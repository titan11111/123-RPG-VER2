/* ============================================
   初期化とコントローラー処理、シナリオイベント
   ============================================ */

/**
 * iOS Safari対応: 音声アンロック＋タイトル画面時はタイトルBGM再生
 * ユーザー操作のたびに呼んでよい（内部で重複再生を防ぐ）
 */
function ensureAudioUnlockAndMaybePlayTitleBGM() {
    if (typeof audioContextUnlocked !== 'undefined' && typeof unlockAudioContext === 'function' && !audioContextUnlocked) {
        unlockAudioContext();
    }
    const startScreen = document.getElementById('start-screen');
    if (!startScreen || !startScreen.classList.contains('active')) return;
    if (typeof playBGM !== 'function') return;
    const currentBGM = typeof getCurrentBGM === 'function' ? getCurrentBGM() : null;
    if (currentBGM && currentBGM.id === 'bgm-title' && !currentBGM.paused) return;
    setTimeout(() => { playBGM('bgm-title'); }, TIMING.AUDIO_UNLOCK_RETRY_MS || 100);
}

/**
 * 移動入力処理
 * @param {number} dx - X方向の移動量（-1, 0, 1）
 * @param {number} dy - Y方向の移動量（-1, 0, 1）
 */
function handleMove(dx, dy) {
    ensureAudioUnlockAndMaybePlayTitleBGM();

    // 戦闘中のコマンド選択
    if (gameState.isBattle && gameState.canAttack) {
        if (dy === -1) {
            // 上ボタン：コマンドを上に移動
            moveCommandCursor(-1);
        } else if (dy === 1) {
            // 下ボタン：コマンドを下に移動
            moveCommandCursor(1);
        }
        return;
    }
    
    // 移動できない状態のチェック
    if (gameState.isBattle) return;
    if (document.getElementById('custom-dialog-overlay').style.display === 'flex') return;
    if (document.getElementById('yes-no-modal-overlay').style.display === 'flex') return;
    if (document.getElementById('prologue-screen').classList.contains('active')) return;
    
    moveHero(dx, dy);
}

function handleA() {
    ensureAudioUnlockAndMaybePlayTitleBGM();

    const dialogOverlay = document.getElementById('custom-dialog-overlay');
    const yesNoModal = document.getElementById('yes-no-modal-overlay');
    const startScreen = document.getElementById('start-screen');
    const prologueScreen = document.getElementById('prologue-screen');
    const endingScreen = document.getElementById('ending-screen');
    const townActions = document.getElementById('town-actions');

    // はい/いいえモーダルが開いている場合は「はい」を選択
    if (yesNoModal && yesNoModal.style.display === 'flex') {
        const yesButton = document.getElementById('yes-button');
        if (yesButton) {
            yesButton.click();
        }
        return;
    }

    // ダイアログが開いている場合は閉じる（仲間の挑発台詞の直後なら試練戦闘開始）
    if (dialogOverlay.style.display === 'flex') {
        if (gameState.pendingAllyTrial !== null) {
            const tile = gameState.pendingAllyTrial;
            gameState.pendingAllyTrial = null;
            closeCustomDialog();
            if (typeof startAllyTrialBattle === 'function') startAllyTrialBattle(tile);
        } else {
            closeCustomDialog();
        }
        return;
    }

    // タイトル画面
    if (startScreen.classList.contains('active')) {
        // 復帰フラグがある場合はプロローグをスキップしてメインへ
        const waitingForReturn = localStorage.getItem('rpgWaitingForReturn');
        const savedState = localStorage.getItem('rpgSavedState');
        if (waitingForReturn === 'true' && savedState) {
            if (typeof stopAllBGM === 'function') stopAllBGM();
            showScreen('main-screen');
            setTimeout(() => {
                if (typeof returnFromOtherWorld === 'function') returnFromOtherWorld();
            }, 1000);
            return;
        }

        // 1回目A: オープニングBGMを再生してタイトルに留まる
        if (gameState.titleScreenStep === 0) {
            if (typeof playBGM === 'function') {
                const currentBGM = typeof getCurrentBGM === 'function' ? getCurrentBGM() : null;
                if (!currentBGM || currentBGM.id !== 'bgm-title' || currentBGM.paused) {
                    playBGM('bgm-title');
                }
            }
            gameState.titleScreenStep = 1;
            return;
        }

        // 2回目A: プロローグへ進む
        if (typeof stopAllBGM === 'function') stopAllBGM();
        showScreen('prologue-screen');
        setTimeout(() => {
            if (typeof playBGM === 'function') playBGM('bgm-prologue');
        }, 150);
        gameState.titleScreenStep = 0; // 次回起動用にリセット
        return;
    }

    // プロローグ画面
    if (prologueScreen.classList.contains('active')) {
        startPrologue();
        return;
    }

    // エンディング画面
    if (endingScreen.classList.contains('active')) {
        // BGMを停止してからリロード
        stopAllBGM();
        location.reload();
        return;
    }

    // 戦闘中
    if (gameState.isBattle) {
        if (gameState.isBattleEnding) {
            confirmBattleResult();
        } else if (gameState.canAttack) {
            executeSelectedCommand();
        }
        return;
    }

    // 宿屋アクション
    if (townActions.style.display === 'block') {
        rest();
        return;
    }

    // メイン画面：仲間のいるマスでAボタン→挑発台詞を表示（閉じたら試練戦闘開始・勝てば仲間）
    const mainScreen = document.getElementById('main-screen');
    if (mainScreen && mainScreen.classList.contains('active')) {
        const map = worldMaps[hero.currentArea];
        if (map && map.data && map.data[hero.y] !== undefined) {
            const tile = map.data[hero.y][hero.x];
            if ((tile === TILE.ALLY_DOG || tile === TILE.ALLY_BIRD || tile === TILE.ALLY_MONKEY)) {
                const ally = allyData[tile];
                if (ally && !party.find(m => m.name === ally.name)) {
                    gameState.pendingAllyTrial = tile;
                    showAlert(`${ally.name}:「${ally.trialMsg}」\n\nAボタンで戦いを始める`);
                    return;
                }
            }
        }
    }
}

