/* ============================================
   ゲーム状態とデータ管理
   ============================================ */

// ゲーム状態を一元管理するオブジェクト
const gameState = {
    // 戦闘関連
    currentEnemy: null,
    canAttack: true,
    isBattle: false,
    isBattleEnding: false,
    battleCommandIndex: 0, // 戦闘コマンド選択のインデックス
    battleMagicIndex: 0, // 魔法選択のインデックス
    isSelectingMagic: false, // 魔法選択中かどうか
    
    // 状態異常・バフ関連
    enemyStatus: {}, // 敵の状態異常 {burn: true, stun: 1}
    heroBuffs: {
        ironGuard: false, // アイアンガードの効果
        diamondSkin: false, // ダイヤモンドスキンの効果
        diamondSkinTurns: 0 // ダイヤモンドスキンの残りターン
    },
    
    // シナリオ関連
    trueKingMet: false,
    prologueStep: 0,
    
    // 主人公の移動方向（'up', 'down', 'left', 'right'）
    heroDirection: 'down',
    
    // 仲間の位置を配列で管理（party配列のインデックスに対応）
    // allyPositions[0] = party[1]（最初の仲間）の位置
    // allyPositions[1] = party[2]（2番目の仲間）の位置
    // 各要素は {x, y, area, direction} の形式
    allyPositions: [],
    heroPositionHistory: [], // 主人公の移動履歴（最大1つ保持）
    goldenCatProcessed: false, // 金色の🐈イベントを処理済みかどうか
    heroMovementDisabled: false // 主人公の移動が無効化されているかどうか
};

// ヒーローのステータス
const hero = { 
    name: "勇者", 
    x: 4, 
    y: 7, 
    hp: 100, 
    maxHp: 100, 
    mp: 30,  // 初期MPを増加（魔法を使いやすく）
    maxMp: 30, 
    atk: 15, 
    mgc: 20,  // 初期魔法力を調整 
    lv: 1, 
    exp: 0, 
    gold: 0, 
    currentArea: "town_inside",
    hasKey: false 
};

// パーティメンバー
let party = [hero];

// 武器屋のアイテム
const shopItems = [
    { name: "銅の剣", price: 50, atk: 5 },
    { name: "銀の剣", price: 150, atk: 15 },
    { name: "黄金の剣", price: 500, atk: 50 }
];

// 仲間キャラクターのデータ
const allyData = {
    5: { id: "dog", name: "犬", hp: 60, maxHp: 60, atk: 12, img: "🐩", msg: "ワン！一緒に戦います！" },
    6: { id: "bird", name: "きじ", hp: 40, maxHp: 40, atk: 20, img: "🦆", msg: "ケンケン！空から助けます！" },
    7: { id: "monkey", name: "猿", hp: 80, maxHp: 80, atk: 10, img: "🐒", msg: "ウキッ！ボクも行くよ！" }
};

// エリア別モンスターテーブル（戦闘画面でのみ表示・images/ の画像を使用・オープニング/フィールドには影響しない）
const monsterTable = {
    "green_field": [
        { name: "ミチ生命体", hp: 30, atk: 8, exp: 40, gold: 20, img: "images/ミチ生命体.png" },
        { name: "大蛇", hp: 45, atk: 12, exp: 50, gold: 30, img: "images/大蛇.png" }
    ],
    "wasteland": [
        { name: "ならず者", hp: 60, atk: 15, exp: 60, gold: 40, img: "images/ならず者.png" },
        { name: "ハゲタカ", hp: 50, atk: 18, exp: 70, gold: 30, img: "images/ハゲタカ.png" }
    ],
    "lonely_desert": [
        { name: "サソリ", hp: 70, atk: 22, exp: 90, gold: 50, img: "images/おおさそり.png" },
        { name: "ミイラ", hp: 90, atk: 18, exp: 110, gold: 60, img: "images/ミイラさん.png" }
    ],
    "ruined_village": [
        { name: "うらみ", hp: 100, atk: 25, exp: 150, gold: 80, img: "images/うらみ.png" }
    ],
    "dark_forest": [
        { name: "オオオトコ", hp: 80, atk: 20, exp: 120, gold: 60, img: "images/大男.png" },
        { name: "静電気", hp: 60, atk: 25, exp: 100, gold: 80, img: "images/静電気.png" }
    ],
    "lava_cave": [
        { name: "ドクモリ", hp: 150, atk: 35, exp: 250, gold: 120, img: "images/おおコウモリ.png" },
        { name: "ヒトクイジャック", hp: 180, atk: 30, exp: 300, gold: 150, img: "images/ヒトクイジャック.png" }
    ],
    "demon_castle": [
        { name: "水神", hp: 400, atk: 55, exp: 600, gold: 300, img: "images/水龍.png" },
        { name: "ヴィラン", hp: 500, atk: 60, exp: 800, gold: 500, img: "images/ヴィラン.png" }
    ]
};

