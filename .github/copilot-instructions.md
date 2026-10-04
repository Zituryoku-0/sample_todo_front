# Copilot Code Review – Repository Guidelines (sample_front)

本リポジトリは **Next.js（App Router）+ React + TypeScript** のフロントエンドです。  
Copilot は以下の指針に基づいて Pull Request（PR）をレビューしてください。

> 💬 **レビュー言語指定**  
> すべてのコメント・提案・指摘は **日本語** で記載してください。  
> ただし、コード例や関数名・技術用語（React, TypeScript, hook など）は英語のままで構いません。  
> 丁寧でわかりやすい文体で説明してください。  
> 指摘の際は「なぜそうすべきか」の理由も添えてください。

---

## Goals（レビューのゴール）

- バグ/UX劣化の **早期検出** と **回避策の提案**
- **アクセシビリティ・パフォーマンス・セキュリティ** の継続的改善
- **型安全**（TypeScript）と **テスト品質** の担保
- API 連携（エラーハンドリング/再試行/キャンセル）の堅牢化

## Non-Goals（対象外）

- 好みのみ（明確な規約に反しない限り指摘は控える）
- 大規模リファクタの強行（別PR提案に留める）

---

## Review Focus（観点）

### 1) 型安全 / コード品質

- `tsconfig` は **strict** を維持（`any` は原則禁止、必要時は理由コメント）。
- **`import type`** の活用、`zod/yup` 等で **実行時バリデーション** を追加検討。
- Hooks ルール：`eslint-plugin-react-hooks` を満たす（依存配列の漏れなし）。
- 共通型は `types/**` に集約、API 型は **サーバのスキーマ**（OpenAPIなど）と同期。

### 2) アクセシビリティ（A11y）

- **フォーカス可能**・**キーボード操作** 完備（`tabindex` / `aria-*` / `role`）。
- フォーム要素は `label` と関連付け。画像は `alt`、アイコンは `aria-hidden` 適切化。
- コントラスト比（WCAG 2.1 AA）を満たす。**見た目依存の説明** を避ける。
- コンポーネントに **適切なランドマーク**（`header/main/nav/footer`）。

### 3) パフォーマンス

- **コード分割**（`React.lazy` / `import()`）と **遅延読み込み** を検討。
- **メモ化**：`useMemo/useCallback/memo` は測定に基づき最小限で。
- **画像最適化**：サイズ、`loading="lazy"`、`decoding="async"`、`srcset`。
- リストは **仮想化**（大規模時）。不要な再レンダリング要因を除去（props 安定化）。
- `next/dynamic` や Server Components を活用し、クライアントバンドルの肥大化を避ける。

### 4) セキュリティ

- **XSS**：`dangerouslySetInnerHTML` は禁止（やむを得ない場合は厳格サニタイズ）。
- **クライアントへの機微情報漏洩** 回避：`.env` の **NEXT_PUBLIC_** 以外はクライアントに露出させない。
- **CSP/iframe sandbox/referrerPolicy** の設定検討。外部リンクは `rel="noopener"`。
- 依存は定期更新。既知脆弱性（`npm audit`）に対応。

### 5) 状態管理 / データ取得

- **サーバ状態** は `@tanstack/react-query`（推奨）で管理（キャッシュ・再試行・`staleTime`）。
- **ローカル状態** は React の標準フックを優先。グローバル化は慎重に。
- API は **共通クライアント** を介す：`fetch`/`axios` ラッパで **タイムアウト**、**エラー正規化**、**AbortController** に対応。
- **スキーマ検証**（zod等）で **受信データの型保証**。失敗時はユーザーに分かりやすいエラー表示。

### 6) ルーティング / エラーハンドリング

- App Router の `error.tsx`・`loading.tsx`・`not-found.tsx` で **エラーハンドラ**・**ローディング UI**・**境界** を整備。
- 非同期コンポーネントは `Suspense` とスケルトン UI を用意。

### 7) スタイル / UI

- 設計は **デザイントークン**／ユーティリティ（Tailwind 等）を一貫利用。
- コンポーネントは **小さく再利用可能** に。Props の責務を明確化。
- スピナー/ボタンなどの共通 UI は `components/ui/**` に。

### 8) テスト（推奨構成）

- 単体：**Vitest + Testing Library**（DOM 依存は RTL）。
- E2E：**Playwright**（クリティカルフロー）。
- モック：**MSW** でネットワークを再現。
- 重点：**境界値、エラーパス、アクセシビリティ、遅延/キャンセル**。

---

## Files of Interest（Copilot が特に見る場所）

- `app/**`（`layout.tsx`, `page.tsx`, `error.tsx`, `loading.tsx` など）および `components/`, `hooks/`, `types/`, `lib/`
- API クライアント：`lib/apiClient.ts`（想定）
- ルーティング：`app/**`（App Router）
- 設定：`next.config.ts`, `tsconfig*.json`, `eslint.config.mjs`, `package.json`
- 環境：`.env*`（※レビューは差分のみ参照）
- テスト：`**/*.test.tsx?`, `playwright/**`, `msw/**`

## Files to Ignore（ノイズ除外）

- `dist/**`, `out/**`, `node_modules/**`, `.next/**`
- 生成物、ビルド結果、ロックファイルの大量差分

---

## PR ルール

- **小さめPR** を推奨（大差分は UI / ロジック / 依存更新を分割）。
- PR 説明には：**目的 / 影響範囲 / スクショ or 動画 / ロールバック** を記載。
- UI 変更は **スクショ** または **録画（最短GIF）** を添付。
- CI（lint / typecheck / test）が **グリーン** でない PR はレビュー対象外。

---

## 具体的指摘の例（Copilot 向け）

- 「このコンポーネントは `aria-label` が不足。アイコンボタンに代替テキストを追加してください。」
- 「`useEffect` の依存配列に `query` が漏れています。再レンダリング時の不整合が起きる可能性。」
- 「データ取得は `useQuery` を使用し、`staleTime` と `retry` を適切に設定してください。」
- 「API レスポンスのバリデーションに `zod` を導入し、`apiClient` で共通化してください。」
- 「巨大画像がレイアウトシフトを起こしています。`width/height` の指定と `loading="lazy"` を追加してください。」
- 「`dangerouslySetInnerHTML` は禁止。サニタイズ方針か別実装を提示してください。」

---

## Autofix（自動修正してよい範囲）

- import 整理、未使用変数の削除、軽微な命名/コメントの改善
- ESLint/Prettier 準拠のフォーマット
- `alt` の追加・`button` の `type="button"` 付与など **安全な A11y 修正**
- 軽微なレンダリング最適化（不要な匿名関数の外出し 等）

**ただし、公開 API の契約・ルーティング構造・依存の大幅更新は提案のみ（自動コミットしない）。**

---

## 参考コード（雛形）

### `lib/apiClient.ts`（例）

```ts
export type ApiError = { status: number; message: string; cause?: unknown };

export async function api<T>(
  input: RequestInfo,
  init?: RequestInit & { timeoutMs?: number; signal?: AbortSignal },
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init?.timeoutMs ?? 15000,
  );
  try {
    const res = await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw {
        status: res.status,
        message: text || res.statusText,
      } satisfies ApiError;
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
```
