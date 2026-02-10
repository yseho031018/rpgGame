/**
 * ============================================
 * RPG Adventure - 인벤토리 시스템
 * ============================================
 * 캐릭터 정보, 장비, 아이템을 관리합니다.
 */

// ============================================
// 📦 인벤토리 데이터
// ============================================

// 인벤토리 슬롯 (최대 20개)
var inventoryItems = [];
const MAX_INVENTORY_SIZE = 20;

// 장비 슬롯 (9개)
var equipment = {
    helmet: null,
    armor: null,
    gloves: null,
    boots: null,
    weapon: null,
    tool: null,
    necklace: null,
    ring1: null,
    ring2: null
};

// 현재 선택된 탭
let currentInventoryTab = 'all';

// ============================================
// 🎒 아이템 데이터 템플릿
// ============================================

const ITEM_TYPES = {
    weapon: { name: '무기', icon: '⚔️', color: '#e74c3c' },
    armor: { name: '방어구', icon: '🛡️', color: '#3498db' },
    helmet: { name: '투구', icon: '⛑️', color: '#8e44ad' },
    boots: { name: '신발', icon: '👟', color: '#34495e' },
    gloves: { name: '장갑', icon: '🧤', color: '#2c3e50' },
    tool: { name: '도구', icon: '🔧', color: '#7f8c8d' },
    necklace: { name: '목걸이', icon: '📿', color: '#9b59b6' },
    ring: { name: '반지', icon: '💍', color: '#f1c40f' },
    accessory: { name: '장신구', icon: '💍', color: '#9b59b6' },  // 호환성 유지
    consumable: { name: '소모품', icon: '🧪', color: '#27ae60' },
    material: { name: '재료', icon: '🌿', color: '#f39c12' },
    special: { name: '특수', icon: '⭐', color: '#ffd700' }
};

// 샘플 아이템 데이터 (나중에 확장)
const ITEMS_DATABASE = {
    // ========== 초기 장비 ==========
    // 전사
    old_longsword: {
        id: 'old_longsword',
        name: '낡은 대검',
        type: 'weapon',
        rarity: 'common',
        stats: { pAtk: 5 },
        description: '낡았지만 쓸만한 대검입니다.',
        icon: '⚔️',
        sellPrice: 10
    },
    old_heavy_leather_armor: {
        id: 'old_heavy_leather_armor',
        name: '낡은 가죽 중갑',
        type: 'armor',
        rarity: 'common',
        stats: { pDef: 4, mDef: 2 },
        description: '두꺼운 가죽으로 만든 중갑입니다.',
        icon: '🥋',
        sellPrice: 10
    },
    // 궁수
    crude_bow: {
        id: 'crude_bow',
        name: '조잡한 활',
        type: 'weapon',
        rarity: 'common',
        stats: { pAtk: 5 },
        description: '조잡하게 만든 활이지만 사용 가능합니다.',
        icon: '🏹',
        sellPrice: 10
    },
    old_hunting_clothes: {
        id: 'old_hunting_clothes',
        name: '낡은 사냥복',
        type: 'armor',
        rarity: 'common',
        stats: { pDef: 3, mDef: 1 },
        description: '가벼운 사냥복입니다. 방어력은 낮지만 움직이기 편합니다.',
        icon: '👕',
        sellPrice: 10
    },
    // 마법사
    crude_staff: {
        id: 'crude_staff',
        name: '조잡한 지팡이',
        type: 'weapon',
        rarity: 'common',
        stats: { mAtk: 5 },
        description: '마법을 담을 수 있는 조잡한 지팡이입니다.',
        icon: '🪄',
        sellPrice: 10
    },
    old_robe: {
        id: 'old_robe',
        name: '낡은 로브',
        type: 'armor',
        rarity: 'common',
        stats: { pDef: 3, mDef: 1 },
        description: '마법사가 입는 낡은 로브입니다.',
        icon: '🧥',
        sellPrice: 10
    },
    // 도적
    old_sword: {
        id: 'old_sword',
        name: '낡은 단검',
        type: 'weapon',
        rarity: 'common',
        stats: { pAtk: 5 },
        description: '가볍고 빠른 낡은 단검입니다.',
        icon: '🗡️',
        sellPrice: 10
    },
    old_leather_armor: {
        id: 'old_leather_armor',
        name: '낡은 가죽 경갑',
        type: 'armor',
        rarity: 'common',
        stats: { pDef: 3, mDef: 1 },
        description: '가벼운 가죽 경갑입니다.',
        icon: '🥋',
        sellPrice: 10
    },
    // ========== 일반 장비 ==========
    wooden_sword: {
        id: 'wooden_sword',
        name: '나무 단검',
        type: 'weapon',
        rarity: 'common',
        stats: { pAtk: 3 },
        description: '초보 모험가용 나무 단검입니다.',
        icon: '🗡️',
        sellPrice: 5
    },
    iron_sword: {
        id: 'iron_sword',
        name: '철 단검',
        type: 'weapon',
        rarity: 'uncommon',
        stats: { pAtk: 8 },
        description: '든든한 철로 만든 단검입니다.',
        icon: '🗡️',
        sellPrice: 25
    },
    leather_armor: {
        id: 'leather_armor',
        name: '가죽 갑옷',
        type: 'armor',
        rarity: 'common',
        stats: { pDef: 3 },
        description: '가벼운 가죽 갑옷입니다.',
        icon: '🥋',
        sellPrice: 10
    },
    // 소모품
    hp_potion: {
        id: 'hp_potion',
        name: 'HP 포션',
        type: 'consumable',
        rarity: 'common',
        effect: { hp: 50 },
        description: 'HP를 50 회복합니다.',
        icon: '🧪',
        sellPrice: 15,
        stackable: true
    },
    mp_potion: {
        id: 'mp_potion',
        name: 'MP 포션',
        type: 'consumable',
        rarity: 'common',
        effect: { mp: 30 },
        description: 'MP를 30 회복합니다.',
        icon: '💙',
        sellPrice: 20,
        stackable: true
    },
    // 재료
    herb: {
        id: 'herb',
        name: '약초',
        type: 'material',
        rarity: 'common',
        description: '일반적인 약초입니다.',
        icon: '🌿',
        sellPrice: 3,
        stackable: true
    },
    monster_tooth: {
        id: 'monster_tooth',
        name: '몬스터 이빨',
        type: 'material',
        rarity: 'uncommon',
        description: '몬스터의 날카로운 이빨입니다.',
        icon: '🦷',
        sellPrice: 8,
        stackable: true
    }
};

