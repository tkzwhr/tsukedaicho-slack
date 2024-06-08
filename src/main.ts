import * as datastore from "@/datastore";
import { Keys } from "@/types";
import * as views from "@/views";
import {
  App,
  type AppOptions,
  type BlockAction,
  type ButtonAction,
} from "@slack/bolt";
import type { ViewsPublishArguments } from "@slack/web-api";

const appOptions: AppOptions = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: 3000,
};

if (process.env.SLACK_APP_TOKEN) {
  appOptions.socketMode = true;
  appOptions.appToken = process.env.SLACK_APP_TOKEN;
}

const app = new App(appOptions);

const renderHomeLoading = (userId: string): ViewsPublishArguments => ({
  user_id: userId,
  view: {
    type: "home",
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "NOW LOADING... :cd:",
          emoji: true,
        },
      },
    ],
  },
});

const renderHome = async (userId: string) => {
  const data = await Promise.all([
    datastore.listUserAmount(),
    datastore.listRecords(20),
  ]);

  return views.home(userId, data[0], data[1]);
};

app.event("app_home_opened", async ({ client, event, logger }) => {
  await client.views.publish(renderHomeLoading(event.user));

  const view = await renderHome(event.user);

  const result = await client.views.publish(view);

  logger.debug(result);
});

app.action<BlockAction<ButtonAction>>(
  Keys.CREATE_TSUKE_ACTION,
  async ({ ack, body, client }) => {
    client.views
      .open(views.create(body.trigger_id, body.user.id, Keys.TSUKE))
      .then();

    await ack();
  },
);

app.action<BlockAction<ButtonAction>>(
  Keys.CREATE_SETTLE_ACTION,
  async ({ ack, body, client }) => {
    client.views
      .open(views.create(body.trigger_id, body.user.id, Keys.SETTLE))
      .then();

    await ack();
  },
);

app.view(Keys.EXEC_CREATE, async ({ ack, client, body, logger }) => {
  const mode = body.view.private_metadata;

  const values = body.view.state.values;
  const date = `${values.date.date.selected_date}T${values.time.time.selected_time}:00`;
  const userId = values.name.name.selected_user;
  let amount = Number.parseInt(values.amount.amount.value ?? "0");
  const detail = values.detail.detail.value ?? "";

  if (Number.isNaN(amount) || amount <= 0) {
    await ack({
      response_action: "errors",
      errors: {
        amount: "整数で入力してください。",
      },
    });
    return;
  }

  ack().then();

  await client.views.publish(renderHomeLoading(body.user.id));

  const profile = await client.users.info({
    user: userId ?? "",
  });
  const name = profile.user?.profile?.display_name ?? "";

  if (mode === Keys.TSUKE) {
    amount *= -1;
  }

  await datastore.createRecord({
    date,
    name,
    amount,
    detail,
  });

  const view = await renderHome(body.user.id);

  const result = await client.views.publish(view);

  logger.debug(result);
});

app.action<BlockAction<ButtonAction>>(
  Keys.DELETE_ACTION,
  async ({ ack, body, client }) => {
    client.views
      .open(views.confirmDelete(body.trigger_id, body.actions[0].value))
      .then();

    await ack();
  },
);

app.view(Keys.EXEC_DELETE, async ({ ack, client, body, logger }) => {
  ack().then();

  await client.views.publish(renderHomeLoading(body.user.id));

  const recordId = body.view.private_metadata;

  await datastore.deleteRecord(recordId);

  const view = await renderHome(body.user.id);

  const result = await client.views.publish(view);

  logger.debug(result);
});

(async () => {
  await app.start();

  console.info("⚡️ Bolt app is running!");
})();
