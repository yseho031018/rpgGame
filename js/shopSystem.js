/**
 * ============================================
 * RPG Adventure - 상점 시스템
 * ============================================
 * 상점 아이템 구매/판매, NPC 대화를 처리합니다.
 */

// ============================================
// 🛒 상점 아이템 데이터
// ============================================

/**
 * 훈련장 상점 판매 아이템
 * 설정:
 * - 탐사불가지역, 전투불가
 * - 상점주인 NPC와 대화 후 구매 가능
 * - 직업별 무기/방어구, 소모품, 재료 판매
 */
const SHOP_ITEMS = {
    // ===== 구리 무기 (Tier 1) =====
    copperWeapons: {
        warrior: {
            id: 'copper_longsword',
            name: '구리 대검',
            type: 'weapon',
            rarity: 'common',
            stats: { pAtk: 7 },
            description: '구리로 만든 전사용 대검입니다. 초보자에게 적합합니다.',
            icon: '⚔️',
            price: 150,
            sellPrice: 75,
            job: 'warrior'
        },
        archer: {
            id: 'copper_bow',
            name: '구리 활',
            type: 'weapon',
            rarity: 'common',
            stats: { pAtk: 7 },
            description: '구리로 보강된 궁수용 활입니다.',
            icon: '🏹',
            price: 150,
            sellPrice: 75,
            job: 'archer'
        },
        mage: {
            id: 'copper_staff',
            name: '구리 지팡이',
            type: 'weapon',
            rarity: 'common',
            stats: { mAtk: 7 },
            description: '구리 장식이 달린 마법사용 지팡이입니다.',
            icon: '🪄',
            price: 150,
            sellPrice: 75,
            job: 'mage'
        },
        skirmisher: {
            id: 'copper_sword',
            name: '구리 단검',
            type: 'weapon',
            rarity: 'common',
            stats: { pAtk: 7 },
            description: '구리로 만든 도적용 단검입니다. 가볍고 날카롭습니다.',
            icon: '🗡️',
            price: 150,
            sellPrice: 75,
            job: 'skirmisher'
        }
    },

    // ===== 평범한 무기 (Tier 2) =====
    weapons: {
        warrior: {
            id: 'plain_longsword',
            name: '평범한 대검',
            type: 'weapon',
            rarity: 'uncommon',
            stats: { pAtk: 10, str: 1 },
            description: '전사용 평범한 대검입니다. 기본기에 충실합니다.',
            icon: '⚔️',
            price: 300,
            sellPrice: 150,
            job: 'warrior'
        },
        archer: {
            id: 'plain_bow',
            name: '평범한 활',
            type: 'weapon',
            rarity: 'uncommon',
            stats: { pAtk: 10, str: 1 },
            description: '궁수용 평범한 활입니다. 강한 장력을 자랑합니다.',
            icon: '🏹',
            price: 300,
            sellPrice: 150,
            job: 'archer'
        },
        mage: {
            id: 'plain_staff',
            name: '평범한 지팡이',
            type: 'weapon',
            rarity: 'uncommon',
            stats: { mAtk: 10, int: 1 },
            description: '마법사용 평범한 지팡이입니다. 마력을 담기에 적합합니다.',
            icon: '🪄',
            price: 300,
            sellPrice: 150,
            job: 'mage'
        },
        skirmisher: {
            id: 'plain_sword',
            name: '평범한 단검',
            type: 'weapon',
            rarity: 'uncommon',
            stats: { pAtk: 10, agi: 1 },
            description: '도적용 평범한 단검입니다. 가볍고 빠릅니다.',
            icon: '🗡️',
            price: 300,
            sellPrice: 150,
            job: 'skirmisher'
        }
    },

    // ===== 직업별 방어구 (재료별) =====
    armors: {
        // --- 튼튼한 가죽 (Tier 1) ---
        leather: {
            warrior: {
                id: 'leather_heavy_armor',
                name: '튼튼한 가죽 중갑',
                type: 'armor',
                rarity: 'common',
                stats: { pDef: 6, mDef: 3 },
                description: '질긴 가죽으로 만든 전사용 중갑입니다.',
                icon: '🛡️',
                price: 80,
                sellPrice: 40,
                job: 'warrior'
            },
            skirmisher: {
                id: 'leather_light_armor',
                name: '튼튼한 가죽 경갑',
                type: 'armor',
                rarity: 'common',
                stats: { pDef: 5, mDef: 3 },
                description: '질긴 가죽으로 만든 도적용 경갑입니다. 움직임이 자유롭습니다.',
                icon: '🥋',
                price: 80,
                sellPrice: 40,
                job: 'skirmisher'
            },
            archer: {
                id: 'leather_hunting_clothes',
                name: '튼튼한 가죽 사냥복',
                type: 'armor',
                rarity: 'common',
                stats: { pDef: 4, mDef: 3 },
                description: '질긴 가죽으로 만든 궁수용 사냥복입니다. 숲에서 위장에 유리합니다.',
                icon: '👕',
                price: 80,
                sellPrice: 40,
                job: 'archer'
            },
            mage: {
                id: 'leather_lined_robe',
                name: '튼튼한 가죽 로브',
                type: 'armor',
                rarity: 'common',
                stats: { pDef: 3, mDef: 4 },
                description: '질긴 가죽 안감이 달린 마법사용 로브입니다.',
                icon: '🧥',
                price: 80,
                sellPrice: 40,
                job: 'mage'
            }
        },
        // --- 구리 (Tier 2) ---
        copper: {
            warrior: {
                id: 'copper_heavy_armor',
                name: '구리 중갑',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 8, mDef: 5 },
                description: '구리판으로 보강된 전사용 중갑입니다. 묵직한 방어력을 자랑합니다.',
                icon: '🛡️',
                price: 190,
                sellPrice: 95,
                job: 'warrior'
            },
            skirmisher: {
                id: 'copper_light_armor',
                name: '구리 경갑',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 8, mDef: 4 },
                description: '구리 조각으로 보강된 도적용 경갑입니다. 민첩성을 유지하면서 방어력을 높였습니다.',
                icon: '🥋',
                price: 190,
                sellPrice: 95,
                job: 'skirmisher'
            },
            archer: {
                id: 'copper_reinforced_hunting_clothes',
                name: '구리 보강 사냥복',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 6, mDef: 4 },
                description: '구리판으로 어깨와 가슴을 보강한 궁수용 사냥복입니다.',
                icon: '👕',
                price: 190,
                sellPrice: 95,
                job: 'archer'
            },
            mage: {
                id: 'copper_inscribed_robe',
                name: '구리 문양 로브',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 5, mDef: 7 },
                description: '마력 증폭을 위한 구리 문양이 새겨진 마법사용 로브입니다.',
                icon: '🧥',
                price: 190,
                sellPrice: 95,
                job: 'mage'
            }
        },
        // --- 철 (Tier 3) ---
        iron: {
            warrior: {
                id: 'iron_heavy_armor',
                name: '철 중갑',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 12, mDef: 8, str: 1 },
                description: '단단한 철판으로 만든 전사용 중갑입니다. 최고의 물리 방어력을 자랑합니다.',
                icon: '🛡️',
                price: 400,
                sellPrice: 200,
                job: 'warrior'
            },
            skirmisher: {
                id: 'iron_light_armor',
                name: '철 경갑',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 10, mDef: 6, agi: 1 },
                description: '경량화된 철판으로 만든 도적용 경갑입니다.',
                icon: '🥋',
                price: 400,
                sellPrice: 200,
                job: 'skirmisher'
            },
            archer: {
                id: 'iron_plated_hunting_clothes',
                name: '철판 사냥복',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 8, mDef: 6, agi: 1 },
                description: '철판으로 요소요소를 보강한 궁수용 사냥복입니다. 방어력이 크게 향상되었습니다.',
                icon: '👕',
                price: 400,
                sellPrice: 200,
                job: 'archer'
            },
            mage: {
                id: 'iron_woven_robe',
                name: '철사 직조 로브',
                type: 'armor',
                rarity: 'uncommon',
                stats: { pDef: 7, mDef: 10, int: 1 },
                description: '마법 강화된 철사로 직조된 마법사용 로브입니다. 방어력과 마법 저항력이 뛰어납니다.',
                icon: '🧥',
                price: 400,
                sellPrice: 200,
                job: 'mage'
            }
        }
    },

    // ===== 소모품 =====
    consumables: [
        {
            id: 'hp_potion',
            name: '체력회복물약',
            type: 'consumable',
            rarity: 'common',
            description: 'HP를 50 회복합니다.',
            icon: '❤️',
            price: 15,
            sellPrice: 7,
            effect: { type: 'heal_hp', amount: 50 },
            stackable: true
        },
        {
            id: 'mp_potion',
            name: '마나회복물약',
            type: 'consumable',
            rarity: 'common',
            description: 'MP를 30 회복합니다.',
            icon: '💙',
            price: 20,
            sellPrice: 10,
            effect: { type: 'heal_mp', amount: 30 },
            stackable: true
        },
        {
            id: 'bandage',
            name: '붕대',
            type: 'consumable',
            rarity: 'common',
            description: 'HP를 20 회복합니다. 저렴하지만 효과가 약합니다.',
            icon: '🩹',
            price: 10,
            sellPrice: 5,
            effect: { type: 'heal_hp', amount: 20 },
            stackable: true
        },
        {
            id: 'purify_potion',
            name: '정화의 물약',
            type: 'consumable',
            rarity: 'uncommon',
            description: '모든 상태이상을 제거합니다.',
            icon: '✨',
            price: 25,
            sellPrice: 12,
            effect: { type: 'cure_status' },
            stackable: true
        }
    ],

    // ===== 재료 =====
    materials: [
        {
            id: 'herb',
            name: '약초',
            type: 'material',
            rarity: 'common',
            description: '일반적인 약초입니다. 물약 제조에 사용됩니다.',
            icon: '🌿',
            price: 5,
            sellPrice: 2,
            stackable: true
        },
        {
            id: 'bread',
            name: '빵',
            type: 'material',
            rarity: 'common',
            description: '맛있는 빵입니다. 배고픔을 달랠 수 있습니다.',
            icon: '🍞',
            price: 8,
            sellPrice: 4,
            stackable: true
        },
        {
            id: 'grass',
            name: '풀',
            type: 'material',
            rarity: 'common',
            description: '일반적인 풀입니다. 다양한 용도로 사용됩니다.',
            icon: '🌱',
            price: 3,
            sellPrice: 1,
            stackable: true
        },
        {
            id: 'herb_material',
            name: '허브',
            type: 'material',
            rarity: 'common',
            description: '향긋한 허브입니다. 요리나 물약에 사용됩니다.',
            icon: '🌿',
            price: 6,
            sellPrice: 3,
            stackable: true
        }
    ]
};