// ITEMS 전역 변수로도 접근 가능하게
const ITEMS = ITEMS_DATABASE;

// 희귀도 색상
const RARITY_COLORS = {
    common: '#9e9e9e',
    uncommon: '#4caf50',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800'
};

// ============================================
// 📦 인벤토리 함수
// ============================================

/**
 * 아이템을 인벤토리에 추가합니다.
 */
function addItemToInventory(itemId, quantity = 1) {
    const itemData = ITEMS_DATABASE[itemId];
    if (!itemData) {
        console.error('존재하지 않는 아이템:', itemId);
        return false;
    }

    // 스택 가능한 아이템인 경우 기존 스택에 추가
    if (itemData.stackable) {
        const existingItem = inventoryItems.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity += quantity;
            addGameLog(`📦 ${itemData.name} x${quantity} 획득!`);
            return true;
        }
    }

    // 인벤토리 공간 확인
    if (inventoryItems.length >= MAX_INVENTORY_SIZE) {
        addGameLog('❌ 인벤토리가 가득 찼습니다!');
        return false;
    }

    // 새 아이템 추가
    inventoryItems.push({
        ...itemData,
        quantity: quantity,
        slot: inventoryItems.length
    });

    addGameLog(`📦 ${itemData.name}${quantity > 1 ? ` x${quantity}` : ''} 획득!`);
    return true;
}

/**
 * 아이템을 인벤토리에서 제거합니다.
 */
function removeItemFromInventory(slotIndex, quantity = 1) {
    if (slotIndex < 0 || slotIndex >= inventoryItems.length) return false;

    const item = inventoryItems[slotIndex];
    if (item.stackable && item.quantity > quantity) {
        item.quantity -= quantity;
    } else {
        inventoryItems.splice(slotIndex, 1);
    }

    return true;
}

/**
 * 아이템을 사용합니다.
 */
function useItem(slotIndex) {
    if (slotIndex < 0 || slotIndex >= inventoryItems.length) return;

    const item = inventoryItems[slotIndex];

    if (item.type === 'consumable') {
        // 소모품 사용
        if (item.effect) {
            if (item.effect.hp) {
                const healAmount = Math.min(item.effect.hp, player.maxHp - player.hp);
                player.hp += healAmount;
                addGameLog(`💚 ${item.name} 사용! HP +${healAmount}`);
            }
            if (item.effect.mp) {
                const recoverAmount = Math.min(item.effect.mp, player.maxMp - player.mp);
                player.mp += recoverAmount;
                addGameLog(`💙 ${item.name} 사용! MP +${recoverAmount}`);
            }
        }
        removeItemFromInventory(slotIndex, 1);
        updatePlayerUI();
        renderInventory();
    } else if (['weapon', 'armor', 'helmet', 'boots', 'gloves', 'tool', 'necklace', 'ring', 'accessory'].includes(item.type)) {
        // 장비 장착
        equipItem(slotIndex);
    }
}

/**
 * 장비를 장착합니다. (인덱스 또는 아이템 객체 지원)
 */
function equipItem(slotIndexOrItem) {
    let item, slotIndex = -1;

    // 객체로 전달된 경우
    if (typeof slotIndexOrItem === 'object') {
        item = slotIndexOrItem;
        slotIndex = inventoryItems.findIndex(i => i.instanceId === item.instanceId);
    } else {
        slotIndex = slotIndexOrItem;
        if (slotIndex < 0 || slotIndex >= inventoryItems.length) return;
        item = inventoryItems[slotIndex];
    }

    if (!item) return;

    // 장착 가능한 타입 목록
    const equipableTypes = ['weapon', 'armor', 'helmet', 'boots', 'gloves', 'tool', 'necklace', 'ring', 'accessory'];

    if (!equipableTypes.includes(item.type)) {
        addGameLog('❌ 장착할 수 없는 아이템입니다.');
        return;
    }

    // 아이템 타입에 따른 슬롯 결정
    let targetSlot = item.type;

    // accessory는 necklace로 처리 (호환성)
    if (item.type === 'accessory') {
        targetSlot = 'necklace';
    }

    // ring 타입은 ring1, ring2 중 빈 슬롯에 장착
    if (item.type === 'ring') {
        if (!equipment.ring1) {
            targetSlot = 'ring1';
        } else if (!equipment.ring2) {
            targetSlot = 'ring2';
        } else {
            // 둘 다 차있으면 ring1 교체
            targetSlot = 'ring1';
        }
    }

    // 기존 장비 해제
    if (equipment[targetSlot]) {
        inventoryItems.push(equipment[targetSlot]);
    }

    // 새 장비 장착
    if (slotIndex >= 0 && slotIndex < inventoryItems.length) {
        equipment[targetSlot] = inventoryItems.splice(slotIndex, 1)[0];
    } else {
        // 인벤토리에 없는 아이템 (초기 장비 등)
        const idx = inventoryItems.findIndex(i => i.instanceId === item.instanceId);
        if (idx >= 0) {
            equipment[targetSlot] = inventoryItems.splice(idx, 1)[0];
        }
    }

    // 스탯 적용
    applyEquipmentStats();

    addGameLog(`⚔️ ${item.name} 장착!`);
    updatePlayerUI();
    renderInventory();
}

