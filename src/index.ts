import "dotenv/config";
import { App } from "@slack/bolt";
import { QuickDB } from "quick.db";
import { admins, fh_admins, overrides } from "./constants";
const db = new QuickDB();
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

app.start(process.env.PORT || process.env.SERVER_PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});
//@ts-ignore

// TODO: commands
app.command("/crossposting-optout", async (par) => {
  await par.ack();
  await db.set(`userdata_${par.body.user_id}.optout`, true);
  await par.say(
    "You have opted out of crossposting. You will no longer be able to use me. to opt back in please dm <@U07L45W79E1> or delete your data with /crossposting-deletemydata",
  );
});
app.command("/crossposting-forget-i-exist", async (par) => {
  await par.ack();
  await db.delete("userdata_" + par.body.user_id);
  await db.set(`userdata_${par.body.user_id}.optout`, true);
  await par.say("Done, Now who are you again??");
});
app.command("/crossposting-deletemydata", async (par) => {
  await par.ack();
  await db.delete("userdata_" + par.body.user_id);
  par.say(
    "Deleting your data...\n> note: this deletes all refrences of your user id. Including if you have been opted out.",
  );
});
app.command("/crossposting-block-my-channel", async (par) => {
  await par.ack();
  if (!overrides.includes(par.body.user_id)) {
    await par.say(
      "You are not the channel manager for this channel.  OR fire dept",
    );
    return;
  }
  await db.set("blocked_channel_" + par.body.channel_id, true);
  await par.say(":yay: Channel blocked");
});
app.command("/crosspost-message", async (par) => {
  await par.ack();
  // get message link
  const messageLink = par.body.text.split(" ")[0];
  //validate channels
  try {
    await db.set(
      `userdata_${par.body.user_id}.current_message_link`,
      messageLink,
    );
    await db.set(
      `userdata_${par.body.user_id}.current_channel_id`,
      par.body.channel_id,
    );
    // Call views.open with the built-in client
    const result = await app.client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: par.body.trigger_id,
      // View payload
      view: {
        type: "modal",
        // View identifier
        // send message link to view as well
        callback_id: "view_1",
        title: {
          type: "plain_text",
          text: "Select Channels",
        },
        blocks: [
          {
            type: "input",
            element: {
              type: "multi_channels_select",
              placeholder: {
                type: "plain_text",
                text: "Select Channels",
                emoji: true,
              },
              action_id: "channels-to-send",
            },
            label: {
              type: "plain_text",
              text: "Pick the channels you want to send them to!",
              emoji: true,
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// callback for modal
app.view("view_1", async ({ ack, body, view, client }) => {
  // Acknowledge the view_submission event
  await ack();
  // Get the submitted data
  const data = body.view.state.values["5xIxx"];
  const channels = data["channels-to-send"].selected_channels;
  const channel_id = await db.get(
    `userdata_${body.user.id}.current_channel_id`,
  );
  const messageLink = await db.get(
    `userdata_${body.user.id}.current_message_link`,
  );
  console.log(body);

  if (!channels || channels.length == 0) {
    await client.chat.postMessage({
      channel: channel_id,
      text: "You didn't select any channels to send to. Please try again.",
    });
    return;
  }
  let blocked_channels = [];
  for (const channel of channels) {
    if (await db.get("blocked_channel_" + channel)) {
      blocked_channels.push(channel);
      continue;
    }
    await client.chat.postMessage({
      channel: channel,
      text: messageLink,
    });
  }
  await client.chat.postMessage({
    channel: channel_id,
    text:
      blocked_channels.length === 0
        ? "Message sent to all channels!"
        : "Message sent to all channels except <#" +
          blocked_channels.join(">, <#") +
          ">",
  });
});