// ============================================
// 🏪 상점 상태
// ============================================

let currentShopOpen = false;
let currentShopMode = 'buy'; // 'buy' or 'sell'
let currentNpcDialogOpen = false;
let currentNpc = null;

// ============================================
// 💬 NPC 대화 시스템
// ============================================

/**
 * NPC 대화를 표시합니다.
 * 현재 위치에 있는 NPC 목록을 보여주고 선택할 수 있습니다.
 */
function showNPCDialog() {
    const location = getCurrentLocation();
    if (!location || !location.npcs || location.npcs.length === 0) {
        addGameLog('💬 이 지역에는 대화할 수 있는 NPC가 없습니다.');
        return;
    }

    // NPC 선택 모달 표시
    showNPCSelectionModal(location.npcs);
}

/**
 * NPC 선택 모달을 표시합니다.
 */
function showNPCSelectionModal(npcIds) {
    // 기존 모달 제거
    const existingModal = document.querySelector('.npc-modal-overlay');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'npc-modal-overlay';

    let npcsHtml = '';
    npcIds.forEach(npcId => {
        const npc = NPCS[npcId];
        if (npc) {
            npcsHtml += `
                <button class="npc-select-btn" onclick="selectNPC('${npcId}')">
                    <span class="npc-emoji">${npc.emoji}</span>
                    <span class="npc-name">${npc.name}</span>
                </button>
            `;
        }
    });

    overlay.innerHTML = `
        <div class="npc-modal">
            <div class="npc-modal-header">
                <h3>💬 대화할 NPC 선택</h3>
                <button class="npc-modal-close" onclick="closeNPCModal()">✕</button>
            </div>
            <div class="npc-modal-content">
                <div class="npc-list">
                    ${npcsHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    currentNpcDialogOpen = true;
}

/**
 * NPC를 선택하고 대화를 시작합니다.
 */
function selectNPC(npcId) {
    const npc = NPCS[npcId];
    if (!npc) return;

    currentNpc = npc;
    closeNPCModal();
    showNPCConversation(npc);
}

/**
 * NPC와의 대화를 표시합니다.
 */
function showNPCConversation(npc) {
    const overlay = document.createElement('div');
    overlay.className = 'npc-modal-overlay';

    // 대화 옵션 생성
    let optionsHtml = '';

    // 상점주인인 경우 구매 옵션 추가
    if (npc.canTrade) {
        optionsHtml += `
            <button class="dialog-option-btn" onclick="openShopFromNPC()">
                🛒 물건을 사고 싶어요
            </button>
        `;
    }

    // 퀘스트 가능한 경우
    if (npc.canGiveQuest) {
        optionsHtml += `
            <button class="dialog-option-btn" onclick="showNPCQuest('${npc.id}')">
                📜 의뢰가 있나요?
            </button>
        `;
    }

    // 힌트/정보 옵션
    if (npc.dialogues.info) {
        optionsHtml += `
            <button class="dialog-option-btn" onclick="showNPCInfo('${npc.id}')">
                ❓ 정보가 필요해요
            </button>
        `;
    }

    // 대련 가능한 경우
    if (npc.canSpar) {
        optionsHtml += `
            <button class="dialog-option-btn spar-btn" onclick="startSpar('${npc.id}')">
                ⚔️ 대련하고 싶어요
            </button>
        `;
    }

    // 대화 종료 옵션
    optionsHtml += `
        <button class="dialog-option-btn dialog-exit" onclick="closeNPCConversation()">
            👋 안녕히 계세요
        </button>
    `;

    overlay.innerHTML = `
        <div class="npc-dialog-modal">
            <div class="npc-dialog-header">
                <span class="npc-dialog-emoji">${npc.emoji}</span>
                <span class="npc-dialog-name">${npc.name}</span>
            </div>
            <div class="npc-dialog-content">
                <div class="npc-dialog-bubble">
                    <p>${npc.dialogues.greeting}</p>
                </div>
                <div class="dialog-options">
                    ${optionsHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    currentNpcDialogOpen = true;
}

/**
 * NPC 대화에서 상점을 엽니다.
 */
function openShopFromNPC() {
    // NPC 정보를 먼저 저장 (closeNPCConversation에서 currentNpc가 null이 됨)
    const npc = currentNpc;
    const buyMessage = npc ? (npc.dialogues.buy || '좋은 선택이야! 천천히 둘러보게.') : '좋은 선택이야!';

    // 대화 모달만 닫기 (작별 인사 없이)
    const modal = document.querySelector('.npc-modal-overlay');
    if (modal) modal.remove();
    currentNpcDialogOpen = false;
    // currentNpc는 유지 (상점에서 사용할 수 있도록)

    // 상점 열기
    addGameLog(`🧓 ${npc ? npc.name : '상점주인'}: "${buyMessage}"`);
    showShopUI();
}

/**
 * NPC 정보를 표시합니다.
 */
function showNPCInfo(npcId) {
    const npc = NPCS[npcId];
    if (!npc) return;

    // 대화 버블 내용만 변경
    const bubble = document.querySelector('.npc-dialog-bubble p');
    if (bubble) {
        bubble.textContent = npc.dialogues.info;
    }
}

/**
 * NPC 퀘스트를 표시합니다.
 */
function showNPCQuest(npcId) {
    const npc = NPCS[npcId];
    if (!npc) return;

    const bubble = document.querySelector('.npc-dialog-bubble p');
    if (bubble) {
        bubble.textContent = npc.dialogues.quest || '아직 자네에게 줄 임무는 없네.';
    }
}

/**
 * NPC 모달을 닫습니다.
 */
function closeNPCModal() {
    const modal = document.querySelector('.npc-modal-overlay');
    if (modal) modal.remove();
    currentNpcDialogOpen = false;
}

/**
 * NPC 대화를 종료합니다.
 */
function closeNPCConversation() {
    const modal = document.querySelector('.npc-modal-overlay');
    if (modal) modal.remove();
    currentNpcDialogOpen = false;

    if (currentNpc) {
        addGameLog(`💬 ${currentNpc.name}: "${currentNpc.dialogues.farewell || '또 오게나!'}"`);
    }
    currentNpc = null;
}

/**
 * NPC와 대련을 시작합니다.
 * @param {string} npcId - NPC ID
 */
function startSpar(npcId) {
    const npc = NPCS[npcId];
    if (!npc || !npc.canSpar || !npc.sparMonster) {
        addGameLog('❌ 이 NPC와는 대련할 수 없습니다.');
        return;
    }

    const sparMonster = MONSTERS[npc.sparMonster];
    if (!sparMonster) {
        addGameLog('❌ 대련 상대를 찾을 수 없습니다.');
        return;
    }

    // 이미 보상을 수령한 경우 대련 거절 대사 표시
    if (player.sparRewardsReceived && player.sparRewardsReceived[sparMonster.id]) {
        // NPC별 거절 대사 설정
        const refusalDialogues = {
            instructor2: '자네는 이미 내 활솜씨를 넘어섰네. 더 넓은 세상의 적들과 겨뤄보게나. 자네의 앞길에 행운을 빌겠네.',
            instructor3: '호오, 또 대련을 원하나? 하하, 이제 자네는 나와 대련할 필요가 없을 정도로 강하네. 더 넓은 세상에서 활약해보게나.',
            instructor4: '자네의 실력은 이미 내가 가르칠 수준을 넘어섰어. 그 빠른 검술로 더 강한 적들에게 도전해보게. 기대하고 있겠네.',
            senior_instructor: '허허, 자네가 또 나에게 도전하겠다고? 이미 나를 넘어선 자네에게 더 가르칠 것이 없네. 진정한 시련은 이 훈련장 밖에 있다네. 가서 세상을 구해보게나.'
        };
        const refusalText = refusalDialogues[npcId] || '이제 자네는 나와 대련할 필요가 없을 정도로 강하네. 더 넓은 세상에서 활약해보게나.';

        // 대화 버블 내용을 거절 대사로 변경
        const bubble = document.querySelector('.npc-dialog-bubble p');
        if (bubble) {
            bubble.textContent = refusalText;
        }
        addGameLog(`⚔️ ${npc.name}: "${refusalText}"`);
        return;
    }

    // NPC 대화 모달 닫기
    const modal = document.querySelector('.npc-modal-overlay');
    if (modal) modal.remove();
    currentNpcDialogOpen = false;

    // 대련 시작 대화 표시
    const sparDialogue = npc.dialogues.spar || sparMonster.dialogues?.start || '덤벼라!';
    addGameLog(`⚔️ ${npc.name}: "${sparDialogue}"`);

    // 대련 전투 시작
    setTimeout(() => {
        startSparBattle(sparMonster, npc);
    }, 500);
}

/**
 * 대련 전투를 시작합니다.
 * @param {Object} sparMonster - 대련 몬스터 데이터
 * @param {Object} npc - NPC 데이터
 */
function startSparBattle(sparMonster, npc) {
    // 전투용 몬스터 객체 생성
    const monster = {
        ...sparMonster,
        name: npc.name,
        currentHp: sparMonster.hp,
        currentMp: sparMonster.mp,
        cooldowns: {},  // 스킬 쿨타임 관리
        traitState: {},  // 특성 상태 관리
        isPhase2: false  // 2페이즈 상태 (상급교관용)
    };

    // 대련 시작 - battleSystem.js의 startBattle 함수 호출
    if (typeof startBattle === 'function') {
        // 대련용 플래그 설정
        battleState.isSpar = true;
        battleState.sparNpc = npc;
        battleState.sparBackground = 'assets/backgrounds/spar_arena.png';  // 대련 배경
        startBattle(monster);
    } else {
        console.error('startBattle 함수를 찾을 수 없습니다.');
        addGameLog('❌ 전투 시스템 오류가 발생했습니다.');
    }
}


// ============================================
// 🛒 상점 UI 시스템
// ============================================

/**
 * 상점 UI를 표시합니다.
 */
function showShopUI() {
    // 기존 상점 모달 제거
    const existingShop = document.querySelector('.shop-modal-overlay');
    if (existingShop) existingShop.remove();

    const overlay = document.createElement('div');
    overlay.className = 'shop-modal-overlay';

    overlay.innerHTML = `
        <div class="shop-modal">
            <div class="shop-header">
                <h2>🏪 상점</h2>
                <div class="shop-gold">💰 <span id="shopGoldDisplay">${gold || 0}</span>G</div>
                <button class="shop-close-btn" onclick="closeShop()">✕</button>
            </div>
            <div class="shop-tabs">
                <button class="shop-tab active" data-mode="buy" onclick="switchShopMode('buy')">🛒 구매</button>
                <button class="shop-tab" data-mode="sell" onclick="switchShopMode('sell')">💰 판매</button>
            </div>
            <div class="shop-content">
                <div class="shop-categories">
                    <button class="shop-category-btn active" data-category="weapons" onclick="showShopCategory('weapons')">⚔️ 무기</button>
                    <button class="shop-category-btn" data-category="armors" onclick="showShopCategory('armors')">🛡️ 방어구</button>
                    <button class="shop-category-btn" data-category="consumables" onclick="showShopCategory('consumables')">🧪 소모품</button>
                    <button class="shop-category-btn" data-category="materials" onclick="showShopCategory('materials')">🌿 재료</button>
                </div>
                <div class="shop-items" id="shopItemsContainer">
                    <!-- 동적 생성 -->
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    currentShopOpen = true;
    currentShopMode = 'buy';

    // 초기 카테고리 표시
    showShopCategory('weapons');
}

/**
 * 상점 모드를 전환합니다 (구매/판매).
 */
function switchShopMode(mode) {
    currentShopMode = mode;

    // 탭 활성화 업데이트
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // 판매 모드면 인벤토리 표시, 구매 모드면 상점 아이템 표시
    if (mode === 'sell') {
        showSellItems();
    } else {
        showShopCategory('weapons');
    }
}

/**
 * 상점 카테고리를 표시합니다.
 */
function showShopCategory(category) {
    // 카테고리 버튼 활성화 업데이트
    document.querySelectorAll('.shop-category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    const container = document.getElementById('shopItemsContainer');
    if (!container) return;

    container.innerHTML = '';

    let items = [];

    if (category === 'weapons') {
        // 현재 플레이어 직업에 맞는 무기만 표시
        const playerJob = player ? player.job : 'warrior';
        
        // 구리 무기 (Tier 1)
        if (SHOP_ITEMS.copperWeapons) {
            const copperWeapon = SHOP_ITEMS.copperWeapons[playerJob];
            if (copperWeapon) items.push(copperWeapon);
        }
        
        // 평범한 무기 (Tier 2)
        const weapon = SHOP_ITEMS.weapons[playerJob];
        if (weapon) items.push(weapon);

        // 다른 직업 무기도 표시 (구매 불가 표시)
        if (SHOP_ITEMS.copperWeapons) {
            Object.entries(SHOP_ITEMS.copperWeapons).forEach(([job, w]) => {
                if (job !== playerJob) {
                    items.push({ ...w, otherJob: true });
                }
            });
        }
        Object.entries(SHOP_ITEMS.weapons).forEach(([job, w]) => {
            if (job !== playerJob) {
                items.push({ ...w, otherJob: true });
            }
        });
    } else if (category === 'armors') {
        const playerJob = player ? player.job : 'warrior';

        // 각 재료별로 현재 직업 방어구 표시
        ['leather', 'copper', 'iron'].forEach(material => {
            const armor = SHOP_ITEMS.armors[material][playerJob];
            if (armor) {
                items.push({ ...armor, material });
            }
        });
    } else if (category === 'consumables') {
        items = SHOP_ITEMS.consumables;
    } else if (category === 'materials') {
        items = SHOP_ITEMS.materials;
    }

    // 아이템 렌더링
    items.forEach(item => {
        const itemElement = createShopItemElement(item);
        container.appendChild(itemElement);
    });

    if (items.length === 0) {
        container.innerHTML = '<p class="shop-empty">판매 중인 아이템이 없습니다.</p>';
    }
}

/**
 * 상점 아이템 요소를 생성합니다.
 */
function createShopItemElement(item) {
    const div = document.createElement('div');
    div.className = `shop-item ${item.rarity || 'common'}`;

    if (item.otherJob) {
        div.classList.add('other-job');
    }

    const canAfford = (gold || 0) >= item.price;
    // 소모품/재료는 수량 조절 가능, 무기/방어구는 1개만 구매
    const isStackable = (item.type === 'consumable' || item.type === 'material');

    div.innerHTML = `
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-info">
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.description}</div>
            ${item.stats ? `<div class="shop-item-stats">${formatItemStats(item.stats)}</div>` : ''}
        </div>
        <div class="shop-item-right">
            <div class="shop-item-price ${canAfford ? '' : 'not-afford'}">
                💰 <span id="buyPrice_${item.id}">${item.price}</span>G
            </div>
            ${isStackable && !item.otherJob ? `
            <div class="shop-quantity-control" data-item-id="${item.id}" data-unit-price="${item.price}">
                <button class="qty-btn qty-minus" onclick="changeShopQty('${item.id}', -1)">−</button>
                <input type="number" class="qty-input" id="qty_${item.id}" value="1" min="1" max="99" onchange="updateShopQty('${item.id}')">
                <button class="qty-btn qty-plus" onclick="changeShopQty('${item.id}', 1)">+</button>
            </div>
            ` : ''}
            <button class="shop-buy-btn" onclick="buyItem('${item.id}')" ${!canAfford || item.otherJob ? 'disabled' : ''}>
                ${item.otherJob ? '다른 직업' : (canAfford ? '구매' : '골드 부족')}
            </button>
        </div>
    `;

    return div;
}

/**
 * 상점 구매 수량을 변경합니다.
 * @param {string} itemId - 아이템 ID
 * @param {number} delta - 변경량 (+1 또는 -1)
 */
function changeShopQty(itemId, delta) {
    const input = document.getElementById(`qty_${itemId}`);
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(99, val + delta));
    input.value = val;
    updateShopQty(itemId);
}

/**
 * 상점 구매 수량 입력 시 가격을 업데이트합니다.
 * @param {string} itemId - 아이템 ID
 */
function updateShopQty(itemId) {
    const input = document.getElementById(`qty_${itemId}`);
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(99, val));
    input.value = val;

    const control = input.closest('.shop-quantity-control');
    const unitPrice = parseInt(control?.dataset?.unitPrice) || 0;
    const totalPrice = unitPrice * val;

    const priceSpan = document.getElementById(`buyPrice_${itemId}`);
    if (priceSpan) {
        priceSpan.textContent = totalPrice;
        // 가격 색상 업데이트
        const priceDiv = priceSpan.closest('.shop-item-price');
        if (priceDiv) {
            priceDiv.classList.toggle('not-afford', (gold || 0) < totalPrice);
        }
    }

    // 구매 버튼 상태 업데이트
    const shopItem = input.closest('.shop-item');
    if (shopItem) {
        const buyBtn = shopItem.querySelector('.shop-buy-btn');
        if (buyBtn && !shopItem.classList.contains('other-job')) {
            buyBtn.disabled = (gold || 0) < totalPrice;
            buyBtn.textContent = (gold || 0) < totalPrice ? '골드 부족' : '구매';
        }
    }
}

/**
 * 아이템 스탯을 포맷팅합니다.
 */
function formatItemStats(stats) {
    const statNames = {
        pAtk: '물리공격력',
        mAtk: '마법공격력',
        pDef: '물리방어력',
        mDef: '마법방어력',
        str: '근력',
        vit: '체력',
        int: '지능',
        agi: '민첩',
        hp: 'HP',
        mp: 'MP',
        atk: '공격력',
        def: '방어력'
    };

    return Object.entries(stats)
        .map(([key, value]) => `${statNames[key] || key}: +${value}`)
        .join(', ');
}

/**
 * 판매할 아이템 목록을 표시합니다.
 */
function showSellItems() {
    const container = document.getElementById('shopItemsContainer');
    if (!container) return;

    container.innerHTML = '';

    // 인벤토리 아이템 표시
    if (!inventoryItems || inventoryItems.length === 0) {
        container.innerHTML = '<p class="shop-empty">판매할 아이템이 없습니다.</p>';
        return;
    }

    inventoryItems.forEach((item, index) => {
        if (!item) return;

        const sellPrice = item.sellPrice || Math.floor((item.price || 10) / 2);
        const maxQty = item.quantity || 1;
        const isStackable = maxQty > 1;

        const div = document.createElement('div');
        div.className = `shop-item ${item.rarity || 'common'}`;

        div.innerHTML = `
            <div class="shop-item-icon">${item.icon || '📦'}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}${maxQty > 1 ? ` x${maxQty}` : ''}</div>
                <div class="shop-item-desc">${item.description || ''}</div>
            </div>
            <div class="shop-item-right">
                <div class="shop-item-price sell-price">
                    💰 <span id="sellPrice_${index}">${sellPrice}</span>G
                </div>
                ${isStackable ? `
                <div class="shop-quantity-control" data-slot-index="${index}" data-unit-price="${sellPrice}" data-max-qty="${maxQty}">
                    <button class="qty-btn qty-minus" onclick="changeSellQty(${index}, -1)">−</button>
                    <input type="number" class="qty-input" id="sellQty_${index}" value="1" min="1" max="${maxQty}" onchange="updateSellQty(${index})">
                    <button class="qty-btn qty-plus" onclick="changeSellQty(${index}, 1)">+</button>
                </div>
                ` : ''}
                <button class="shop-sell-btn" onclick="sellItem(${index})">
                    판매
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}

