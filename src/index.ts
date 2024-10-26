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
await par.say("You have opted out of crossposting. You will no longer be able to use me. to opt back in please dm <@U07L45W79E1> or delete your data with /crossposting-deletemydata");
});
app.command('/crossposting-forget-i-exist', async (par) => {
await par.ack();
await db.delete("userdata_"+ par.body.user_id)
await db.set(`userdata_${par.body.user_id}.optout`, true);
await par.say("Done, Now who are you again??")
})
app.command('/crossposting-deletemydata', async (par) => {
  await par.ack();
  await db.delete("userdata_"+ par.body.user_id)
  par.say("Deleting your data...\n> note: this deletes all refrences of your user id. Including if you have been opted out.");
})
app.command("/crosspost-message", async (par) => {
await par.ack()
// get message link
const messageLink = par.body.text.split(" ")[0]
//validate channels
try {
  // Call views.open with the built-in client
  const result = await app.client.views.open({
    // Pass a valid trigger_id within 3 seconds of receiving it
    trigger_id: par.body.trigger_id,
    // View payload
    view: {
      type: 'modal',
      // View identifier
      // send message link to view as well
      callback_id: 'view_1',
      title: {
        type: 'plain_text',
        text: 'Select Channels',
      },
      "blocks": [
        {
          "type": "input",
          "element": {
            "type": "multi_channels_select",
            "placeholder": {
              "type": "plain_text",
              "text": "Select Channels",
              "emoji": true
            },
            "action_id": "channels-to-send"
          },
          "label": {
            "type": "plain_text",
            "text": "Pick the channels you want to send them to!",
            "emoji": true
          }
        }
      ]
    ,
      submit: {
        type: 'plain_text',
        text: 'Submit'
      }
    }
  });
}
catch (error) {
  console.error(error);
}
});

// callback for modal
app.view("view_1", async ({ ack, body, view, client }) => {
  // Acknowledge the view_submission event
  await ack();
  // Get the submitted data
  const data = body.view.state.values;
  console.log(data);
  const channels = data.channels;
  const message = data.message;
  if (channels.length == 0) {
    await client.chat.postMessage({
      channel: par.body.channel_id,
      text: "You didn't select any channels to send to. Please try again."
    });
    return;
  }
  
  for (const channel of channels) {
    await client.chat.postMessage({
      channel: channel,
      text: message
    });
  }
  await client.chat.postMessage({
    channel: par.body.channel_id,
    text: "Message sent to all channels!"
  });
});