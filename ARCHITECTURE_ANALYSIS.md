# アーキテクチャ分析と分割計画

## 現状分析

### 500行を超えるファイル

1. **css/style.css** - 3,340行（大幅超過）
2. **js/gameState.js** - 522行（少し超過）
3. **js/sprites/svgGenerator.js** - 783行（大幅超過）

## 分割計画

### 1. CSSファイルの分割（3,340行 → 6ファイル）

#### css/base.css（約50行）
- テーマ変数（:root）
- 基本リセット（html, body）
- iOS・レスポンシブ対応の基本設定

#### css/layout.css（約600行）
- ゲームコンテナ（#game-container）
- 画面（.screen, .active）
- ウィンドウ（.ff-window）
- ダイアログ（#custom-dialog-overlay, #yes-no-modal-overlay）
- ステータスオーバーレイ（.status-overlay）
- フィールド背景色（#game-container.field-*）

#### css/map.css（約1,100行）
- マップグリッド（#map-grid）
- セル（.cell, .cell.wall, .cell.plain など）
- オブジェクト（.cell.obj-*）
- アニメーション（@keyframes）
- フィールド別スタイル

#### css/battle.css（約1,000行）
- 戦闘画面（#battle-screen）
- 敵エリア（.enemy-area）
- 戦闘UI（.battle-ui）
- コマンドボックス（.command-box）
- ステータスボックス（.status-box）
- 戦闘ログ（#battle-log）
- レスポンシブ対応（メディアクエリ）

#### css/controls.css（約100行）
- コントロールパネル（#control-panel）
- 方向パッド（.d-pad, .pad-btn）
- アクションボタン（.action-group, .circle-btn）

#### css/magic-effects.css（約670行）
- 魔法エフェクトコンテナ（.magic-effect-container）
- 各魔法エフェクト（.magic-effect-*）
- アニメーション（@keyframes）

### 2. gameState.jsの分割（522行 → 2ファイル）

#### js/gameState.js（約200行）
- gameStateオブジェクト
- heroオブジェクト
- party配列
- 状態管理関数

#### js/gameData.js（約320行）
- worldMaps（ワールドマップデータ）
- monsterTable（モンスターテーブル）
- MAGIC_SPELLS（魔法データ）
- allyData（仲間データ）
- shopItems（ショップアイテム）
- MP_ITEMS（MP回復アイテム）
- AREA_BGM_MAP（BGMマッピング）

### 3. svgGenerator.jsの分割（783行 → 4ファイル）

#### js/sprites/villagers.js（約200行）
- generateVillagerSVG()
- generateElderSVG()

#### js/sprites/allies.js（約250行）
- generateAllySVG()（犬・猿・きじ）

#### js/sprites/buildings.js（約150行）
- generateInnSVG()
- generateItemShopSVG()

#### js/sprites/special.js（約180行）
- generateGoldenCatSVG()
- generateCatNPCHTML()

## 実装順序

1. CSSファイルの分割（最優先：3,340行）
2. gameState.jsの分割（522行）
3. svgGenerator.jsの分割（783行）
4. index.htmlの更新（CSS/JSの読み込み順序）

## 注意事項

- 分割後も機能が正常に動作することを確認
- CSS変数（:root）は base.css に集約
- メディアクエリは各ファイルに適切に配置
- 依存関係を考慮した読み込み順序を維持