/**
 * 아이템을 구매합니다.
 * @param {string} itemId - 아이템 ID
 */
function buyItem(itemId) {
    // 모든 상점 아이템에서 해당 아이템 찾기
    let item = null;

    // 구리 무기에서 찾기
    if (SHOP_ITEMS.copperWeapons) {
        Object.values(SHOP_ITEMS.copperWeapons).forEach(w => {
            if (w.id === itemId) item = w;
        });
    }

    // 무기에서 찾기
    if (!item) {
        Object.values(SHOP_ITEMS.weapons).forEach(w => {
            if (w.id === itemId) item = w;
        });
    }

    // 방어구에서 찾기
    if (!item) {
        Object.values(SHOP_ITEMS.armors).forEach(tier => {
            Object.values(tier).forEach(a => {
                if (a.id === itemId) item = a;
            });
        });
    }

    // 소모품에서 찾기
    if (!item) {
        item = SHOP_ITEMS.consumables.find(c => c.id === itemId);
    }

    // 재료에서 찾기
    if (!item) {
        item = SHOP_ITEMS.materials.find(m => m.id === itemId);
    }

    if (!item) {
        addGameLog('❌ 아이템을 찾을 수 없습니다.');
        return;
    }

    // 수량 확인 (수량 입력이 있으면 해당 수량, 없으면 1)
    const qtyInput = document.getElementById(`qty_${itemId}`);
    const quantity = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;
    const totalCost = item.price * quantity;

    // 골드 확인
    if ((gold || 0) < totalCost) {
        addGameLog('❌ 골드가 부족합니다!');
        return;
    }

    // 구매 처리
    gold -= totalCost;

    // 인벤토리에 아이템 추가 (수량만큼)
    addItemToInventory(item.id, quantity);

    if (quantity > 1) {
        addGameLog(`🛒 ${item.name}을(를) ${quantity}개 ${totalCost}G에 구매했습니다!`);
    } else {
        addGameLog(`🛒 ${item.name}을(를) ${item.price}G에 구매했습니다!`);
    }

    // 수량 입력 초기화
    if (qtyInput) qtyInput.value = 1;

    // UI 업데이트
    updateShopGoldDisplay();
    updatePlayerUI();

    // 현재 카테고리 다시 표시 (상태 업데이트)
    const activeCategory = document.querySelector('.shop-category-btn.active');
    if (activeCategory) {
        showShopCategory(activeCategory.dataset.category);
    }
}

