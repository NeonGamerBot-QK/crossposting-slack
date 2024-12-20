import "dotenv/config";
import { App } from "@slack/bolt";
import { QuickDB } from "quick.db";
import { loadModules } from "./loader";
const db = new QuickDB();
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

app.start(process.env.PORT || process.env.SERVER_PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});
//@ts-ignore
loadModules(app, db);
// TODO: commands
