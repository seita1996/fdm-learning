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

<!--
話すこと:
- 「FDM寄り」に組み立て直す回。State/Command/Result を一本の軸にする。
- DDD用語は補助線として使い、実装の型の形を優先する。
-->

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

<!--
話すこと:
- 今日は「設計の形」を持ち帰るのがゴール。ツールはneverthrow固定で説明する。
- 非ゴールを先に置くことで、深掘りしたくなる気持ちを一旦止める。
-->

---
class: text-left
---

## 目次（章）

<Toc text-sm minDepth="1" maxDepth="1" />

<!--
話すこと:
- 章立てだけまず把握してもらう。次ページで詳細に落とす。
-->

---
class: text-left
---

## 目次（詳細）

<Toc text-xs minDepth="1" maxDepth="2" columns="2" />

<!--
話すこと:
- 今日の「型の流れ」を追えるように、Decision/Evolution/handle までが中心。
-->

---
level: 1
class: text-left
---

# 1. FDMは何を「うれしく」する？

<!--
話すこと:
- ここは動機づけ。設計の表現力とテスト容易性が主な価値。
-->

---
class: text-left
---

## FDMの狙い（超要約）

<ul>
  <li v-click><b>複雑さ</b>（ビジネスルール）を「状態機械」として書ける</li>
  <li v-click>「何が起きるか」を <b>Command</b> として明示できる</li>
  <li v-click>「なぜ失敗するか」を <b>DomainError</b> として型で表現できる</li>
  <li v-click>ドメインを純粋関数に寄せ、I/Oを境界に押し出せる（Functional Core / Imperative Shell）</li>
</ul>

<!--
話すこと:
- 「状態機械」として書ける、が体感ポイント。状態とコマンドの組み合わせで仕様が見える。
- 例外ではなく DomainError に寄せると、失敗理由がドキュメントになる。
-->

---
layout: center
class: text-left
---

## メタファーで掴む（アレルギー回避）

<ul>
  <li v-click><b>ゲーム</b>：State = セーブデータ / Command = ボタン入力</li>
  <li v-click><b>空港の手続き</b>：Decision = 「搭乗OK？」の判定（NG理由が大事）</li>
  <li v-click><b>レシピ</b>：Evolution = 手順どおり混ぜるだけ（失敗しない想定）</li>
</ul>

<div v-after class="mt-6 opacity-70">
  以降は「概観 → コード」で、同じ理解を何度も上書きします。
</div>

<!--
話すこと:
- まずは言葉より比喩。State/Commandは「ゲームの入出力」だと思うと楽。
- Decisionは「OK/NGと理由」。Evolutionは「OKなら状態に反映」。
-->

---
layout: two-cols
class: text-left
---

## DDDとの関係（戦略）

<ul>
  <li v-click>境界づけられたコンテキスト（BC）</li>
  <li v-click>ユビキタス言語</li>
  <li v-click>チームと責務の分割</li>
</ul>

::right::

## DDDとの関係（戦術）

<ul>
  <li v-click>値オブジェクト：生成で不正を止める</li>
  <li v-click>集約：不変条件を守る「単位」</li>
  <li v-click>リポジトリ：状態の入出力（I/O側）</li>
  <li v-click>ドメインイベント：起きた事実（必要なら）</li>
</ul>

<!--
話すこと:
- FDMはDDDを置き換えるというより「戦術の実装スタイル」。
- 境界（BC）や言葉はDDD、中心ロジックの形はFDM、という分担で考える。
-->

---
level: 1
class: text-left
---

# 2. コア形：State -> Command -> Result<State, DomainError>

<!--
話すこと:
- 以降はこの形を何度も反復する。覚えるのはこれだけでもOK。
-->

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

<!--
話すこと:
- Decisionは「拒否理由（DomainError）」を返せる場所。
- Evolutionは「事実（event）」を畳み込むだけ。基本は失敗させない設計に寄せる。
-->

---
class: text-left
---

## 概観：1枚絵（これだけ覚える）

<div class="text-sm leading-7">
  <div v-click><b>State</b>（いま） + <b>Command</b>（やりたい）</div>
  <div v-click>→ <b>Decision</b>（OK/NG + 起きる事実）</div>
  <div v-click>→ <b>Evolution</b>（事実をStateに反映）</div>
  <div v-click>→ 次の <b>State</b></div>
</div>

<div v-after class="mt-8 p-3 rounded bg-gray-100/40">
  例：<code>Draft</code> に <code>PlaceOrder</code> → OKなら <code>OrderPlaced</code> → 状態が <code>Placed</code>
