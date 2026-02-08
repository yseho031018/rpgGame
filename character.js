/**
 * ============================================
 * RPG Adventure - 캐릭터 시스템 v2
 * ============================================
 * 직업 시스템 및 캐릭터 생성을 관리합니다.
 */

// ============================================
// 👤 플레이어 클래스
// ============================================

class Character {
    constructor(name, job) {
        const jobData = JOBS[job] || JOBS.warrior;
        const baseStats = jobData.baseStats;

        this.name = name;
        this.job = job;
        this.jobData = jobData;
        this.level = 1;

        // 기본 스탯
        this.maxHp = baseStats.hp;
        this.hp = baseStats.hp;
        this.maxMp = baseStats.mp;
        this.mp = baseStats.mp;
        this.atk = baseStats.atk;
        this.def = baseStats.def;

        // 세부 스탯
        this.str = baseStats.str;  // 근력
        this.vit = baseStats.vit;  // 체력
        this.int = baseStats.int;  // 지능
        this.agi = baseStats.agi;  // 민첩

        // 기타
        this.gold = 0;
        this.exp = 0;
        this.requiredExp = 100;

        // 포만감/수분
        this.hunger = 100;
        this.thirst = 100;
    }

    // 총 공격력 계산 (기본 + 주스탯 보너스)
    getTotalAtk() {
        const mainStat = this[this.jobData.mainStat] || 0;
        const strBonus = Math.floor(this.str * 0.5);
        const mainStatBonus = Math.floor(mainStat * STATS_CONFIG.mainStatAtkRatio);
        return this.atk + strBonus + mainStatBonus;
    }

    // 총 방어력 계산
    getTotalDef() {
        const vitBonus = Math.floor(this.vit * 0.3);
        return this.def + vitBonus;
    }

    // 레벨업
    levelUp() {
        this.level++;

        // 스탯 증가
        this.maxHp += LEVEL_UP_STATS.hp;
        this.hp = this.maxHp;
        this.maxMp += LEVEL_UP_STATS.mp;
        this.mp = this.maxMp;
        this.atk += LEVEL_UP_STATS.atk;
        this.def += LEVEL_UP_STATS.def;

        // 포만감/수분 100% 회복
        if (typeof hungerState !== 'undefined') {
            hungerState.hunger = 100;
            hungerState.thirst = 100;
            hungerState.lastUpdate = Date.now();
            if (typeof updateHungerUI === 'function') {
                updateHungerUI();
            }
        }

        // 다음 레벨 경험치
        this.requiredExp = getRequiredExp(this.level);
        this.exp = 0;

        return true;
    }

    // 경험치 획득
    gainExp(amount) {
        this.exp += amount;

        while (this.exp >= this.requiredExp) {
            this.exp -= this.requiredExp;
            this.levelUp();
            addGameLog(`🎉 레벨 업! Lv.${this.level}!`);
        }
    }

    // 회복
    heal(hpAmount, mpAmount = 0) {
        this.hp = Math.min(this.maxHp, this.hp + hpAmount);
        this.mp = Math.min(this.maxMp, this.mp + mpAmount);
    }
}

// ============================================
// 🎮 캐릭터 생성 함수
// ============================================

/**
 * 플레이어 이름 입력
 */
function c_inputName() {
    const name = prompt("플레이어 이름을 입력해주세요.");
    return name || '용사';
}

/**
 * 직업 선택 다이얼로그 표시
 */
function showJobSelection(callback) {
    const modal = document.createElement('div');
    modal.className = 'job-selection-modal';
    modal.innerHTML = `
        <div class="job-selection-content">
            <h2>⚔️ 직업을 선택하세요</h2>
            <div class="job-list">
                ${Object.entries(JOBS).map(([id, job]) => `
                    <button class="job-btn" data-job="${id}">
                        <span class="job-icon">${job.icon}</span>
                        <span class="job-name">${job.name}</span>
                        <span class="job-desc">${job.description}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.job-btn').forEach(btn => {
        btn.onclick = () => {
            const jobId = btn.dataset.job;
            modal.remove();
            if (callback) callback(jobId);
        };
    });
}

/**
 * 새 플레이어 생성
 */
function createPlayer(name, jobId) {
    const playerName = name || c_inputName();
    const job = jobId || 'warrior';

    const newPlayer = new Character(playerName, job);

    console.log('👤 플레이어 생성:', newPlayer);
    return newPlayer;
}

/**
 * 기본 장비 지급
 */
function giveStarterEquipment(player) {
    const job = JOBS[player.job];
    if (!job || !job.equipment) return;

    // TODO: 인벤토리에 기본 장비 추가
    console.log('📦 기본 장비 지급:', job.equipment);
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('👤 character.js v2 로드 완료!');
