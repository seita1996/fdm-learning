---
theme: seriph
title: neverthrowで理解するResult型（TypeScript）
class: text-center
transition: slide-left
mdc: true
duration: 35min
---

# neverthrowで理解するResult型
## なぜ使う？どう設計する？FDMへの第一歩まで

<div class="mt-10 opacity-70">
  なぜResult？ / チェインの設計 / ResultAsync / FDMへの接続
</div>

<!--
話すこと:
- Resultは「難しい関数型」ではなく、ジュニアでも“分岐が読める”ようにする道具。
- 今日は “概観 → コード” を何度も繰り返して、手に馴染ませる。
-->

---
layout: center
class: text-left
---

## 今日のゴール

<ul>
  <li v-click><b>なぜ</b> Result型を使うのかを説明できる（例外との違い）</li>
  <li v-click><code>andThen</code> で繋げるための <b>関数の入出力</b> を設計できる</li>
  <li v-click><code>ResultAsync</code> でI/Oを合成し、<b>境界で例外を封じる</b>方針を説明できる</li>
  <li v-click>応用として <b>FDM（State/Command/Result）</b> の入口が見える</li>
</ul>

<!--
話すこと:
- Resultが書ける＝仕様の分岐がコードに残る、ということ。
-->

---
class: text-left
---

## 目次

<Toc text-sm minDepth="1" maxDepth="2" />

---
level: 1
class: text-left
---

# 1. 例外がつらい理由（メタファー）

---
layout: center
class: text-left
---

## メタファー：信号のない交差点 vs 信号のある交差点

<ul>
  <li v-click><b>例外</b>：突然飛び出す車（どこから来るかがコードから見えない）</li>
  <li v-click><b>Result</b>：信号機（赤/青が目に見える、進行条件が明確）</li>
</ul>

<div v-after class="mt-6 opacity-70">
  目的は「安全」だけではなく <b>理解しやすさ</b> と <b>漏れの減少</b>。
</div>

<!--
話すこと:
- 例外は便利だけど、チームで読むときに「分岐が見えない」のがつらい。
- Resultは “分岐を隠さない” というチーム運用の約束。
-->

---
layout: center
class: text-left
---

## あるある：ジュニアがハマる「どこで落ちた？」

<ul>
  <li v-click>ログを見る → 例外が飛んだ場所は分かる</li>
  <li v-click>でも「<b>何が原因で</b>」「<b>どの入力が</b>」は追いづらい</li>
  <li v-click>Resultなら、失敗理由（E）を<b>戻り値に同梱</b>できる</li>
</ul>

<!--
話すこと:
- E（エラー型）に “原因の情報” を乗せられると、調査が早くなる。
-->

---
level: 1
class: text-left
---

# 2. Resultの基本（概観 → コード）

---
class: text-left
---

## 概観：成功レーン / 失敗レーン

<div class="text-sm leading-7">
  <div v-click><b>ok(T)</b>：成功レーンに乗っている</div>
  <div v-click><b>err(E)</b>：失敗レーンに乗っている（Eは失敗理由）</div>
  <div v-click>どちらのレーンにいるかを <b>型で固定</b> する</div>
</div>

<!--
話すこと:
- 「失敗も通常の戻り値」という発想が肝。
-->

---
class: text-left text-sm
---

## コード：ok / err / match

<<< ./snippets/basic.ts#snippet

<!--
話すこと:
- matchは「境界で一回だけ」使うのがコツ（途中は合成で流す）。
-->

---
level: 1
class: text-left
---

# 3. andThenで繋ぐための “入出力設計”

---
class: text-left
---

## 概観：チェインは “レゴ” にする

<ul class="text-sm leading-7">
  <li v-click><b>小さな関数</b>に分ける（1つの責務）</li>
  <li v-click>入力は <b>必要最小限</b>（後段に渡したいものだけ）</li>
  <li v-click>失敗しうるなら <b>Resultを返す</b>（<code>andThen</code>で繋げる形）</li>
</ul>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  ゴール：<b>読み下せる「処理の列」</b>にする
</div>

<!--
話すこと:
- “チェインできる関数” を作るのが半分以上の価値。
-->

---
class: text-left
---

## 概観：map と andThen の使い分け

<div class="text-sm leading-7">
  <div v-click><code>map</code>：成功値を加工（<b>T → U</b>）</div>
  <div v-click><code>andThen</code>：失敗しうる処理を接続（<b>T → Result&lt;U, E&gt;</b>）</div>
</div>

<!--
話すこと:
- “mapの中でResultを返してしまう” のが初学者あるある。andThenで平らにする。
-->

---
class: text-left text-sm
---

## コード：map / andThen の最小例

<<< ./snippets/map-andthen.ts#snippet

<!--
話すこと:
- まずはこの違いを身体で覚える。
-->

---
class: text-left
---

## 概観：チェインは「入力/出力の整形」が9割

