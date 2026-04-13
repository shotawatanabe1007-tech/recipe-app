import Anthropic from '@anthropic-ai/sdk';
import type { Ingredient, AISuggestedRecipe, CookedRecord } from '../types';

function getClient(): Anthropic {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) {
    throw new Error(
      'VITE_ANTHROPIC_API_KEY が設定されていません。.env ファイルに API キーを追加してください。'
    );
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

interface ExtractedRecipe {
  title: string;
  ingredients: { name: string; amount: string }[];
}

// 画像(base64)からレシピ情報を抽出
export async function extractRecipeFromImage(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
): Promise<ExtractedRecipe> {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `このレシピ画像から料理名・必要な食材・調味料・分量を抽出してください。
以下のJSON形式で返してください（他のテキストは含めないでください）:
{
  "title": "料理名",
  "ingredients": [
    { "name": "食材名", "amount": "分量" }
  ]
}`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('レシピ情報の抽出に失敗しました');
  return JSON.parse(jsonMatch[0]);
}

// URLからレシピ情報を推定
export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `次のレシピURLの料理について、一般的な知識をもとに料理名・食材・調味料・分量を推定してください。
URL: ${url}

以下のJSON形式で返してください（他のテキストは含めないでください）:
{
  "title": "料理名",
  "ingredients": [
    { "name": "食材名", "amount": "分量" }
  ]
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('レシピ情報の抽出に失敗しました');
  return JSON.parse(jsonMatch[0]);
}

// 料理写真からカロリーを推定
export async function estimateCalories(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
): Promise<number> {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `この料理の写真から推定カロリー（kcal）を計算してください。
数値のみを返してください（例: 520）。`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '0';
  const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

// AIレシピ提案
export async function suggestRecipes(
  keyword: string,
  recentRecords: CookedRecord[],
  ingredients: Ingredient[]
): Promise<AISuggestedRecipe[]> {
  const client = getClient();

  const recentTitles = recentRecords
    .slice(0, 10)
    .map((r) => r.title)
    .join('、');

  const ingredientNames = ingredients
    .slice(0, 20)
    .map((i) => i.name)
    .join('、');

  const contextParts: string[] = [];
  if (recentTitles) contextParts.push(`最近作った料理: ${recentTitles}`);
  if (ingredientNames) contextParts.push(`買い物リストにある食材: ${ingredientNames}`);
  if (keyword) contextParts.push(`キーワード: ${keyword}`);

  const context = contextParts.length > 0 ? contextParts.join('\n') : 'キーワードなし';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `以下の情報をもとに、おすすめレシピを20個以上提案してください。

${context}

以下のJSON配列形式で返してください（他のテキストは含めないでください）:
[
  {
    "title": "料理名",
    "description": "簡単な説明（1行）",
    "ingredients": [
      { "name": "食材名", "amount": "分量" }
    ],
    "steps": ["手順1", "手順2", "手順3"]
  }
]`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('レシピ提案の取得に失敗しました');
  return JSON.parse(jsonMatch[0]);
}