/**
 * 판매 수량을 변경합니다.
 * @param {number} slotIndex - 인벤토리 슬롯 인덱스
 * @param {number} delta - 변경량 (+1 또는 -1)
 */
function changeSellQty(slotIndex, delta) {
    const input = document.getElementById(`sellQty_${slotIndex}`);
    if (!input) return;
    const maxQty = parseInt(input.max) || 1;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(maxQty, val + delta));
    input.value = val;
    updateSellQty(slotIndex);
}

/**
 * 판매 수량 입력 시 가격을 업데이트합니다.
 * @param {number} slotIndex - 인벤토리 슬롯 인덱스
 */
function updateSellQty(slotIndex) {
    const input = document.getElementById(`sellQty_${slotIndex}`);
    if (!input) return;
    const maxQty = parseInt(input.max) || 1;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(maxQty, val));
    input.value = val;

    const control = input.closest('.shop-quantity-control');
    const unitPrice = parseInt(control?.dataset?.unitPrice) || 0;
    const totalPrice = unitPrice * val;

    const priceSpan = document.getElementById(`sellPrice_${slotIndex}`);
    if (priceSpan) {
        priceSpan.textContent = totalPrice;
    }
}

/**
 * 아이템을 판매합니다.
 * @param {number} slotIndex - 인벤토리 슬롯 인덱스
 */
