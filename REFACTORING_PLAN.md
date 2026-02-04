# リファクタリング計画書

## 現状分析

### ファイル構成と行数

| ファイル | 行数 | 状態 |
|---------|------|------|
| `config.js` | 182 | ✅ 適切 |
| `gameState.js` | 519 | ⚠️ やや大きい（許容範囲） |
| `audio.js` | 243 | ✅ 適切 |
| `sfx.js` | 288 | ✅ 適切 |
| `ui.js` | 327 | ✅ 適切 |
| `map.js` | **1917** | ❌ **肥大化（分割必須）** |
| `battle.js` | **1698** | ❌ **肥大化（分割必須）** |
| `main.js` | 458 | ✅ 適切 |

### 問題点

1. **map.js (1917行)**: 複数の責務が混在
   - SVG生成（7種類のSVG生成関数）
   - マップ描画
   - 移動処理
   - タイルイベント処理
   - NPC管理
   - 仲間位置管理

2. **battle.js (1698行)**: 戦闘システムが巨大
   - 戦闘開始処理
   - UI更新
   - コマンド処理
   - ターン処理
   - 魔法処理
   - ダメージ計算
   - 戦闘終了処理

---

## 再設計方針

### 原則

1. **単一責任の原則（SRP）**: 各ファイルは1つの明確な責務を持つ
2. **「何をしているか」で分類**: 「どこで使われているか」ではなく、処理内容で分類
3. **500行ルール**: 1ファイル500行を超える場合は再分割を検討
4. **検索性**: ファイル名から内容が推測できる

---

## 分割設計

### 1. map.js の分割

#### 1-1. `js/sprites/svgGenerator.js` (新規)
**責務**: SVGスプライトの生成
- `generateVillagerSVG()` - 村人のSVG生成
- `generateInnSVG()` - 宿屋のSVG生成
- `generateItemShopSVG()` - 道具屋のSVG生成
- `generateGoldenCatSVG()` - 金色の猫のSVG生成
- `generateCatNPCHTML()` - 猫NPCのHTML生成
- `generateElderSVG()` - おばあさんのSVG生成
- `generateAllySVG()` - 仲間のSVG生成

**理由**: SVG生成は独立した責務。視覚表現の変更時に影響範囲を限定できる。

#### 1-2. `js/map/mapRenderer.js` (新規)
**責務**: マップの描画処理
- `drawMap()` - マップ全体の描画
- セル生成とスタイル設定
- 地形タイプのクラス設定

**理由**: 描画ロジックは独立した責務。UI変更時に影響範囲を限定できる。

#### 1-3. `js/map/movement.js` (新規)
**責務**: キャラクターの移動処理
- `moveHero()` - 主人公の移動
- `handleAreaTransition()` - エリア移動処理
- `isValidMapPosition()` - 座標検証
- `handleDoorTile()` - 扉タイル処理
- `afterMove()` - 移動後の処理

**理由**: 移動ロジックは独立した責務。ゲームロジックの変更時に影響範囲を限定できる。

#### 1-4. `js/map/tileEvents.js` (新規)
**責務**: タイルイベントの処理
- `handleTileEvent()` - タイルイベントのルーティング
- `handleGoldenCatEvent()` - 金色の猫イベント
- `isEncounterableTile()` - エンカウント可能判定

**理由**: イベント処理は独立した責務。シナリオ変更時に影響範囲を限定できる。

#### 1-5. `js/map/npcManager.js` (新規)
**責務**: NPCの管理
- `updateNPCs()` - NPCの位置更新（ランダム移動）

**理由**: NPC管理は独立した責務。NPC機能拡張時に影響範囲を限定できる。

#### 1-6. `js/map/allyManager.js` (新規)
**責務**: 仲間の位置管理
- `getAllyPosition()` - 仲間の位置取得
- `getPreviousMemberPosition()` - 前のメンバーの位置取得
- `getBehindPosition()` - 後ろの位置計算
- `getDirectionFromMovement()` - 移動方向から方向文字列取得
- `updateAllyPosition()` - 仲間の位置更新
- `addAlly()` - 仲間をパーティに追加

**理由**: 仲間管理は独立した責務。パーティシステム変更時に影響範囲を限定できる。

