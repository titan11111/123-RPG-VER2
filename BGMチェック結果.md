# BGMスタート/停止チェック結果

## ✅ 正常に動作している箇所

### 1. タイトル画面 → プロローグ画面
- **停止**: ✅ `stopAllBGM()` が呼ばれている（main.js:109）
- **再生**: ✅ `playBGM('bgm-prologue')` が呼ばれている（main.js:112、150ms遅延）

### 2. メイン画面 → 戦闘画面
- **停止**: ✅ `stopAllBGM()` が呼ばれている（battle.js:257）
- **再生**: ✅ `playBGM()` が呼ばれている（battle.js:263-277、50ms遅延）

### 3. エンディング画面 → タイトル画面
- **停止**: ✅ `stopAllBGM()` が呼ばれている（main.js:127）

### 4. エリア移動時
- **再生**: ✅ `playAreaBGM(hero.currentArea)` が呼ばれている（map.js:1888）
- **注意**: `playBGM()` 内で `stopAllBGM()` が呼ばれるため、前のBGMは自動停止される

## ❌ 問題点

### 1. プロローグ画面 → メイン画面
- **問題**: プロローグBGMが明示的に停止されていない
- **影響**: プロローグBGMがエリアBGMと重複再生される可能性（ただし、`playBGM()`内で`stopAllBGM()`が呼ばれるため、実際には停止される）
- **推奨修正**: 明示的に`stopAllBGM()`を呼ぶ

### 2. 戦闘画面 → エンディング画面
- **問題**: 戦闘BGMが明示的に停止されていない
- **影響**: 戦闘BGMがエンディングBGMと重複再生される可能性（ただし、`playBGM()`内で`stopAllBGM()`が呼ばれるため、実際には停止される）
- **推奨修正**: 明示的に`stopAllBGM()`を呼ぶ

### 3. タイトル画面の初期再生
- **問題**: ページロード時にタイトルBGMが自動再生されない（iOS Safariの制約）
- **現状**: ユーザー操作（Aボタン、移動、タッチ）で`ensureAudioUnlockAndMaybePlayTitleBGM()`が呼ばれ、その中で再生される
- **評価**: iOS Safariの制約上、これは正しい実装

## iOS対応の確認

### ✅ 実装されているiOS対応

1. **音声コンテキストのアンロック**
   - `unlockAudioContext()` 関数が実装されている（audio.js:11-45）
   - 全てのaudio要素を音量0で再生・停止してアンロック
   - `audioContextUnlocked` フラグで重複実行を防止

2. **ユーザー操作による再生開始**
   - `ensureAudioUnlockAndMaybePlayTitleBGM()` が実装されている（main.js:9-19）
   - 移動、Aボタン、タッチイベントで呼ばれる
   - タイトル画面時のみタイトルBGMを再生

3. **再生エラーの再試行**
   - `tryPlayAudio()` 関数で再生エラーをキャッチ（audio.js:164-191）
   - アンロック未完了時は再試行する

4. **再生前の待機時間**
   - 戦闘BGM: 50ms待機（battle.js:277）
   - プロローグBGM: 150ms待機（main.js:112）
   - エンディングBGM: 500ms待機（battle.js:1559）

### ⚠️ 潜在的な問題

1. **エンディングBGMの再生タイミング**
   - `showScreen('ending-screen')` の直後に `playBGM('bgm-ending')` が呼ばれている
   - 待機時間がないため、iOS Safariで再生に失敗する可能性がある
   - **推奨修正**: `setTimeout()` で待機時間を追加

2. **stopAllBGM()の不完全な停止**
   - `stopAllBGM()` で `bgm-catgod` がリストに含まれていない（audio.js:82-84）
   - **推奨修正**: `bgm-catgod` をリストに追加