// ワールドマップデータ
const worldMaps = {
    "town_inside": {
        name: "ポチの村",
        data: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,17,1],
            [1,0,8,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,0,1,1,1,1],
            [1,1,1,1,0,0,1,1,1,1]
        ],
        exits: { bottom: "green_field" },
        npcs: [
            { x: 4, y: 3, img: "🧑", msg: "この村に『古い鍵』が隠されているらしいぞ。", direction: 'down', messages: [
                "この村に『古い鍵』が隠されているらしいぞ。",
                "魔王が現れてから、この村もずいぶん寂しくなったな...",
                "お前、勇者って言うのか？見た目が弱そうだな。",
                "鍵を探してるなら、村の外を探してみろ。"
            ]},
            { x: 7, y: 6, img: "👧", msg: "魔王の城の門には、鍵がかかっているの。", direction: 'down', messages: [
                "魔王の城の門には、鍵がかかっているの。",
                "お兄ちゃん、本当に魔王を倒せるの？大丈夫？",
                "この村、最近お化けが出るって噂よ。気をつけてね。",
                "鍵？そんなの知らないわ。私、まだ子供なんだから。"
            ]},
            { x: 2, y: 5, img: "🧑", msg: "村の外は危険だ。装備を整えてから行け。", direction: 'down', messages: [
                "村の外は危険だ。装備を整えてから行け。",
                "魔王が現れる前は、この村も平和だったんだ...",
                "お前みたいな若造が魔王を倒せるわけないだろ。",
                "武器屋で装備を買ってこい。命に関わるぞ。"
            ]},
            { x: 5, y: 1, img: "🧑", msg: "かつての村には、お化けが出るらしい...", direction: 'down', messages: [
                "かつての村には、お化けが出るらしい...",
                "魔王に滅ぼされた村の話、聞いたことあるか？",
                "お前、本当に勇者なのか？見た目が普通すぎる。",
                "砂漠の向こうに、廃墟の村があるって聞いた。"
            ]}
        ]
    },
    "green_field": { 
        name: "始まりの平原", 
        data: [
            [1,1,1,1,0,0,1,1,1,1],
            [1,0,10,10,10,10,10,10,10,0],
            [1,10,10,10,5,10,10,10,10,1],
            [1,2,1,1,10,1,1,1,10,1],
            [1,10,10,10,10,10,10,10,14,1],
            [1,1,1,10,3,10,10,1,1,1],
            [1,10,10,10,1,1,10,10,10,1],
            [1,10,1,1,1,10,10,1,10,1],
            [1,10,10,10,10,10,10,10,10,1],
            [1,1,1,1,0,0,1,1,1,1] 
        ], 
        exits: { right: "dark_forest", top: "town_inside", bottom: "wasteland" } 
    },
    "wasteland": {
        name: "無法の荒地",
        data: [
            [1,1,1,1,0,0,1,1,1,1],
            [1,20,20,20,20,20,2,20,20,1],
            [1,20,1,1,20,1,1,20,20,1],
            [1,20,20,20,20,20,20,20,20,0], 
            [1,20,1,1,1,20,20,1,1,1],
            [1,2,20,20,20,20,20,20,20,1],
            [1,20,1,1,20,1,1,1,20,1],
            [1,20,20,20,20,20,20,20,20,1],
            [1,20,20,2,20,20,20,2,20,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],
        exits: { top: "green_field", right: "lonely_desert" }
    },
    "lonely_desert": {
        name: "寂しい砂漠",
        data: [
            [1,1,1,1,0,0,1,1,1,1],
            [1,21,21,21,21,21,21,21,21,1],
            [1,21,1,1,1,1,1,1,21,1],
            [0,21,1,21,21,21,21,21,21,0],  // x=9: 南国への出口（歩行可）
            [1,21,1,21,25,21,21,21,21,1], // 25: かつての村の入り口 (🏚️)
            [1,21,1,21,21,21,21,1,21,1],
            [1,21,1,1,1,1,1,1,21,1],
            [1,21,21,2,21,21,21,21,21,1],
            [1,21,21,21,21,2,21,21,21,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],
        exits: { left: "wasteland", top: "dark_forest", right: "tropical_south" }
    },
    "tropical_south": {
        name: "南国の浜",
        data: [
            [1,1,1,1,0,0,1,1,1,1],
            [1,27,27,0,0,0,0,27,27,1],   // 27:海 0:ビーチ
            [1,27,0,0,28,0,0,0,27,1],   // 28:ヤシの木
            [0,0,0,0,0,0,0,0,0,1],
            [1,0,28,0,0,0,28,0,0,29],   // x=9: 橋（南国の村へ）29=BRIDGE
            [1,0,0,0,0,0,0,0,0,0],
            [1,27,0,0,0,28,0,0,27,1],
            [1,27,27,0,0,0,0,0,27,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,0,1,1,1,1]
        ],
        exits: { left: "lonely_desert", right: "tropical_village" },
        npcs: [
            { x: 2, y: 3, type: 'cat', direction: 'down', msg: 'にゃー', messages: ['にゃー', 'ニャン', 'にゃんにゃん', '南国は気持ちいいニャ〜'] },
            { x: 5, y: 5, type: 'cat', direction: 'down', msg: 'にゃー', messages: ['にゃー', 'ココナッツあるニャ', 'ヤシの木でひっかけニャ', '海、きれいニャ'] },
            { x: 7, y: 6, type: 'cat', direction: 'down', msg: 'にゃー', messages: ['にゃー', '砂漠から来たニャ？', 'ここでまったりするニャ', 'にゃん♪'] }
        ]
    },
    "tropical_village": {
        name: "南国の村",
        data: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,28,0,0,0,28,0,1],   // 28:🌴ヤシの木
            [1,0,0,0,0,0,0,0,0,1],
            [1,28,0,0,0,0,0,0,28,1],
            [29,29,0,0,0,0,0,0,0,1],   // 橋（浜から繋がる）x=0,1=BRIDGE
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,28,0,0,0,0,28,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,28,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],
        exits: { left: "tropical_south" },
        npcs: [
            // 村人男×3（重要な情報＋冗談）
            { x: 2, y: 1, direction: 'down', msg: "浜の橋は東の村への唯一の道だ。", messages: ["浜の橋は東の村への唯一の道だ。", "砂漠から来たなら、南国の陽気に慣れろ。", "ココナッツは落ちるから頭上に気をつけろ。", "オレの日焼け、今年も最高だろ？"] },
            { x: 5, y: 3, direction: 'down', msg: "かつての村に桃仙人がいるって噂だ。", messages: ["かつての村に桃仙人がいるって噂だ。", "魔王の城には鍵がなければ入れない。", "南国の魚は焼くとうまい。", "冗談で海に飛び込んだら、本当に泳げた。"] },
            { x: 7, y: 6, direction: 'down', msg: "西の浜に三毛猫がいる。", messages: ["西の浜に三毛猫がいる。触ると何か起きるかもな。", "金の猫の試練を超えると、異界へ飛ばされるらしい。", "ヤシの木に登るのは子供の時以来だ。", "お前、勇者にしては日焼けが足りないな。"] },
            // 村人女×3（重要な情報＋冗談）
            { x: 3, y: 5, direction: 'down', msg: "古い鍵は魔王の城の扉を開けるの。", messages: ["古い鍵は魔王の城の扉を開けるの。", "ポチの村の武器屋で装備を買うといいわ。", "浜で休むとMPが少しずつ溜まる気がするの。", "私のストール、南国仕様でしょ？"] },
            { x: 5, y: 7, direction: 'down', msg: "魔王を倒すと世界に平和が戻るわ。", messages: ["魔王を倒すと世界に平和が戻るわ。", "レベルが上がると魔法が増えるの。", "ここから砂漠へは浜を西に抜けて行くのよ。", "今日のココナッツ、いつもより甘い気がする。"] },
            { x: 2, y: 7, direction: 'down', msg: "橋を渡ると浜。あっちに猫が三匹。", messages: ["橋を渡ると浜。あっちに猫が三匹。", "迷いの森の奥に金色の猫がいるらしいわ。", "火の洞窟には道具屋兼宿屋があるの。", "南国育ちの私、雪って見たことないの。"] }
        ]
    },
    "ruined_village": {
        name: "かつての村",
        data: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,22,22,22,22,22,22,22,22,1],
            [1,22,1,1,22,22,1,1,22,1],
            [1,22,1,23,22,22,24,1,22,1], // 23:お化け, 24:桃仙人
            [1,22,22,22,22,22,22,22,22,1],
            [1,22,22,1,1,1,1,22,22,1],
            [1,22,22,22,22,22,22,22,22,1],
            [1,1,22,22,22,22,22,22,1,1],
            [1,1,1,1,0,0,1,1,1,1], // 下から砂漠に戻る
            [1,1,1,1,0,0,1,1,1,1] // 出口を開ける（x=4,5を床に）
        ],
        exits: { bottom: "lonely_desert" }
    },
    "dark_forest": { 
        name: "迷いの森", 
        data: [
            [1,1,1,1,1,1,1,1,1,1],
            [0,11,2,11,11,6,11,11,2,1],
            [1,11,1,1,11,1,11,1,11,1],
            [1,11,1,11,11,2,11,1,11,1],
            [1,2,1,11,7,1,11,1,11,1],
            [1,11,11,11,11,11,11,11,11,0],
            [1,1,1,1,1,1,11,1,1,1],
            [1,11,11,11,2,11,11,1,11,1],
            [1,11,1,1,1,1,1,1,11,1],
            [1,1,1,1,0,26,1,1,1,1] // 26: 金色の🐈（一番下、左から6マス目 x=5, y=9）
        ], 
        exits: { left: "green_field", right: "lava_cave", bottom: "lonely_desert" } 
    },
    "lava_cave": { 
        name: "火の洞窟", 
        data: [
            [1,1,1,1,1,1,1,1,1,1],
            [0,12,12,12,12,12,12,2,12,1],
            [1,1,1,1,12,1,1,1,12,1],
            [1,2,12,12,12,1,8,12,12,1],
            [1,12,1,1,1,1,12,1,1,1],
            [1,12,12,12,12,2,12,12,12,0],
            [1,1,1,1,1,1,1,1,12,1],
            [1,2,12,12,12,12,12,2,12,1],
            [1,12,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ], 
        exits: { left: "dark_forest", right: "demon_castle" } 
    },
    "demon_castle": { 
        name: "水の山", 
        data: [
            [1,1,1,1,4,1,1,1,1,1],
            [1,13,13,13,16,13,13,13,13,1],
            [1,13,1,1,1,1,1,1,13,1],
            [1,2,1,13,13,13,13,1,2,1],
            [1,13,13,13,1,1,13,13,13,1],
            [0,13,1,2,1,1,2,1,13,1],
            [1,13,1,13,13,13,13,1,13,1],
            [1,13,13,13,1,1,13,13,13,1],
            [1,1,1,1,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,1,0,8]
        ], 
        exits: { left: "lava_cave" } 
    }
};

