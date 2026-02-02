---
theme: seriph
title: TypeScriptの型安全性を殺すには
class: text-center
transition: slide-left
mdc: true
duration: 40min
---

# TypeScriptの型安全性を殺すには
## そして、殺さないためには

<div class="mt-10 opacity-70">
  ジュニア向け：良いTS / 悪いTS を見分ける目を作る
</div>

<!--
話すこと:
- タイトルは煽りだが目的は逆。「殺し方」を知ると、レビューで止められる。
- “型があるのに事故る” パターンを集中的に潰す回。
-->

---
layout: center
class: text-left
---

## 今日のゴール

<ul>
  <li v-click>「これは型安全性を殺している」と気づける</li>
  <li v-click>レビューで <b>代替案</b> を提案できる</li>
  <li v-click>型は <b>境界で作って</b>、中で守る、が腹落ちする</li>
</ul>

<!--
話すこと:
- 悪い例も出すが「代わりにこう書く」を必ずセットにする。
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

# 1. 型安全性って何？（メタファー）

---
layout: center
class: text-left
---

## メタファー：シートベルト

<ul>
  <li v-click>型 = シートベルト（事故を <b>減らす</b>、ゼロにはしない）</li>
  <li v-click><code>as</code> や <code>any</code> = ベルトを切るハサミ</li>
  <li v-click>切った瞬間は楽、後で痛い</li>
</ul>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  コツ：<b>「楽になった瞬間」</b> を疑う
</div>

<!--
話すこと:
- 型は“邪魔”ではなく、事故コストの削減装置。
- だから「便利な抜け道」がある。そこが今日のテーマ。
-->

---
level: 1
class: text-left
---

# 2. 王道の殺し方：as / any / !

---
class: text-left
---

## 概観：3大“臭いものに蓋”

<ul class="text-sm leading-7">
  <li v-click><code>as</code>：本当か分からないのに「本当です」と言い張る</li>
  <li v-click><code>any</code>：型検査を「無効化」する</li>
  <li v-click><code>!</code>（non-null assertion）：nullかもを「絶対nullじゃない」と言い張る</li>
</ul>

<!--
話すこと:
- どれも “型の穴” を開ける。
- 穴は「境界」に集めないと、システム全体に漏れる。
-->

---
class: text-left
---

## as：一番ありがちな“封印札”

<div class="text-sm leading-7">
  <div><code>as</code> は「型を作る」ではなく「型を主張する」</div>
  <div class="opacity-70">（実行時に正しいかは、何も保証しない）</div>
</div>

<div class="mt-6 text-sm leading-7">
  <div v-click><b>危険度MAX</b>：<code>JSON.parse</code> の直後に <code>as</code></div>
  <div v-click>代替：<b>unknown</b> で受けて、チェックしてから型を作る</div>
  <div v-click>レビュー観点：<b>「根拠（チェック）」はどこ？</b></div>
</div>

<!--
話すこと:
- asは「型を作る」のではなく「型を主張する」だけ。
- JSON.parseの直後は最も危険な境界。
-->

---
class: text-left text-sm
---

## コード：asで“蓋”をする vs しない

<<< ./snippets/as-vs-guard.ts#snippet

<!--
話すこと:
- 代替案は “型ガード” or “パース関数”。
- asは “最後の最後” に限定し、根拠（チェック）を隣に置く。
-->

---
class: text-left
---

## any：一発で伝播する毒

<div class="text-sm leading-7">
  <div v-click><code>any</code> は “一箇所だけ” のつもりでも、呼び出し元に広がる</div>
  <div v-click>型推論が崩れて、補完もレビューも弱くなる</div>
  <div v-click>代替：まず <code>unknown</code> で受け、狭める</div>
</div>

<!--
話すこと:
- anyは「便利」ではなく「契約破り」。
-->

---
class: text-left text-sm
---

## コード：anyの伝播 / unknownで止める

<<< ./snippets/any-vs-unknown.ts#snippet

<!--
話すこと:
- unknownは “不便” だが、それが安全装置。
-->

---
class: text-left
---

## !：未来の自分にツケを回す

<ul class="text-sm leading-7">
  <li v-click><code>value!</code> は「ここで絶対nullじゃない」という <b>宣誓</b></li>
  <li v-click>宣誓が崩れた瞬間、実行時例外</li>
  <li v-click>代替：早期return / ifで分岐して安全にする</li>
</ul>

---
class: text-left text-sm
---

## コード：! を使わずに分岐する

<<< ./snippets/non-null.ts#snippet

<!--
話すこと:
- “ここでnullじゃないはず” は仕様の一部。ならコードで表現する。
-->

---
level: 1
class: text-left
---

# 3. 目に見えない殺し方：広すぎる型 / stringly-typed

---
layout: center
class: text-left
---

## メタファー：住所が「文字列」だけの世界

<ul>
  <li v-click>住所を全部 <code>string</code> にすると、国/郵便番号/県…が混ざる</li>
  <li v-click>コンパイルは通るけど、現場で迷子になる</li>
</ul>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  「意味」を型にする：<b>ブランド型</b> / <b>ユニオン</b> / <b>値オブジェクト</b>
</div>

<!--
話すこと:
- stringly-typedは “とりあえず” の代表。
- “意味の違うstring” を分けるだけで事故が減る。
-->

---
class: text-left text-sm
---

## コード：ブランド型で「意味の違うstring」を分ける

<<< ./snippets/brand.ts#snippet

---
class: text-left
---

## switchにdefaultを書く（静かに殺す）

<div class="text-sm leading-7">
  <div v-click>defaultを書くと、ユニオンの追加に気づけない</div>
  <div v-click>代替：<code>never</code> で網羅性チェック</div>
</div>

---
class: text-left text-sm
---

## コード：neverで漏れを止める

<<< ./snippets/exhaustive.ts#snippet

<!--
話すこと:
- “機能追加で壊れる箇所” をコンパイルエラーにするのが勝ち。
-->

---
level: 1
class: text-left
---

# 4. 境界で型を作る（安全に穴を閉じる）

---
layout: center
class: text-left
---

## 境界ってどこ？

<ul>
  <li v-click>HTTPリクエスト / JSON</li>
  <li v-click>DBレコード</li>
  <li v-click>環境変数</li>
  <li v-click>ユーザー入力</li>
</ul>

<div v-after class="mt-6 p-3 rounded bg-gray-100/40">
  ここは <b>unknown</b> で受けて、検証してから “ドメイン型” に変換する
</div>

<!--
話すこと:
- “外の世界” は型がない。だから境界でだけ頑張る。
-->

---
class: text-left text-sm
---

## コード：境界でunknown→Domainへ（判定結果を返す）

<<< ./snippets/boundary-parse.ts#snippet

<!--
話すこと:
- 失敗理由を返せると、UI/ログ/テストが全部楽になる。
-->

---
level: 1
class: text-left
---

---
layout: center
class: text-left
---

# まとめ

<ul>
  <li v-click>型安全性を殺す “楽な手段” を見抜く（as/any/!）</li>
  <li v-click>境界で型を作り、内部で守る</li>
  <li v-click>「意味の違う値」を型で分ける（ユニオン/ブランド型）</li>
  <li v-click>網羅性チェックで“静かなバグ”を止める（never）</li>
</ul>

<!--
話すこと:
- 次のレビューから使える観点：as/any/! が出たら「境界？根拠ある？」を聞く。
-->
