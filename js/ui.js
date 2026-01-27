/* ============================================
   UI更新とダイアログ管理
   ============================================ */

/**
 * ステータス表示を更新
 */
function updateStatus() { 
    // 次のレベルまでの必要経験値を計算
    const nextLevelExp = getRequiredExp(hero.lv + 1);
    const currentExp = hero.exp;
    const expToNext = nextLevelExp - currentExp;
    const currentLevelExp = getRequiredExp(hero.lv);
    const expInLevel = currentExp - currentLevelExp;
    const expForLevel = nextLevelExp - currentLevelExp;
    const expPercent = expForLevel > 0 ? Math.floor((expInLevel / expForLevel) * 100) : 100;
    
    document.getElementById('st-hp').innerText = `HP: ${hero.hp}/${hero.maxHp} | MP: ${hero.mp}/${hero.maxMp} | LV:${hero.lv} EXP:${currentExp}(${expPercent}%) | Gold: ${hero.gold}G | 鍵: ${hero.hasKey ? '持' : '無'}`; 
    document.getElementById('st-party').innerText = `一行: [${hero.name}] ` + party.slice(1).map(m => m.name).join(", "); 
}

/**
 * 画面を切り替え
 * @param {string} id - 表示する画面のID
 */
function showScreen(id) { 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
    document.getElementById(id).classList.add('active');
    
    // タイトル画面の時だけgame-containerにクラスを追加（overflow制御用）
    const gameContainer = document.getElementById('game-container');
    if (id === 'start-screen') {
        gameContainer.classList.add('start-screen-active');
    } else {
        gameContainer.classList.remove('start-screen-active');
    }
}

/**
 * アラートダイアログを表示
 * @param {string} text - 表示するテキスト
 */
function showAlert(text) { 
    document.getElementById('dialog-message').innerText = text; 
    document.getElementById('custom-dialog-overlay').style.display = 'flex'; 
}

/**
 * カスタムダイアログを閉じる
 */
function closeCustomDialog() { 
    document.getElementById('custom-dialog-overlay').style.display = 'none'; 
}

/**
 * 武器屋を表示・購入処理
 */
function showShop() {
    let msg = "武器屋 (番号入力):\n";
    shopItems.forEach((item, index) => { msg += `${index}: ${item.name} (${item.price}G)\n`; });
    
    // MP回復アイテムが定義されている場合のみ表示
    if (typeof MP_ITEMS !== 'undefined' && MP_ITEMS.length > 0) {
        msg += "\n--- MP回復アイテム ---\n";
        MP_ITEMS.forEach((item, index) => { 
            msg += `${shopItems.length + index}: ${item.name} (${item.price}G) - ${item.description}\n`; 
        });
    }
    
    const choice = prompt(msg);
    if (choice !== null) {
        const itemIndex = parseInt(choice);
        // 武器アイテム
        if (itemIndex < shopItems.length && shopItems[itemIndex]) {
            const item = shopItems[itemIndex];
            if (hero.gold >= item.price) {
                // アイテム購入効果音を再生
                if (typeof playSfxPurchase === 'function') {
                    playSfxPurchase();
                }
                hero.gold -= item.price; 
                hero.atk += item.atk; 
                showAlert(`${item.name}を購入！`); 
                updateStatus(); 
            } else { showAlert("ゴールドが足りません！"); }
        }
        // MP回復アイテム（定義されている場合のみ）
        else if (typeof MP_ITEMS !== 'undefined' && 
                 itemIndex >= shopItems.length && 
                 itemIndex < shopItems.length + MP_ITEMS.length) {
            const item = MP_ITEMS[itemIndex - shopItems.length];
            if (hero.gold >= item.price) {
                // アイテム購入効果音を再生
                if (typeof playSfxPurchase === 'function') {
                    playSfxPurchase();
                }
                hero.gold -= item.price;
                if (item.mpRestore >= 999) {
                    hero.mp = hero.maxMp;
                } else {
                    hero.mp = Math.min(hero.maxMp, hero.mp + item.mpRestore);
                }
                showAlert(`${item.name}を使用！${item.description}`);
                updateStatus();
            } else {
                showAlert("ゴールドが足りません！");
            }
        }
    }
}

/**
 * レベルアップ判定と処理
 */
function checkLevelUp() { 
    // 経験値テーブルを使用してレベルアップ判定
    let currentLevel = hero.lv;
    let nextLevelExp = getRequiredExp(currentLevel + 1);
    
    // 複数レベルアップに対応（経験値を大量に獲得した場合）
    while (hero.exp >= nextLevelExp && currentLevel < 50) {
        const oldLv = hero.lv;
        hero.lv++; 
        hero.atk += LEVEL_UP.ATK_BONUS; 
        hero.maxHp += LEVEL_UP.HP_BONUS;
        // 魔法力も成長（定義されている場合）
        if (LEVEL_UP.MGC_BONUS) {
            hero.mgc += LEVEL_UP.MGC_BONUS;
        }
        hero.hp = hero.maxHp;
        // MPもレベルアップ時に増やす（定義されている場合）
        const mpBonus = LEVEL_UP.MP_BONUS || 5; // デフォルト値
        hero.maxMp += mpBonus;
        hero.mp = hero.maxMp; // レベルアップ時にMPも全回復
        
        // FF風レベルアップ演出
        showLevelUpAnimation(oldLv, hero.lv);
        
        // 次のレベルアップ判定
        currentLevel = hero.lv;
        nextLevelExp = getRequiredExp(currentLevel + 1);
    }
}

/**
 * FF風レベルアップ演出を表示
 * @param {number} oldLv - レベルアップ前のレベル
 * @param {number} newLv - レベルアップ後のレベル
 */
function showLevelUpAnimation(oldLv, newLv) {
    // レベルアップ効果音を再生
    if (typeof playSfxLevelUp === 'function') {
        playSfxLevelUp();
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'levelup-overlay';
    
    const levelupText = document.createElement('div');
    levelupText.className = 'levelup-text';
    levelupText.innerText = `レベルアップ！`;
    overlay.appendChild(levelupText);
    
    const stats = document.createElement('div');
    stats.className = 'levelup-stats';
    const mgcBonus = LEVEL_UP.MGC_BONUS || 0;
    const mpBonus = LEVEL_UP.MP_BONUS || 5;
    stats.innerHTML = `LV ${oldLv} → LV ${newLv}<br>攻撃力 +${LEVEL_UP.ATK_BONUS}<br>最大HP +${LEVEL_UP.HP_BONUS}<br>魔法力 +${mgcBonus}<br>最大MP +${mpBonus}`;
    overlay.appendChild(stats);
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.remove();
        showAlert(`レベルアップ！ LV ${newLv}\n攻撃力とHPが上がった！`);
    }, 2500);
}

/**
 * 宿屋で休む（HP/MP全回復）
 */
function rest() {
    // 宿屋で休む効果音を再生
    if (typeof playSfxRest === 'function') {
        playSfxRest();
    }
    hero.hp = hero.maxHp; 
    hero.mp = hero.maxMp; 
    updateStatus(); 
    showAlert("宿屋で休んで全快した！"); 
}
