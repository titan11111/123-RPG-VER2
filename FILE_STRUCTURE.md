# ファイル構成ドキュメント

## ディレクトリ構造

```
102-シンプルRPG/
├── index.html          (HTML構造のみ、約100行)
├── css/
│   └── style.css       (全CSS、約575行)
├── js/
│   ├── config.js       (定数定義、約50行)
│   ├── gameState.js    (ゲーム状態・データ、約200行)
│   ├── audio.js        (BGM管理、約150行)
│   ├── map.js          (マップ描画・移動、約200行)
│   ├── battle.js       (戦闘システム、約500行)
│   ├── ui.js           (UI更新・ダイアログ、約150行)
│   └── main.js         (初期化・コントローラー、約200行)
├── audio/              (既存のBGMファイル)
└── images/             (既存の画像ファイル)
```

## 各ファイルの役割

### index.html
**役割**: HTML構造のみを定義
- 画面要素（タイトル、プロローグ、メイン、戦闘、エンディング）
- コントロールパネル（D-pad、A/Bボタン）
- カスタムダイアログオーバーレイ
- BGM用のaudio要素
- CSS/JSファイルの読み込み（`<link>`、`<script>`タグ）

### css/style.css
**役割**: 全スタイル定義
- 全体レイアウト（body、game-container）
- 画面切り替え（.screen、.active）
- FF風ウィンドウデザイン（.ff-window）
- マップ表示（#map-grid、.cell）
- 戦闘画面（#battle-screen、.enemy-area、.battle-ui）
- HPバー、ダメージ表示、エフェクト
- コントロールパネル（#control-panel、.d-pad、.pad-btn）
- レスポンシブ対応（メディアクエリ）

### js/config.js
**役割**: 定数定義のみ
- `TILE`: タイルタイプ定数（WALL, ENEMY, CASTLE等）
- `MAP_SIZE`: マップサイズ定数（WIDTH, HEIGHT, MAX_X, MAX_Y）
- `BATTLE`: 戦闘関連定数（TURN_DELAY, ENCOUNTER_RATE, CRITICAL_RATE等）
- `LEVEL_UP`: レベルアップ関連定数（EXP_MULTIPLIER, ATK_BONUS等）
- `TREASURE`: 宝箱関連定数（GOLD_AMOUNT）
- `IMAGE_EXTENSIONS`: 画像拡張子配列

### js/gameState.js
**役割**: ゲーム状態とデータの管理
- `gameState`: ゲーム状態オブジェクト（isBattle, currentEnemy等）
- `hero`: ヒーローのステータス（name, hp, atk, lv等）
- `party`: パーティメンバー配列
- `shopItems`: 武器屋のアイテムデータ
- `allyData`: 仲間キャラクターのデータ
- `monsterTable`: エリア別モンスターテーブル
- `worldMaps`: ワールドマップデータ（全エリアのマップ情報）
- `AREA_BGM_MAP`: エリア別BGMマッピング

### js/audio.js
**役割**: BGM管理システム
- `BGM_VOLUME`: BGM音量定数
- `currentBGM`: 現在再生中のBGM
- `audioContextUnlocked`: iOS Safari対応フラグ
- `unlockAudioContext()`: 音声コンテキストのアンロック
- `stopAllBGM()`: 全BGM停止
- `playBGM(bgmId)`: BGM再生
- `playAreaBGM(areaId)`: エリアに応じたBGM再生

### js/map.js
**役割**: マップ描画と移動処理
- `drawMap()`: マップを描画
- `moveHero(dx, dy)`: ヒーローの移動処理
- `handleAreaTransition(newX, newY, map)`: エリア移動処理
- `isValidMapPosition(x, y)`: 有効な座標か判定
- `handleDoorTile(tile, x, y, map)`: 扉タイル処理
- `handleTileEvent(tile, x, y, map)`: タイルイベント処理
- `isEncounterableTile(tile)`: エンカウント可能なタイルか判定
- `afterMove()`: 移動後の処理
- `updateNPCs()`: NPCの位置更新（ランダム移動）
- `addAlly(type)`: 仲間をパーティに追加

