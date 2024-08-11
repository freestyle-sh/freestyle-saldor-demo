import { Chat } from "freestyle-chat/react";
import { useCloud } from "freestyle-sh";
import type { ChatCS } from "../cloudstate/chatbot";
import { useCloudMutation } from "freestyle-sh/react";

export function Chatbot(props: { conversationId: string }) {
  const chatbot = useCloud<typeof ChatCS>(props.conversationId);

  return <Chat messageList={chatbot} />;
}