</div>

<!--
話すこと:
- Decisionが仕様の中心、Evolutionが更新の中心。
- Resultにすることで「失敗経路」がドキュメントになって漏れが減る。
-->

---
class: text-left
---

## コード：最小の形（magic-move）

````md magic-move
```ts
// 最初に作るのはこれ
handle(state, command): Result<State, DomainError>
```

```ts
// 中身を分割して「見える化」
decide(state, command): Result<Event, DomainError>
evolve(state, event): State
```

```ts
// 合成（ここがFDMの型の芯）
handle = (s, c) => decide(s, c).map((e) => evolve(s, e))
```
````

<!--
話すこと:
- 「できる/できない（理由）」と「更新」を分けるだけで、議論もテストも楽になる。
-->

---
class: text-left
---

## なぜ分ける？（Decision / Evolution）

- Decision：**やってよいか** / **何が起きるか** を決める（失敗しうる）
- Evolution：起きた事実を状態に畳み込む（失敗しない想定）
- テストが書きやすい（副作用なし、入力→出力が固定）

<!--
話すこと:
- Decisionのテストは「許可/拒否」。Evolutionのテストは「更新結果」。
- 分けると、設計の議論が「何が禁止？」「事実が起きたらどう更新？」に収束する。
-->

---
level: 1
class: text-left
---

# 3. neverthrowで失敗を型にする

<!--
話すこと:
- TypeScript単体だと例外に流れがち。neverthrowで「失敗を値」に固定する。
-->

---
class: text-left
---

## neverthrowの位置づけ

- `Result<T, E>`：同期の成功/失敗
- `ResultAsync<T, E>`：Promiseを包んだ成功/失敗（合成しやすい）
- `map / andThen / mapErr`：**成功経路/失敗経路**を明示的に繋ぐ

<!--
話すこと:
- 「throwしない」方針を型で支えるのが目的。
- ResultAsyncはI/O境界で便利。ドメイン中心はまずResultで揃える。
-->

---
class: text-left
---

## 概観：成功レーン / 失敗レーン

<div class="text-sm leading-7">
  <div v-click><b>Result</b> は「分岐を隠さない」ための箱</div>
  <div v-click><code>ok</code> のときだけ次へ進む（<code>andThen</code>）</div>
  <div v-click><code>err</code> のときは、そのまま上に返る（例外で飛ばない）</div>
</div>

<div v-after class="mt-6 opacity-70">
  初学者のつまずきポイント：<b>「失敗も通常の戻り値」</b> にする。
</div>

<!--
話すこと:
- 例外は「見えないgoto」になりがち。Resultは分岐がコードに残る。
-->

---
class: text-left
---

## まずは最小例

<<< @/snippets/fdm/result-intro.ts#snippet

<!--
話すこと:
- andThenで「失敗したら後続を止める」を明示できる。
- エラー型（E）を業務の言葉に寄せるのがコツ。
-->

---
level: 1
class: text-left
---

# 4. 例題：注文（Order）をFDMで書く

<!--
話すこと:
- ミニドメインで形を固める。重要なのは「型の分割」。
-->

---
class: text-left
---

## 例題で扱うもの

- `OrderState`：状態（Draft/Placed、明細、合計）
- `OrderCommand`：要求（AddLine / PlaceOrder）
- `DomainError`：拒否理由（空の注文は確定できない等）
- （必要なら）`OrderEvent`：起きた事実（LineAdded / OrderPlaced）

DDD用語で言うと「集約の振る舞い」を関数として書く。

<!--
話すこと:
- State/Command/Eventは「用語」ではなく「インターフェース」。
- OrderEventは必須ではないが、Decision/Evolution分離が綺麗になるので採用。
-->

---
layout: center
class: text-left
---

## 概観：注文を「ゲーム」にする

<ul>
  <li v-click><b>State</b>：注文のセーブデータ（明細・合計・状態）</li>
  <li v-click><b>Command</b>：ボタン入力（AddLine / PlaceOrder）</li>
  <li v-click><b>DomainError</b>：押してはいけないボタン理由（空の注文は確定不可 など）</li>
  <li v-click><b>Event</b>：起きた事実（LineAdded / OrderPlaced）</li>
</ul>

<!--
話すこと:
- 「注文」は難しいから、まずゲームの入力/出力に置き換える。
-->

---
class: text-left
---

## 値オブジェクト：`Money`（生成で不正を止める）

ポイント：

- 実体はただの構造体でも、**生成を制限**して不正を入れない
- 失敗は `Result` で返す（例外を投げない）

