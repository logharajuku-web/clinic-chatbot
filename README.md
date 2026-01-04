# Ladies Clinic LOG チャットボット

Claude AI搭載のチャットボットです。APIキーをサーバー側で安全に管理します。

## 📁 ファイル構成

```
chatbot-backend/
├── server.js          # バックエンドサーバー
├── package.json       # 依存関係
├── .env.example       # 環境変数サンプル
├── .env               # 環境変数（自分で作成）
└── public/
    └── index.html     # フロントエンド
```

## 🚀 セットアップ手順

### 1. Node.js のインストール

Node.js がインストールされていない場合は、以下からダウンロード：
https://nodejs.org/

### 2. 依存パッケージのインストール

```bash
cd chatbot-backend
npm install
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、Anthropic APIキーを設定：

```
ANTHROPIC_API_KEY=sk-ant-あなたのAPIキー
```

APIキーは https://console.anthropic.com/ で取得できます。

### 4. サーバー起動

```bash
npm start
```

ブラウザで http://localhost:3000 を開く

## 🌐 本番環境へのデプロイ

### オプション1: VPS / クラウドサーバー

1. サーバーにNode.jsをインストール
2. このフォルダをアップロード
3. `npm install` と `npm start` を実行
4. PM2などでプロセスを永続化

```bash
npm install -g pm2
pm2 start server.js --name chatbot
pm2 save
```

### オプション2: Render.com（無料枠あり）

1. GitHubにリポジトリを作成
2. Render.com でアカウント作成
3. 「New Web Service」から GitHub リポジトリを接続
4. 環境変数に `ANTHROPIC_API_KEY` を設定
5. デプロイ

### オプション3: Railway

1. https://railway.app/ でアカウント作成
2. 「New Project」→「Deploy from GitHub」
3. 環境変数を設定
4. デプロイ

## 🔧 ホームページへの埋め込み

デプロイ後、以下の方法で既存のホームページに埋め込めます：

### 方法1: iframe（簡単）

```html
<iframe 
  src="https://あなたのドメイン.com/chatbot-widget" 
  style="position: fixed; bottom: 0; right: 0; width: 400px; height: 600px; border: none;"
></iframe>
```

### 方法2: スクリプト埋め込み

`public/index.html` の `<button class="chat-toggle">` 以降のコードを
既存のホームページにコピー。

APIエンドポイントを絶対URLに変更：

```javascript
// 変更前
const response = await fetch('/api/chat', ...);

// 変更後
const response = await fetch('https://あなたのドメイン.com/api/chat', ...);
```

## 💰 料金の目安

Claude Sonnet 4.5 を使用：
- 入力: $3 / 100万トークン
- 出力: $15 / 100万トークン

月1,000件の問い合わせで **数百円〜千円程度**

## ⚠️ 注意事項

- `.env` ファイルは絶対にGitHubにアップロードしないでください
- `.gitignore` に `.env` を追加してください：

```
.env
node_modules/
```

## 📞 サポート

問題が発生した場合は、お気軽にご連絡ください。