function sellItem(slotIndex) {
    if (!inventoryItems || !inventoryItems[slotIndex]) {
        addGameLog('❌ 아이템을 찾을 수 없습니다.');
        return;
    }

    const item = inventoryItems[slotIndex];
    const sellPrice = item.sellPrice || Math.floor((item.price || 10) / 2);

    // 수량 확인 (수량 입력이 있으면 해당 수량, 없으면 1)
    const qtyInput = document.getElementById(`sellQty_${slotIndex}`);
    const maxQty = item.quantity || 1;
    const quantity = qtyInput ? Math.max(1, Math.min(maxQty, parseInt(qtyInput.value) || 1)) : 1;
    const totalGold = sellPrice * quantity;

    // 판매 처리
    gold = (gold || 0) + totalGold;

    // 인벤토리에서 제거 (수량만큼)
    removeItemFromInventory(slotIndex, quantity);

    if (quantity > 1) {
        addGameLog(`💰 ${item.name}을(를) ${quantity}개 ${totalGold}G에 판매했습니다!`);
    } else {
        addGameLog(`💰 ${item.name}을(를) ${sellPrice}G에 판매했습니다!`);
    }

    // UI 업데이트
    updateShopGoldDisplay();
    updatePlayerUI();
    showSellItems();
}

/**
 * 상점 골드 표시를 업데이트합니다.
 */