<!--
話すこと:
- ここは「不正値を入れない」入口。後段を楽にするための投資。
-->

---
class: text-left text-sm
---

## Money（コード）

<<< @/snippets/fdm/money.ts#snippet

<!--
話すこと:
- Evolutionを失敗させないために、Money.add/multiplyは前提を置く。
- 前提（同一通貨など）はDecisionで担保するのがFDMの基本。
-->

---
class: text-left
---

## ドメインエラーを「列挙」する

- インフラ由来のエラー（DB接続失敗等）と区別する
- 表示文言ではなく **機械可読な種類** を持たせる

<!--
話すこと:
- DomainErrorは「拒否理由」そのもの。APIやUIの都合は混ぜない。
-->

---
class: text-left text-sm
---

## DomainError（コード）

<<< @/snippets/fdm/domain-errors.ts#snippet

<!--
話すこと:
- エラーは増えても良い。むしろ増えるほど仕様が見える。
-->

---
class: text-left text-sm
---

## State / Command / Event

<<< @/snippets/fdm/order-types.ts#snippet

<!--
話すこと:
- State: いまの事実。Command: やりたいこと。Event: 起きたこと。
- まず型を固定してから関数を書くのが近道。
-->

---
layout: center
class: text-left
---

## 概観：Decisionで「ルールブック」を書く

<div class="text-sm leading-7">
  <div v-click>Decisionは「ルールブック」：この入力は <b>OK/NG</b>？</div>
  <div v-click>OKなら「何が起きるか（Event）」を返す</div>
  <div v-click>NGなら「なぜダメか（DomainError）」を返す</div>
</div>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  コツ：NG理由はUI向け文章ではなく、<b>機械可読</b>なタグにする
</div>

<!--
話すこと:
- Decisionに仕様を集めると「どこで拒否する？」が一箇所にまとまる。
-->

---
class: text-left
---

## Decision：バリデーションと「何が起きるか」

例：

- すでに `Placed` なら `AddLine` は拒否
- 明細が空なら `PlaceOrder` は拒否
- 数量は正の整数、金額は0以上…など

<!--
話すこと:
- Decisionは仕様の中心。「このコマンドはいつ拒否される？」をここに集約する。
-->

---
class: text-left text-sm
---

## Decision（コード）

<<< @/snippets/fdm/order-decision.ts#snippet

<!--
話すこと:
- Commandごとに分岐し、許可される場合だけEventを作る。
- ここで「計算（lineTotal）」までやってEventに持たせるとEvolutionが軽くなる。
-->

---
layout: center
class: text-left
---

## 概観：Evolutionは「リプレイ再生」

<div class="text-sm leading-7">
  <div v-click>Eventログを先頭から再生すると、いつでもStateを作れる</div>
  <div v-click>Evolutionは「Eventが起きたらStateがこう変わる」を書くだけ</div>
  <div v-click><b>原則：Evolutionは失敗させない</b>（失敗はDecisionで止める）</div>
</div>

<!--
話すこと:
- Eventは「起きた事実」なので、Evolutionは機械的に畳み込める形が理想。
-->

---
class: text-left text-sm
---

## Evolution：状態更新は「事実の畳み込み」

<<< @/snippets/fdm/order-evolution.ts#snippet

<!--
話すこと:
- Evolutionは「eventが起きたなら state はこう変わる」を網羅するだけ。
- 例外/失敗を起こさない設計に寄せると扱いやすい。
-->

---
layout: center
class: text-left
---

## 概観：handle = Decision + Evolution

<div class="text-sm leading-7">
  <div v-click>handleは「司令塔」ではなく <b>合成</b> だけをする</div>
  <div v-click>だからテストはここに集中できる</div>
</div>

<!--
話すこと:
- handleは薄く。薄いほど設計が保てる。
-->

---
class: text-left text-sm
---

## handle：State -> Command -> Result<State, DomainError>

<<< @/snippets/fdm/order-handle.ts#snippet

<!--
話すこと:
- handleは「コア形」のそのまま。テストはここを中心に書ける。
-->

---
level: 1
class: text-left
---

# 5. アプリケーション層：I/Oと合成する

<!--
話すこと:
- ここからがImperative Shell。ドメインを呼び出すだけにする。
-->

---
class: text-left
---

## 依存関係の方向

<ul>
  <li v-click><b>ドメイン（Decision/Evolution）</b> → 何にも依存しない</li>
  <li v-click>アプリケーション → ドメインに依存（ポート＝インターフェースを定義）</li>
  <li v-click>インフラ → アプリケーションのポートを実装（DB/HTTPなど）</li>
