---
theme: seriph
title: 関数型ドメインモデリング（FDM）入門（TypeScript + neverthrow）
class: text-center
transition: slide-left
mdc: true
duration: 45min
---

# 関数型ドメインモデリング（FDM）入門
## TypeScript + neverthrow で「State / Command / Result」を型でつなぐ

<div class="mt-10 opacity-70">
  State → Command → Result&lt;State, DomainError&gt; / Decision & Evolution
</div>

---
layout: center
class: text-left
---

## 今日のゴール

- FDMのコア形（`State -> Command -> Result<State, DomainError>`）を説明できる
- **Decision（バリデーション）** と **Evolution（状態更新）** に分けて実装できる
- `neverthrow`（`Result` / `ResultAsync`）で失敗を値として合成できる

## 非ゴール

- DDDの全パターン網羅（イベントソーシング等）は扱わない（ただし親和性は触れる）
- フレームワーク選定やORM設定などの実装詳細は扱わない

---
class: text-left
---

## 目次

<Toc minDepth="1" maxDepth="2" />

---
level: 1
class: text-left
---

# 1. FDMは何を「うれしく」する？

---
class: text-left
---

## FDMの狙い（超要約）

- **複雑さ**（ビジネスルール）を「状態機械」として書ける
- 「何が起きるか」を **Command** として明示できる
- 「なぜ失敗するか」を **DomainError** として型で表現できる
- ドメインを純粋関数に寄せ、I/Oを境界に押し出せる（Functional Core / Imperative Shell）

---
layout: two-cols
class: text-left
---

## DDDとの関係（戦略）

- 境界づけられたコンテキスト（BC）
- ユビキタス言語
- チームと責務の分割

::right::

## DDDとの関係（戦術）

- 値オブジェクト：生成で不正を止める
- 集約：不変条件を守る「単位」
- リポジトリ：状態の入出力（I/O側）
- ドメインイベント：起きた事実（必要なら）

---
level: 1
class: text-left
---

# 2. コア形：State -> Command -> Result<State, DomainError>

---
class: text-left
---

## まずは最重要スライド

ドメインの中心を、次の形に固定する：

- `handle(state, command): Result<state, DomainError>`

そして中身を分割する：

- `decide(state, command): Result<event, DomainError>`（Decision）
- `evolve(state, event): state`（Evolution）

合成：

- `handle = decide(...).map(event => evolve(state, event))`

---
class: text-left
---

## なぜ分ける？（Decision / Evolution）

- Decision：**やってよいか** / **何が起きるか** を決める（失敗しうる）
- Evolution：起きた事実を状態に畳み込む（失敗しない想定）
- テストが書きやすい（副作用なし、入力→出力が固定）

---
level: 1
class: text-left
---

# 3. neverthrowで失敗を型にする

---
class: text-left
---

## neverthrowの位置づけ

- `Result<T, E>`：同期の成功/失敗
- `ResultAsync<T, E>`：Promiseを包んだ成功/失敗（合成しやすい）
- `map / andThen / mapErr`：**成功経路/失敗経路**を明示的に繋ぐ

---
class: text-left
---

## まずは最小例

<<< @/snippets/fdm/result-intro.ts

---
level: 1
class: text-left
---

# 4. 例題：注文（Order）をFDMで書く

---
class: text-left
---

## 例題で扱うもの

- `OrderState`：状態（Draft/Placed、明細、合計）
- `OrderCommand`：要求（AddLine / PlaceOrder）
- `DomainError`：拒否理由（空の注文は確定できない等）
- （必要なら）`OrderEvent`：起きた事実（LineAdded / OrderPlaced）

DDD用語で言うと「集約の振る舞い」を関数として書く。

---
class: text-left
---

## 値オブジェクト：`Money`（生成で不正を止める）

ポイント：

- 実体はただの構造体でも、**生成を制限**して不正を入れない
- 失敗は `Result` で返す（例外を投げない）

<<< @/snippets/fdm/money.ts

---
class: text-left
---

## ドメインエラーを「列挙」する

- インフラ由来のエラー（DB接続失敗等）と区別する
- 表示文言ではなく **機械可読な種類** を持たせる

<<< @/snippets/fdm/domain-errors.ts

---
class: text-left
---

## State / Command / Event

<<< @/snippets/fdm/order-types.ts

---
class: text-left
---

## Decision：バリデーションと「何が起きるか」

例：

- すでに `Placed` なら `AddLine` は拒否
- 明細が空なら `PlaceOrder` は拒否
- 数量は正の整数、金額は0以上…など

<<< @/snippets/fdm/order-decision.ts

---
class: text-left
---

## Evolution：状態更新は「事実の畳み込み」

<<< @/snippets/fdm/order-evolution.ts

---
class: text-left
---

## handle：State -> Command -> Result<State, DomainError>

<<< @/snippets/fdm/order-handle.ts

---
level: 1
class: text-left
---

# 5. アプリケーション層：I/Oと合成する

---
class: text-left
---

## 依存関係の方向

- **ドメイン（Decision/Evolution）→ 何にも依存しない**
- アプリケーション → ドメインに依存（ポート＝インターフェースを定義）
- インフラ → アプリケーションのポートを実装（DB/HTTPなど）

（いわゆるヘキサゴナル / クリーンアーキテクチャの感覚）

---
class: text-left
---

## ポート：リポジトリ（状態の入出力）

<<< @/snippets/fdm/ports.ts

---
class: text-left
---

## ユースケース：Commandを流す

ポイント：

- I/Oは `ResultAsync`、ドメインは `Result`
- I/O境界で例外を捕まえて `ResultAsync` に寄せる（方針化）
- `load -> handle -> save` の形にそろえる

<<< @/snippets/fdm/run-command.ts

---
class: text-left
---

## 失敗をどう「返す」か

- UI/HTTP層は `Result` を見て `4xx/5xx` やエラーメッセージに変換する
- ドメイン層にHTTPステータスを持ち込まない（境界の責務）

実務では `DomainError | InfraError` のように合成して扱うと楽。

---
level: 1
class: text-left
---

# 6. 実務のコツ（設計と運用）

---
class: text-left
---

## ありがちな落とし穴

- 「全部を厳密に」しようとして詰む → 重要な集約から小さく
- DecisionにI/Oが混ざる → まず分ける（依存方向を守る）
- 例外とResultが混在 → 境界で例外を捕まえてResult化（ルール化）

---
class: text-left
---

## テスト戦略

- ドメイン：純粋関数なので**高速な単体テスト**が中心
- アプリケーション：ポートをスタブしてユースケースを検証
- インフラ：契約テスト/統合テストで担保

---
class: text-left
---

## 小さく始める導入手順

1. 「ユースケース」境界で `Result` を返す
2. バリデーションを **生成時** に寄せる（Value Object化）
3. 重要な集約の不変条件を明文化して関数にする
4. ポート分離（DB/HTTP）を後から進める

---
layout: center
class: text-left
---

# まとめ

- FDMのコアは `State -> Command -> Result<State, DomainError>`
- Decision（決定）と Evolution（更新）に分けると、複雑さが扱いやすい
- `neverthrow` の `Result` / `ResultAsync` で、失敗とI/Oを合成できる

---
class: text-left
---

## 参考（キーワード）

- Eric Evans: Domain-Driven Design
- Vaughn Vernon: Implementing Domain-Driven Design
- Scott Wlaschin: Domain Modeling Made Functional
- “Functional Core, Imperative Shell”
- Hexagonal Architecture / Clean Architecture
