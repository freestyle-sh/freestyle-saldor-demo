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
      <div className="h-screen grid sm:grid-cols-2">
        <div>
          <div className="p-4 h-screen">
          <Chat<[TextMessageCS], ChatCS>
            submitButtonBackgroundColor="#38ef7d"
            messageList={chatbot}
            displayMessage={(message) => {
              switch (message.data.type) {
                case "TEXT_MESSAGE": {
                  return (
                    <TextMessage
                      backgroundColor={message.isSelf ? "#38ef7d" : "#f0f0f0"}
                      message={message}
                    />
                  );
                }
                default: {
                  return (
                    <div>Cannot display message type: {message.data.type}</div>
                  );
                }
              }
            }}
          />
          </div>
        </div>
        <div className="bg-gray-100">
          Built on
        </div>
      </div>
    </>
  );
}
