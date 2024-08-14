import { Chat } from "freestyle-chat/react";
import { useCloud } from "freestyle-sh";
import type { ChatCS } from "../cloudstate/chatbot";
import { useCloudMutation } from "freestyle-sh/react";
import { TextMessage } from "freestyle-chat/react/messages/text";
import type { TextMessageCS } from "freestyle-chat";

export function Chatbot(props: { conversationId: string }) {
  const chatbot = useCloud<typeof ChatCS>(props.conversationId);

  return (
    <>
      <div
        className="
           fixed block top-3 left-3 md:hidden z-50
        "
      >
        <img src="/image.png" className="h-12 object-contain z-50" />
      </div>
      <div className="h-screen grid grid-cols-1 md:grid-cols-2 overflow-scroll">
        <div>
          <div className="p-4 h-screen">
            <Chat<[TextMessageCS], ChatCS>
              submitButtonBackgroundColor="#77DD77"
              messageList={chatbot}
              displayMessage={(message) => {
                switch (message.data.type) {
                  case "TEXT_MESSAGE": {
                    return (
                      <TextMessage
                        backgroundColor={message.isSelf ? "#77DD77" : "#f0f0f0"}
                        message={message}
                      />
                    );
                  }
                  default: {
                    return (
                      <div>
                        Cannot display message type: {message.data.type}
                      </div>
                    );
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="bg-gray-100 text-center p-8 hidden sm:block">
          <div className="w-full  flex flex-col justify-center">
            <img src="/image.png" className="h-24 object-contain" />
            <p className="my-2 text-gray-700">We educate AI.</p>
            <div className="text-left">
              <p>
                We had our AI read through all of today's{" "}
                <a
                  href={"https://www.techcrunch.com"}
                  className="text-[#65bb65] font-extrabold transition-all hover:text-[#77DD77] underline"
                >
                  TechCrunch
                </a>{" "}
                articles, so you can ask our bot about the latest tech news.
              </p>
              <div className=" h-4 block" />
              You can ask about anything, but here are some examples:
              <ul className="list-disc">
                <li className="my-2">
                  <button
                    onClick={async () => {
                      await chatbot.sendTextMessage({
                        text: "What's the latest news?",
                      });
                    }}
                    className="
                 text-green-700 hover:text-green-600 transition-all
                "
                  >
                    Ask about the latest news
                  </button>
                </li>
                <li className="my-2">
                  <button
                    onClick={async () => {
                      await chatbot.sendTextMessage({
                        text: "Tell me about the top AI stories",
                      });
                    }}
                    className="
                 text-green-700 hover:text-green-600 transition-all
                "
                  >
                    Hear about AI innovations
                  </button>
                </li>
                <li className="my-2">
                  <button
                    className="
                 text-green-700 hover:text-green-600 transition-all
                "
                    onClick={async () => {
                      await chatbot.sendTextMessage({
                        text: "Tell me about the latest fundraising news",
                      });
                    }}
                  >
                    Find out about recent fundraising trends
                  </button>
                </li>
                <li className="my-2">
                  <button
                    className="
                 text-green-700 hover:text-green-600 transition-all
                "
                    onClick={async () => {
                      await chatbot.sendTextMessage({
                        text: "Tell me about the latest IPOs",
                      });
                    }}
                  >
                    Learn about the latest IPOs
                  </button>
                </li>
                <li className="my-2">
                  <button
                    className="
                 text-green-700 hover:text-green-600 transition-all
                "
                    onClick={async () => {
                      await chatbot.sendTextMessage({
                        text: "Tell me about the latest acquisitions",
                      });
                    }}
                  >
                    Discover the latest acquisitions
                  </button>
                </li>
                <li className="my-2">
                  <button
                    className="
                 text-green-700 hover:text-green-600 transition-all
                "
                    onClick={async () => {
                      await chatbot.sendTextMessage({
                        text: "Tell me about the latest security breaches",
                      });
                    }}
                  >
                    Learn about the latest security breaches
                  </button>
                </li>
              </ul>
              <div className=" h-4 block" />
              <h2 className="font-bold">
                How it works
              </h2>
              <p>
                 <a className="text-green-700 hover:text-green-600" href="https://saldor.com/">Saldor</a> provides an API that takes in a URL and a prompt, and traverses through the page, and any related pages to provide any information you asked for.
              </p>
              <div className=" h-4 block" />
              <p>
                <a href="https://www.freestyle.sh" className="text-green-700 hover:text-green-600">Freestyle</a> provides serverless cloud hosting for stateful TypeScript apps. <a href="https://www.freestyle.sh" className="text-green-700 hover:text-green-600">Freestyle</a>'s technology allows for developers to share whole features as opensource packages with each other. This chatbot is powered by the Open Source <a href="https://github.com/freestyle-sh/freestyle-chat" className="text-green-700 hover:text-green-600">freestyle-chat</a> Package.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
