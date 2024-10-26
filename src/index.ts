import "dotenv/config";
import { App } from "@slack/bolt";
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

app.start(process.env.PORT || process.env.SERVER_PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});
//@ts-ignore
// app.event("message", (message) => {
// console.debug("#message");
// });

// TODO: commands
app.command("/crossposting-optout", (par) => {});

app.command("/crosspost-message", (par) => {});