function handleB() {
    // はい/いいえモーダルが開いている場合は「いいえ」を選択
    const yesNoModal = document.getElementById('yes-no-modal-overlay');
    if (yesNoModal && yesNoModal.style.display === 'flex') {
        const noButton = document.getElementById('no-button');
        if (noButton) {
            noButton.click();
        }
        return;
    }
    
    // 魔法選択中はキャンセル
    if (gameState.isBattle && gameState.isSelectingMagic) {
        hideMagicList();
        gameState.isSelectingMagic = false;
        return;
    }
    console.log("Bボタン");
}

/**
 * プロローグ進行処理
 */
function startPrologue() {
    const textElem = document.getElementById('prologue-text');
    const step = gameState.prologueStep;
    
    if (step === 0) {
        // 名前入力
        let name = prompt("お主の名前を教えてくれ（カタカナ4文字以内）", "ユウシャ");
        if (!name) name = "ユウシャ";
        hero.name = name.substring(0, 4);
        textElem.innerText = `王様：「そうじゃった、${hero.name}よ。頼みがある。」`;
        gameState.prologueStep++;
    } else if (step === 1) {
        textElem.innerText = "王様：「最近、街の川の流れが悪くなっておるのじゃ。」";
        gameState.prologueStep++;
    } else if (step === 2) {
        textElem.innerText = "王様：「何者かが川上で悪さをしているのかもしれん。」";
        gameState.prologueStep++;
    } else if (step === 3) {
        textElem.innerText = `王様：「${hero.name}よ、川上を調べてきてはくれまいか？」`;
        gameState.prologueStep++;
    } else {
        // プロローグ終了、ゲーム開始
        showScreen('main-screen');
        drawMap();
        updateStatus();
        playAreaBGM(hero.currentArea);
        showAlert("王様に頼まれ、冒険が始まった！");
        
        // メイン画面に遷移した後、復帰フラグをチェック（念のため）
        setTimeout(() => {
            checkReturnFromOtherWorld();
        }, 500);
    }
}

/**
 * ボスイベントのトリガー処理
 */
function triggerBossEvent() {
    const choice = confirm("水源に魔王がいます。戦いますか？");
    if (choice) {
        startBossBattle();
    } else {
        const joinChoice = confirm("私が元王様だ。水源の岩をどかすのを手伝ってくれんか？");
        if (joinChoice) {
            gameState.trueKingMet = true;
            showAlert("ありがとう。街の王は偽物じゃ。懲らしめてくれ。");
        } else {
            startBossBattle();
        }
    }
}

/**
 * 偽王様（オウサマニア）戦闘開始
 */
