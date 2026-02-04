/**
 * ============================================
 * RPG Adventure - 전투 시스템 v2
 * ============================================
 * 턴제 전투 로직을 처리합니다.
 */

// ============================================
// ⚔️ 전투 상태
// ============================================

let battleState = {
    inBattle: false,
    turn: 'player', // 'player' or 'monster'
    currentMonster: null,
    monsters: [],           // 다중 몬스터 지원
    isDefending: false,
    canEscape: true,
    turnCount: 0,
    playerStatusEffects: [],   // 플레이어 상태이상
    monsterStatusEffects: {}   // 몬스터별 상태이상
};

// ============================================
// ⚔️ 전투 시작/종료
// ============================================

/**
 * 전투를 시작합니다.
 * @param {string|Array<string>} monsterTypes - 몬스터 타입 ID 또는 몬스터 타입 ID 배열
 */
function startBattle(monsterTypes) {
    console.log('🎮 startBattle 호출:', monsterTypes);

    if (battleState.inBattle) {
        console.log('이미 전투 중입니다!');
        return;
    }

    // 배열이 아니면 배열로 변환 (하위 호환성)
    const monsterTypeArray = Array.isArray(monsterTypes) ? monsterTypes : [monsterTypes];
    
    // 몬스터들 생성
    const monsters = [];
    for (const monsterType of monsterTypeArray) {
        const monster = createBattleMonster(monsterType);
        if (monster) {
            monsters.push(monster);
        }
    }

    if (monsters.length === 0) {
        console.error('몬스터 생성 실패:', monsterTypes);
        return;
    }

    // 보스 몬스터가 있으면 도주 불가
    const hasBoss = monsters.some(m => m.isBoss);

    battleState = {
        inBattle: true,
        turn: 'player',
        monsters: monsters,           // 모든 몬스터 배열
        currentMonster: monsters[0],  // 현재 타겟 몬스터 (첫 번째)
        currentMonsterIndex: 0,       // 현재 타겟 인덱스
        isDefending: false,
        canEscape: !hasBoss,
        turnCount: 1,
        monsterStatusEffects: {},     // 상태이상 초기화
        playerStatusEffects: []       // 플레이어 상태이상
    };

    // 스킬 쿨다운 초기화
    if (player && player.skillCooldowns) {
        Object.keys(player.skillCooldowns).forEach(skillId => {
            player.skillCooldowns[skillId] = 0;
        });
    }

    // 전투 UI 표시
    showBattleUI();
    updateBattleUI();

    // 조우 메시지
    if (monsters.length === 1) {
        if (hasBoss) {
            addGameLog(`🔥 보스 ${monsters[0].name}과(와) 전투 시작! (도주 불가)`);
        } else {
            addGameLog(`⚔️ ${monsters[0].name}과(와) 전투 시작!`);
        }
    } else {
        const monsterNames = monsters.map(m => m.name).join(', ');
        if (hasBoss) {
            addGameLog(`🔥 ${monsters.length}마리의 몬스터와 전투 시작! (${monsterNames}) [도주 불가]`);
        } else {
            addGameLog(`⚔️ ${monsters.length}마리의 몬스터와 전투 시작! (${monsterNames})`);
        }
    }

    console.log('⚔️ 전투 시작 완료, battleState:', battleState);
}

/**
 * 현재 난이도 배율을 반환합니다.
 */
function getDifficultyMultiplier() {
    if (typeof player !== 'undefined' && player.difficulty && DIFFICULTY[player.difficulty]) {
        return DIFFICULTY[player.difficulty].multiplier;
    }
    return 1.0;
}

/**
 * 전투용 몬스터를 생성합니다.
 * MONSTERS 데이터에서 가져오거나 기본 템플릿 사용
 */
function createBattleMonster(monsterType) {
    let template = null;

    // 1. MONSTERS 데이터에서 확인
    if (typeof MONSTERS !== 'undefined' && MONSTERS[monsterType]) {
        template = MONSTERS[monsterType];
    }
    // 2. 레거시 템플릿 확인
    else {
        const monsterTemplates = {
            scarecrow: { name: '일반 허수아비', hp: 50, atk: 8, def: 3, exp: 15, gold: 8, emoji: '🧿' },
            strong_scarecrow: { name: '튼튼한 허수아비', hp: 80, atk: 12, def: 5, exp: 25, gold: 12, emoji: '🎃' },
            giant_scarecrow: { name: '거대 허수아비', hp: 120, atk: 18, def: 8, exp: 40, gold: 20, emoji: '👹' },
            rat: { name: '쥐', hp: 40, atk: 10, def: 3, exp: 18, gold: 10, emoji: '🐀' },
            goblin: { name: '고블린', hp: 70, atk: 15, def: 6, exp: 30, gold: 18, emoji: '👺' },
            bat: { name: '박쥐', hp: 45, atk: 12, def: 4, exp: 22, gold: 12, emoji: '🦇' },
            spider: { name: '거미', hp: 55, atk: 14, def: 5, exp: 28, gold: 15, emoji: '🕷️' },
            orc: { name: '오크', hp: 100, atk: 22, def: 10, exp: 50, gold: 35, emoji: '👹' },
            treant: { name: '나무정령', hp: 150, atk: 25, def: 18, exp: 70, gold: 45, emoji: '🌳' },
            wolf: { name: '늑대', hp: 90, atk: 20, def: 8, exp: 45, gold: 28, emoji: '🐺' },
            fairy: { name: '요정', hp: 40, atk: 25, def: 3, exp: 45, gold: 35, emoji: '🧚' },
            golem: { name: '골렘', hp: 200, atk: 22, def: 15, exp: 70, gold: 45, emoji: '🪨' },
            mage: { name: '마법사', hp: 80, atk: 35, def: 6, exp: 80, gold: 55, emoji: '🧙' },
            demon: { name: '악마', hp: 180, atk: 30, def: 12, exp: 100, gold: 70, emoji: '😈' },
            dragonling: { name: '어린 드래곤', hp: 250, atk: 40, def: 18, exp: 150, gold: 100, emoji: '🐲' },
            dragon: { name: '드래곤', hp: 500, atk: 60, def: 25, exp: 300, gold: 200, emoji: '🐉' },
            demon_lord: { name: '마왕', hp: 800, atk: 80, def: 30, exp: 500, gold: 400, emoji: '👿' },
            fallen_angel: { name: '타락천사', hp: 600, atk: 100, def: 20, exp: 600, gold: 500, emoji: '😇' }
        };
        template = monsterTemplates[monsterType];
    }

    // 템플릿이 없으면 기본 몬스터
    if (!template) {
        template = {
            name: '알 수 없는 몬스터',
            hp: 50, atk: 10, def: 5, exp: 20, gold: 10, emoji: '👹'
        };
    }

    // 난이도 배율 적용
    const diffMultiplier = getDifficultyMultiplier();

    return {
        ...template,
        hp: Math.floor((template.hp || 50) * diffMultiplier),
        maxHp: Math.floor((template.hp || 50) * diffMultiplier),
        atk: Math.floor((template.atk || 10) * diffMultiplier),
        def: Math.floor((template.def || 5) * diffMultiplier),
        exp: Math.floor((template.exp || 10) * diffMultiplier),
        gold: Math.floor((template.gold || 5) * diffMultiplier)
    };
}