<div class="text-sm leading-7">
  <div v-click>① 入力を <b>検証</b> する</div>
  <div v-click>② 成功なら <b>次に必要な形</b> を返す</div>
  <div v-click>③ 失敗なら <b>理由（E）</b> を返す</div>
</div>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  つまり：<b>後段が迷わない型</b>を作る
</div>

<!--
話すこと:
- andThenを使うために、各関数の「出口」を揃えるのが重要。
-->

---
class: text-left text-sm
---

## コード：チェインしやすい関数設計（例）

<<< ./snippets/pipeline.ts#snippet

<!--
話すこと:
- “DTO → Validated → Domain” のように段階を作ると、後段がシンプルになる。
-->

---
level: 1
class: text-left
---

# 4. I/OはResultAsyncに寄せる（概観 → コード）

---
layout: center
class: text-left
---

## メタファー：宅配便の中継

<ul>
  <li v-click>同期：手渡し（その場で渡せる）</li>
  <li v-click>非同期：宅配（届くまで待つ）</li>
  <li v-click><b>ResultAsync</b>：宅配便の追跡番号つき（成功/失敗が追跡できる）</li>
</ul>

<!--
話すこと:
- Promise単体だと失敗が例外になりがち。ResultAsyncで同じレーン設計を維持する。
-->

---
class: text-left
---

## 概観：Promiseを「Resultの世界」に持ち上げる

<div class="text-sm leading-7">
  <div v-click><code>ResultAsync.fromPromise(promise, mapErr)</code></div>
  <div v-click>以降は <code>andThen</code> でI/Oをつないでいく</div>
</div>

<!--
話すこと:
- I/Oは境界。ここで例外→errに変換して、以降は例外を投げない方針を守る。
-->

---
class: text-left text-sm
---

## コード：ResultAsync.fromPromise

<<< ./snippets/resultasync.ts#snippet

<!--
話すこと:
- mapErrで「技術エラーの種類」を揃えると扱いやすい。
-->

---
level: 1
class: text-left
---

# 5. “境界で例外を封じる” という運用（概観 → コード）

---
class: text-left
---

## 概観：例外は「外の世界」でだけ起きる

<div class="text-sm leading-7">
  <div v-click>ドメイン：<b>throwしない</b>（Resultで返す）</div>
  <div v-click>I/O境界：<b>try/catchしてResult化</b> する</div>
  <div v-click>アプリ層：<b>Result/ResultAsyncを合成</b>する</div>
</div>

<!--
話すこと:
- 例外をゼロにするのが目的ではなく、「起きる場所を固定」するのが目的。
-->

---
class: text-left text-sm
---

## コード：try/catch を Result に変換する

<<< ./snippets/boundary.ts#snippet

<!--
話すこと:
- “境界ユーティリティ” を1つ用意すると、例外混入を減らせる。
-->

---
level: 1
class: text-left
---

# 6. 応用：FDMへの第一歩（Resultがそのまま使える）

---
layout: center
class: text-left
---

## メタファー：ゲームの入力処理

<ul>
  <li v-click><b>State</b>：セーブデータ（いま）</li>
  <li v-click><b>Command</b>：ボタン入力（やりたい）</li>
  <li v-click><b>Result</b>：OKなら次のState、NGなら理由（DomainError）</li>
</ul>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  形：<code>handle(state, command): Result&lt;State, DomainError&gt;</code>
</div>

<!--
話すこと:
- Resultが自然にハマる場所が「状態更新」。ここがFDMの入口。
-->

---
class: text-left
---

## 概観：Decision / Evolution に分けると一気に楽

<div class="text-sm leading-7">
  <div v-click><b>Decision</b>：OK/NG + 起きる事実（Event）を返す</div>
  <div v-click><b>Evolution</b>：EventをStateに反映する（原則失敗させない）</div>
  <div v-click><b>handle</b>：DecisionとEvolutionを合成するだけ</div>
</div>

<!--
話すこと:
- この分離は「チーム議論」を簡単にする（拒否理由と更新ロジックが混ざらない）。
-->

---
class: text-left text-sm
---

## コード：FDM最小の形（Resultで書ける）

<<< ./snippets/fdm-first-step.ts#snippet

<!--
話すこと:
- ここまで来ると、あとは「自分のドメイン」でState/Commandを決めて同じ形を当てるだけ。
-->

---
layout: center
class: text-left
---

# まとめ

<ul>
  <li v-click>Resultは「分岐を隠さない」ための道具</li>
  <li v-click><code>andThen</code> のために「関数の入出力」を設計する</li>
  <li v-click>I/Oは <code>ResultAsync</code> で合成し、境界で例外を封じる</li>
  <li v-click>そのまま <b>FDM（State/Command/Result）</b> へ繋がる</li>
</ul>

<!--
話すこと:
- 次は自分のコードで「チェインしやすい関数（andThen前提）」を1本作るのが第一歩。
-->
