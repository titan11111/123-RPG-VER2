# シーン切り替えと対応BGM一覧表

## シーン別BGM対応表

| シーン名 | 画面ID | 対応BGM | 音量 | 切り替えタイミング |
|---------|--------|---------|------|-------------------|
| タイトル画面 | `start-screen` | `bgm-title` | 0.7 | 初回Aボタンで再生、2回目Aボタンでプロローグへ |
| プロローグ画面 | `prologue-screen` | `bgm-prologue` | 0.7 | タイトル画面で2回目Aボタン押下時 |
| メイン画面 | `main-screen` | エリアに応じて変更 | 0.7 | プロローグ終了時、戦闘終了時、エリア移動時 |
| 戦闘画面 | `battle-screen` | 敵の種類に応じて変更 | 1.2 | エンカウント時、ボス戦開始時 |
| エンディング画面 | `ending-screen` | `bgm-ending` | 0.7 | 魔王撃破時 |

## エリア別BGM対応表

| エリアID | エリア名 | 対応BGM |
|---------|---------|---------|
| `town_inside` | ポチの村 | `bgm-town` |
| `green_field` | 始まりの平原 | `bgm-field` |
| `wasteland` | 無法の荒地 | `bgm-field` |
| `lonely_desert` | 寂しい砂漠 | `bgm-field` |
| `tropical_south` | 南国の浜 | `bgm-field` |
| `tropical_village` | 南国の村 | `bgm-field` |
| `water_spirit_dwelling` | 水の精霊のすみか | `bgm-field` |
| `monster_forest` | 魔物の森 | `bgm-field` |
| `ruined_village` | かつての村 | `bgm-field` |
| `dark_forest` | 迷いの森 | `bgm-field` |
| `lava_cave` | 火の洞窟 | `bgm-field` |
| `demon_castle` | 水の山（魔王城） | `bgm-field` |

## 戦闘BGM対応表

| 敵の種類 | 敵名 | 対応BGM | 音量 |
|---------|------|---------|------|
| ラスボス | 魔王 | `bgm-lastboss` | 1.2 |
| 特殊ボス | レア猫がみさま | `bgm-catgod` | 1.2 |
| 通常ボス | オウサマニア | `bgm-boss` | 1.2 |
| 通常ボス | 桃仙人 | `bgm-boss` | 1.2 |
| 通常ボス | 森の魔女 | `bgm-boss` | 1.2 |
| 通常敵 | その他すべて | `bgm-battle` | 1.2 |

## BGMフォールバック設定表

| 元のBGM ID | フォールバック先 | 説明 |
|-----------|----------------|------|
| `bgm-lastboss` | `bgm-boss` | ファイル未存在時の代替 |
| `bgm-boss` | `bgm-battle` | ファイル未存在時の代替 |
| `bgm-catgod` | `bgm-boss` | ファイル未存在時の代替 |
| `bgm-ending` | `bgm-title` | ファイル未存在時の代替 |

## 全BGMファイル一覧

| BGM ID | ファイルパス | 説明 |
|--------|-------------|------|
| `bgm-title` | `audio/title.mp3` | タイトル画面BGM |
| `bgm-prologue` | `audio/prologue.mp3` | プロローグBGM |
| `bgm-town` | `audio/town.mp3` | 村BGM |
| `bgm-field` | `audio/field.mp3` | フィールドBGM |
| `bgm-battle` | `audio/battle.mp3` | 通常戦闘BGM |
| `bgm-boss` | `audio/boss.mp3` | ボス戦BGM |
| `bgm-lastboss` | `audio/lassboss.mp3` | ラスボスBGM（フォールバック: `boss.mp3`） |
| `bgm-ending` | `audio/ending.mp3` | エンディングBGM |
| `bgm-catgod` | `audio/catgod.mp3` | レア猫がみさまBGM |

## シーン遷移フロー

```
タイトル画面 (bgm-title)
    ↓ [1回目Aボタン] BGM再生
    ↓ [2回目Aボタン]
プロローグ画面 (bgm-prologue)
    ↓ [Aボタン連打]
メイン画面 (エリアに応じたBGM)
    ↓ [エンカウント]
戦闘画面 (敵の種類に応じたBGM)
    ↓ [戦闘終了]
メイン画面 (エリアBGMに戻る)
    ↓ [魔王撃破]
エンディング画面 (bgm-ending)
    ↓ [Aボタン]
タイトル画面 (bgm-title)
```