/**
 * 장비를 해제합니다.
 */
function unequipItem(slot) {
    if (!equipment[slot]) return;

    if (inventoryItems.length >= MAX_INVENTORY_SIZE) {
        addGameLog('❌ 인벤토리가 가득 찼습니다!');
        return;
    }

    const item = equipment[slot];
    inventoryItems.push(item);
    equipment[slot] = null;

    applyEquipmentStats();

    addGameLog(`🔄 ${item.name} 해제!`);
    updatePlayerUI();
    renderInventory();
}

/**
 * 장비 스탯을 적용합니다. (새로운 스탯 시스템)
 */
function applyEquipmentStats() {
    // player가 없으면 스킵
    if (typeof player === 'undefined' || player === null) {
        console.warn('⚠️ applyEquipmentStats: player가 없어서 스킵합니다.');
        return;
    }
    
    // equipment가 없으면 스킵
    if (typeof equipment === 'undefined' || equipment === null) {
        console.warn('⚠️ applyEquipmentStats: equipment가 없어서 스킵합니다.');
        return;
    }
    
    // 보너스 스탯 초기화
    let bonusPAtk = 0, bonusMAtk = 0;
    let bonusPDef = 0, bonusMDef = 0;
    let bonusHp = 0, bonusMp = 0;
    let bonusStr = 0, bonusVit = 0, bonusInt = 0, bonusAgi = 0;

    // 장비 스탯 합산
    Object.values(equipment).forEach(item => {
        if (item && item.stats) {
            if (item.stats.pAtk) bonusPAtk += item.stats.pAtk;
            if (item.stats.mAtk) bonusMAtk += item.stats.mAtk;
            if (item.stats.pDef) bonusPDef += item.stats.pDef;
            if (item.stats.mDef) bonusMDef += item.stats.mDef;
            if (item.stats.hp) bonusHp += item.stats.hp;
            if (item.stats.mp) bonusMp += item.stats.mp;
            if (item.stats.str) bonusStr += item.stats.str;
            if (item.stats.vit) bonusVit += item.stats.vit;
            if (item.stats.int) bonusInt += item.stats.int;
            if (item.stats.agi) bonusAgi += item.stats.agi;
            // 호환성: 기존 atk/def도 지원
            if (item.stats.atk) bonusPAtk += item.stats.atk;
            if (item.stats.def) bonusPDef += item.stats.def;
        }
    });

    // 플레이어에 보너스 스탯 저장
    player.bonusPAtk = bonusPAtk;
    player.bonusMAtk = bonusMAtk;
    player.bonusPDef = bonusPDef;
    player.bonusMDef = bonusMDef;
    player.bonusHp = bonusHp;
    player.bonusMp = bonusMp;
    player.bonusStr = bonusStr;
    player.bonusVit = bonusVit;
    player.bonusInt = bonusInt;
    player.bonusAgi = bonusAgi;

    // 파생 스탯 재계산 (보너스 HP/MP 포함)
    if (typeof recalculatePlayerStats === 'function') {
        recalculatePlayerStats();
    }
}

/**
 * 총 물리공격력을 계산합니다.
 */
function getTotalPAtk() {
    return (player.pAtk || 0) + (player.bonusPAtk || 0);
}

/**
 * 총 물리방어력을 계산합니다.
 */
function getTotalPDef() {
    return (player.pDef || 0) + (player.bonusPDef || 0);
}

// 호환성을 위한 기존 함수
function getTotalAtk() { return getTotalPAtk(); }
function getTotalDef() { return getTotalPDef(); }

// ============================================
// 🎨 인벤토리 UI
// ============================================

/**
 * 인벤토리 창을 엽니다.
 */
function showInventory() {
    const modal = document.getElementById('inventoryModal');
    if (modal) {
        modal.classList.remove('hidden');
        renderInventory();
    }
}

/**
 * 인벤토리 창을 닫습니다.
 */
