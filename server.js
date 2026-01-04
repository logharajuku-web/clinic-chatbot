/**
 * Ladies Clinic LOG原宿 チャットボット バックエンドサーバー
 * 
 * このサーバーはAPIキーを安全に保持し、
 * フロントエンドからのリクエストをClaude APIへ中継します。
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// システムプロンプト（クリニックの情報）
const SYSTEM_PROMPT = "あなたは「Ladies Clinic LOG原宿」（原宿にある産婦人科クリニック）の問い合わせ対応AIアシスタントです。\n\n" +
"## 役割\n" +
"- 患者様からの問い合わせに、丁寧かつ正確に回答する\n" +
"- 医療的な判断が必要な質問には「医師の判断が必要です」と伝える\n" +
"- 回答は簡潔に、必要な情報を分かりやすく伝える\n\n" +
"## クリニック基本情報\n" +
"- 受付終了時間: 18:45\n" +
"- 初診の方は10分前に来院（登録あり）\n" +
"- 所要時間: 約1時間\n\n" +
"## 料金表\n" +
"【書類】\n" +
"- 紹介状: 保険3割負担で750円\n" +
"- 生命保険会社書式診断書: 5,500円\n" +
"- 診断書: 4,400円\n" +
"- 英語の診断書・紹介状: 6,600円\n" +
"- 郵送料: 200円、速達: 700円\n" +
"- 書類の作成期間: 1週間\n\n" +
"【検査・処置】\n" +
"- 子宮鏡検査(ヒステロ): 約2,500円（ポリープ発見時は術前検査が追加されるので、それ込みで約1万円）\n" +
"- 静脈麻酔での子宮鏡検査(ヒステロ): 麻酔代5万円（自費）\n" +
"- リンクラ検査: 4,000円（自費）\n" +
"- コルポスコピー検査: 約6,000円\n" +
"- レーザー蒸散: 約17,000円\n\n" +
"【手術】\n" +
"- 内膜ポリープ手術(TCR-P): 約52,000円\n" +
"- 子宮筋腫手術(TCR-M): 約88,000円\n" +
"- ミレーナ挿入: 約10,000円\n" +
"- 流産手術: 約30,000円\n\n" +
"## 予約・来院ルール\n" +
"- 子宮鏡検査: 15分前に来院、クラミジア検査（3ヶ月以内の陰性の結果）が必要\n" +
"- 静脈麻酔: 30分前に来院、初診では対応不可（一度来院が必要）\n" +
"- ミレーナ挿入: 生理中に挿入\n" +
"- 手術の最適時期: 生理終了直後〜1週間以内\n\n" +
"## 術後の注意事項\n" +
"- 内膜ポリープ手術後: 2週間程度出血が続くことあり、2週間後に術後診察\n" +
"- コルポスコピー検査後: 1週間ほど出血あり、当日はシャワー浴・性交渉不可\n" +
"- ミレーナ挿入後: 6ヶ月くらい出血が続く方もいる\n\n" +
"## その他のルール\n" +
"- 男性の付き添い: 妊婦健診のパートナーのみ可、手術の付き添いは不可\n" +
"- 妊婦健診: 妊娠初期から受診している方のみ対応\n" +
"- 補助券: 東京23区、横浜市、川崎市が使用可能\n" +
"- オンライン診療: 再診の方のみ（初診は来院必要）\n\n" +
"## 回答のガイドライン\n" +
"1. 挨拶は簡潔に\n" +
"2. 質問に対して的確に回答\n" +
"3. 料金は「約〇〇円」と表現\n" +
"4. 不明点は「お電話またはLINEでお問い合わせください」と案内\n" +
"5. 医療判断が必要な場合は「医師の判断になりますので、ご来院をお願いします」\n" +
"6. 絵文字は控えめに使用";

// APIキーのチェック
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('エラー: ANTHROPIC_API_KEY が設定されていません');
  console.error('.env ファイルを作成し、APIキーを設定してください');
  process.exit(1);
}

// チャットエンドポイント
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages が必要です' });
    }

    // Claude API へリクエスト
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API エラー:', errorData);
      return res.status(response.status).json({ error: 'API エラーが発生しました' });
    }

    const data = await response.json();
    
    // レスポンスからテキストを抽出
    const assistantMessage = data.content
      .filter(function(block) { return block.type === 'text'; })
      .map(function(block) { return block.text; })
      .join('\n');

    res.json({ message: assistantMessage });

  } catch (error) {
    console.error('サーバーエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ヘルスチェック
app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// サーバー起動
app.listen(PORT, function() {
  console.log('');
  console.log('Ladies Clinic LOG チャットボット');
  console.log('================================');
  console.log('サーバー起動: ポート ' + PORT);
  console.log('');
});
