import { type Record, Keys, type UserAmount } from "@/types";
import type { ViewsPublishArguments, ViewsOpenArguments } from "@slack/web-api";

export function home(
  userId: string,
  userAmount: UserAmount[],
  records: Record[],
): ViewsPublishArguments {
  const userAmountViews = userAmount.map((v) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${v.name}*\t\t\t\t ${v.amount}円`,
    },
  }));
  const recordViews = records.map((v) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `\`${v.date.split("T")[0]}\` ${v.name} *${v.amount}円*\n${
        v.detail
      }`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: ":wastebasket:",
        emoji: true,
      },
      value: `${v.id}`,
      action_id: Keys.DELETE_ACTION,
    },
  }));

  return {
    user_id: userId,
    view: {
      type: "home",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":moneybag: 残高",
            emoji: true,
          },
        },
        ...userAmountViews,
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":memo: 最近の履歴",
            emoji: true,
          },
        },
        ...recordViews,
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "ツケる",
              },
              action_id: Keys.CREATE_TSUKE_ACTION,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "精算する",
              },
              action_id: Keys.CREATE_SETTLE_ACTION,
            },
          ],
        },
      ],
    },
  };
}

export function create(
  triggerId: string,
  userId: string,
  mode: string,
): ViewsOpenArguments {
  let label = "ツケる";
  if (mode === Keys.SETTLE) {
    label = "精算する";
  }

  const pad = (n: number, d: number) => `0000${n}`.slice(-d);

  const now = new Date();
  const date = `${pad(now.getFullYear(), 4)}-${pad(
    now.getMonth() + 1,
    2,
  )}-${pad(now.getDate(), 2)}`;
  const time = `${pad(now.getHours(), 2)}:${pad(now.getMinutes(), 2)}`;

  return {
    trigger_id: triggerId,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: label,
        emoji: true,
      },
      submit: {
        type: "plain_text",
        text: label,
        emoji: true,
      },
      close: {
        type: "plain_text",
        text: "キャンセル",
        emoji: true,
      },
      private_metadata: mode,
      blocks: [
        {
          type: "input",
          block_id: "date",
          element: {
            type: "datepicker",
            action_id: "date",
            initial_date: date,
            placeholder: {
              type: "plain_text",
              text: "Select a date",
              emoji: true,
            },
          },
          label: {
            type: "plain_text",
            text: "日付",
            emoji: true,
          },
        },
        {
          type: "input",
          block_id: "time",
          element: {
            type: "timepicker",
            action_id: "time",
            initial_time: time,
            placeholder: {
              type: "plain_text",
              text: "Select time",
              emoji: true,
            },
          },
          label: {
            type: "plain_text",
            text: "時間",
            emoji: true,
          },
        },
        {
          type: "input",
          block_id: "name",
          element: {
            type: "users_select",
            action_id: "name",
            initial_user: userId,
            placeholder: {
              type: "plain_text",
              text: "Select users",
              emoji: true,
            },
          },
          label: {
            type: "plain_text",
            text: "ユーザー",
            emoji: true,
          },
        },
        {
          type: "input",
          block_id: "amount",
          element: {
            type: "plain_text_input",
            action_id: "amount",
          },
          label: {
            type: "plain_text",
            text: "金額",
            emoji: true,
          },
        },
        {
          type: "input",
          block_id: "detail",
          element: {
            type: "plain_text_input",
            action_id: "detail",
          },
          label: {
            type: "plain_text",
            text: "摘要",
            emoji: true,
          },
        },
      ],
      callback_id: Keys.EXEC_CREATE,
    },
  };
}

export function confirmDelete(
  triggerId: string,
  recordId: string,
): ViewsOpenArguments {
  return {
    trigger_id: triggerId,
    view: {
      type: "modal",
      submit: {
        type: "plain_text",
        text: "削除する",
        emoji: true,
      },
      close: {
        type: "plain_text",
        text: "キャンセル",
        emoji: true,
      },
      title: {
        type: "plain_text",
        text: "削除します",
        emoji: true,
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "この操作は取り消せません。",
            emoji: true,
          },
        },
      ],
      callback_id: Keys.EXEC_DELETE,
      private_metadata: recordId,
    },
  };
}