// エリア別BGMマッピング
const AREA_BGM_MAP = {
    "town_inside": "bgm-town",
    "green_field": "bgm-field",
    "wasteland": "bgm-field",
    "lonely_desert": "bgm-field",
    "tropical_south": "bgm-field",
    "tropical_village": "bgm-field",
    "ruined_village": "bgm-field",
    "dark_forest": "bgm-field",
    "lava_cave": "bgm-field",
    "demon_castle": "bgm-field"
};

// 魔法データ（バランス調整済み）
// 注意: damageは基本値。実際のダメージは魔法力ベースで計算される
const MAGIC_SPELLS = [
    {
        id: "flame_shot",
        name: "フレイム弾",
        level: 1,
        mpCost: 8,  // MP消費を増やして戦略性を高める
        type: "attack", // attack, heal, shield, status
        target: "enemy_single",
        damage: 30, // 基本ダメージ（魔法力ベースで計算される）
        damageMultiplier: 1.2, // 魔法力に対する倍率
        effect: "burn", // 30%で火だるま状態
        effectChance: 0.3,
        description: "敵1体に魔法力×1.2のダメージ。30%で火だるま状態。"
    },
    {
        id: "aid_heal",
        name: "エイドヒール",
        level: 5,
        mpCost: 10,
        type: "heal",
        target: "ally_single",
        heal: 35, // 初期HP100に対して適切
        description: "味方1人のHPを35回復。"
    },
    {
        id: "iron_guard",
        name: "アイアンガード",
        level: 9,
        mpCost: 12,
        type: "shield",
        target: "self",
        shield: 40, // 中盤敵の攻撃15-25に対して適切
        description: "次に受けるダメージを最大40まで無効化。"
    },
    {
        id: "sonic_blade",
        name: "ソニックブレード",
        level: 14,
        mpCost: 18,  // MP消費を調整
        type: "attack",
        target: "enemy_single",
        damage: 50, // 基本ダメージ
        damageMultiplier: 1.5, // 魔法力に対する倍率
        flyingBonus: 1.5, // 空中の敵には1.5倍
        description: "敵1体に魔法力×1.5のダメージ。空中の敵には1.5倍。"
    },
    {
        id: "recovery_rain",
        name: "リカバリーレイン",
        level: 19,
        mpCost: 20,
        type: "heal",
        target: "ally_all",
        heal: 35, // 全員回復は強力なので少し控えめに
        description: "味方全員のHPを35回復。"
    },
    {
        id: "gravity_storm",
        name: "グラビティストーム",
        level: 24,
        mpCost: 28,  // MP消費を調整
        type: "attack_status",
        target: "enemy_all",
        damage: 40, // 基本ダメージ
        damageMultiplier: 1.0, // 全体攻撃なので倍率は控えめ
        status: "stun", // 1ターン行動不能
        description: "敵全員に魔法力×1.0のダメージ＋1ターン行動不能。"
    },
    {
        id: "giga_burst",
        name: "ギガバースト",
        level: 29,
        mpCost: 35,  // MP消費を増加
        type: "attack",
        target: "enemy_all",
        damage: 80, // 基本ダメージ
        damageMultiplier: 1.3, // 全体攻撃だが高威力
        selfStun: 1, // 使用後1ターン動けない
        description: "敵全体に魔法力×1.3のダメージ。使用後1ターン動けない。"
    },
    {
        id: "diamond_skin",
        name: "ダイヤモンドスキン",
        level: 33,
        mpCost: 35,
        type: "shield",
        target: "self",
        shield: 999, // 3ターンの間、物理ダメージを100%反射
        reflect: true,
        duration: 3,
        description: "3ターンの間、物理ダメージを100%反射。"
    },
    {
        id: "judgment_ray",
        name: "ジャッジメント光線",
        level: 37,
        mpCost: 45,  // MP消費を増加
        type: "attack",
        target: "enemy_single",
        damagePercent: 0.5, // HPの50%を減らす（魔法力に関係なく固定）
        description: "敵の今のHPをピッタリ半分（50%）減らす。"
    },
    {
        id: "zero_disaster",
        name: "ゼロ・ディザスター",
        level: 40,
        mpCost: 60,  // MP消費を大幅に増加（最強魔法の代償）
        type: "attack",
        target: "enemy_all",
        damage: 100, // 基本ダメージ
        damageMultiplier: 2.0, // 最強魔法なので高い倍率
        description: "敵全員に魔法力×2.0のダメージ。背景が闇に包まれる。"
    }
];

// MP回復アイテム
const MP_ITEMS = [
    { name: "MPポーション", price: 50, mpRestore: 20, description: "MPを20回復" },
    { name: "MPエリクサー", price: 200, mpRestore: 50, description: "MPを50回復" },
    { name: "MPフルエリクサー", price: 500, mpRestore: 999, description: "MPを全回復" }
];