function hideInventory() {
    const modal = document.getElementById('inventoryModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * 인벤토리를 렌더링합니다.
 */
function renderInventory() {
    // 인벤토리 창 레벨/이름 업데이트
    const invLevelEl = document.getElementById('invPlayerLevel');
    if (invLevelEl && player) invLevelEl.textContent = `Lv.${player.level}`;

    const invNameEl = document.getElementById('invPlayerName');
    if (invNameEl && player) invNameEl.textContent = player.name;

    renderCharacterInfo();
    renderEquipment();
    renderInventoryItems();
}

/**
 * 캐릭터 정보를 렌더링합니다. (새로운 스탯 시스템)
 */
function renderCharacterInfo() {
    const container = document.getElementById('characterStats');
    if (!container || !player) return;

    const requiredExp = getRequiredExp(player.level);

    // 직업 정보
    const jobName = player.jobData ? player.jobData.name : '모험가';
    const jobIcon = player.jobData ? player.jobData.icon : '⚔️';

    container.innerHTML = `
        <div class="stat-row job-row">
            <span class="stat-label">${jobIcon} 직업</span>
            <span class="stat-value">${jobName}</span>
        </div>
        <button class="skill-trait-view-btn" onclick="showSkillTraitModal()">⚡ 스킬 및 특성 보기</button>
        <div class="stat-divider"></div>
        <div class="stat-row">
            <span class="stat-label">❤️ HP</span>
            <span class="stat-value">${player.hp} / ${player.maxHp}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">💙 MP</span>
            <span class="stat-value">${player.mp} / ${player.maxMp}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">⚔️ 물리공격력</span>
            <span class="stat-value">${player.pAtk || 0}${player.bonusPAtk ? ` <span class="bonus">+${player.bonusPAtk}</span>` : ''}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">🔮 마법공격력</span>
            <span class="stat-value">${player.mAtk || 0}${player.bonusMAtk ? ` <span class="bonus">+${player.bonusMAtk}</span>` : ''}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">🛡️ 물리방어력</span>
            <span class="stat-value">${player.pDef || 0}${player.bonusPDef ? ` <span class="bonus">+${player.bonusPDef}</span>` : ''}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">🔰 마법방어력</span>
            <span class="stat-value">${player.mDef || 0}${player.bonusMDef ? ` <span class="bonus">+${player.bonusMDef}</span>` : ''}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-row sub-stat${(player.statPoints || 0) > 0 ? ' allocatable' : ''}">
            <span class="stat-label">💪 근력</span>
            <span class="stat-value">${player.str || 0}${(player.bonusStr || 0) > 0 ? ` <span class="bonus">+${player.bonusStr}</span>` : ''}${(player.statPoints || 0) > 0 ? `<button class="stat-add-btn" onclick="allocateStatPoint('str')">+</button>` : ''}</span>
        </div>
        <div class="stat-row sub-stat${(player.statPoints || 0) > 0 ? ' allocatable' : ''}">
            <span class="stat-label">🫀 체력</span>
            <span class="stat-value">${player.vit || 0}${(player.bonusVit || 0) > 0 ? ` <span class="bonus">+${player.bonusVit}</span>` : ''}${(player.statPoints || 0) > 0 ? `<button class="stat-add-btn" onclick="allocateStatPoint('vit')">+</button>` : ''}</span>
        </div>
        <div class="stat-row sub-stat${(player.statPoints || 0) > 0 ? ' allocatable' : ''}">
            <span class="stat-label">🧠 지능</span>
            <span class="stat-value">${player.int || 0}${(player.bonusInt || 0) > 0 ? ` <span class="bonus">+${player.bonusInt}</span>` : ''}${(player.statPoints || 0) > 0 ? `<button class="stat-add-btn" onclick="allocateStatPoint('int')">+</button>` : ''}</span>
        </div>
        <div class="stat-row sub-stat${(player.statPoints || 0) > 0 ? ' allocatable' : ''}">
            <span class="stat-label">💨 민첩</span>
            <span class="stat-value">${player.agi || 0}${(player.bonusAgi || 0) > 0 ? ` <span class="bonus">+${player.bonusAgi}</span>` : ''}${(player.statPoints || 0) > 0 ? `<button class="stat-add-btn" onclick="allocateStatPoint('agi')">+</button>` : ''}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-row sub-stat">
            <span class="stat-label">🎯 정확도</span>
            <span class="stat-value">${player.efficiency || 0}%</span>
        </div>
        <div class="stat-row sub-stat">
            <span class="stat-label">💫 회피율</span>
            <span class="stat-value">${player.evasion || 0}%</span>
        </div>
        <div class="stat-row sub-stat">
            <span class="stat-label">💚 회복효율</span>
            <span class="stat-value">${player.healEff || 0}%</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-row">
            <span class="stat-label">⭐ 경험치</span>
            <span class="stat-value">${player.exp} / ${requiredExp}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">💰 골드</span>
            <span class="stat-value gold">${gold.toLocaleString()} G</span>
        </div>
        ${(player.statPoints || 0) > 0 ? `
        <div class="stat-row stat-points-row">
            <span class="stat-label">📊 스탯포인트</span>
            <span class="stat-value bonus">${player.statPoints}</span>
        </div>
        <button class="stat-allocate-btn" onclick="showStatAllocationUI()">📊 스탯 배분하기</button>
        ` : ''}
    `;

    // 스탯 배분 버튼이 있으면 기본 스탯에도 + 버튼 표시
    if ((player.statPoints || 0) > 0) {
        updateStatButtons();
    }
}

/**
 * 장비 슬롯을 렌더링합니다.
 */
function renderEquipment() {
    const slots = ['helmet', 'armor', 'gloves', 'boots', 'weapon', 'tool', 'necklace', 'ring1', 'ring2'];
    const slotNames = {
        helmet: '투구',
        armor: '갑옷',
        gloves: '장갑',
        boots: '신발',
        weapon: '무기',
        tool: '도구',
        necklace: '목걸이',
        ring1: '반지1',
        ring2: '반지2'
    };
    const slotIcons = {
        helmet: '⛑️',
        armor: '🥋',
        gloves: '🧤',
        boots: '👟',
        weapon: '⚔️',
        tool: '🔧',
        necklace: '📿',
        ring1: '💍',
        ring2: '💎'
    };

    slots.forEach(slot => {
        const slotElement = document.getElementById(`equip-${slot}`);
        if (!slotElement) return;

        const item = equipment[slot];
        if (item) {
            // 장비 스탯 문자열 생성
            let statsStr = '';
            if (item.stats) {
                const statParts = [];
                if (item.stats.pAtk) statParts.push(`물공+${item.stats.pAtk}`);
                if (item.stats.mAtk) statParts.push(`마공+${item.stats.mAtk}`);
                if (item.stats.pDef) statParts.push(`물방+${item.stats.pDef}`);
                if (item.stats.mDef) statParts.push(`마방+${item.stats.mDef}`);
                if (item.stats.atk) statParts.push(`공격+${item.stats.atk}`);
                if (item.stats.def) statParts.push(`방어+${item.stats.def}`);
                if (item.stats.hp) statParts.push(`HP+${item.stats.hp}`);
                if (item.stats.mp) statParts.push(`MP+${item.stats.mp}`);
                if (item.stats.str) statParts.push(`근력+${item.stats.str}`);
                if (item.stats.vit) statParts.push(`체력+${item.stats.vit}`);
                if (item.stats.int) statParts.push(`지능+${item.stats.int}`);
                if (item.stats.agi) statParts.push(`민첩+${item.stats.agi}`);
                statsStr = statParts.join(' ');
            }

            slotElement.innerHTML = `
                <div class="equip-item" style="border-color: ${RARITY_COLORS[item.rarity] || '#666'}" onclick="unequipItem('${slot}')">
                    <span class="equip-icon">${item.icon}</span>
                    <span class="equip-name">${item.name}</span>
                    ${statsStr ? `<span class="equip-stats">${statsStr}</span>` : ''}
                </div>
            `;
            slotElement.classList.add('equipped');
        } else {
            slotElement.innerHTML = `
                <div class="equip-empty">
                    <span class="equip-icon">${slotIcons[slot]}</span>
                    <span class="equip-name">${slotNames[slot]}</span>
                </div>
            `;
            slotElement.classList.remove('equipped');
        }
    });
}

/**
 * 인벤토리 아이템들을 렌더링합니다.
 */
function renderInventoryItems() {
    const container = document.getElementById('inventoryGrid');
    if (!container) return;

    container.innerHTML = '';

    // 탭 필터 적용
    let filteredItems = inventoryItems;
    if (currentInventoryTab !== 'all') {
        filteredItems = inventoryItems.filter(item => item.type === currentInventoryTab);
    }

    // 아이템 슬롯 렌더링
    for (let i = 0; i < MAX_INVENTORY_SIZE; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';

        if (i < filteredItems.length) {
            const item = filteredItems[i];
            const originalIndex = inventoryItems.indexOf(item);

            slot.innerHTML = `
                <div class="item-content" style="border-color: ${RARITY_COLORS[item.rarity] || '#666'}" 
                     onclick="showItemContextMenu(${originalIndex}, event)"
                     oncontextmenu="event.preventDefault(); showItemContextMenu(${originalIndex}, event);">
                    <span class="item-icon">${item.icon}</span>
                    ${item.stackable && item.quantity > 1 ? `<span class="item-quantity">${item.quantity}</span>` : ''}
                </div>
            `;
            slot.classList.add('has-item');
        } else {
            slot.innerHTML = '<div class="slot-empty"></div>';
        }

        container.appendChild(slot);
    }
}

/**
 * 탭을 변경합니다.
 */
function changeInventoryTab(tab) {
    currentInventoryTab = tab;

    // 탭 버튼 활성화 상태 변경
    document.querySelectorAll('.inv-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    renderInventoryItems();
}

/**
 * 아이템 툴팁을 표시합니다.
 */
function showItemTooltip(slotIndex, event) {
    if (slotIndex < 0 || slotIndex >= inventoryItems.length) return;

    const item = inventoryItems[slotIndex];
    const tooltip = document.getElementById('itemTooltip');
    if (!tooltip) return;

    let statsHtml = '';
    if (item.stats) {
        // 새로운 스탯 시스템
        if (item.stats.pAtk) statsHtml += `<div class="tooltip-stat">⚔️ 물리공격력 +${item.stats.pAtk}</div>`;
        if (item.stats.mAtk) statsHtml += `<div class="tooltip-stat">🔮 마법공격력 +${item.stats.mAtk}</div>`;
        if (item.stats.pDef) statsHtml += `<div class="tooltip-stat">🛡️ 물리방어력 +${item.stats.pDef}</div>`;
        if (item.stats.mDef) statsHtml += `<div class="tooltip-stat">🔰 마법방어력 +${item.stats.mDef}</div>`;
        // 기본 스탯
        if (item.stats.str) statsHtml += `<div class="tooltip-stat">💪 근력 +${item.stats.str}</div>`;
        if (item.stats.vit) statsHtml += `<div class="tooltip-stat">🫀 체력 +${item.stats.vit}</div>`;
        if (item.stats.int) statsHtml += `<div class="tooltip-stat">🧠 지능 +${item.stats.int}</div>`;
        if (item.stats.agi) statsHtml += `<div class="tooltip-stat">💨 민첩 +${item.stats.agi}</div>`;
        // 기존 호환성
        if (item.stats.atk) statsHtml += `<div class="tooltip-stat">⚔️ 공격력 +${item.stats.atk}</div>`;
        if (item.stats.def) statsHtml += `<div class="tooltip-stat">🛡️ 방어력 +${item.stats.def}</div>`;
        if (item.stats.hp) statsHtml += `<div class="tooltip-stat">❤️ HP +${item.stats.hp}</div>`;
        if (item.stats.mp) statsHtml += `<div class="tooltip-stat">💙 MP +${item.stats.mp}</div>`;
    }
    if (item.effect) {
        if (item.effect.hp) statsHtml += `<div class="tooltip-stat">❤️ HP 회복 +${item.effect.hp}</div>`;
        if (item.effect.mp) statsHtml += `<div class="tooltip-stat">💙 MP 회복 +${item.effect.mp}</div>`;
    }

    tooltip.innerHTML = `
        <div class="tooltip-header" style="border-left-color: ${RARITY_COLORS[item.rarity] || '#666'}">
            <span class="tooltip-icon">${item.icon}</span>
            <span class="tooltip-name">${item.name}</span>
        </div>
        <div class="tooltip-type">${ITEM_TYPES[item.type]?.name || item.type}</div>
        ${statsHtml}
        <div class="tooltip-desc">${item.description}</div>
        <div class="tooltip-price">💰 ${item.sellPrice}G</div>
    `;

    // 위치 설정
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;
    tooltip.classList.remove('hidden');

    // 클릭 외부 감지
    setTimeout(() => {
        document.addEventListener('click', hideItemTooltip, { once: true });
    }, 0);
}

/**
 * 아이템 툴팁을 숨깁니다.
 */
function hideItemTooltip() {
    const tooltip = document.getElementById('itemTooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
    }
}

// ============================================
// 📋 아이템 컨텍스트 메뉴 시스템
// ============================================

/**
 * 아이템 컨텍스트 메뉴를 표시합니다.
 */
function showItemContextMenu(slotIndex, event) {
    event.preventDefault();
    event.stopPropagation();

    if (slotIndex < 0 || slotIndex >= inventoryItems.length) return;

    const item = inventoryItems[slotIndex];
    
    // 기존 컨텍스트 메뉴 제거
    hideItemContextMenu();
    hideItemTooltip();

    const menu = document.createElement('div');
    menu.id = 'itemContextMenu';
    menu.className = 'item-context-menu';

    // 아이템 타입에 따른 메뉴 옵션 구성
    const equipableTypes = ['weapon', 'armor', 'helmet', 'boots', 'gloves', 'tool', 'necklace', 'ring', 'accessory'];
    const isEquipable = equipableTypes.includes(item.type);
    const isConsumable = item.type === 'consumable';

    let menuOptions = '';

    // 아이템 이름 헤더
    menuOptions += `
        <div class="context-menu-header" style="border-left-color: ${RARITY_COLORS[item.rarity] || '#666'}">
            <span class="context-menu-icon">${item.icon}</span>
            <span class="context-menu-name">${item.name}</span>
        </div>
    `;

    // 장착 가능한 아이템
    if (isEquipable) {
        menuOptions += `
            <button class="context-menu-btn equip-btn" onclick="contextMenuEquip(${slotIndex})">
                <span class="context-btn-icon">⚔️</span>
                <span class="context-btn-text">장착</span>
            </button>
        `;
    }

    // 소모품 사용
    if (isConsumable) {
        menuOptions += `
            <button class="context-menu-btn use-btn" onclick="contextMenuUse(${slotIndex})">
                <span class="context-btn-icon">🧪</span>
                <span class="context-btn-text">사용</span>
            </button>
        `;
    }

    // 정보 보기 (모든 아이템)
    menuOptions += `
        <button class="context-menu-btn info-btn" onclick="contextMenuInfo(${slotIndex}, event)">
            <span class="context-btn-icon">📋</span>
            <span class="context-btn-text">정보 보기</span>
        </button>
    `;

    // 버리기 (모든 아이템)
    menuOptions += `
        <button class="context-menu-btn discard-btn" onclick="contextMenuDiscard(${slotIndex})">
            <span class="context-btn-icon">🗑️</span>
            <span class="context-btn-text">버리기</span>
        </button>
    `;

    menu.innerHTML = menuOptions;

    // 위치 설정 - 클릭 위치 기준
    document.body.appendChild(menu);

    // 메뉴가 화면 밖으로 나가지 않도록 위치 조정
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let posX = event.clientX;
    let posY = event.clientY;

    if (posX + menuRect.width > viewportWidth) {
        posX = viewportWidth - menuRect.width - 10;
    }
    if (posY + menuRect.height > viewportHeight) {
        posY = viewportHeight - menuRect.height - 10;
    }

    menu.style.left = `${posX}px`;
    menu.style.top = `${posY}px`;

    // 외부 클릭 시 메뉴 닫기
    setTimeout(() => {
        document.addEventListener('click', hideItemContextMenu, { once: true });
    }, 0);
}

/**
 * 컨텍스트 메뉴를 숨깁니다.
 */
function hideItemContextMenu() {
    const menu = document.getElementById('itemContextMenu');
    if (menu) {
        menu.remove();
    }
}

/**
 * 컨텍스트 메뉴 - 장착
 */
function contextMenuEquip(slotIndex) {
    hideItemContextMenu();
    equipItem(slotIndex);
}

/**
 * 컨텍스트 메뉴 - 사용
 */
function contextMenuUse(slotIndex) {
    hideItemContextMenu();
    useItem(slotIndex);
}

/**
 * 컨텍스트 메뉴 - 정보 보기
 */
function contextMenuInfo(slotIndex, event) {
    // 메뉴 위치를 저장해 둔 뒤 메뉴를 닫고 tooltip을 그 위치에 표시
    const menu = document.getElementById('itemContextMenu');
    const posX = menu ? parseInt(menu.style.left) : event.clientX;
    const posY = menu ? parseInt(menu.style.top) : event.clientY;
    hideItemContextMenu();
    showItemTooltipAtPosition(slotIndex, posX, posY);
}

/**
 * 컨텍스트 메뉴 - 버리기
 */
function contextMenuDiscard(slotIndex) {
    hideItemContextMenu();
    
    if (slotIndex < 0 || slotIndex >= inventoryItems.length) return;

    const item = inventoryItems[slotIndex];
    
    // 확인 다이얼로그
    const confirmed = confirm(`정말 "${item.name}"${item.stackable && item.quantity > 1 ? ` x${item.quantity}` : ''}을(를) 버리시겠습니까?\n\n⚠️ 버린 아이템은 되돌릴 수 없습니다!`);
    
    if (confirmed) {
        const itemName = item.name;
        const quantity = item.quantity || 1;
        removeItemFromInventory(slotIndex);
        addGameLog(`🗑️ ${itemName}${quantity > 1 ? ` x${quantity}` : ''}을(를) 버렸습니다.`);
        updatePlayerUI();
        renderInventory();
    }
}

/**
 * 아이템 툴팁을 표시합니다. (정보 보기용)
 */
function showItemTooltipAtPosition(slotIndex, x, y) {
    if (slotIndex < 0 || slotIndex >= inventoryItems.length) return;

    const item = inventoryItems[slotIndex];
    const tooltip = document.getElementById('itemTooltip');
    if (!tooltip) return;

    // showItemTooltip과 동일한 내용 표시
    let statsHtml = '';
    if (item.stats) {
        if (item.stats.pAtk) statsHtml += `<div class="tooltip-stat">⚔️ 물리공격력 +${item.stats.pAtk}</div>`;
        if (item.stats.mAtk) statsHtml += `<div class="tooltip-stat">🔮 마법공격력 +${item.stats.mAtk}</div>`;
        if (item.stats.pDef) statsHtml += `<div class="tooltip-stat">🛡️ 물리방어력 +${item.stats.pDef}</div>`;
        if (item.stats.mDef) statsHtml += `<div class="tooltip-stat">🔰 마법방어력 +${item.stats.mDef}</div>`;
        if (item.stats.str) statsHtml += `<div class="tooltip-stat">💪 근력 +${item.stats.str}</div>`;
        if (item.stats.vit) statsHtml += `<div class="tooltip-stat">🫀 체력 +${item.stats.vit}</div>`;
        if (item.stats.int) statsHtml += `<div class="tooltip-stat">🧠 지능 +${item.stats.int}</div>`;
        if (item.stats.agi) statsHtml += `<div class="tooltip-stat">💨 민첩 +${item.stats.agi}</div>`;
        if (item.stats.atk) statsHtml += `<div class="tooltip-stat">⚔️ 공격력 +${item.stats.atk}</div>`;
        if (item.stats.def) statsHtml += `<div class="tooltip-stat">🛡️ 방어력 +${item.stats.def}</div>`;
        if (item.stats.hp) statsHtml += `<div class="tooltip-stat">❤️ HP +${item.stats.hp}</div>`;
        if (item.stats.mp) statsHtml += `<div class="tooltip-stat">💙 MP +${item.stats.mp}</div>`;
    }
    if (item.effect) {
        if (item.effect.hp) statsHtml += `<div class="tooltip-stat">❤️ HP 회복 +${item.effect.hp}</div>`;
        if (item.effect.mp) statsHtml += `<div class="tooltip-stat">💙 MP 회복 +${item.effect.mp}</div>`;
    }

    tooltip.innerHTML = `
        <div class="tooltip-header" style="border-left-color: ${RARITY_COLORS[item.rarity] || '#666'}">
            <span class="tooltip-icon">${item.icon}</span>
            <span class="tooltip-name">${item.name}</span>
        </div>
        <div class="tooltip-type">${ITEM_TYPES[item.type]?.name || item.type}</div>
        ${statsHtml}
        <div class="tooltip-desc">${item.description}</div>
        <div class="tooltip-price">💰 ${item.sellPrice}G</div>
    `;

    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.remove('hidden');

    setTimeout(() => {
        document.addEventListener('click', hideItemTooltip, { once: true });
    }, 0);
}

// ============================================
// 📊 스탯포인트 배분 시스템
// ============================================

/**
 * 스탯포인트 하나를 지정한 스탯에 배분합니다.
 */
function allocateStatPoint(statId) {
    if (!player || (player.statPoints || 0) <= 0) {
        addGameLog('⚠️ 배분할 스탯포인트가 없습니다!');
        return;
    }

    const validStats = ['str', 'vit', 'int', 'agi'];
    if (!validStats.includes(statId)) {
        console.error('잘못된 스탯 ID:', statId);
        return;
    }

    // 스탯 증가
    player[statId] = (player[statId] || 0) + 1;
    player.statPoints--;

    // 파생 스탯 재계산
    if (typeof recalculatePlayerStats === 'function') {
        recalculatePlayerStats();
    }

    const statNames = { str: '근력', vit: '체력', int: '지능', agi: '민첩' };
    addGameLog(`📊 ${statNames[statId]} +1! (남은 포인트: ${player.statPoints})`);

    // UI 업데이트
    renderCharacterInfo();
    if (typeof updatePlayerUI === 'function') {
        updatePlayerUI();
    }

    // 스탯 배분 UI가 열려있으면 업데이트
    const allocationUI = document.getElementById('statAllocationUI');
    if (allocationUI) {
        showStatAllocationUI();
    }
}

/**
 * 스탯 배분 UI를 표시합니다.
 */
function showStatAllocationUI() {
    // 기존 UI 제거
    closeStatAllocationUI();

    if (!player || (player.statPoints || 0) <= 0) {
        addGameLog('⚠️ 배분할 스탯포인트가 없습니다!');
        return;
    }

    const container = document.createElement('div');
    container.id = 'statAllocationUI';
    container.className = 'stat-allocation-overlay';

    const stats = [
        { id: 'str', name: '근력', icon: '💪', desc: '물리공격력/방어력 증가', value: player.str || 0 },
        { id: 'vit', name: '체력', icon: '🫀', desc: 'HP/방어력/회복효율 증가', value: player.vit || 0 },
        { id: 'int', name: '지능', icon: '🧠', desc: 'MP/마법공격력/방어력 증가', value: player.int || 0 },
        { id: 'agi', name: '민첩', icon: '💨', desc: '정확도/회피율 증가', value: player.agi || 0 }
    ];

    let html = `
        <div class="stat-allocation-panel">
            <h3>📊 스탯포인트 배분</h3>
            <p class="stat-points-available">남은 포인트: <span class="bonus">${player.statPoints}</span></p>
            <div class="stat-allocation-list">
    `;

    stats.forEach(stat => {
        html += `
            <div class="stat-allocation-row">
                <div class="stat-allocation-info">
                    <span class="stat-allocation-icon">${stat.icon}</span>
                    <div class="stat-allocation-details">
                        <span class="stat-allocation-name">${stat.name}: ${stat.value}</span>
                        <span class="stat-allocation-desc">${stat.desc}</span>
                    </div>
                </div>
                <button class="stat-plus-btn" onclick="allocateStatPoint('${stat.id}')">+1</button>
            </div>
        `;
    });

    html += `
            </div>
            <button class="stat-close-btn" onclick="closeStatAllocationUI()">✅ 완료</button>
        </div>
    `;

    container.innerHTML = html;
    document.body.appendChild(container);
}

/**
 * 스탯 배분 UI를 닫습니다.
 */
function closeStatAllocationUI() {
    const ui = document.getElementById('statAllocationUI');
    if (ui) ui.remove();
}

/**
 * 스탯 버튼들을 업데이트합니다. (인라인 + 버튼용)
 */
function updateStatButtons() {
    // 현재 사용 안함 (renderCharacterInfo에서 직접 렌더링)
}

// ============================================
// 🎁 테스트용 함수
// ============================================

/**
 * 테스트용 아이템 추가
 */
function addTestItems() {
    addItemToInventory('wooden_sword');
    addItemToInventory('leather_armor');
    addItemToInventory('hp_potion', 5);
    addItemToInventory('mp_potion', 3);
    addItemToInventory('herb', 10);
    addItemToInventory('monster_tooth', 4);
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('📦 inventorySystem.js 로드 완료!');

// ============================================
// ⚡ 스킬 및 특성 보기 모달
// ============================================

/**
 * 스킬 및 특성 보기 모달을 표시합니다.
 */
function showSkillTraitModal() {
    // 기존 모달 제거
    closeSkillTraitModal();
    
    const modal = document.createElement('div');
    modal.id = 'skillTraitModal';
    modal.className = 'skill-trait-modal';
    
    // 플레이어 스킬 목록
    const skills = player.skills || [];
    const trait = player.trait;
    const traitData = trait && typeof TRAITS !== 'undefined' ? TRAITS[trait] : null;
    
    let skillsHtml = '';
    if (skills.length === 0) {
        skillsHtml = '<div class="no-skills">습득한 스킬이 없습니다.</div>';
    } else {
        skills.forEach(skillId => {
            const skill = typeof SKILLS !== 'undefined' ? SKILLS[skillId] : null;
            if (skill) {
                const cooldown = player.skillCooldowns?.[skillId] || 0;
                skillsHtml += `
                    <div class="skill-trait-item">
                        <div class="skill-trait-icon">${skill.icon}</div>
                        <div class="skill-trait-info">
                            <div class="skill-trait-name">${skill.name}</div>
                            <div class="skill-trait-desc">${skill.description}</div>
                            <div class="skill-trait-stats">
                                <span>MP: ${skill.mpCost}</span>
                                <span>쿨타임: ${skill.cooldown}턴</span>
                                ${skill.unlockLevel ? `<span>해금 레벨: ${skill.unlockLevel}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    let traitHtml = '';
    if (traitData) {
        const traitState = player.traitState || {};
        let statusText = '';
        if (traitState.active) {
            statusText = `<span class="trait-active">활성화 (${traitState.duration}턴)</span>`;
        } else if (traitState.cooldown > 0) {
            statusText = `<span class="trait-cooldown">쿨다운 (${traitState.cooldown}턴)</span>`;
        } else {
            statusText = '<span class="trait-ready">발동 대기</span>';
        }
        
        traitHtml = `
            <div class="skill-trait-item trait-item">
                <div class="skill-trait-icon">${traitData.icon}</div>
                <div class="skill-trait-info">
                    <div class="skill-trait-name">${traitData.name} ${statusText}</div>
                    <div class="skill-trait-desc">${traitData.description}</div>
                </div>
            </div>
        `;
    } else {
        traitHtml = '<div class="no-skills">특성이 없습니다.</div>';
    }
    
    modal.innerHTML = `
        <div class="skill-trait-content">
            <div class="skill-trait-header">
                <h2>⚡ 스킬 및 특성</h2>
                <button class="skill-trait-close-btn" onclick="closeSkillTraitModal()">×</button>
            </div>
            <div class="skill-trait-section">
                <h3>🌟 특성</h3>
                <div class="skill-trait-list">
                    ${traitHtml}
                </div>
            </div>
            <div class="skill-trait-section">
                <h3>⚔️ 스킬 목록</h3>
                <div class="skill-trait-list">
                    ${skillsHtml}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * 스킬 및 특성 모달을 닫습니다.
 */
function closeSkillTraitModal() {
    const modal = document.getElementById('skillTraitModal');
    if (modal) modal.remove();
}
