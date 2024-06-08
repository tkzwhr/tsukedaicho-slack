# ツケ台帳 for Slack

## インストール

```bash
bun install
```

## 環境変数の用意

.env.local を作成する。

```
DATASTORE_API=<spreadsheet gas endpoint url>
DATASTORE_TOKEN=<spreadsheet gas endpoint access token>
SLACK_BOT_TOKEN=<slack bot token>
SLACK_SIGNING_SECRET=<slack signing secret>
SLACK_APP_TOKEN=<slack app token if you use socket mode>
```

## 起動

起動する

```bash
bun run serve
```