/**
 * 전투를 종료합니다.
 * @param {string} result - 'victory', 'defeat', 'escape'
 */
function endBattle(result) {
    const monster = battleState.currentMonster;
    const monsters = battleState.monsters || [monster]; // 다중 몬스터 또는 단일 몬스터
    console.log('🏁 endBattle 호출:', result);

    switch (result) {
        case 'victory':
            // 모든 몬스터 보상 합산
            let totalExp = 0;
            let totalGold = 0;
            
            for (const m of monsters) {
                if (m) {
                    totalExp += m.exp || 0;
                    totalGold += m.gold || 0;
                }
            }

            gold += totalGold;
            player.exp = (player.exp || 0) + totalExp;

            if (monsters.length > 1) {
                addGameLog(`🎉 승리! ${monsters.length}마리 처치! ${totalExp} EXP, ${totalGold} Gold 획득!`);
            } else {
                addGameLog(`🎉 승리! ${totalExp} EXP, ${totalGold} Gold 획득!`);
            }

            // 레벨업 체크
            checkLevelUp();
            break;

        case 'defeat':
            addGameLog('💀 패배했습니다...');

            // 패배 정보 저장 (부활 시 의사 NPC 대화용)
            const currentLoc = getCurrentLocation();
            player.lastDefeat = {
                location: currentLoc?.id || 'unknown',
                locationName: currentLoc?.name || '알 수 없는 장소',
                monster: monster ? monster.name : '알 수 없는 적'
            };

            // 현재 맵의 noDeathZone 설정 확인
            const currentMapData = getCurrentMap();
            if (currentMapData && currentMapData.noDeathZone) {
                // 훈련장처럼 사망하지 않는 지역
                handleNoDeathZoneDefeat(currentMapData, monster);
            } else {
                // 일반 사망 처리 - 게임오버 화면으로 이동
                showGameOverScreen();
            }
            break;

        case 'escape':
            addGameLog('🏃 전투에서 도망쳤습니다.');
            break;
    }

    // 전투 상태 초기화
    battleState = {
        inBattle: false,
        turn: 'player',
        currentMonster: null,
        isDefending: false,
        canEscape: true,
        turnCount: 0
    };

    // 전투 UI 숨기기
    hideBattleUI();
    updatePlayerUI();
}

/**
 * 게임오버 화면을 표시합니다.
 */
function showGameOverScreen() {
    // 게임 데이터 저장 (게임오버 화면에서 사용)
    const gameOverData = {
        playerName: player.name,
        level: player.level,
        job: player.jobData?.name || '모험가',
        playTime: getPlayTimeString ? getPlayTimeString() : '00:00:00',
        gold: gold || 0,
        lastLocation: player.lastDefeat?.locationName || '알 수 없는 장소',
        lastMonster: player.lastDefeat?.monster || '알 수 없는 적'
    };
    
    // sessionStorage에 데이터 저장
    sessionStorage.setItem('gameOverData', JSON.stringify(gameOverData));
    
    // 페이드 아웃 효과 후 이동
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        opacity: 0;
        z-index: 99999;
        transition: opacity 1s ease;
    `;
    document.body.appendChild(overlay);
    
    // 페이드 인
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    // 페이지 이동
    setTimeout(() => {
        window.location.href = 'gameresult/gameover.html';
    }, 1500);
}

/**
 * noDeathZone에서 패배 시 처리
 * 1. 즉시 화면 깜깜해지는 연출
 * 2. "나는 쓰러졌다..." 메시지 표시
 * 3. 즉시 휴식처로 이동
 * 4. 이동 후 게임 시간 7시간 경과
 * 5. HP/MP 완전 회복, 상태이상 제거
 * 6. 의사 NPC와 대화
 */
function handleNoDeathZoneDefeat(mapData, monster) {
    const reviveLocation = mapData.reviveLocation || 'rest_area';
    const reviveTimeHours = mapData.reviveTimeHours || 7;

    // 전투 UI 숨기기
    hideBattleUI();

    // 즉시 화면 깜깜해지는 연출
    showDeathScreenOverlay(reviveLocation, reviveTimeHours);
}

/**
 * 쓰러짐 화면 오버레이를 표시합니다.
 */
function showDeathScreenOverlay(reviveLocation, reviveTimeHours) {
    // 기존 오버레이 제거
    const existingOverlay = document.getElementById('deathScreenOverlay');
    if (existingOverlay) existingOverlay.remove();

    // 깜깜한 화면 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'deathScreenOverlay';
    overlay.className = 'death-screen-overlay';

    overlay.innerHTML = `
        <div class="death-screen-container">
            <div class="death-message">나는 쓰러졌다...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 페이드인 효과
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 50);

    // 2초 후 휴식처로 이동 처리
    setTimeout(() => {
        processReviveAfterDefeat(reviveLocation, reviveTimeHours, overlay);
    }, 2000);
}

