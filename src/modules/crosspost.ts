// anything related to blocking/data deletions
import { App } from "@slack/bolt";
import { QuickDB } from "quick.db";

export default function (app: App, db: QuickDB) {
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
}