### js/battle.js
**役割**: 戦闘システム全般
- `startBattle()`: 通常戦闘開始
- `startBossBattle()`: ボス戦闘開始
- `startNiseousamaBattle()`: 偽王様戦闘開始
- `startMomoBattle()`: 桃仙人戦闘開始
- `initBattle()`: 戦闘初期化
- `showBattleStartAnimation()`: 戦闘開始演出
- `updateBattleStatus()`: パーティステータス更新
- `updateEnemyHPBar()`: 敵HPバー更新
- `addBattleLog(message)`: 戦闘ログ追加
- `heroTurn(action)`: ヒーローのターン
- `partyTurn()`: パーティメンバーのターン
- `performAttack(attacker)`: 攻撃処理
- `calculateDamage(attacker)`: ダメージ計算
- `enemyTurn()`: 敵のターン
- `winBattle()`: 戦闘勝利処理
- `showVictoryAnimation()`: 勝利演出
- `confirmBattleResult()`: 戦闘結果確定
- `handleBattleRewards(enemy)`: 戦闘報酬処理
- `showDamageNumber(damage, isCritical)`: ダメージ数値表示
- `showCriticalText()`: クリティカルテキスト表示
- `showBattleFlash()`: 画面フラッシュエフェクト
- `showDamageNumberOnParty(damage, target)`: 味方へのダメージ表示

### js/ui.js
**役割**: UI更新とダイアログ管理
- `updateStatus()`: ステータス表示更新
- `showScreen(id)`: 画面切り替え
- `showAlert(text)`: アラートダイアログ表示
- `closeCustomDialog()`: カスタムダイアログを閉じる
- `showShop()`: 武器屋表示・購入処理
- `checkLevelUp()`: レベルアップ判定と処理
- `showLevelUpAnimation(oldLv, newLv)`: レベルアップ演出
- `rest()`: 宿屋で休む（HP/MP全回復）

### js/main.js
**役割**: 初期化とコントローラー処理、シナリオイベント
- `handleMove(dx, dy)`: 移動入力処理
- `handleA()`: Aボタン処理（画面遷移、戦闘、イベント）
- `handleB()`: Bボタン処理
- `startPrologue()`: プロローグ進行処理
- `triggerBossEvent()`: ボスイベントのトリガー処理
- ページ読み込み時の初期化
- タッチイベントの防止設定

## 依存関係

```
index.html
  ├── css/style.css
  └── js/
      ├── config.js (他の全JSファイルから参照)
      ├── gameState.js (map.js, battle.js, ui.js, main.jsから参照)
      ├── audio.js (map.js, battle.js, main.jsから参照)
      ├── map.js (main.jsから参照)
      ├── battle.js (main.jsから参照)
      ├── ui.js (map.js, battle.js, main.jsから参照)
      └── main.js (エントリーポイント)
```

## 開発時の注意事項

1. **グローバル変数の使用**
   - `gameState`, `hero`, `party` は `gameState.js` で定義
   - 他のファイルからは直接参照可能（グローバルスコープ）

2. **定数の参照**
   - 全ての定数は `config.js` で定義
   - 各ファイルで `TILE`, `BATTLE`, `MAP_SIZE` などを参照

3. **関数の呼び出し**
   - 各モジュール間で関数を呼び出す際は、グローバルスコープに定義されていることを前提とする
   - ES6モジュール（import/export）は使用しない（シンプルな構成を維持）

4. **ファイル分割の順序**
   - 1. `config.js` (定数)
   - 2. `gameState.js` (データ)
   - 3. `audio.js` (BGM)
   - 4. `ui.js` (UI)
   - 5. `map.js` (マップ)
   - 6. `battle.js` (戦闘)
   - 7. `main.js` (初期化・コントローラー)
   - 8. `index.html` と `css/style.css` の分離

## 更新履歴

- 2025-01-XX: 初版作成（リファクタリング後、ファイル分割前）
- 2025-01-XX: ファイル分割完了
