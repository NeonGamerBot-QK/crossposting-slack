import "dotenv/config";
import { App } from "@slack/bolt";
import { QuickDB } from "quick.db";
const db = new QuickDB();
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
app.command("/crossposting-optout", async (par) => {
await par.ack();
await db.set(`userdata_${par.body.user_id}.optout`, true);
await par.say("You have opted out of crossposting. You will no longer be able to use me. to opt back in please dm <@U07L45W79E1> or delte your data with /crossposting-deletemydata");
});
app.command('/crossposting-deletemydata', async (par) => {
  par.say("Deleting your data...\n> note: this deletes all refrences of your user id. Including if you have been opted out.");
  await db.delete("userdata_"+ par.body.user_id)
})
app.command("/crosspost-message", async (par) => {
await par.ack()
const channels = par.body.text.split(' ').filter(e=>e.startsWith('<#')).map(e=>e.replace('<#','').replace('>',''))
//validate channels
});
