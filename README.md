# Slidevスライド集（TypeScript + neverthrow）

このリポジトリは複数のSlidevデッキ（スライド）を `decks/` 配下で管理します。

## デッキ一覧

- `decks/fdm-intro/slides.md`：関数型ドメインモデリング（FDM）入門
- `decks/neverthrow-result/slides.md`：neverthrowで理解するResult型

## 起動（開発）

- `pnpm install`
- `pnpm dev:fdm`（FDM入門）
- `pnpm dev:neverthrow`（Result型）

## ビルド/エクスポート

- `pnpm build:fdm` / `pnpm build:neverthrow`
- `pnpm export:fdm` / `pnpm export:neverthrow`

## メモ

- Effectライブラリとして `neverthrow`（`Result` / `ResultAsync`）を前提にしています。
- スライド内のコード例は各デッキ配下の `snippets/` に置いてあります（Slidevの `<<< ./snippets/...` で取り込み）。