</ul>

（いわゆるヘキサゴナル / クリーンアーキテクチャの感覚）

<!--
話すこと:
- 依存は外向き。ドメインを中心に固定して、周辺（DB/HTTP）を差し替える。
-->

---
layout: center
class: text-left
---

## 概観：受付（I/O）と厨房（ドメイン）を分ける

<div class="text-sm leading-7">
  <div v-click><b>受付</b>：HTTP/CLI/Queue など（外の世界）</div>
  <div v-click><b>厨房</b>：handle（純粋、テストしやすい）</div>
  <div v-click><b>倉庫</b>：Repository（load/save の副作用）</div>
</div>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  実装形：<code>load → handle → save</code>
</div>

<!--
話すこと:
- 「厨房に電話が鳴る」みたいな副作用が混ざると一気に複雑化する。
-->

---
class: text-left text-sm
---

## ポート：リポジトリ（状態の入出力）

<<< @/snippets/fdm/ports.ts#snippet

<!--
話すこと:
- リポジトリは「状態の入出力」。ここは副作用でOK。
-->

---
class: text-left
---

## ユースケース：Commandを流す

ポイント：

- I/Oは `ResultAsync`、ドメインは `Result`
- I/O境界で例外を捕まえて `ResultAsync` に寄せる（方針化）
- `load -> handle -> save` の形にそろえる

<!--
話すこと:
- アプリ層は「取り出す・流す・保存する」。
- DomainErrorとInfraErrorを分けると、責務の議論がしやすい。
-->

---
class: text-left text-sm
---

## ユースケース（コード）

<<< @/snippets/fdm/run-command.ts#snippet

<!--
話すこと:
- handleは同期Resultなので match で ResultAsync に持ち上げる。
- 例外はrepo実装の中で捕まえて errAsync へ（ここでは省略）。
-->

---
class: text-left
---

## 失敗をどう「返す」か

- UI/HTTP層は `Result` を見て `4xx/5xx` やエラーメッセージに変換する
- ドメイン層にHTTPステータスを持ち込まない（境界の責務）

実務では `DomainError | InfraError` のように合成して扱うと楽。

<!--
話すこと:
- 返し方（HTTP 400/409/500 等）は境界の責務。ドメインに持ち込まない。
-->

---
level: 1
class: text-left
---

# 6. 実務のコツ（設計と運用）

<!--
話すこと:
- ここは導入の現実論。完璧を目指さずに形を揃える。
-->

---
class: text-left
---

## ありがちな落とし穴

- 「全部を厳密に」しようとして詰む → 重要な集約から小さく
- DecisionにI/Oが混ざる → まず分ける（依存方向を守る）
- 例外とResultが混在 → 境界で例外を捕まえてResult化（ルール化）

<!--
話すこと:
- DecisionにI/Oが入った瞬間にテストが重くなる。まず分けるのが勝ち筋。
-->

---
class: text-left
---

## テスト戦略

- ドメイン：純粋関数なので**高速な単体テスト**が中心
- アプリケーション：ポートをスタブしてユースケースを検証
- インフラ：契約テスト/統合テストで担保

<!--
話すこと:
- ドメインが薄いほど統合テストが増える。ドメインを厚くしてテストを安くする。
-->

---
class: text-left
---

## 小さく始める導入手順

1. 「ユースケース」境界で `Result` を返す
2. バリデーションを **生成時** に寄せる（Value Object化）
3. 重要な集約の不変条件を明文化して関数にする
4. ポート分離（DB/HTTP）を後から進める

<!--
話すこと:
- まずは「返り値をResultに固定」から始めるのが一番効く。
-->

---
layout: center
class: text-left
---

# まとめ

- FDMのコアは `State -> Command -> Result<State, DomainError>`
- Decision（決定）と Evolution（更新）に分けると、複雑さが扱いやすい
- `neverthrow` の `Result` / `ResultAsync` で、失敗とI/Oを合成できる

<!--
話すこと:
- 次にやることは「自分のドメインでState/Commandを1つ決めてhandleを書く」。
-->

---
class: text-left
---

## 参考（キーワード）

- Eric Evans: Domain-Driven Design
- Vaughn Vernon: Implementing Domain-Driven Design
- Scott Wlaschin: Domain Modeling Made Functional
- “Functional Core, Imperative Shell”
- Hexagonal Architecture / Clean Architecture

<!--
話すこと:
- Wlaschin本は命名が良い。チームの言葉を揃えるのに役立つ。
-->
