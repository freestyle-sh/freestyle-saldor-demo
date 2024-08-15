import { cloudstate } from "freestyle-sh";
import { ChatCS } from "./chatbot";

@cloudstate
export class ConversationManagerCS {
  static readonly id = "conversation-manager";
  conversations = new Map<string, ChatCS>();
  doesConversationExist(conversationId: string) {
    return this.conversations.has(conversationId);
  }
  async createConversation() {
    const conversation = new ChatCS();
    this.conversations.set(conversation.id, conversation);
    return {
      id: conversation.id,
    };
  }
}