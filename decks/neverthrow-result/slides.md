---
theme: seriph
title: neverthrowで理解するResult型（TypeScript）
class: text-center
transition: slide-left
mdc: true
duration: 35min
---

# neverthrowで理解するResult型
## 例外をやめて「成功/失敗のレーン」を型で見える化する

<div class="mt-10 opacity-70">
  Result / map / andThen / ResultAsync / 境界で例外を封じる
</div>

<!--
話すこと:
- Resultは「難しい関数型」ではなく、分岐を隠さないための道具。
- 今日は “概観 → コード” を何度も繰り返して慣れる。
-->

---
layout: center
class: text-left
---

## 今日のゴール

<ul>
  <li v-click>例外とResultの違いを「設計の言葉」で説明できる</li>
  <li v-click><code>map</code> と <code>andThen</code> を使い分けられる</li>
  <li v-click><code>ResultAsync</code> でI/Oを合成できる</li>
  <li v-click>「境界で例外を捕まえてResult化」する方針を説明できる</li>
</ul>

<!--
話すこと:
- Resultが書ける＝設計の分岐が見える、ということ。
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
  目的は「安全」ではなく <b>理解しやすさ</b> と <b>漏れの減少</b>。
</div>

<!--
話すこと:
- 例外は便利だけど、チームで読むときに「分岐が見えない」のがつらい。
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
- matchは「最後に一回だけ」使うのがコツ（途中は合成で流す）。
-->

---
level: 1
class: text-left
---

# 3. map / andThen（概観 → コード）

---
class: text-left
---

## 概観：違いは「中でResultを返すか」

<div class="text-sm leading-7">
  <div v-click><code>map</code>：<b>T → U</b>（失敗は増やさない）</div>
  <div v-click><code>andThen</code>：<b>T → Result&lt;U, E2&gt;</b>（失敗しうる処理をつなぐ）</div>
</div>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  迷ったら：<b>失敗する可能性があるなら andThen</b>
</div>

<!--
話すこと:
- mapは「成功値だけ加工」、andThenは「次の段階に進む判定込み」。
-->

---
class: text-left text-sm
---

## コード：map / andThen の最小例

<<< ./snippets/map-andthen.ts#snippet

<!--
話すこと:
- “mapの中でResultを返してしまう” のが初学者あるある。andThenで平らにする。
-->

---
level: 1
class: text-left
---

# 4. ResultAsync（概観 → コード）

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
layout: center
class: text-left
---

# まとめ

<ul>
  <li v-click>Resultは「分岐を隠さない」ための道具</li>
  <li v-click><code>map</code> は加工、<code>andThen</code> は失敗しうる処理の接続</li>
  <li v-click>I/Oは <code>ResultAsync</code> で合成し、境界で例外を封じる</li>
</ul>

<!--
話すこと:
- 次は自分のコードで「throwする場所」を境界に寄せるのが第一歩。
-->