function updateShopGoldDisplay() {
    const display = document.getElementById('shopGoldDisplay');
    if (display) {
        display.textContent = gold || 0;
    }
}

/**
 * 상점을 닫습니다.
 */
function closeShop() {
    const modal = document.querySelector('.shop-modal-overlay');
    if (modal) modal.remove();
    currentShopOpen = false;
    addGameLog('🏪 상점을 나왔습니다.');
}

/**
 * 상점을 표시합니다. (맵 시스템에서 호출)
 */
function showShop() {
    // 현재 위치가 상점인지 확인
    const location = getCurrentLocation();
    if (location && location.npcs && location.npcs.includes('shopkeeper')) {
        // 상점주인 NPC 대화로 시작
        selectNPC('shopkeeper');
    } else {
        addGameLog('🏪 여기에는 상점이 없습니다.');
    }
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('🛒 shopSystem.js 로드 완료!');

// ============================================
// 📦 상점 아이템을 ITEMS_DATABASE에 등록
// ============================================

/**
 * 상점 아이템들을 ITEMS_DATABASE에 등록합니다.
 * 이렇게 해야 addItemToInventory 함수가 아이템을 찾을 수 있습니다.
 */
function registerShopItemsToDatabase() {
    // 구리 무기 등록
    if (SHOP_ITEMS.copperWeapons) {
        Object.values(SHOP_ITEMS.copperWeapons).forEach(item => {
            if (!ITEMS_DATABASE[item.id]) {
                ITEMS_DATABASE[item.id] = item;
            }
        });
    }

    // 무기 등록
    Object.values(SHOP_ITEMS.weapons).forEach(item => {
        if (!ITEMS_DATABASE[item.id]) {
            ITEMS_DATABASE[item.id] = item;
        }
    });

    // 방어구 등록
    Object.values(SHOP_ITEMS.armors).forEach(tier => {
        Object.values(tier).forEach(item => {
            if (!ITEMS_DATABASE[item.id]) {
                ITEMS_DATABASE[item.id] = item;
            }
        });
    });

    // 소모품 등록
    SHOP_ITEMS.consumables.forEach(item => {
        if (!ITEMS_DATABASE[item.id]) {
            ITEMS_DATABASE[item.id] = item;
        }
    });

    // 재료 등록
    SHOP_ITEMS.materials.forEach(item => {
        if (!ITEMS_DATABASE[item.id]) {
            ITEMS_DATABASE[item.id] = item;
        }
    });

    console.log('📦 상점 아이템 등록 완료!');
}

// 즉시 실행
registerShopItemsToDatabase();
