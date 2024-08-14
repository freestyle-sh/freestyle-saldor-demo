import { cloudstate, useRequest } from "freestyle-sh";
import { MessageListCS, TextMessageCS } from "freestyle-chat";
import type { BaseUserCS } from "freestyle-auth/passkey";
import { parse as parseCookie } from "cookie";
import * as Saldor from "saldor";

@cloudstate
export class ChatCS extends MessageListCS {
  id = crypto.randomUUID();
  ragCache = {
    lastCached: 0,
    data:undefined
  } as {
    lastCached: number;
    data: {
      data: string[];
    } | undefined;
  }


  async saldorCall() {
    const refetchTime = 1000 * 60 * 60 * 24; // 24 hours
    if (Date.now() - this.ragCache.lastCached < refetchTime) {
      return this.ragCache.data
    }
    
    const saldor = new Saldor.SaldorClient(process.env.SALDOR_API_KEY);
    const out = await saldor.scrape("")

    this.ragCache.data = out;
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
    if (message.sender.id !== "SALDOR") {
      const ragData = await this.saldorCall();
      // rag goes here
      const ragOut = "RAG out goes here";
      await this._addMessage(new TextMessageCS({
        text: ragOut,
        sender: {
          id: "SALDOR",
          username: "Saldor",
        },
      }))

    }
  }
}
