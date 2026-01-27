/* ============================================
   音楽管理システム
   ============================================ */
const BGM_VOLUME = 0.7; // 70%音量
let currentBGM = null;
let audioContextUnlocked = false; // iOS Safari対応フラグ

/**
 * iOS Safari対応: ユーザー操作で音声コンテキストをアンロック
 */
function unlockAudioContext() {
    if (audioContextUnlocked) return;
    
    try {
        // 全てのaudio要素を一度再生・停止してアンロック
        // 音量を0にしてから再生・停止することで、動作音を防ぐ
        const audioElements = document.querySelectorAll('audio');
        const unlockPromises = Array.from(audioElements).map(audio => {
            const originalVolume = audio.volume;
            audio.volume = 0; // 音量を0にしてから再生（動作音を防ぐ）
            const promise = audio.play();
            if (promise !== undefined) {
                return promise
                    .then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = originalVolume; // 音量を元に戻す
                    })
                    .catch(() => {
                        // エラーは無視（まだロックされている可能性）
                        audio.volume = originalVolume; // エラー時も音量を元に戻す
                    });
            } else {
                audio.volume = originalVolume; // Promiseが返らない場合も音量を元に戻す
            }
        });
        
        Promise.all(unlockPromises).then(() => {
            audioContextUnlocked = true;
            console.log('音声コンテキストをアンロックしました');
        });
    } catch (error) {
        console.error('音声コンテキストアンロックエラー:', error);
    }
}

/**
 * BGM要素を取得。未定義なら BGM_FALLBACK_MAP で代替IDを解決
 * @param {string} bgmId - BGM ID
 * @returns {{ audio: HTMLAudioElement, resolvedId: string } | null}
 */
function getBGMWithFallback(bgmId) {
    let audio = document.getElementById(bgmId);
    let resolvedId = bgmId;
    while (!audio && typeof BGM_FALLBACK_MAP !== 'undefined' && BGM_FALLBACK_MAP[resolvedId]) {
        const fallbackId = BGM_FALLBACK_MAP[resolvedId];
        console.warn(`BGM要素が見つかりません: ${resolvedId} → ${fallbackId} を使用`);
        resolvedId = fallbackId;
        audio = document.getElementById(fallbackId);
    }
    if (!audio) return null;
    return { audio, resolvedId };
}

/**
 * 全てのBGMを停止
 */
function stopAllBGM() {
    try {
        // 現在のBGMを明示的に停止
        if (currentBGM) {
            try {
                currentBGM.pause();
                currentBGM.currentTime = 0;
            } catch (e) {
                // エラーは無視
            }
        }
        
        // 全てのBGM要素を停止（念のため）
        const bgmIds = [
            'bgm-title', 'bgm-prologue', 'bgm-town', 'bgm-field',
            'bgm-battle', 'bgm-boss', 'bgm-lastboss', 'bgm-ending'
        ];
        
        bgmIds.forEach(id => {
            const audio = document.getElementById(id);
            if (audio) {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) {
                    // 個別のエラーは無視
                }
            }
        });
        
        currentBGM = null;
        console.log('全てのBGMを停止しました');
    } catch (error) {
        console.error('BGM停止エラー:', error);
        currentBGM = null;
    }
}

/**
 * BGMを再生
 * @param {string} bgmId - BGM ID
 * @param {number} volume - 音量（0.0-1.0、省略時はBGM_VOLUME）
 */
function playBGM(bgmId, volume = null) {
    try {
        const resolved = getBGMWithFallback(bgmId);
        if (!resolved) {
            console.error(`BGM要素・フォールバックも見つかりません: ${bgmId}`);
            return;
        }
        const { audio, resolvedId } = resolved;

        // 同じBGMが既に再生中なら何もしない
        if (currentBGM && currentBGM.id === resolvedId && !currentBGM.paused) {
            console.log(`BGM既に再生中: ${resolvedId}`);
            return;
        }

        stopAllBGM();

        const targetVolume = volume != null ? Math.min(1.0, Math.max(0.0, volume)) : BGM_VOLUME;
        audio.volume = targetVolume;
        audio.currentTime = 0;
        currentBGM = audio;

        // ファイル未存在時にフォールバック再生
        audio.addEventListener('error', function onError() {
            console.warn(`BGMファイル読み込み失敗: ${resolvedId}`);
            if (typeof BGM_FALLBACK_MAP !== 'undefined' && BGM_FALLBACK_MAP[resolvedId]) {
                playBGM(BGM_FALLBACK_MAP[resolvedId], volume);
            } else {
                currentBGM = null;
            }
        }, { once: true });

        const delayMs = typeof TIMING !== 'undefined' ? TIMING.AUDIO_PLAY_DELAY_MS : 200;
        const retryMs = typeof TIMING !== 'undefined' ? TIMING.AUDIO_RETRY_MS : 300;

        if (!audioContextUnlocked) {
            unlockAudioContext();
            setTimeout(() => tryPlayAudio(audio, resolvedId, retryMs), delayMs);
        } else {
            tryPlayAudio(audio, resolvedId, retryMs);
        }
    } catch (error) {
        console.error('BGM再生エラー:', error);
        currentBGM = null;
    }
}

/**
 * 音声を再生（iOS Safari対応）
 * @param {HTMLAudioElement} audio - 音声要素
 * @param {string} bgmId - BGM ID
 * @param {number} [retryDelayMs] - 再試行までの待機ms
 */
function tryPlayAudio(audio, bgmId, retryDelayMs) {
    const retryMs = retryDelayMs ?? (typeof TIMING !== 'undefined' ? TIMING.AUDIO_RETRY_MS : 300);
    const playPromise = audio.play();
    if (playPromise === undefined) {
        console.log(`BGM再生: ${bgmId}`);
        return;
    }
    playPromise
        .then(() => { console.log(`BGM再生成功: ${bgmId}`); })
        .catch(error => {
            console.error(`BGM再生エラー (${bgmId}):`, error);
            if (!audioContextUnlocked) {
                unlockAudioContext();
                setTimeout(() => {
                    const p = audio.play();
                    if (p && p.then) {
                        p.then(() => { console.log(`BGM再試行成功: ${bgmId}`); })
                            .catch(e => {
                                console.error(`BGM再試行エラー (${bgmId}):`, e);
                                currentBGM = null;
                            });
                    }
                }, retryMs);
            } else {
                currentBGM = null;
            }
        });
}

/**
 * エリアに応じたBGMを再生
 */
function playAreaBGM(areaId) {
    const bgmId = AREA_BGM_MAP[areaId] || 'bgm-field';
    playBGM(bgmId);
}

/**
 * 現在再生中のBGMを取得
 * @returns {HTMLAudioElement|null} 現在のBGM要素、またはnull
 */
function getCurrentBGM() {
    return currentBGM;
}
