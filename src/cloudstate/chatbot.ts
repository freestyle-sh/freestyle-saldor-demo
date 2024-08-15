import { cloudstate, useRequest } from "freestyle-sh";
import { MessageListCS, TextMessageCS } from "freestyle-chat";
import type { BaseUserCS } from "freestyle-auth/passkey";
import axios from "axios";
import { parse as parseCookie } from "cookie";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore} from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from '@langchain/core/prompts';

export class SaldorClient {
  client;

  constructor(apiKey: string, baseURL = 'http://localhost:8000') {
      this.client = axios.create({
          baseURL,
          timeout: 50000,
          headers: {
              'x-api-key': apiKey,
          },
      });
  }

  // Example method to scrape data
  async crawl(url: string, goal: string) {
  try {
          const response = await this.client.post('/crawl', {
          url, 
          goal,
          max_depth: 0,
          max_pages: 100,
  });
      return response.data

  }

  catch (error) {
          // Handle error appropriately
          console.error('Scrape failed:', error);
          throw error;
      }
  }

  async get_crawl_status(crawl_id: string) {
      const response = await this.client.get(`/crawl/${crawl_id}`);
      return response.data
  }
}

@cloudstate
export class ChatCS extends MessageListCS {
  id = crypto.randomUUID();
  ragCache = {
    lastCached: 0,
    chain: undefined,
    retriever: undefined,
  } as {
    lastCached: number;
    chain: any; 
    retriever: any;
  };
  


  async saldorCall() {
    const refetchTime = 1000 * 60 * 60 * 24; // 24 hours
    if (Date.now() - this.ragCache.lastCached < refetchTime) {
      return this.ragCache.chain, this.ragCache.retriever;
    }

    const saldor = new SaldorClient(process.env.SALDOR_API_KEY);
    const out = await saldor.crawl("https://techcrunch.com/category/startups/", "Acquire all information from techcrunch.com relating to startup news");
    const crawlId = out.data.id;
    let crawlStatus;
    do {
        crawlStatus = await saldor.get_crawl_status(crawlId);
        console.log("Current crawl status:", crawlStatus.data.state);
        if (crawlStatus.data.state == 'running' || crawlStatus.data.state == 'pending') {
            // Wait for 5 seconds before checking again
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    } while (crawlStatus.data.state == 'running' || crawlStatus.data.state == 'pending');
    
    if (crawlStatus.data.state == 'completed') {
        console.log("Crawl completed successfully");
        console.log(crawlStatus.data);
    } else {
      console.error("Crawl failed");
      return
    }
    const results: string[] = crawlStatus.data.result

    const docs = results.map(item => new Document({ pageContent: item }));
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments(docs);
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings()
    );

    // Retrieve and generate using the relevant snippets of the blog.
    const retriever = vectorStore.asRetriever();

    // Define your prompt template
    const promptTemplate = new PromptTemplate({
      inputVariables: ['context', 'question'],
      template: `
      You are a knowledgeable assistant. Given the following context:
  
      {context}
  
      Please answer the following question:
  
      {question}
    `,
  });


  const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
  
  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt: promptTemplate,
    outputParser: new StringOutputParser(),
  });

    this.ragCache.chain = ragChain;
    this.ragCache.retriever = retriever;
    this.ragCache.lastCached = Date.now();
  }

  override getCurrentUser(): BaseUserCS {
    const req = useRequest();
    const cookie = req.headers.get("cookie");
    const parsedCookie = parseCookie(cookie ?? "");
    const sessionId = parsedCookie["freestyle-session-id"];

    return {
      id: sessionId,
      username: sessionId,
    };
  }

  override async _onMessageAdded(message: TextMessageCS): Promise<void> {
    try {
      if (message.sender.id !== "SALDOR") {
        const chain, retriever = await this.saldorCall();
        const retrieved_docs = await retriever.invoke(message.text);
        let data = await chain.invoke({
          context: retriever,
          question: message.text,
        });
        if (!data) {
          data = "No data found";
        }
        // rag goes here
        await this._addMessage(new TextMessageCS({
          text: data,
          sender: {
            id: "SALDOR",
            username: "Saldor",
          },
        }))
      }
    } catch (e) {
      console.error(e);
    }
  }
}
