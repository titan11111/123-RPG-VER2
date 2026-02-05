# iOS対応実装チェックリスト

## ✅ 既に実装済みの項目

### 1. ✅ ビューポート設定（meta viewport）
**実装場所**: `index.html` 6行目
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```
- ✅ 適切なビューポート設定が実装済み
- ✅ `viewport-fit=cover` でノッチ対応も実装済み

### 2. ✅ フルスクリーン表示対応
**実装場所**: `index.html` 7-8行目
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```
- ✅ PWA対応のメタタグが実装済み

### 3. ✅ ダブルタップズーム防止
**実装場所**: 
- `css/base.css` 71行目: `touch-action: manipulation;` (body)
- `css/controls.css`: ボタンに `touch-action: manipulation;`
- その他多数のCSSファイルで実装済み

### 4. ✅ スクロール防止（bounce effect対策）
**実装場所**: `js/main.js` 306行目
```javascript
document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
```
- ✅ オーバースクロール防止が実装済み

### 5. ✅ 音声再生のユーザーインタラクション要件
**実装場所**: 
- `js/audio.js`: `unlockAudioContext()` 関数で実装
- `js/main.js` 403行目: `touchstart` イベントで音声アンロック
- `js/main.js` 9-19行目: `ensureAudioUnlockAndMaybePlayTitleBGM()` で確実にアンロック

### 6. ✅ Web Audio APIの初期化
**実装場所**: `js/sfx.js` 11-21行目
```javascript
function initAudioContext() {
    if (audioContext) return audioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    return audioContext;
}
```
- ✅ iOS対応（webkitAudioContext）が実装済み

### 7. ✅ タッチイベント対応（部分的）
**実装場所**: 
- `js/battle/battleUI.js`: `touchend` イベントでコマンド選択
- `index.html`: `onpointerdown` でボタン操作
- ⚠️ ただし、マウスイベントとタッチイベントの統一処理は部分的

### 8. ✅ CSS Hardware Acceleration
**実装場所**: 多数のCSSファイル
- `css/magic-effects-*.css`: `transform: translateZ(0); -webkit-transform: translateZ(0);`
- `css/battle-screen.css`: ハードウェアアクセラレーション有効化
- ✅ アニメーション要素に実装済み

### 9. ✅ PWA対応（manifest.json）
**実装場所**: `manifest.json`
- ✅ PWA設定が実装済み
- ⚠️ Service Workerは未実装（オフライン対応なし）

### 10. ✅ 画像読み込みのiOS対応
**実装場所**: `js/battle/battleInitializer.js` 199-226行目
- ✅ 日本語ファイル名のURLエンコード対応
- ✅ Imageオブジェクトでの事前読み込み
- ✅ `loading='eager'` と `decoding='async'` の設定

---

## ✅ 実装完了した項目（2025-01-XX更新）

### 1. ✅ LocalStorage/SessionStorageの容量制限対応
**実装場所**: `js/gameState.js`
**実装内容**: 
- `safeLocalStorageSetItem()` - 安全な保存関数
- `safeLocalStorageGetItem()` - 安全な取得関数
- `safeLocalStorageRemoveItem()` - 安全な削除関数
- すべてのLocalStorage使用箇所を置き換え済み

### 2. ✅ ページ表示/非表示時の処理（visibilitychange）
**実装場所**: `js/main.js`
**実装内容**: 
- バックグラウンド時にBGMを停止
- フォアグラウンド復帰時に現在の画面に応じてBGMを再開

### 3. ✅ オリエンテーション変更対応
**実装場所**: `js/main.js`
**実装内容**: 
- `orientationchange` イベントでマップ再描画
- `resize` イベントでURLバー表示/非表示に対応

### 4. ✅ 画像プリロードの実装
**実装場所**: `js/gameState.js`
**実装内容**: 
- `preloadImage()` - 単一画像のプリロード
- `preloadAllGameImages()` - 全画像のプリロード
- ゲーム開始前に自動実行

### 5. ✅ タッチ座標の正確な取得
**実装場所**: `js/gameState.js`
**実装内容**: 
- `getEventCoordinates()` - タッチ/マウス統一処理関数
- `isTouchEvent()` - タッチイベント判定関数

---

## ❌ 未実装・改善が必要な項目

### 1. ❌ Canvas要素のレティナディスプレイ対応
**現状**: Canvas要素を使用していない（SVGとDOM要素を使用）
**対応**: 現在の実装では不要（Canvas未使用のため）

### 3. ❌ requestAnimationFrameの使用
**現状**: `setTimeout` を多用している
**推奨**: アニメーションループには `requestAnimationFrame` を使用すべき
**影響**: iOSでバックグラウンド時にタイマーが遅延する可能性
**優先度**: 中（大規模リファクタリングが必要なため後回し推奨）

### 9. ❌ iOSバージョンごとの機能検出
**現状**: 未実装
**必要な対応**: 機能検出（feature detection）の実装

### 10. ❌ Safariの自動一時停止タイマー対策
**現状**: `setTimeout` を使用
**推奨**: `performance.now()` を使った時間管理
```javascript
let lastTime = performance.now();
function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    // ゲームロジック
    requestAnimationFrame(gameLoop);
}
```

### 11. ❌ Service Workerとオフライン対応
**現状**: `manifest.json` はあるが、Service Worker未実装
**必要な対応**: Service Workerの登録とキャッシュ戦略の実装

### 12. ⚠️ メモリ管理とリソース解放
**現状**: 画像やオーディオリソースの明示的な解放処理がない
**推奨**: 使用していないリソースを解放する処理を追加

---

## 📊 実装状況サマリー

| 項目 | 状態 | 優先度 |
|------|------|--------|
| ビューポート設定 | ✅ 実装済み | - |
| フルスクリーン表示 | ✅ 実装済み | - |
| ダブルタップズーム防止 | ✅ 実装済み | - |
| スクロール防止 | ✅ 実装済み | - |
| 音声再生のユーザーインタラクション | ✅ 実装済み | - |
| Web Audio API初期化 | ✅ 実装済み | - |
| CSS Hardware Acceleration | ✅ 実装済み | - |
| LocalStorageエラーハンドリング | ✅ 実装済み | - |
| visibilitychange対応 | ✅ 実装済み | - |
| 画像プリロード | ✅ 実装済み | - |
| オリエンテーション変更対応 | ✅ 実装済み | - |
| タッチ座標の正確な取得 | ✅ 実装済み | - |
| requestAnimationFrame使用 | ❌ 未実装 | 中 |
| Service Worker | ❌ 未実装 | 低 |
| メモリ管理 | ⚠️ 要改善 | 中 |

---

## 🎯 実装完了状況（2025-01-XX更新）

### ✅ 完了した項目
1. **高優先度** ✅
   - LocalStorageのエラーハンドリング追加 ✅
   - visibilitychangeイベントでゲーム一時停止処理 ✅

2. **中優先度** ✅
   - 画像プリロード機能の実装 ✅
   - オリエンテーション変更対応 ✅
   - タッチ座標の正確な取得（統一処理関数） ✅

### ⏳ 残りの項目（低優先度）
3. **低優先度**
   - Service Worker実装（オフライン対応）
   - メモリ管理の改善
   - requestAnimationFrameへの移行（大規模リファクタリングが必要）