/**
 * 패배 후 부활 처리
 */
function processReviveAfterDefeat(reviveLocation, reviveTimeHours, overlay) {
    // 즉시 휴식처로 이동 (강제 이동)
    if (typeof currentLocationId !== 'undefined') {
        currentLocationId = reviveLocation;
    }

    // 이동 후 게임 시간 7시간 경과
    if (typeof addGameTime === 'function') {
        addGameTime(reviveTimeHours * 60); // 분 단위로 추가
    } else if (typeof gameTime !== 'undefined') {
        gameTime += reviveTimeHours * 60;
    }

    // HP/MP 완전 회복
    player.hp = player.maxHp;
    player.mp = player.maxMp;

    // 상태이상 제거
    player.statusEffects = {};

    // 부활 상태 플래그 설정
    player.justRevived = true;

    // 메시지 변경: "7시간 후..."
    const messageDiv = overlay.querySelector('.death-message');
    if (messageDiv) {
        messageDiv.innerHTML = `${reviveTimeHours}시간 후...<br><br>🏥 휴식처에서 눈을 떴다.`;
    }

    addGameLog(`😵 의식을 잃었습니다...`);
    addGameLog(`⏰ ${reviveTimeHours}시간 후...`);
    addGameLog(`🏥 휴식처에서 눈을 떴습니다.`);

    // 2초 후 화면 밝아지고 의사 대화
    setTimeout(() => {
        // 오버레이 페이드아웃
        overlay.classList.remove('visible');

        setTimeout(() => {
            overlay.remove();

            // UI 업데이트
            updatePlayerUI();
            updateLocationUI();

            // 의사 NPC 대화 표시
            showDoctorReviveDialog();
        }, 500);
    }, 2000);
}

/**
 * 부활 후 의사 NPC 대화를 표시합니다.
 */
