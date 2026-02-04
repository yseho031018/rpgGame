/**
 * ============================================
 * RPG Adventure - 메인 게임 스크립트
 * ============================================
 */

// ============================================
// 🎮 게임 상태 변수
// ============================================

// 현재 화면
let currentScreen = 'loading';

// 플레이어 데이터
let player = null;

// 게임 진행 데이터
let gold = 0;
let inventory = [];

// 플레이 시간
let gameStartTime = null;

// ============================================
// 🚀 게임 초기화 및 로딩
// ============================================

/**
 * 페이지 로드 시 실행
 */
window.onload = function () {
    console.log('🎮 RPG Adventure 시작!');
    startLoading();
};

/**
 * 로딩 시작 - 로딩바가 4초 동안 완료됩니다
 */
function startLoading() {
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');

    const loadingMessages = [
        '게임을 불러오는 중...',
        '캐릭터 데이터 로딩...',
        '몬스터 데이터 로딩...',
        '맵 데이터 로딩...',
        '시간 시스템 초기화...',
        '게임 준비 완료!'
    ];

    let progress = 0;
    const totalDuration = 4000;
    const interval = 50;
    const increment = 100 / (totalDuration / interval);

    const loadingInterval = setInterval(() => {
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);

            loadingBar.style.width = '100%';
            loadingText.textContent = loadingMessages[loadingMessages.length - 1];

            setTimeout(() => {
                showScreen('mainMenu');
            }, 500);
        } else {
            loadingBar.style.width = progress + '%';

            const messageIndex = Math.min(
                Math.floor((progress / 100) * (loadingMessages.length - 1)),
                loadingMessages.length - 2
            );
            loadingText.textContent = loadingMessages[messageIndex];
        }
    }, interval);
}

// ============================================
// 📺 화면 전환 시스템
// ============================================

function showScreen(screenName) {
    const screens = {
        'loading': document.getElementById('loadingScreen'),
        'mainMenu': document.getElementById('mainMenuScreen'),
        'characterCreate': document.getElementById('characterCreateScreen'),
        'game': document.getElementById('gameScreen')
    };

    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.add('hidden');
    });

    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
        currentScreen = screenName;

        if (screenName === 'mainMenu') {
            initMainMenu();
        } else if (screenName === 'characterCreate') {
            initCharacterCreate();
        } else if (screenName === 'game') {
            initGameScreen();
        }
    }

    console.log(`📺 화면 전환: ${screenName}`);
}

// ============================================
// 🏠 메인 메뉴
// ============================================

function initMainMenu() {
    createParticles();
}

function createParticles() {
    const container = document.getElementById('bgParticles');
    if (!container || container.children.length > 0) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (8 + Math.random() * 6) + 's';
        container.appendChild(particle);
    }
}

// 선택된 난이도
let currentDifficulty = 'normal';

function startNewGame() {
    showDifficultySelection();
}

/**
 * 난이도 선택 UI 표시
 */
