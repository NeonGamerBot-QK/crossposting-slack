// anything related to blocking/data deletions
import { App } from "@slack/bolt";
import { QuickDB } from "quick.db";
import { admins, fh_admins, overrides } from "../constants";

export default function (app: App, db: QuickDB) {
  app.command("/crossposting-optout", async (par) => {
    await par.ack();
    await db.set(`userdata_${par.body.user_id}.optout`, true);
    await app.client.chat.postEphemeral(
      {
        text: "You have opted out of crossposting. You will no longer be able to use me. to opt back in please dm <@U07L45W79E1> or delete your data with /crossposting-deletemydata",
        channel: par.body.channel_id,
        user: par.body.user_id
      },
    );
  });
  app.command("/crossposting-forget-i-exist", async (par) => {
    await par.ack();
    await db.delete("userdata_" + par.body.user_id);
    await db.set(`userdata_${par.body.user_id}.optout`, true);
    // await par.say();
    await app.client.chat.postEphemeral(
      {
        text: "Done, Now who are you again??",
        channel: par.body.channel_id,
        user: par.body.user_id
      },
    );
  });

  app.command("/crossposting-deletemydata", async (par) => {
    await par.ack();
    await db.delete("userdata_" + par.body.user_id);

    await app.client.chat.postEphemeral(
      {
        text: "Deleting your data...\n> note: this deletes all refrences of your user id. Including if you have been opted out.",
        channel: par.body.channel_id,
        user: par.body.user_id
      },
    );
  });
  app.command("/crossposting-block-my-channel", async (par) => {
    await par.ack();
    if (!overrides.includes(par.body.user_id)) {
      await app.client.chat.postEphemeral(
        {
          text:         "You are not the channel manager (not implemented yet) for this channel.  OR fire dept",
          channel: par.body.channel_id,
          user: par.body.user_id
        },
      );
      return;
    }
    await db.set("blocked_channel_" + par.body.channel_id, true);
    await par.say(":yay: Channel blocked");
  });
}