#### 1-7. `js/map/worldTransition.js` (新規)
**責務**: 異世界転移処理
- `transferToOtherWorld()` - 異世界への転移
- `returnFromOtherWorld()` - 異世界からの復帰
- `playMysteriousSound()` - 転移時の音声再生
- `showYesNoModal()` - はい/いいえモーダル表示

**理由**: 異世界転移は特殊な機能。外部ゲーム連携変更時に影響範囲を限定できる。

---

### 2. battle.js の分割

#### 2-1. `js/battle/battleInitializer.js` (新規)
**責務**: 戦闘の初期化処理
- `startBattle()` - 通常戦闘開始
- `startAllyTrialBattle()` - 仲間試練戦闘開始
- `startWaterSpiritBattle()` - 水の精霊戦闘開始
- `startForestWitchBattle()` - 森の魔女戦闘開始
- `startBossBattle()` - ボス戦闘開始
- `startNiseousamaBattle()` - 偽王様戦闘開始
- `startMomoBattle()` - 桃仙人戦闘開始
- `initBattle()` - 戦闘初期化
- `showBattleStartAnimation()` - 戦闘開始演出

**理由**: 戦闘開始処理は独立した責務。新しい戦闘タイプ追加時に影響範囲を限定できる。

#### 2-2. `js/battle/battleUI.js` (新規)
**責務**: 戦闘画面のUI更新
- `updateBattleStatus()` - パーティステータス更新
- `updateEnemyHPBar()` - 敵HPバー更新
- `addBattleLog()` - 戦闘ログ追加
- `updateCommandCursor()` - コマンドカーソル更新
- `updateMagicCursor()` - 魔法カーソル更新
- `showMagicList()` - 魔法リスト表示
- `hideMagicList()` - 魔法リスト非表示
- `setupCommandTouchHandlers()` - タッチ操作ハンドラー設定

**理由**: UI更新は独立した責務。UIデザイン変更時に影響範囲を限定できる。

#### 2-3. `js/battle/battleCommands.js` (新規)
**責務**: 戦闘コマンドの処理
- `moveCommandCursor()` - コマンドカーソル移動
- `moveMagicCursor()` - 魔法カーソル移動
- `executeSelectedCommand()` - 選択コマンド実行
- `executeSelectedMagic()` - 選択魔法実行
- `getAvailableMagic()` - 使用可能魔法取得

**理由**: コマンド処理は独立した責務。コマンド追加時に影響範囲を限定できる。

#### 2-4. `js/battle/battleTurns.js` (新規)
**責務**: ターン処理
- `heroTurn()` - 主人公のターン
- `partyTurn()` - パーティメンバーのターン
- `enemyTurn()` - 敵のターン
- `useItem()` - アイテム使用
- `tryEscape()` - 逃走処理

**理由**: ターン処理は独立した責務。ターン制ルール変更時に影響範囲を限定できる。

#### 2-5. `js/battle/magicSystem.js` (新規)
**責務**: 魔法システム
- `castMagic()` - 魔法実行
- `handleAttackMagic()` - 攻撃魔法処理
- `handleHealMagic()` - 回復魔法処理
- `handleShieldMagic()` - シールド魔法処理
- `handleAttackStatusMagic()` - 攻撃＋状態異常魔法処理
- `showMagicEffect()` - 魔法エフェクト表示
- `getEffectDuration()` - エフェクト表示時間取得

**理由**: 魔法システムは独立した責務。魔法追加時に影響範囲を限定できる。

#### 2-6. `js/battle/damageSystem.js` (新規)
**責務**: ダメージ計算と表示
- `calculateDamage()` - ダメージ計算
- `performAttack()` - 攻撃処理
- `showDamageNumber()` - ダメージ数値表示
- `showDamageNumberOnParty()` - 味方へのダメージ数値表示
- `showCriticalText()` - クリティカルテキスト表示
- `showBattleFlash()` - 画面フラッシュエフェクト

**理由**: ダメージ計算は独立した責務。バランス調整時に影響範囲を限定できる。

#### 2-7. `js/battle/statusEffects.js` (新規)
**責務**: 状態異常の処理
- `applyStatusEffect()` - 状態異常適用
- `processStatusEffects()` - 状態異常処理（ターン開始時）