function startNiseousamaBattle() {
    showAlert("オウサマニア:「バレたか。邪魔者は消えよ！！！！」");
    gameState.isBattle = true;
    gameState.isBattleEnding = false;
    gameState.currentEnemy = { 
        name: "オウサマニア", 
        hp: 1200, 
        atk: 70, 
        exp: 0, 
        gold: 0, 
        img: 'images/niseousama.png'
    };
    initBattle();
}

/**
 * 桃仙人戦闘開始
 */
function startMomoBattle() {
    showAlert("桃仙人:「わしのお供を勝手に仲間にしたのはお前か？\n許さん！」");
    gameState.isBattle = true;
    gameState.isBattleEnding = false;
    gameState.currentEnemy = { 
        name: "桃仙人", 
        hp: 800, 
        atk: 45, 
        exp: 1000, 
        gold: 500, 
        img: 'images/momosennin.png'
    };
    initBattle();
}

// タッチイベントの防止設定
document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });

// 外部ゲームから復帰したかチェック
function checkReturnFromOtherWorld() {
    // localStorageで復帰を検出
    const waitingForReturn = localStorage.getItem('rpgWaitingForReturn');
    const savedState = localStorage.getItem('rpgSavedState');
    
    // 復帰処理を実行する条件：フラグ'true'かつ保存状態あり
    if (waitingForReturn !== 'true' || !savedState) return;
    
    const mainScreen = document.getElementById('main-screen');
    const startScreen = document.getElementById('start-screen');
    
    // タイトル画面の場合：124クリア後の復帰なので、自動でメインへ移し金の猫位置でイベント開始
    if (startScreen && startScreen.classList.contains('active')) {
        if (typeof stopAllBGM === 'function') stopAllBGM();
        showScreen('main-screen');
        setTimeout(() => {
            if (typeof returnFromOtherWorld === 'function') returnFromOtherWorld();
        }, 1000);
        return;
    }
    
    // メイン画面表示中の場合
    if (mainScreen && mainScreen.classList.contains('active')) {
        setTimeout(() => {
            if (typeof returnFromOtherWorld === 'function') returnFromOtherWorld();
        }, 1000);
    }
}

// ページ読み込み時の初期化
window.addEventListener('load', function() {
    // 外部ゲームから復帰したかチェック
    checkReturnFromOtherWorld();
    // iOS Safari対応: ページ読み込み時に音声コンテキストをアンロック試行
    // ユーザー操作がないと実際にはアンロックされないが、準備はしておく
    if (typeof unlockAudioContext === 'function') {
        unlockAudioContext();
    }
    
    // タイトル画面が表示されている場合、game-containerにクラスを追加
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    if (startScreen && startScreen.classList.contains('active')) {
        gameContainer.classList.add('start-screen-active');
        
        // タイトル画面が表示されている場合、タイトルBGMを再生試行
        // ユーザー操作後に確実に再生されるように、少し待機してから試行
        setTimeout(() => {
            if (typeof playBGM === 'function') {
                // ユーザー操作を待つため、ここでは再生しない
                // 最初のユーザー操作（Aボタンなど）で再生される
            }
        }, 500);
    }
    
    console.log('ゲーム初期化完了');
});

document.addEventListener('touchstart', ensureAudioUnlockAndMaybePlayTitleBGM, { once: true });
document.addEventListener('click', function() {
    if (typeof unlockAudioContext === 'function' && typeof audioContextUnlocked !== 'undefined' && !audioContextUnlocked) unlockAudioContext();
}, { once: true });

/* ============================================
   キーボード入力対応（PC用）
   ============================================ */

document.addEventListener('keydown', function(event) {
    ensureAudioUnlockAndMaybePlayTitleBGM();

    // キーコードに応じて移動処理
    let dx = 0;
    let dy = 0;
    
    switch(event.key) {
        // 矢印キー
        case 'ArrowUp':
            dy = -1;
            break;
        case 'ArrowDown':
            dy = 1;
            break;
        case 'ArrowLeft':
            dx = -1;
            break;
        case 'ArrowRight':
            dx = 1;
            break;
        // WASDキー
        case 'w':
        case 'W':
            dy = -1;
            break;
        case 's':
        case 'S':
            dy = 1;
            break;
        case 'a':
        case 'A':
            dx = -1;
            break;
        case 'd':
        case 'D':
            dx = 1;
            break;
        default:
            return; // 対応していないキーは何もしない
    }
    
    // 移動処理を実行
    if (dx !== 0 || dy !== 0) {
        event.preventDefault(); // デフォルトの動作を防ぐ（スクロールなど）
        handleMove(dx, dy);
    }
});