function showDifficultySelection() {
    const overlay = document.getElementById('difficultyOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/**
 * 난이도 선택 처리
 */
function selectDifficulty(diff) {
    if (DIFFICULTY[diff]) {
        currentDifficulty = diff;
        console.log(`🎮 난이도 선택: ${DIFFICULTY[diff].name}`);

        const overlay = document.getElementById('difficultyOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }

        // 캐릭터 생성 화면으로 이동
        showScreen('characterCreate');
        initCharacterCreate();
    }
}

function backToMainMenu() {
    // 시간 시스템 중지
    if (typeof stopTimeSystem === 'function') {
        stopTimeSystem();
    }
    showScreen('mainMenu');
}

// ============================================
// 👤 캐릭터 생성
// ============================================

// 선택된 직업
let selectedJob = 'warrior';

// 임시 스탯 (직업 기반 + 랜덤)
let tempStats = {
    hp: 120, maxHp: 120,
    mp: 40, maxMp: 40,
    atk: 12, def: 10,
    str: 10, vit: 8, int: 3, agi: 5
};

// 스탯 굴리기 횟수 (최대 3회)
let rerollCount = 0;
const MAX_REROLLS = 3;

function initCharacterCreate() {
    // 초기화 - 직업 미선택 상태
    selectedJob = null;
    jobConfirmed = false;
    rerollCount = 0;

    // 직업 선택 UI 생성
    renderJobSelection();
    renderJobInfo(null);
    clearStatsPreview();
    updateRerollButton();

    const input = document.getElementById('characterNameInput');
    if (input) {
        input.value = '';
    }
}

// 직업 확정 여부
let jobConfirmed = false;

/**
 * 직업 선택 UI 렌더링
 */
function renderJobSelection() {
    const container = document.getElementById('jobSelection');
    if (!container) return;

    container.innerHTML = '';

    Object.entries(JOBS).forEach(([id, job]) => {
        const btn = document.createElement('button');
        btn.className = 'job-select-btn';
        btn.dataset.jobId = id;
        btn.innerHTML = `
            <span class="job-icon">${job.icon}</span>
            <span class="job-name">${job.name}</span>
        `;
        btn.onclick = () => showJobInfo(id);
        container.appendChild(btn);
    });
}

/**
 * 직업 정보 표시 (선택 확정 전)
 */
function showJobInfo(jobId) {
    if (jobConfirmed) return; // 이미 확정된 경우 무시

    const job = JOBS[jobId];
    if (!job) return;

    // 하이라이트 UI
    document.querySelectorAll('.job-select-btn').forEach(btn => {
        btn.classList.toggle('highlighted', btn.dataset.jobId === jobId);
    });

    // 직업 정보 표시
    renderJobInfo(jobId);
}

/**
 * 직업 정보 렌더링
 */
function renderJobInfo(jobId) {
    const infoEl = document.getElementById('jobInfoPanel');
    if (!infoEl) return;

    if (!jobId) {
        infoEl.innerHTML = `
            <div class="job-info-placeholder">
                <p>💡 직업을 클릭하면 정보를 볼 수 있습니다</p>
            </div>
        `;
        return;
    }

    const job = JOBS[jobId];
    const base = job.baseStats;

    // 스킬 정보
    const skill = SKILLS[job.startingSkill];
    const skillInfo = skill ? `<p class="job-skill-info">💥 초기 스킬: <strong>${skill.name}</strong> - ${skill.description}</p>` : '';

    infoEl.innerHTML = `
        <div class="job-info-header">
            <span class="job-info-icon">${job.icon}</span>
            <span class="job-info-name">${job.name}</span>
        </div>
        <p class="job-info-desc">${job.description}</p>
        <div class="job-info-stats">
            <div class="stat-range">❤️ HP: ${base.hp - 5} ~ ${base.hp + 5}</div>
            <div class="stat-range">💙 MP: ${base.mp - 3} ~ ${base.mp + 3}</div>
            <div class="stat-range">⚔️ 물공: ${base.pAtk - 2} ~ ${base.pAtk + 2}</div>
            <div class="stat-range">🔮 마공: ${base.mAtk - 2} ~ ${base.mAtk + 2}</div>
            <div class="stat-range sub">💪 근력: ${base.str - 2} ~ ${base.str + 2}</div>
            <div class="stat-range sub">🫀 체력: ${base.vit - 2} ~ ${base.vit + 2}</div>
            <div class="stat-range sub">🧠 지능: ${base.int - 2} ~ ${base.int + 2}</div>
            <div class="stat-range sub">💨 민첩: ${base.agi - 2} ~ ${base.agi + 2}</div>
        </div>
        <p class="job-info-main">주 스탯: <strong>${getStatName(job.mainStat)}</strong> | 피해 타입: <strong>${job.damageType === 'physical' ? '물리' : '마법'}</strong></p>
        ${skillInfo}
        <button class="confirm-job-btn" onclick="confirmJobSelection('${jobId}')">
            ✅ ${job.name} 선택하기
        </button>
    `;
}

/**
 * 스탯 이름 반환
 */
function getStatName(statId) {
    const names = { str: '근력', int: '지능', vit: '체력', agi: '민첩' };
    return names[statId] || statId;
}

/**
 * 직업 선택 확정 (확인창 표시)
 */
function confirmJobSelection(jobId) {
    const job = JOBS[jobId];
    if (!job) return;

    const confirmed = confirm(`${job.name}을(를) 선택하시겠습니까?\n\n⚠️ 결정 후에는 변경할 수 없습니다!`);

    if (confirmed) {
        selectedJob = jobId;
        jobConfirmed = true;

        // UI 업데이트 - 선택된 직업 표시
        document.querySelectorAll('.job-select-btn').forEach(btn => {
            btn.classList.remove('highlighted');
            if (btn.dataset.jobId === jobId) {
                btn.classList.add('selected', 'locked');
            } else {
                btn.classList.add('disabled');
                btn.disabled = true;
            }
        });

        // 직업 정보 패널 업데이트
        const infoEl = document.getElementById('jobInfoPanel');
        if (infoEl) {
            infoEl.innerHTML = `
                <div class="job-confirmed">
                    <span class="job-confirmed-icon">${job.icon}</span>
                    <span class="job-confirmed-name">${job.name}</span>
                    <span class="job-confirmed-badge">✓ 선택됨</span>
                </div>
            `;
        }

        // 스탯 생성
        generateStatsForJob(jobId);
        updateRerollButton();

        // 이름 입력 필드 포커스
        const input = document.getElementById('characterNameInput');
        if (input) input.focus();
    }
}

/**
 * 스탯 미리보기 초기화
 */
function clearStatsPreview() {
    const container = document.getElementById('previewStats');
    if (!container) return;

    container.innerHTML = `
        <div class="stats-placeholder">
            <p>직업을 선택하면 스탯이 표시됩니다</p>
        </div>
    `;
}

/**
 * 직업 기반 스탯 생성 (새로운 공식 적용)
 */
function generateStatsForJob(jobId) {
    const job = JOBS[jobId];
    if (!job) return;

    const base = job.baseStats;
    const r = STATS_CONFIG.ratios;

    // 기본 스탯 + 랸덤 (-2 ~ +2)
    const str = base.str + Math.floor(Math.random() * 5) - 2;
    const vit = base.vit + Math.floor(Math.random() * 5) - 2;
    const int = base.int + Math.floor(Math.random() * 5) - 2;
    const agi = base.agi + Math.floor(Math.random() * 5) - 2;

    // 기본 HP/MP + 랸덤
    const baseHp = base.hp + Math.floor(Math.random() * 11) - 5;
    const baseMp = base.mp + Math.floor(Math.random() * 7) - 3;

    // 기본 공격력/방어력 + 랸덤
    const basePAtk = base.pAtk + Math.floor(Math.random() * 5) - 2;
    const baseMAtk = base.mAtk + Math.floor(Math.random() * 5) - 2;
    const basePDef = base.pDef + Math.floor(Math.random() * 5) - 2;
    const baseMDef = base.mDef + Math.floor(Math.random() * 5) - 2;

    // 파생 스탯 계산 (반올림 적용)
    const hp = baseHp + Math.round(vit * r.hpPerVit);
    const mp = baseMp + Math.round(int * r.mpPerInt);
    const pAtk = Math.round(basePAtk + str * r.pAtkPerStr);
    const mAtk = Math.round(baseMAtk + int * r.mAtkPerInt);
    const pDef = Math.round(basePDef + str * r.pDefPerStr + vit * r.pDefPerVit);
    const mDef = Math.round(baseMDef + int * r.mDefPerInt + vit * r.mDefPerVit);

    // 효율/회피/회복효율 (반올림)
    const efficiency = Math.round(agi * r.efficiencyPerAgi);
    const evasion = Math.round(agi * r.evasionPerAgi);
    const healEff = Math.round(vit * r.healEffPerVit);

    tempStats = {
        // 기본 스탯
        str: Math.max(1, str),
        vit: Math.max(1, vit),
        int: Math.max(1, int),
        agi: Math.max(1, agi),
        // 기본 HP/MP
        baseHp: Math.max(20, baseHp),
        baseMp: Math.max(10, baseMp),
        // 파생 스탯
        hp: Math.max(30, hp),
        maxHp: Math.max(30, hp),
        mp: Math.max(15, mp),
        maxMp: Math.max(15, mp),
        pAtk: Math.max(1, pAtk),
        mAtk: Math.max(1, mAtk),
        pDef: Math.max(0, pDef),
        mDef: Math.max(0, mDef),
        // 퍼센트 스탯
        efficiency: Math.max(0, efficiency),
        evasion: Math.max(0, evasion),
        healEff: Math.max(0, healEff),
        // 기본 공격/방어 (장비 전)
        basePAtk: Math.max(1, basePAtk),
        baseMAtk: Math.max(1, baseMAtk),
        basePDef: Math.max(0, basePDef),
        baseMDef: Math.max(0, baseMDef)
    };

    renderStatsPreview();
}

/**
 * 스탯 굴리기 (3회 제한, 직업 확정 후에만 가능)
 */
function rerollStats() {
    if (!jobConfirmed) {
        alert('먼저 직업을 선택해주세요!');
        return;
    }

    if (rerollCount >= MAX_REROLLS) {
        alert('스탯 굴리기 횟수를 모두 사용했습니다!');
        return;
    }

    rerollCount++;
    generateStatsForJob(selectedJob);
    updateRerollButton();
}

/**
 * 굴리기 버튼 업데이트
 */
function updateRerollButton() {
    const btn = document.getElementById('rerollBtn');
    if (!btn) return;

    // 직업 미선택 시 비활성화
    if (!jobConfirmed) {
        btn.textContent = '🎲 스탯 다시 굴리기 (직업 선택 필요)';
        btn.disabled = true;
        btn.classList.add('disabled');
        return;
    }

    const remaining = MAX_REROLLS - rerollCount;
    btn.textContent = `🎲 스탯 다시 굴리기 (${remaining}회 남음)`;
    btn.disabled = remaining <= 0;

    if (remaining <= 0) {
        btn.classList.add('disabled');
    } else {
        btn.classList.remove('disabled');
    }
}

/**
 * 스탯 미리보기 렌더링 (새로운 스탯 시스템)
 */
function renderStatsPreview() {
    const container = document.getElementById('previewStats');
    if (!container) return;

    container.innerHTML = `
        <div class="stat-preview">
            <span class="stat-name">❤️ HP</span>
            <span class="stat-value">${tempStats.hp}</span>
        </div>
        <div class="stat-preview">
            <span class="stat-name">💙 MP</span>
            <span class="stat-value">${tempStats.mp}</span>
        </div>
        <div class="stat-preview">
            <span class="stat-name">⚔️ 물공</span>
            <span class="stat-value">${tempStats.pAtk}</span>
        </div>
        <div class="stat-preview">
            <span class="stat-name">🔮 마공</span>
            <span class="stat-value">${tempStats.mAtk}</span>
        </div>
        <div class="stat-preview">
            <span class="stat-name">🛡️ 물방</span>
            <span class="stat-value">${tempStats.pDef}</span>
        </div>
        <div class="stat-preview">
            <span class="stat-name">🔰 마방</span>
            <span class="stat-value">${tempStats.mDef}</span>
        </div>
        <div class="stat-divider full-width"></div>
        <div class="stat-preview sub">
            <span class="stat-name">💪 근력</span>
            <span class="stat-value">${tempStats.str}</span>
        </div>
        <div class="stat-preview sub">
            <span class="stat-name">🫀 체력</span>
            <span class="stat-value">${tempStats.vit}</span>
        </div>
        <div class="stat-preview sub">
            <span class="stat-name">🧠 지능</span>
            <span class="stat-value">${tempStats.int}</span>
        </div>
        <div class="stat-preview sub">
            <span class="stat-name">💨 민첩</span>
            <span class="stat-value">${tempStats.agi}</span>
        </div>
        <div class="stat-divider full-width"></div>
        <div class="stat-preview sub">
            <span class="stat-name">🎯 효율</span>
            <span class="stat-value">${tempStats.efficiency}%</span>
        </div>
        <div class="stat-preview sub">
            <span class="stat-name">💫 회피</span>
            <span class="stat-value">${tempStats.evasion}%</span>
        </div>
        <div class="stat-preview sub">
            <span class="stat-name">💚 회복</span>
            <span class="stat-value">${tempStats.healEff}%</span>
        </div>
    `;
}

function confirmCharacter() {
    if (!jobConfirmed || !selectedJob) {
        alert('먼저 직업을 선택해주세요!');
        return;
    }

    const nameInput = document.getElementById('characterNameInput');
    const name = nameInput ? nameInput.value.trim() : '';

    if (name.length < 2 || name.length > 10) {
        alert('이름은 2~10자 사이로 입력해주세요!');
        if (nameInput) nameInput.focus();
        return;
    }

    const job = JOBS[selectedJob];

    // 플레이어 생성 (새로운 스탯 시스템)
    player = {
        name: name,
        job: selectedJob,
        jobData: job,
        difficulty: currentDifficulty, // 난이도 저장
        level: 1,
        exp: 0,
        requiredExp: 100,
        statPoints: 0,  // 자유 배분 스탯포인트

        // 기본 스탯
        str: tempStats.str,
        vit: tempStats.vit,
        int: tempStats.int,
        agi: tempStats.agi,

        // HP/MP
        hp: tempStats.hp,
        maxHp: tempStats.maxHp,
        mp: tempStats.mp,
        maxMp: tempStats.maxMp,
        baseHp: tempStats.baseHp,
        baseMp: tempStats.baseMp,

        // 공격력/방어력
        pAtk: tempStats.pAtk,
        mAtk: tempStats.mAtk,
        pDef: tempStats.pDef,
        mDef: tempStats.mDef,
        basePAtk: tempStats.basePAtk,
        baseMAtk: tempStats.baseMAtk,
        basePDef: tempStats.basePDef,
        baseMDef: tempStats.baseMDef,

        // 퍼센트 스탯
        efficiency: tempStats.efficiency,
        evasion: tempStats.evasion,
        healEff: tempStats.healEff,

        // 장비 보너스 (초기화)
        bonusPAtk: 0, bonusMAtk: 0,
        bonusPDef: 0, bonusMDef: 0,
        bonusHp: 0, bonusMp: 0,

        // 스킬
        skills: [job.startingSkill],
        skillCooldowns: {}
    };

    // 게임 데이터 초기화
    gold = 0;
    inventory = [];
    gameStartTime = Date.now();

    // 초기 장비 지급
    giveStartingEquipment(job.startingEquipment);

    // 게임 화면으로 이동
    showScreen('game');

    console.log('✅ 캐릭터 생성 완료:', player);
}

/*
 * 초기 장비를 지급합니다.
 */
function giveStartingEquipment(equipmentIds) {
    if (!equipmentIds || !Array.isArray(equipmentIds)) {
        console.warn('⚠️ 초기 장비 목록이 없습니다.');
        return;
    }

    console.log('📦 초기 장비 지급 시작:', equipmentIds);

    equipmentIds.forEach(itemId => {
        // ITEMS 또는 ITEMS_DATABASE에서 아이템 찾기
        let itemData = null;
        if (typeof ITEMS !== 'undefined' && ITEMS[itemId]) {
            itemData = ITEMS[itemId];
        } else if (typeof ITEMS_DATABASE !== 'undefined' && ITEMS_DATABASE[itemId]) {
            itemData = ITEMS_DATABASE[itemId];
        }

        if (itemData) {
            // 아이템 인스턴스 생성
            const item = {
                ...itemData,
                id: itemId,
                instanceId: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };

            // inventoryItems에 추가 (inventorySystem.js의 전역 변수)
            if (typeof inventoryItems !== 'undefined') {
                inventoryItems.push(item);
                console.log(`📦 인벤토리에 추가: ${itemData.name}`);

                // 장비면 자동 장착
                if (['weapon', 'armor', 'helmet', 'boots', 'accessory'].includes(itemData.type)) {
                    // 장착 슬롯 확인
                    if (typeof equipment !== 'undefined' && !equipment[itemData.type]) {
                        // 인벤토리에서 제거하고 장착
                        const idx = inventoryItems.findIndex(i => i.instanceId === item.instanceId);
                        if (idx >= 0) {
                            equipment[itemData.type] = inventoryItems.splice(idx, 1)[0];
                            console.log(`⚔️ 장착 완료: ${itemData.name}`);
                        }
                    }
                }
            } else {
                console.warn('⚠️ inventoryItems 변수를 찾을 수 없습니다.');
            }
        } else {
            console.warn(`⚠️ 아이템 데이터 없음: ${itemId}`);
        }
    });

    // 장비 스탯 적용
    if (typeof applyEquipmentStats === 'function') {
        applyEquipmentStats();
    }
}

// ============================================
// 🎮 게임 화면
// ============================================

function initGameScreen() {
    if (!player) return;

    // 시작 시 HP/MP를 최대치로 설정
    player.hp = player.maxHp;
    player.mp = player.maxMp;

    // 시간 시스템 시작
    if (typeof resetGameTime === 'function') {
        resetGameTime(8);
    }
    if (typeof startTimeSystem === 'function') {
        startTimeSystem();
    }

    // 배고픔/수분 시스템 시작
    if (typeof startHungerSystem === 'function') {
        startHungerSystem();
    }

    // 날씨 시스템 시작
    if (typeof startWeatherSystem === 'function') {
        startWeatherSystem();
    }

    // 맵 초기화
    if (typeof travelToMap === 'function') {
        travelToMap('training');
    }

    // UI 업데이트
    updatePlayerUI();

    // 플레이 시간 업데이트 시작
    startPlayTimeUpdate();

    // 게임 로그 초기화
    if (typeof clearGameLog === 'function') {
        clearGameLog();
    }
    if (typeof addGameLog === 'function') {
        addGameLog(`${player.name}님, 모험을 시작합니다!`);
        addGameLog('훈련장에서 기초를 다져보세요.');
    }
}

function updatePlayerUI() {
    if (!player) return;

    // 이름, 레벨
    const nameEl = document.getElementById('playerNameDisplay');
    if (nameEl) nameEl.textContent = player.name;

    const levelEl = document.getElementById('playerLevelDisplay');
    if (levelEl) levelEl.textContent = `Lv.${player.level}`;

    // HP 바
    const hpPercent = (player.hp / player.maxHp) * 100;
    const hpBar = document.getElementById('hpBar');
    if (hpBar) hpBar.style.width = hpPercent + '%';
    const hpText = document.getElementById('hpText');
    if (hpText) hpText.textContent = `${player.hp}/${player.maxHp}`;

    // MP 바
    const mpPercent = (player.mp / player.maxMp) * 100;
    const mpBar = document.getElementById('mpBar');
    if (mpBar) mpBar.style.width = mpPercent + '%';
    const mpText = document.getElementById('mpText');
    if (mpText) mpText.textContent = `${player.mp}/${player.maxMp}`;

    // 골드
    const goldEl = document.getElementById('goldDisplay');
    if (goldEl) goldEl.textContent = gold.toLocaleString();

    // 경험치
    const expEl = document.getElementById('expDisplay');
    if (expEl) expEl.textContent = player.exp;
    const expReqEl = document.getElementById('expRequiredDisplay');
    if (expReqEl && typeof getRequiredExp === 'function') {
        expReqEl.textContent = getRequiredExp(player.level);
    }
}

// ============================================
// ⏱️ 플레이 시간
// ============================================

let playTimeInterval = null;

function startPlayTimeUpdate() {
    if (playTimeInterval) clearInterval(playTimeInterval);

    playTimeInterval = setInterval(() => {
        if (gameStartTime) {
            const elapsed = Date.now() - gameStartTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);

            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            const el = document.getElementById('playTimeDisplay');
            if (el) el.textContent = timeStr;
        }
    }, 1000);
}

// ============================================
// ⚙️ 설정
// ============================================

function showSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        initSettingsUI();
    }
}

function hideSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('hidden');
}

function initSettingsUI() {
    const bgmSlider = document.getElementById('bgmVolume');
    const sfxSlider = document.getElementById('sfxVolume');
    const brightnessSlider = document.getElementById('brightness');

    if (bgmSlider) {
        bgmSlider.oninput = function () {
            document.getElementById('bgmVolumeValue').textContent = this.value + '%';
        };
    }

    if (sfxSlider) {
        sfxSlider.oninput = function () {
            document.getElementById('sfxVolumeValue').textContent = this.value + '%';
        };
    }

    if (brightnessSlider) {
        brightnessSlider.oninput = function () {
            document.getElementById('brightnessValue').textContent = this.value + '%';
            document.body.style.filter = `brightness(${this.value / 100})`;
        };
    }
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('📜 main.js 로드 완료!');