import { cloudstate, useRequest } from "freestyle-sh";
import { MessageListCS, TextMessageCS } from "freestyle-chat";
import type { BaseUserCS } from "freestyle-auth/passkey";
import { parse as parseCookie } from "cookie";
// import * as Saldor from "saldor";

@cloudstate
export class ChatCS extends MessageListCS {
  id = crypto.randomUUID();

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
      //{ data: string[] }
      const saldorOut = await fetch(
        "https://api.saldor.com/scrape",
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.SALDOR_API_KEY,
          },
          method: "POST",
          body: JSON.stringify({
            url: "https://www.advil.com/our-products/advil-pain/advil-migraine/",
            params: {
              max_depth: 2,
              prompt: `Summarize what is going on on this page`,
            },
          }),
        }
      );
      console.log("Respponse", saldorOut.headers.get("content-type"), saldorOut.ok);
      const saldorText = await saldorOut.text();
      console.log("SALDOR OUT", saldorText);
      

      // console.log("SALDOR OUT", saldorOut);

      // for (const text of saldorOut.data) {
      //   await this._addMessage(
      //     new TextMessageCS({
      //       sender: { id: "SALDOR", username: "SALDOR" },
      //       text: text,
      //     })
      //   );
      // }
    }
  }
}