function showDoctorReviveDialog() {
    // 패배 정보 가져오기
    const defeatInfo = player.lastDefeat || {
        locationName: '훈련장',
        monster: '적'
    };

    const overlay = document.createElement('div');
    overlay.className = 'npc-modal-overlay';

    const doctorMessage = `아 일어났는가? 내가 ${defeatInfo.locationName}에서 ${defeatInfo.monster}에게 패배해서 쓰러진 자네를 데려왔네. 무리하지 말고 천천히 회복하게나.`;

    overlay.innerHTML = `
        <div class="npc-dialog-modal">
            <div class="npc-dialog-header">
                <span class="npc-dialog-emoji">👨‍⚕️</span>
                <span class="npc-dialog-name">의사</span>
            </div>
            <div class="npc-dialog-content">
                <div class="npc-dialog-bubble">
                    <p>${doctorMessage}</p>
                </div>
                <div class="dialog-options">
                    <button class="dialog-option-btn" onclick="closeDoctorDialog()">
                        💪 감사합니다, 더 열심히 하겠습니다!
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    addGameLog(`👨‍⚕️ 의사: "${doctorMessage}"`);
}

/**
 * 의사 대화를 닫습니다.
 */
function closeDoctorDialog() {
    const modal = document.querySelector('.npc-modal-overlay');
    if (modal) modal.remove();

    // 부활 상태 플래그 해제
    player.justRevived = false;

    addGameLog('💪 다시 도전할 준비가 되었습니다!');
}

// ============================================
// 🎮 플레이어 행동
// ============================================

/**
 * 일반 공격
 */
function doBattleAttack() {
    console.log('⚔️ doBattleAttack 호출, battleState:', battleState);

    if (!battleState.inBattle) {
        console.log('전투 중이 아닙니다!');
        return;
    }

    if (battleState.turn !== 'player') {
        console.log('플레이어 턴이 아닙니다!');
        return;
    }

    const monster = battleState.currentMonster;
    if (!monster || monster.hp <= 0) {
        // 자동으로 다음 생존 몬스터 선택
        if (!selectNextAliveMonster()) {
            endBattle('victory');
            return;
        }
    }

    const targetMonster = battleState.currentMonster;
    const damage = calculateDamage(player, targetMonster, false);

    targetMonster.hp -= damage;
    addGameLog(`⚔️ ${player.name}의 공격! ${targetMonster.name}에게 ${damage} 데미지!`);

    // 몬스터 처치 확인
    if (targetMonster.hp <= 0) {
        targetMonster.hp = 0;
        addGameLog(`💀 ${targetMonster.name}을(를) 처치했습니다!`);
        
        // 모든 몬스터 처치 확인
        const aliveMonsters = battleState.monsters.filter(m => m.hp > 0);
        if (aliveMonsters.length === 0) {
            updateBattleUI();
            setTimeout(() => endBattle('victory'), 500);
            return;
        }
        
        // 다음 생존 몬스터로 자동 타겟 변경
        selectNextAliveMonster();
    }

    updateBattleUI();
    endPlayerTurn();
}

/**
 * 다음 생존 몬스터를 자동 선택합니다.
 * @returns {boolean} 생존 몬스터가 있으면 true
 */
function selectNextAliveMonster() {
    const monsters = battleState.monsters || [];
    
    for (let i = 0; i < monsters.length; i++) {
        if (monsters[i].hp > 0) {
            battleState.currentMonsterIndex = i;
            battleState.currentMonster = monsters[i];
            return true;
        }
    }
    
    return false;
}

/**
 * 스킬 선택 UI 표시
 */
function doBattleSkill() {
    if (!battleState.inBattle || battleState.turn !== 'player') return;

    // 플레이어가 보유한 스킬 확인
    const playerSkills = player.skills || [];
    if (playerSkills.length === 0) {
        addGameLog('⚠️ 사용 가능한 스킬이 없습니다!');
        return;
    }

    // 스킬 선택 UI 표시
    showSkillSelectionUI(playerSkills);
}

/**
 * 스킬 선택 UI를 표시합니다.
 */
function showSkillSelectionUI(skillIds) {
    // 기존 스킬 UI 제거
    const existingUI = document.getElementById('skillSelectionUI');
    if (existingUI) existingUI.remove();

    const container = document.createElement('div');
    container.id = 'skillSelectionUI';
    container.className = 'skill-selection-overlay';

    let skillsHtml = '<div class="skill-selection-panel">';
    skillsHtml += '<h3>⚡ 스킬 선택</h3>';
    skillsHtml += '<div class="skill-list">';

    skillIds.forEach(skillId => {
        const skill = SKILLS[skillId];
        if (!skill) return;

        const cooldown = player.skillCooldowns?.[skillId] || 0;
        const canUse = player.mp >= skill.mpCost && cooldown <= 0;
        const disabledClass = canUse ? '' : 'disabled';
        const cooldownText = cooldown > 0 ? ` (쿨다운 ${cooldown}턴)` : '';

        skillsHtml += `
            <button class="skill-select-btn ${disabledClass}" 
                    onclick="useSelectedSkill('${skillId}')" 
                    ${canUse ? '' : 'disabled'}>
                <span class="skill-icon">${skill.icon}</span>
                <div class="skill-info">
                    <span class="skill-name">${skill.name}${cooldownText}</span>
                    <span class="skill-cost">MP ${skill.mpCost}</span>
                </div>
                <p class="skill-desc">${skill.description}</p>
            </button>
        `;
    });

    skillsHtml += '</div>';
    skillsHtml += '<button class="skill-cancel-btn" onclick="closeSkillSelectionUI()">❌ 취소</button>';
    skillsHtml += '</div>';

    container.innerHTML = skillsHtml;
    document.body.appendChild(container);
}

/**
 * 스킬 선택 UI를 닫습니다.
 */
function closeSkillSelectionUI() {
    const ui = document.getElementById('skillSelectionUI');
    if (ui) ui.remove();
}

/**
 * 선택한 스킬을 사용합니다.
 */
function useSelectedSkill(skillId) {
    closeSkillSelectionUI();

    const skill = SKILLS[skillId];
    if (!skill) {
        addGameLog('⚠️ 알 수 없는 스킬입니다!');
        return;
    }

    // MP 확인
    if (player.mp < skill.mpCost) {
        addGameLog('💙 MP가 부족합니다!');
        return;
    }

    // 쿨다운 확인
    const cooldown = player.skillCooldowns?.[skillId] || 0;
    if (cooldown > 0) {
        addGameLog(`⏳ ${skill.name}은(는) 아직 쿨다운 중입니다! (${cooldown}턴)`);
        return;
    }

    // MP 소모
    player.mp -= skill.mpCost;

    // 쿨다운 설정
    if (!player.skillCooldowns) player.skillCooldowns = {};
    player.skillCooldowns[skillId] = skill.cooldown || 0;

    const monster = battleState.currentMonster;
    
    // 현재 타겟이 없거나 죽었으면 다음 타겟 선택
    if (!monster || monster.hp <= 0) {
        if (!selectNextAliveMonster()) {
            endBattle('victory');
            return;
        }
    }
    
    const targetMonster = battleState.currentMonster;

    // 스킬 효과 적용
    const damageType = skill.damageType || player.jobData?.damageType || 'physical';
    const damagePercent = skill.effects?.damagePercent || 100;
    const attackCount = skill.effects?.attackCount || 1;

    let totalDamage = 0;

    for (let i = 0; i < attackCount; i++) {
        // 기본 공격력 계산
        const baseAtk = damageType === 'magical' ?
            (player.mAtk || 0) + (player.bonusMAtk || 0) :
            (player.pAtk || 0) + (player.bonusPAtk || 0);

        // 스킬 배율 적용 (0.7~2.3배)
        const multiplier = 0.7 + Math.random() * 1.6;
        let damage = Math.round(baseAtk * (damagePercent / 100) * multiplier);

        // 방어력 적용
        const defStat = damageType === 'magical' ? (targetMonster.mDef || 0) : (targetMonster.pDef || targetMonster.def || 0);
        damage = Math.max(1, damage - Math.floor(defStat * 0.3));

        totalDamage += damage;
        targetMonster.hp -= damage;

        if (attackCount > 1) {
            addGameLog(`⚡ ${skill.name} ${i + 1}타! ${targetMonster.name}에게 ${damage} ${damageType === 'magical' ? '마법' : '물리'} 데미지!`);
        }
    }

    if (attackCount === 1) {
        addGameLog(`⚡ ${player.name}의 ${skill.name}! ${targetMonster.name}에게 ${totalDamage} ${damageType === 'magical' ? '마법' : '물리'} 데미지!`);
    } else {
        addGameLog(`💥 총 ${totalDamage} 데미지!`);
    }

    // 상태이상 적용
    if (skill.effects?.statusEffect) {
        applyStatusEffect(targetMonster, skill.effects.statusEffect, skill.effects.statusDuration, totalDamage);
    }

    // 몬스터 처치 확인
    if (targetMonster.hp <= 0) {
        targetMonster.hp = 0;
        addGameLog(`💀 ${targetMonster.name}을(를) 처치했습니다!`);
        
        // 모든 몬스터 처치 확인
        const aliveMonsters = battleState.monsters.filter(m => m.hp > 0);
        if (aliveMonsters.length === 0) {
            updateBattleUI();
            setTimeout(() => endBattle('victory'), 500);
            return;
        }
        
        // 다음 생존 몬스터로 자동 타겟 변경
        selectNextAliveMonster();
    }

    updateBattleUI();
    endPlayerTurn();
}

/**
 * 상태이상을 적용합니다.
 */
function applyStatusEffect(target, effectId, duration, damage = 0) {
    const effect = STATUS_EFFECTS[effectId];
    if (!effect) return;

    // 상태이상 저장
    if (!battleState.monsterStatusEffects) battleState.monsterStatusEffects = {};
    if (!battleState.monsterStatusEffects[target.name]) {
        battleState.monsterStatusEffects[target.name] = {};
    }

    battleState.monsterStatusEffects[target.name][effectId] = {
        duration: duration,
        damage: damage  // 화상용 피해량 저장
    };

    addGameLog(`${effect.icon} ${target.name}에게 ${effect.name} 상태이상 부여! (${duration}턴)`);
}

/**
 * 몬스터의 상태이상 효과를 처리합니다. (턴마다 호출)
 */
function processMonsterStatusEffects(monster) {
    if (!battleState.monsterStatusEffects || !battleState.monsterStatusEffects[monster.name]) {
        return;
    }

    const effects = battleState.monsterStatusEffects[monster.name];
    const effectsToRemove = [];

    Object.keys(effects).forEach(effectId => {
        const effectData = effects[effectId];
        const effectInfo = STATUS_EFFECTS[effectId];

        if (!effectInfo || effectData.duration <= 0) {
            effectsToRemove.push(effectId);
            return;
        }

        let damage = 0;

        // 효과별 처리
        switch (effectId) {
            case 'bleed': // 출혈: 최대HP의 4% 피해 (방어 무시)
                damage = Math.max(1, Math.round(monster.maxHp * (effectInfo.effects.hpPercent / 100)));
                monster.hp -= damage;
                addGameLog(`🩸 ${monster.name}이(가) 출혈로 ${damage} 피해!`);
                break;

            case 'burn': // 화상: 받은 피해의 20% 마법 피해
                damage = Math.max(1, Math.round(effectData.damage * (effectInfo.effects.damagePercent / 100)));
                monster.hp -= damage;
                addGameLog(`🔥 ${monster.name}이(가) 화상으로 ${damage} 피해!`);
                break;

            case 'confusion': // 혼란: 특별한 턴 효과 없음 (공격 시 적용)
                addGameLog(`😵 ${monster.name}은(는) 혼란 상태!`);
                break;
        }

        // 지속시간 감소
        effectData.duration--;

        if (effectData.duration <= 0) {
            effectsToRemove.push(effectId);
            addGameLog(`💨 ${monster.name}의 ${effectInfo.name} 효과가 사라졌다!`);
        }

        // 상태이상으로 처치 확인
        if (monster.hp <= 0) {
            monster.hp = 0;
            updateBattleUI();
            setTimeout(() => endBattle('victory'), 500);
        }
    });

    // 만료된 효과 제거
    effectsToRemove.forEach(effectId => {
        delete effects[effectId];
    });
}

/**
 * 몬스터가 혼란 상태인지 확인합니다. (지속시간은 감소하지 않음)
 */
function checkMonsterConfusion(monster) {
    if (!battleState.monsterStatusEffects) return false;
    
    const effects = battleState.monsterStatusEffects[monster.name];
    if (!effects || !effects.confusion) return false;
    
    return effects.confusion.duration > 0;
}

/**
 * 몬스터 공격 후 상태이상 처리 (피해 및 지속시간 감소)
 */
function processMonsterStatusEffectsAfterAttack(monster) {
    if (!battleState.monsterStatusEffects) return;
    
    const effects = battleState.monsterStatusEffects[monster.name];
    if (!effects) return;

    const effectsToRemove = [];

    Object.entries(effects).forEach(([effectId, effectData]) => {
        const effectInfo = STATUS_EFFECTS[effectId];
        if (!effectInfo || effectData.duration <= 0) {
            effectsToRemove.push(effectId);
            return;
        }

        let damage = 0;

        // 효과별 처리 (공격 후 데미지 적용)
        switch (effectId) {
            case 'bleed': // 출혈: 최대HP의 4% 피해 (방어 무시)
                damage = Math.max(1, Math.round(monster.maxHp * (effectInfo.effects.hpPercent / 100)));
                monster.hp -= damage;
                addGameLog(`🩸 ${monster.name}이(가) 출혈로 ${damage} 피해!`);
                break;

            case 'burn': // 화상: 받은 피해의 20% 마법 피해
                damage = Math.max(1, Math.round(effectData.damage * (effectInfo.effects.damagePercent / 100)));
                monster.hp -= damage;
                addGameLog(`🔥 ${monster.name}이(가) 화상으로 ${damage} 피해!`);
                break;

            case 'confusion': // 혼란: 공격 후 지속시간 감소
                // 공격 후에 지속시간 감소 (공격을 했으므로)
                break;
        }

        // 지속시간 감소 (공격 후)
        effectData.duration--;

        if (effectData.duration <= 0) {
            effectsToRemove.push(effectId);
            addGameLog(`💨 ${monster.name}의 ${effectInfo.name} 효과가 사라졌다!`);
        }

        // 상태이상으로 처치 확인
        if (monster.hp <= 0) {
            monster.hp = 0;
        }
    });

    // 만료된 효과 제거
    effectsToRemove.forEach(effectId => {
        delete effects[effectId];
    });
}

/**
 * 방어
 */
function doBattleDefend() {
    if (!battleState.inBattle || battleState.turn !== 'player') return;

    battleState.isDefending = true;
    addGameLog(`🛡️ ${player.name}은(는) 방어 태세를 취했다!`);

    endPlayerTurn();
}

/**
 * 회복
 */
function doBattleHeal() {
    if (!battleState.inBattle || battleState.turn !== 'player') return;

    // MP 확인
    const mpCost = 15;
    if (player.mp < mpCost) {
        addGameLog('💙 MP가 부족합니다!');
        return;
    }

    player.mp -= mpCost;

    // 회복량 계산 (최대HP의 30%)
    const healAmount = Math.floor(player.maxHp * 0.3);
    player.hp = Math.min(player.hp + healAmount, player.maxHp);

    addGameLog(`💚 ${player.name}은(는) ${healAmount} HP를 회복했다!`);

    updateBattleUI();
    endPlayerTurn();
}

/**
 * 도주
 */
function doBattleEscape() {
    if (!battleState.inBattle || battleState.turn !== 'player') return;

    if (!battleState.canEscape) {
        addGameLog('🚫 이 전투에서는 도망칠 수 없습니다!');
        return;
    }

    const escapeChance = 70;
    const roll = Math.random() * 100;

    if (roll < escapeChance) {
        endBattle('escape');
    } else {
        addGameLog('🏃 도주 실패!');
        endPlayerTurn();
    }
}

// ============================================
// 👹 몬스터 행동
// ============================================

/**
 * 몬스터 턴을 실행합니다. (다중 몬스터 순차 공격)
 */
function doMonsterTurn() {
    console.log('👹 doMonsterTurn 호출, battleState:', battleState);

    if (!battleState.inBattle) {
        console.log('전투가 이미 종료됨');
        return;
    }

    const monsters = battleState.monsters || [];
    const aliveMonsters = monsters.filter(m => m.hp > 0);
    
    if (aliveMonsters.length === 0) {
        console.log('생존 몬스터 없음');
        endBattle('victory');
        return;
    }

    // 모든 생존 몬스터가 순차적으로 공격
    let attackIndex = 0;
    
    function nextMonsterAttack() {
        if (attackIndex >= aliveMonsters.length) {
            // 모든 몬스터 공격 완료
            finishMonsterTurn();
            return;
        }
        
        const monster = aliveMonsters[attackIndex];
        
        // 혼란 상태 체크 - 공격 전에 확인, 지속시간 감소는 공격 후
        const isConfused = checkMonsterConfusion(monster);
        
        if (isConfused) {
            // 혼란 상태면 공격 대신 자해 또는 혼란 행동
            const selfDamage = Math.floor(monster.maxHp * 0.05);
            monster.hp = Math.max(1, monster.hp - selfDamage);
            addGameLog(`😵 ${monster.name}은(는) 혼란스러워 자신을 공격했다! (${selfDamage} 데미지)`);
        } else {
            // 회피 체크
            const evasionRoll = Math.random() * 100;
            if (evasionRoll < (player.evasion || 0)) {
                addGameLog(`💫 ${player.name}이(가) ${monster.name}의 공격을 회피했다!`);
            } else {
                // 몬스터 공격 (피해 타입 적용)
                const damageType = monster.damageType || 'physical';
                let damage = calculateMonsterDamage(monster, player, damageType);

                // 방어 중이면 데미지 감소
                if (battleState.isDefending) {
                    const defenseMultiplier = 2.5 + Math.random();
                    const baseDef = damageType === 'magical' ?
                        (player.mDef || 0) + (player.bonusMDef || 0) :
                        (player.pDef || 0) + (player.bonusPDef || 0);
                    const additionalDef = Math.floor(baseDef * defenseMultiplier);
                    damage = Math.max(1, damage - additionalDef);
                    
                    if (attackIndex === 0) {
                        addGameLog(`🛡️ 방어로 피해 감소!`);
                    }
                }

                player.hp -= damage;
                addGameLog(`👹 ${monster.name}의 ${damageType === 'magical' ? '마법 ' : ''}공격! ${damage} 데미지!`);
            }
        }
        
        // 공격 후 상태이상 피해 및 지속시간 처리 (출혈, 화상 등)
        processMonsterStatusEffectsAfterAttack(monster);
        
        // 플레이어 HP 확인
        if (player.hp <= 0) {
            player.hp = 0;
            updateBattleUI();
            setTimeout(() => endBattle('defeat'), 500);
            return;
        }
        
        attackIndex++;
        
        // 다음 몬스터 공격 (0.5초 딜레이)
        if (attackIndex < aliveMonsters.length) {
            setTimeout(nextMonsterAttack, 500);
        } else {
            finishMonsterTurn();
        }
    }
    
    // 첫 번째 몬스터 공격 시작
    nextMonsterAttack();
}

/**
 * 몬스터 턴을 마무리합니다.
 */
function finishMonsterTurn() {
    // 방어 해제
    battleState.isDefending = false;

    updateBattleUI();

    // 다음 턴 - 자연회복 적용
    battleState.turn = 'player';
    battleState.turnCount++;

    // 턴 시작 시 HP/MP 자연회복
    applyNaturalRegen();

    addGameLog(`--- 턴 ${battleState.turnCount} ---`);

    // 버튼 활성화
    enableBattleButtons(true);
}

/**
 * 플레이어 턴을 종료합니다.
 */
function endPlayerTurn() {
    console.log('🔄 endPlayerTurn 호출');

    battleState.turn = 'monster';

    // 스킬 쿨다운 감소
    if (player.skillCooldowns) {
        Object.keys(player.skillCooldowns).forEach(skillId => {
            if (player.skillCooldowns[skillId] > 0) {
                player.skillCooldowns[skillId]--;
            }
        });
    }

    // 버튼 비활성화
    enableBattleButtons(false);

    // 몬스터 턴 딜레이
    setTimeout(() => {
        doMonsterTurn();
    }, 1000);
}

/**
 * 전투 버튼 활성화/비활성화
 */
function enableBattleButtons(enabled) {
    const buttons = document.querySelectorAll('#battleActions .battle-action-btn');
    buttons.forEach(btn => {
        btn.disabled = !enabled;
    });
}

/**
 * 플레이어 피해를 계산합니다. (피해 타입 분리)
 * 일반공격: 0.6~2배, 스킬: 0.7~2.3배
 * 효율 스탯이 높을수록 높은 배수 확률 증가
 */
function calculateDamage(attacker, defender, isSkill, damageType = null) {
    // 피해 타입 결정 (직업 기반 또는 지정)
    const type = damageType || attacker.jobData?.damageType || 'physical';

    // 공격력 선택
    const baseAtk = type === 'magical' ?
        (attacker.mAtk || 0) + (attacker.bonusMAtk || 0) :
        (attacker.pAtk || 0) + (attacker.bonusPAtk || 0);

    // 방어력 선택
    const baseDef = type === 'magical' ?
        (defender.mDef || 0) :
        (defender.pDef || 0);

    // 배수 계산 (효율 스탯 적용)
    let minMult, maxMult;
    if (isSkill) {
        minMult = 0.7;
        maxMult = 2.3;
    } else {
        minMult = 0.6;
        maxMult = 2.0;
    }

    // 효율 스탯으로 배수 확률 조정
    const efficiency = attacker.efficiency || 0;
    let multiplier = minMult + Math.random() * (maxMult - minMult);

    // 효율이 높을수록 높은 배수가 나올 확률 증가
    if (efficiency > 0) {
        const bonus = (efficiency / 100) * 0.3; // 효율 1%당 0.3% 배수 바이어스
        multiplier = Math.min(maxMult, multiplier + bonus);
    }

    let damage = Math.round(baseAtk * multiplier);

    // 방어력 적용
    damage = Math.max(1, damage - Math.floor(baseDef * 0.3));

    // 최소 피해 1 보장
    return Math.max(1, Math.round(damage));
}

/**
 * 몬스터 피해를 계산합니다. (피해 타입 분리)
 */
function calculateMonsterDamage(monster, target, damageType = 'physical') {
    const type = monster.damageType || damageType;

    // 몬스터 공격력
    const monsterAtk = type === 'magical' ?
        (monster.mAtk || monster.atk || 10) :
        (monster.pAtk || monster.atk || 10);

    // 플레이어 방어력
    const targetDef = type === 'magical' ?
        (target.mDef || 0) + (target.bonusMDef || 0) :
        (target.pDef || 0) + (target.bonusPDef || 0);

    // 배수 0.6~2.0
    let multiplier = 0.6 + Math.random() * 1.4;
    let damage = Math.round(monsterAtk * multiplier);

    // 방어력 적용
    damage = Math.max(1, damage - Math.floor(targetDef * 0.3));

    return Math.max(1, Math.round(damage));
}

/**
 * 난이도 배율을 반환합니다.
 */
function getDifficultyMultiplier() {
    if (typeof DIFFICULTY !== 'undefined' && DIFFICULTY[currentDifficulty]) {
        return DIFFICULTY[currentDifficulty].multiplier;
    }
    return 1.0;
}

/**
 * 레벨업을 확인합니다. (새로운 시스템)
 */
function checkLevelUp() {
    const config = typeof LEVEL_UP_CONFIG !== 'undefined' ? LEVEL_UP_CONFIG : {
        maxLevel: 999,
        perLevel: { str: 1, vit: 1, int: 1, agi: 1, hp: 10, mp: 7, pAtk: 1, mAtk: 1, pDef: 1, mDef: 1 },
        statPoints: 2
    };

    let requiredExp = getRequiredExp(player.level);

    while (player.exp >= requiredExp && player.level < config.maxLevel) {
        player.exp -= requiredExp;
        player.level++;

        // 기본 스탯 증가
        player.str += config.perLevel.str || 1;
        player.vit += config.perLevel.vit || 1;
        player.int += config.perLevel.int || 1;
        player.agi += config.perLevel.agi || 1;

        // HP/MP 증가
        player.baseHp = (player.baseHp || 0) + (config.perLevel.hp || 10);
        player.baseMp = (player.baseMp || 0) + (config.perLevel.mp || 7);

        // 공격력/방어력 증가
        player.basePAtk = (player.basePAtk || 0) + (config.perLevel.pAtk || 1);
        player.baseMAtk = (player.baseMAtk || 0) + (config.perLevel.mAtk || 1);
        player.basePDef = (player.basePDef || 0) + (config.perLevel.pDef || 1);
        player.baseMDef = (player.baseMDef || 0) + (config.perLevel.mDef || 1);

        // 스탯포인트 지급
        player.statPoints = (player.statPoints || 0) + (config.statPoints || 2);

        // 파생 스탯 재계산
        recalculatePlayerStats();

        // HP/MP 회복
        player.hp = player.maxHp;
        player.mp = player.maxMp;

        addGameLog(`🎉 레벨 업! Lv.${player.level}! (스탯포인트 +${config.statPoints})`);

        requiredExp = getRequiredExp(player.level);
    }
}

/**
 * 플레이어 파생 스탯을 재계산합니다.
 */
function recalculatePlayerStats() {
    const r = typeof STATS_CONFIG !== 'undefined' ? STATS_CONFIG.ratios : {
        hpPerVit: 2, mpPerInt: 1,
        pAtkPerStr: 0.5, mAtkPerInt: 0.5,
        pDefPerStr: 1 / 6, pDefPerVit: 0.5,
        mDefPerInt: 1 / 6, mDefPerVit: 0.5,
        efficiencyPerAgi: 1 / 8, evasionPerAgi: 1 / 7, healEffPerVit: 1 / 3
    };

    // HP/MP 계산
    player.maxHp = (player.baseHp || 30) + Math.round(player.vit * r.hpPerVit) + (player.bonusHp || 0);
    player.maxMp = (player.baseMp || 15) + Math.round(player.int * r.mpPerInt) + (player.bonusMp || 0);

    // 공격력/방어력 계산
    player.pAtk = Math.round((player.basePAtk || 1) + player.str * r.pAtkPerStr);
    player.mAtk = Math.round((player.baseMAtk || 1) + player.int * r.mAtkPerInt);
    player.pDef = Math.round((player.basePDef || 0) + player.str * r.pDefPerStr + player.vit * r.pDefPerVit);
    player.mDef = Math.round((player.baseMDef || 0) + player.int * r.mDefPerInt + player.vit * r.mDefPerVit);

    // 퍼센트 스탯
    player.efficiency = Math.round(player.agi * r.efficiencyPerAgi);
    player.evasion = Math.round(player.agi * r.evasionPerAgi);
    player.healEff = Math.round(player.vit * r.healEffPerVit);
}

/**
 * 턴마다 HP/MP 자연회복을 적용합니다.
 */
function applyNaturalRegen() {
    const regen = typeof STATS_CONFIG !== 'undefined' ? STATS_CONFIG.naturalRegen : {
        hpPercent: 1, mpPercent: 5
    };

    // HP 회복 (1%)
    const hpRegen = Math.max(1, Math.round(player.maxHp * (regen.hpPercent / 100)));
    // MP 회복 (5%)
    const mpRegen = Math.max(1, Math.round(player.maxMp * (regen.mpPercent / 100)));

    // 회복효율 적용
    const healEffBonus = 1 + (player.healEff || 0) / 100;

    const actualHpRegen = Math.round(hpRegen * healEffBonus);
    const actualMpRegen = Math.round(mpRegen * healEffBonus);

    const oldHp = player.hp;
    const oldMp = player.mp;

    player.hp = Math.min(player.maxHp, player.hp + actualHpRegen);
    player.mp = Math.min(player.maxMp, player.mp + actualMpRegen);

    const hpRecovered = player.hp - oldHp;
    const mpRecovered = player.mp - oldMp;

    if (hpRecovered > 0 || mpRecovered > 0) {
        let msg = '💚 자연회복:';
        if (hpRecovered > 0) msg += ` HP +${hpRecovered}`;
        if (mpRecovered > 0) msg += ` MP +${mpRecovered}`;
        addGameLog(msg);
    }
}

// ============================================
// 🎨 전투 UI
// ============================================

/**
 * 전투 UI를 표시합니다.
 */
function showBattleUI() {
    console.log('📺 showBattleUI 호출');

    // 전투 UI 표시
    const battleUI = document.getElementById('battleUI');
    if (battleUI) {
        battleUI.classList.remove('hidden');
        battleUI.style.display = 'flex';
    }

    // 탐험 UI 숨기기
    const exploreUI = document.getElementById('exploreUI');
    if (exploreUI) {
        exploreUI.classList.add('hidden');
        exploreUI.style.display = 'none';
    }

    // 탐험 행동 버튼 숨기기
    const exploreActions = document.getElementById('exploreActions');
    if (exploreActions) {
        exploreActions.classList.add('hidden');
        exploreActions.style.display = 'none';
    }

    // 전투 행동 버튼 표시
    const battleActions = document.getElementById('battleActions');
    if (battleActions) {
        battleActions.classList.remove('hidden');
        battleActions.style.display = 'grid';
    }

    // 버튼 활성화
    enableBattleButtons(true);

    console.log('전투 UI 표시 완료');
}

/**
 * 전투 UI를 숨깁니다.
 */
function hideBattleUI() {
    console.log('📺 hideBattleUI 호출');

    // 전투 UI 숨기기
    const battleUI = document.getElementById('battleUI');
    if (battleUI) {
        battleUI.classList.add('hidden');
        battleUI.style.display = 'none';
    }

    // 탐험 UI 표시
    const exploreUI = document.getElementById('exploreUI');
    if (exploreUI) {
        exploreUI.classList.remove('hidden');
        exploreUI.style.display = 'flex';
    }

    // 탐험 행동 버튼 표시
    const exploreActions = document.getElementById('exploreActions');
    if (exploreActions) {
        exploreActions.classList.remove('hidden');
        exploreActions.style.display = 'grid';
    }

    // 전투 행동 버튼 숨기기
    const battleActions = document.getElementById('battleActions');
    if (battleActions) {
        battleActions.classList.add('hidden');
        battleActions.style.display = 'none';
    }

    console.log('전투 UI 숨김 완료');
}

/**
 * 전투 UI를 업데이트합니다. (다중 몬스터 지원)
 */
function updateBattleUI() {
    const monsters = battleState.monsters || [];
    const container = document.getElementById('monstersContainer');
    
    if (!container) return;
    
    // 몬스터 컨테이너 초기화
    container.innerHTML = '';
    
    // 각 몬스터에 대해 카드 생성
    monsters.forEach((monster, index) => {
        const isSelected = index === battleState.currentMonsterIndex;
        const isDead = monster.hp <= 0;
        
        const monsterCard = document.createElement('div');
        monsterCard.className = `monster-card ${isSelected ? 'selected' : ''} ${isDead ? 'dead' : ''}`;
        monsterCard.dataset.index = index;
        
        // 클릭하여 타겟 선택 (죽은 몬스터 제외)
        if (!isDead) {
            monsterCard.onclick = () => selectMonsterTarget(index);
            monsterCard.style.cursor = 'pointer';
        }
        
        const hpPercent = Math.max(0, (monster.hp / monster.maxHp) * 100);
        
        monsterCard.innerHTML = `
            <div class="monster-sprite">${monster.emoji || '👹'}</div>
            <div class="monster-info">
                <span class="monster-name">${monster.name}${isDead ? ' ☠️' : ''}</span>
                <div class="bar monster-hp-bar">
                    <div class="bar-fill" style="width: ${hpPercent}%; background: ${isDead ? '#555' : 'linear-gradient(90deg, #e74c3c, #c0392b)'};"></div>
                    <span class="bar-text">${Math.max(0, monster.hp)}/${monster.maxHp}</span>
                </div>
            </div>
            ${isSelected && !isDead ? '<div class="target-indicator">🎯</div>' : ''}
        `;
        
        container.appendChild(monsterCard);
    });
    
    // 플레이어 정보
    updatePlayerUI();
}

/**
 * 타겟 몬스터를 선택합니다.
 */
function selectMonsterTarget(index) {
    if (!battleState.inBattle) return;
    
    const monsters = battleState.monsters || [];
    const monster = monsters[index];
    
    // 죽은 몬스터는 선택 불가
    if (!monster || monster.hp <= 0) {
        addGameLog('⚠️ 이 대상은 선택할 수 없습니다!');
        return;
    }
    
    battleState.currentMonsterIndex = index;
    battleState.currentMonster = monster;
    
    addGameLog(`🎯 ${monster.name}을(를) 대상으로 선택!`);
    updateBattleUI();
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('⚔️ battleSystem.js v2 로드 완료!');