**理由**: 状態異常は独立した責務。新しい状態異常追加時に影響範囲を限定できる。

#### 2-8. `js/battle/battleEnd.js` (新規)
**責務**: 戦闘終了処理
- `winBattle()` - 戦闘勝利処理
- `confirmBattleResult()` - 戦闘結果確定
- `handleBattleRewards()` - 戦闘報酬処理
- `endAllyTrialDefeat()` - 仲間試練戦闘敗北処理
- `showVictoryAnimation()` - 勝利演出表示
- `showWaterSpiritRewardMenu()` - 水の精霊報酬メニュー

**理由**: 戦闘終了処理は独立した責務。報酬システム変更時に影響範囲を限定できる。

---

## 分割後のファイル構成

```
js/
├── config.js                    (182行) - 定数定義
├── gameState.js                 (519行) - ゲーム状態管理
├── audio.js                     (243行) - BGM管理
├── sfx.js                       (288行) - 効果音管理
├── ui.js                        (327行) - UI更新とダイアログ
├── main.js                      (458行) - 初期化とコントローラー
│
├── sprites/
│   └── svgGenerator.js          (約600行) - SVGスプライト生成
│
├── map/
│   ├── mapRenderer.js           (約300行) - マップ描画
│   ├── movement.js              (約400行) - 移動処理
│   ├── tileEvents.js            (約200行) - タイルイベント
│   ├── npcManager.js            (約100行) - NPC管理
│   ├── allyManager.js           (約300行) - 仲間位置管理
│   └── worldTransition.js       (約200行) - 異世界転移
│
└── battle/
    ├── battleInitializer.js     (約300行) - 戦闘初期化
    ├── battleUI.js              (約400行) - 戦闘UI更新
    ├── battleCommands.js        (约200行) - コマンド処理
    ├── battleTurns.js           (约300行) - ターン処理
    ├── magicSystem.js           (约400行) - 魔法システム
    ├── damageSystem.js          (约300行) - ダメージ計算
    ├── statusEffects.js         (约100行) - 状態異常
    └── battleEnd.js             (约300行) - 戦闘終了処理
```

---

## 分割の判断基準

### 1. 単一責任の原則（SRP）
- **SVG生成**: 視覚表現の生成のみ
- **マップ描画**: 画面への描画のみ
- **移動処理**: 座標計算と移動ロジックのみ
- **タイルイベント**: イベントのルーティングと処理のみ

### 2. 変更の影響範囲
- **SVG生成を変更**: `svgGenerator.js` のみ影響
- **UIデザインを変更**: `battleUI.js` のみ影響
- **魔法を追加**: `magicSystem.js` のみ影響

### 3. 検索性
- **SVGを探す**: `sprites/svgGenerator.js`
- **移動処理を探す**: `map/movement.js`
- **魔法処理を探す**: `battle/magicSystem.js`

### 4. 500行ルール
- 各ファイルは500行以下を目標
- `svgGenerator.js` は約600行だが、7種類のSVG生成関数が含まれるため許容

---

## 実装手順

1. **新規ディレクトリ作成**
   - `js/sprites/`
   - `js/map/`
   - `js/battle/`

2. **ファイル分割**
   - 各ファイルを責務ごとに分割
   - 依存関係を確認しながら順次移行

3. **index.html の更新**
   - 新しいファイルパスを反映

4. **動作確認**
   - 各機能が正常に動作することを確認

---

## 注意事項

1. **循環依存の回避**: ファイル間の依存関係を明確にする
2. **グローバル変数の扱い**: `gameState`, `hero`, `party` などは既存のまま使用
3. **関数のエクスポート**: 必要に応じてグローバルスコープに公開
4. **後方互換性**: 既存の関数呼び出しが動作することを確認

---

## 期待される効果

1. **可読性向上**: 各ファイルの責務が明確になり、理解しやすくなる
2. **保守性向上**: 変更時の影響範囲が限定され、修正が容易になる
3. **検索性向上**: ファイル名から内容が推測でき、目的のコードを見つけやすい
4. **拡張性向上**: 新機能追加時の影響範囲が明確になる
