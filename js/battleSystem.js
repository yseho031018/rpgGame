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
    
    // 전투당 최대 몬스터 수
    const MAX_MONSTERS = 10;
    
    // 몬스터들 생성 (minSpawn 처리, 전체 10마리 제한)
    const monsters = [];
    for (const monsterType of monsterTypeArray) {
        // 이미 최대 수량이면 더 이상 생성하지 않음
        if (monsters.length >= MAX_MONSTERS) break;
        
        // 객체가 직접 전달된 경우 (대련 시스템 등)
        let monster;
        if (typeof monsterType === 'object' && monsterType !== null) {
            // 대련용 몬스터 객체 직접 사용
            monster = {
                ...monsterType,
                hp: monsterType.currentHp || monsterType.hp,
                maxHp: monsterType.hp,
                currentHp: monsterType.currentHp || monsterType.hp,
                currentMp: monsterType.currentMp || monsterType.maxMp || 0
            };
            console.log('📦 대련 몬스터 객체 직접 사용:', monster.name);
        } else {
            // 문자열 ID로 몬스터 생성
            monster = createBattleMonster(monsterType);
        }
        
        if (monster) {
            // minSpawn 속성이 있으면 추가 몬스터 생성
            const minSpawn = monster.minSpawn || 1;
            
            if (minSpawn > 1) {
                // 남은 슬롯 계산
                const remainingSlots = MAX_MONSTERS - monsters.length;
                
                // 최소값을 보장하되, 최대 10마리 제한을 넘지 않도록
                // 랜덤 범위: minSpawn ~ 남은 슬롯 (최대 10개 - 현재 마리수)
                const actualMin = Math.min(minSpawn, remainingSlots);
                const actualMax = remainingSlots;
                
                // 랜덤으로 출현 마리수 결정 (minSpawn ~ 남은 슬롯)
                const spawnCount = Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
                
                // 첫 번째는 이미 생성됨
                monsters.push(monster);
                
                // 추가 몬스터 생성 (2번째부터)
                for (let i = 1; i < spawnCount && monsters.length < MAX_MONSTERS; i++) {
                    const additionalMonster = createBattleMonster(monsterType);
                    if (additionalMonster) {
                        // 각 몬스터에 고유 ID 부여 (구분용)
                        additionalMonster.instanceId = `${monsterType}_${i + 1}`;
                        monsters.push(additionalMonster);
                    }
                }
            } else {
                monsters.push(monster);
            }
        }
    }

    if (monsters.length === 0) {
        console.error('몬스터 생성 실패:', monsterTypes);
        return;
    }

    // 각 몬스터에 고유 battleIndex 할당 (상태이상 추적용)
    monsters.forEach((monster, index) => {
        monster.battleIndex = index;
    });

    // 보스 몬스터가 있으면 도주 불가
    const hasBoss = monsters.some(m => m.isBoss);

    // 대련 상태 보존 (startBattle 호출 전에 설정된 대련 플래그 유지)
    const preservedIsSpar = battleState.isSpar || false;
    const preservedSparNpc = battleState.sparNpc || null;
    const preservedSparBackground = battleState.sparBackground || null;

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
        playerStatusEffects: [],      // 플레이어 상태이상
        // 대련 상태 복원
        isSpar: preservedIsSpar,
        sparNpc: preservedSparNpc,
        sparBackground: preservedSparBackground,
        phase2Transitioning: false,   // 2페이즈 전환 중 플래그
        // 전투 전 상태 저장 (재도전 시스템용)
        preBattleHp: player ? player.hp : 0,
        preBattleMp: player ? player.mp : 0,
        preBattleLocationId: typeof currentLocationId !== 'undefined' ? currentLocationId : null,
        preBattleMapId: typeof currentMapId !== 'undefined' ? currentMapId : null
    };

    // 스킬 쿨다운 초기화
    if (player && player.skillCooldowns) {
        Object.keys(player.skillCooldowns).forEach(skillId => {
            player.skillCooldowns[skillId] = 0;
        });
    }

    // 특성 상태 초기화 (전투 시작)
    resetTraitStateForBattle();

    // 대련 배경 적용
    if (battleState.sparBackground) {
        applyBattleBackground(battleState.sparBackground);
    }

    // 전투 UI 표시
    showBattleUI();
    updateBattleUI();

    // 조우 메시지
    if (monsters.length === 1) {
        const coloredName = getMonsterNameWithColor(monsters[0]);
        if (hasBoss) {
            addGameLog(`🔥 보스 ${coloredName}과(와) 전투 시작! (도주 불가)`);
        } else {
            addGameLog(`⚔️ ${coloredName}과(와) 전투 시작!`);
        }
    } else {
        const monsterNames = monsters.map(m => getMonsterNameWithColor(m)).join(', ');
        if (hasBoss) {
            addGameLog(`🔥 ${monsters.length}마리의 몬스터와 전투 시작! (${monsterNames}) [도주 불가]`);
        } else {
            addGameLog(`⚔️ ${monsters.length}마리의 몬스터와 전투 시작! (${monsterNames})`);
        }
    }

    // 첫 턴 특성 효과 즉시 발동 (신속 등)
    processTraitEffectsOnTurnStart();

    // 대련이 아닌 일반 전투 진입 시 자동 저장 (로컬 + 서버)
    if (!battleState.isSpar && typeof autoSaveBeforeBattle === 'function') {
        autoSaveBeforeBattle();
    }

    console.log('⚔️ 전투 시작 완료, battleState:', battleState);
}

/**
 * 현재 난이도 배율을 반환합니다. (체력/공격력 분리)
 */
function getDifficultyMultipliers() {
    const diff = (typeof player !== 'undefined' && player.difficulty) ? player.difficulty : (typeof currentDifficulty !== 'undefined' ? currentDifficulty : 'normal');
    if (typeof DIFFICULTY !== 'undefined' && DIFFICULTY[diff]) {
        return {
            hp: DIFFICULTY[diff].hpMultiplier || 1.0,
            atk: DIFFICULTY[diff].atkMultiplier || 1.0
        };
    }
    return { hp: 1.0, atk: 1.0 };
}

/**
 * 몬스터 등급을 결정합니다.
 */
function rollMonsterGrade() {
    const diff = (typeof player !== 'undefined' && player.difficulty) ? player.difficulty : (typeof currentDifficulty !== 'undefined' ? currentDifficulty : 'normal');
    const gradeChance = (typeof DIFFICULTY !== 'undefined' && DIFFICULTY[diff]?.gradeChance) || { common: 1.0 };
    
    const roll = Math.random();
    let cumulative = 0;
    
    for (const [grade, chance] of Object.entries(gradeChance)) {
        cumulative += chance;
        if (roll < cumulative) {
            return grade;
        }
    }
    return 'common';
}

/**
 * 몬스터 이름에 등급 색상을 적용합니다.
 * @param {Object} monster - 몬스터 객체 (gradeData 포함)
 * @returns {string} - HTML 스타일이 적용된 몬스터 이름
 */
function getMonsterNameWithColor(monster) {
    if (!monster) return '???';
    
    const name = monster.name || '???';
    const gradeData = monster.gradeData;
    
    // 보스는 특별 색상 (빨강)
    if (monster.isBoss) {
        return `<span style="color: #e74c3c; font-weight: bold;">${name}</span>`;
    }
    
    // 등급 데이터가 없거나 일반 등급이면 그냥 이름 반환
    if (!gradeData || gradeData.id === 'common') {
        return name;
    }
    
    // 등급별 색상 적용
    return `<span style="color: ${gradeData.color}; font-weight: bold;">${name}</span>`;
}

/**
 * 전투용 몬스터를 생성합니다.
 * MONSTERS 데이터에서 가져오거나 기본 템플릿 사용
 * 등급 시스템 적용: 난이도 배율 × 등급 배율
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

    // 난이도 배율 적용 (체력/공격력 분리)
    const diffMultipliers = getDifficultyMultipliers();

    // 등급 결정 (보스는 별도 'boss' 등급)
    const grade = template.isBoss ? 'boss' : rollMonsterGrade();
    const gradeData = (typeof MONSTER_GRADE !== 'undefined' && MONSTER_GRADE[grade]) 
        ? MONSTER_GRADE[grade] 
        : { id: 'common', name: '일반', color: '#FFFFFF', hpMultiplier: 1.0, atkMultiplier: 1.0, expMultiplier: 1.0, goldMultiplier: 1.0, icon: '' };

    // 최종 배율 계산 (난이도 × 등급)
    const finalHpMult = diffMultipliers.hp * gradeData.hpMultiplier;
    const finalAtkMult = diffMultipliers.atk * gradeData.atkMultiplier;

    // 특성 확률 처리 (possibleTraits)
    const activeTraits = [];
    if (template.possibleTraits && Array.isArray(template.possibleTraits)) {
        template.possibleTraits.forEach(traitDef => {
            const roll = Math.random();
            if (roll < traitDef.chance) {
                activeTraits.push(traitDef.id);
            }
        });
    }

    // 스탯 계산 (소수점 올림 처리)
    return {
        ...template,
        grade: grade,
        gradeData: gradeData,
        hp: Math.ceil((template.hp || 50) * finalHpMult),
        maxHp: Math.ceil((template.hp || 50) * finalHpMult),
        atk: Math.ceil((template.atk || 10) * finalAtkMult),
        def: Math.ceil((template.def || 5) * finalHpMult),
        exp: Math.ceil((template.exp || 10) * gradeData.expMultiplier),
        gold: Math.ceil((template.gold || 5) * gradeData.goldMultiplier),
        traits: activeTraits  // 활성화된 특성 배열
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
            // 대련 승리 처리
            if (battleState.isSpar) {
                const sparMonsterData = monster;
                const sparNpc = battleState.sparNpc;
                const sparMonsterId = sparMonsterData ? sparMonsterData.id : null;
                
                // 이미 보상을 받았는지 확인
                if (!player.sparRewardsReceived) player.sparRewardsReceived = {};
                const alreadyRewarded = player.sparRewardsReceived[sparMonsterId];
                
                let sparRewards;
                if (alreadyRewarded) {
                    // 이미 보상을 받은 경우 → 보상 없음
                    sparRewards = { exp: 0, gold: 0, skillBook: null, weapon: null, messages: [] };
                    addGameLog(`⚔️ 대련 승리! (이미 보상을 수령했습니다)`);
                } else {
                    // 대련 보상 계산 (직업 기반)
                    sparRewards = getSparRewards(sparMonsterData);
                    gold += sparRewards.gold;
                    player.exp = (player.exp || 0) + sparRewards.exp;
                    
                    addGameLog(`🎉 대련 승리! ${sparRewards.exp} EXP, ${sparRewards.gold} Gold 획득!`);
                    
                    // 스킬북 보상 적용
                    if (sparRewards.skillBook) {
                        sparRewards.skillResult = applySkillBookReward(sparRewards.skillBook);
                    }
                    
                    // 무기 보상 적용
                    if (sparRewards.weapon) {
                        const weaponData = typeof ITEMS_DATABASE !== 'undefined' ? ITEMS_DATABASE[sparRewards.weapon] : null;
                        if (weaponData) {
                            addItemToInventory(sparRewards.weapon);
                            sparRewards.weaponName = weaponData.name;
                        }
                    }
                    
                    // 보상 수령 기록
                    player.sparRewardsReceived[sparMonsterId] = true;
                    
                    checkLevelUp();
                }
                
                // HP/MP 회복 (대련이므로 30% 회복)
                player.hp = Math.max(player.hp, Math.floor(player.maxHp * 0.3));
                player.mp = Math.max(player.mp, Math.floor(player.maxMp * 0.3));
                
                // 대련 결과 대화 오버레이 표시
                const victoryDialogue = (sparMonsterData && sparMonsterData.dialogues && sparMonsterData.dialogues.defeat) 
                    || '대단하군... 네가 이겼다.';
                const sparName = sparMonsterData ? sparMonsterData.name : (sparNpc ? sparNpc.name : '교관');
                const sparImage = sparMonsterData ? sparMonsterData.image : null;
                const sparEmoji = sparMonsterData ? sparMonsterData.emoji : (sparNpc ? sparNpc.emoji : '⚔️');
                
                // 전투 상태 초기화
                battleState = {
                    inBattle: false, turn: 'player', currentMonster: null,
                    monsters: [], currentMonsterIndex: 0, isDefending: false,
                    canEscape: true, turnCount: 0, isSpar: false, sparNpc: null, sparBackground: null
                };
                hideBattleUI();
                
                showSparResultOverlay('victory', sparName, sparImage, victoryDialogue, alreadyRewarded ? null : sparRewards, sparEmoji);
                updatePlayerUI();
                return;
            }
            
            // 일반 몬스터 승리 보상
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

            // 대련 패배 처리 (대련은 사망/게임오버와 별개)
            if (battleState.isSpar) {
                const sparNpc = battleState.sparNpc;
                const sparMonsterData = monster;
                
                // 대련 패배 대사 (NPC가 승리했을 때의 대사)
                const defeatDialogue = (sparMonsterData && sparMonsterData.dialogues && sparMonsterData.dialogues.victory) 
                    || '아직 멀었군. 더 수련하게.';
                const sparName = sparMonsterData ? sparMonsterData.name : (sparNpc ? sparNpc.name : '교관');
                const sparImage = sparMonsterData ? sparMonsterData.image : null;
                const sparEmoji = sparMonsterData ? sparMonsterData.emoji : (sparNpc ? sparNpc.emoji : '⚔️');
                
                addGameLog(`⚔️ 대련에서 패배했습니다.`);
                
                // HP/MP 최대치의 50%로 회복 (대련이므로 사망하지 않음)
                player.hp = Math.max(1, Math.floor(player.maxHp * 0.5));
                player.mp = Math.max(1, Math.floor(player.maxMp * 0.5));
                
                // 대련한 NPC가 있는 장소에 그대로 유지 (위치 이동 없음)
                // NPC의 location에서 세부 위치 추출
                if (sparNpc && sparNpc.location) {
                    const locParts = sparNpc.location.split('.');
                    if (locParts.length >= 2 && typeof currentLocationId !== 'undefined') {
                        currentLocationId = locParts[1];
                    }
                }
                
                // 전투 상태 초기화
                battleState = {
                    inBattle: false, turn: 'player', currentMonster: null,
                    monsters: [], currentMonsterIndex: 0, isDefending: false,
                    canEscape: true, turnCount: 0, isSpar: false, sparNpc: null, sparBackground: null
                };
                
                hideBattleUI();
                showSparResultOverlay('defeat', sparName, sparImage, defeatDialogue, null, sparEmoji);
                updatePlayerUI();
                if (typeof updateLocationUI === 'function') updateLocationUI();
                return;
            }

            // 현재 맵의 noDeathZone 설정 확인
            const currentMapData = getCurrentMap();
            if (currentMapData && currentMapData.noDeathZone) {
                // 훈련장처럼 사망하지 않는 지역
                handleNoDeathZoneDefeat(currentMapData, monster);
                return;  // 패배 처리 중이므로 즉시 종료
            } else {
                // 일반 사망 처리 - 게임오버 화면으로 이동
                showGameOverScreen();
                return;  // 게임오버 화면 전환 중이므로 즉시 종료
            }

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
 * 대련 보상을 계산합니다.
 * @param {Object} sparMonster - 대련 몬스터 데이터
 * @returns {Object} { exp, gold, skillBook, weapon, message[] }
 */
function getSparRewards(sparMonster) {
    if (!sparMonster) return { exp: 0, gold: 0, skillBook: null, weapon: null, messages: [] };
    
    const sparClass = sparMonster.sparClass; // archer, mage, skirmisher, warrior
    const playerJob = player.job; // warrior, archer, mage, skirmisher
    const isMatchingJob = (playerJob === sparClass);
    const messages = [];
    
    // 직업별 스킬 목록 (하급~중급)
    const jobSkills = {
        archer: ['multishot', 'charge_shot'],
        mage: ['fireball', 'lightning_bolt'],
        skirmisher: ['slash_combo', 'ambush'],
        warrior: ['smash', 'spirit_sword']
    };
    
    // 직업별 강철 무기 매핑
    const steelWeapons = {
        warrior: 'steel_longsword',
        archer: 'steel_bow',
        mage: 'steel_staff',
        skirmisher: 'steel_dagger'
    };
    
    let rewards = { exp: 0, gold: 0, skillBook: null, weapon: null, messages: [] };
    
    if (sparClass === 'warrior') {
        // 상급교관 (전사): 특별 보상
        if (isMatchingJob) {
            rewards.exp = 2000;
            rewards.gold = 1000;
            // 전사 스킬북 (랜덤)
            const availableSkills = jobSkills.warrior;
            const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            rewards.skillBook = randomSkill;
            // 강철 대검
            rewards.weapon = steelWeapons.warrior;
        } else {
            rewards.exp = 3000;  // 1.5배
            rewards.gold = 1500; // 1.5배
            // 플레이어 직업에 맞는 강철 무기
            rewards.weapon = steelWeapons[playerJob] || steelWeapons.warrior;
        }
    } else {
        // 일반 교관 (궁수/마법사/도적)
        if (isMatchingJob) {
            rewards.exp = 1000;
            rewards.gold = 500;
            // 해당 직업 스킬북 (랜덤)
            const availableSkills = jobSkills[sparClass] || [];
            if (availableSkills.length > 0) {
                const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                rewards.skillBook = randomSkill;
            }
        } else {
            rewards.exp = 1500;  // 1.5배
            rewards.gold = 750;  // 1.5배
        }
    }
    
    return rewards;
}

/**
 * 스킬북 보상을 적용합니다 (이미 있으면 레벨업)
 * @param {string} skillId - 스킬 ID
 * @returns {Object} { learned, leveledUp, skillName, newLevel }
 */
function applySkillBookReward(skillId) {
    const skill = typeof SKILLS !== 'undefined' ? SKILLS[skillId] : null;
    if (!skill) return { learned: false, leveledUp: false, skillName: '알 수 없는 스킬', newLevel: 0 };
    
    if (!player.skills) player.skills = [];
    if (!player.skillLevels) player.skillLevels = {};
    
    if (player.skills.includes(skillId)) {
        // 이미 보유한 스킬 → 레벨업
        player.skillLevels[skillId] = (player.skillLevels[skillId] || 1) + 1;
        const newLevel = player.skillLevels[skillId];
        addGameLog(`📖 <span style="color: #f1c40f; font-weight: bold;">${skill.name}</span> 스킬 레벨 상승! Lv.${newLevel}`);
        return { learned: false, leveledUp: true, skillName: skill.name, newLevel: newLevel };
    } else {
        // 새로운 스킬 습득
        player.skills.push(skillId);
        player.skillLevels[skillId] = 1;
        if (!player.skillCooldowns) player.skillCooldowns = {};
        player.skillCooldowns[skillId] = 0;
        addGameLog(`📖 <span style="color: #f1c40f; font-weight: bold;">${skill.name} Lv.1</span>을(를) 배웠습니다!`);
        return { learned: true, leveledUp: false, skillName: skill.name, newLevel: 1 };
    }
}

/**
 * 대련 결과 대화 오버레이를 표시합니다 (보스 대화창 스타일 순차 대화)
 * @param {string} result - 'victory' 또는 'defeat'
 * @param {string} npcName - NPC 이름
 * @param {string} npcImage - NPC 이미지 경로
 * @param {string} dialogue - 대사
 * @param {Object|null} rewards - 보상 { exp, gold, skillBook, weapon, skillResult } (승리 시)
 * @param {string} npcEmoji - NPC 이모지
 */
function showSparResultOverlay(result, npcName, npcImage, dialogue, rewards, npcEmoji) {
    const isVictory = result === 'victory';
    const emoji = npcEmoji || '⚔️';
    
    // 대화 라인 구성
    const lines = [];
    lines.push(dialogue);
    
    if (isVictory && rewards) {
        // 보상 관련 추가 대사
        lines.push(`경험치 ${rewards.exp}과 골드 ${rewards.gold}을 받았다.`);
        
        if (rewards.skillResult) {
            if (rewards.skillResult.learned) {
                lines.push(`📖 새로운 스킬 "${rewards.skillResult.skillName}" Lv.1을 배웠다!`);
            } else if (rewards.skillResult.leveledUp) {
                lines.push(`📖 "${rewards.skillResult.skillName}" 스킬이 Lv.${rewards.skillResult.newLevel}로 상승했다!`);
            }
        }
        
        if (rewards.weaponName) {
            lines.push(`⚔️ "${rewards.weaponName}"을(를) 획득했다!`);
        }
    } else if (!isVictory) {
        lines.push('다음에 다시 도전하자.');
    }
    
    // 순차 대화 표시
    let currentLine = 0;
    
    function showNextSparLine() {
        const existing = document.querySelector('.boss-dialog-modal');
        if (existing) existing.remove();
        
        if (currentLine >= lines.length) {
            return;
        }
        
        const borderColor = isVictory ? '#ffd700' : '#8b0000';
        const nameColor = isVictory ? '#ffd700' : '#e74c3c';
        const btnBg = isVictory ? 'linear-gradient(#b8860b, #8b6914)' : 'linear-gradient(#8b0000, #660000)';
        const btnBorder = isVictory ? '#ffd700' : '#aa0000';
        
        const portraitHtml = npcImage 
            ? `<img src="${npcImage}" alt="${npcName}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;border:3px solid ${borderColor};" onerror="this.outerHTML='<div class=\\'boss-dialog-portrait\\'>${emoji}</div>'">`
            : `<div class="boss-dialog-portrait">${emoji}</div>`;
        
        const overlay = document.createElement('div');
        overlay.className = 'boss-dialog-modal';
        
        overlay.innerHTML = `
            <div class="boss-dialog-content">
                ${portraitHtml}
                <div class="boss-dialog-box" style="border-color: ${borderColor}; box-shadow: 0 0 30px ${borderColor}40;">
                    <div class="boss-dialog-name" style="color: ${nameColor};">${npcName}</div>
                    <div class="boss-dialog-text">${lines[currentLine]}</div>
                </div>
                <div class="boss-dialog-continue" style="background: ${btnBg}; border-color: ${btnBorder};" onclick="continueSparResultDialog()">
                    ${currentLine < lines.length - 1 ? '▶ 다음' : '✔ 확인'}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        currentLine++;
        
        window.continueSparResultDialog = function() {
            showNextSparLine();
        };
    }
    
    showNextSparLine();
}

/**
 * 대련 결과 오버레이를 닫습니다 (하위 호환용)
 */
function closeSparResultOverlay() {
    const overlay = document.querySelector('.spar-result-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
    const dialog = document.querySelector('.boss-dialog-modal');
    if (dialog) dialog.remove();
}

/**
 * 게임오버 화면을 표시합니다.
 */
function showGameOverScreen() {
    // 전투 전 상태 백업 (battleState 초기화 전에 저장)
    const preBattleHp = battleState.preBattleHp || 0;
    const preBattleMp = battleState.preBattleMp || 0;
    const preBattleLocationId = battleState.preBattleLocationId || null;
    const preBattleMapId = battleState.preBattleMapId || null;
    
    // 재도전 가능 여부 확인 (player.retryEnabled 또는 전역 retryEnabled 변수 둘 다 확인)
    const isRetryEnabled = (player && player.retryEnabled === true) || 
                           (typeof retryEnabled !== 'undefined' && retryEnabled === true);

    // 전투 상태 초기화
    battleState = {
        inBattle: false,
        turn: 'player',
        currentMonster: null,
        monsters: [],
        currentMonsterIndex: 0,
        isDefending: false,
        canEscape: true,
        turnCount: 0,
        isSpar: false,
        sparNpc: null,
        sparBackground: null
    };

    // 전투 UI 숨기기
    hideBattleUI();

    // 게임 데이터 저장 (게임오버 화면에서 사용)
    const playTimeStr = (typeof getPlayTime === 'function') ? getPlayTime().formatted : '00:00:00';
    const gameOverData = {
        playerName: player ? player.name : '모험가',
        level: player ? player.level : 1,
        job: player?.jobData?.name || '모험가',
        playTime: playTimeStr,
        gold: gold || 0,
        lastLocation: player?.lastDefeat?.locationName || '알 수 없는 장소',
        lastMonster: player?.lastDefeat?.monster || '알 수 없는 적',
        retryEnabled: isRetryEnabled
    };
    
    // sessionStorage에 게임오버 데이터 저장
    sessionStorage.setItem('gameOverData', JSON.stringify(gameOverData));
    
    // 재도전 처리
    if (isRetryEnabled) {
        // 재도전 가능: 전투 전 상태로 복귀할 세이브 데이터 생성
        try {
            // 전투 전 HP/MP로 복원
            player.hp = preBattleHp;
            player.mp = preBattleMp;
            
            // 상태이상 제거
            player.statusEffects = {};
            
            // 모든 활성 버프 제거 (소모 아이템으로 얻은 일시적 버프 포함)
            if (player.activeBuffs) player.activeBuffs = {};
            
            // 일시적 버프로 인한 스탯 보너스 초기화
            if (player.tempBuffStats) player.tempBuffStats = {};
            
            // 패배한 맵의 입구로 이동 (전투 위치가 아닌 맵 입구에서 재시작)
            if (preBattleMapId && typeof currentMapId !== 'undefined') {
                currentMapId = preBattleMapId;
            }
            if (typeof currentLocationId !== 'undefined') {
                // 해당 맵의 기본 위치(entrance)로 설정
                const retryMap = (typeof MAPS !== 'undefined' && preBattleMapId) ? MAPS[preBattleMapId] : null;
                currentLocationId = (retryMap && retryMap.defaultLocation) ? retryMap.defaultLocation : 'entrance';
            }
            
            // 시간 7시간 경과
            if (typeof addGameTime === 'function') {
                addGameTime(7 * 60); // 420분 추가
            } else if (typeof gameTime !== 'undefined') {
                gameTime += 7 * 60;
            }
            
            // 현재 상태 기반으로 세이브 데이터 수집
            // (전투 중 사용한 소모품은 이미 차감된 상태이므로 그대로 반영됨)
            if (typeof collectSaveData === 'function') {
                const retryData = collectSaveData();
                sessionStorage.setItem('retryData', JSON.stringify(retryData));
                console.log('💾 재도전 데이터 저장 완료 (소모품 차감, 버프 제거 반영)');
            }
        } catch (e) {
            console.error('❌ 재도전 데이터 생성 실패:', e);
        }
    } else {
        // 재도전 불가: 로컬스토리지 + 서버 세이브 데이터 모두 삭제
        if (typeof deleteAllSaves === 'function') {
            deleteAllSaves();
            console.log('🗑️ 재도전 불가 - 로컬+서버 세이브 데이터 삭제');
        }
    }
    
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

    // 전투 상태 초기화 (대련 패배 후 재대련 가능하도록)
    battleState = {
        inBattle: false,
        turn: 'player',
        currentMonster: null,
        monsters: [],
        currentMonsterIndex: 0,
        isDefending: false,
        canEscape: true,
        turnCount: 0,
        isSpar: false,
        sparNpc: null,
        sparBackground: null
    };

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
        messageDiv.innerHTML = `${reviveTimeHours}시간 후...<br><br> 휴식처에서 눈을 떴다.`;
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
    addGameLog(`⚔️ ${player.name}의 공격! ${getMonsterNameWithColor(targetMonster)}에게 ${damage} 데미지!`);

    // 상급교관 2페이즈 체크 (HP 30% 이하 시 강화)
    checkSeniorInstructorPhase2(targetMonster);

    // 2페이즈 전환 중이면 대화 완료 후 턴이 자동 진행됨
    if (battleState.phase2Transitioning) {
        updateBattleUI();
        return;
    }

    if (targetMonster.hp <= 0) {
        targetMonster.hp = 0;
        addGameLog(`💀 ${getMonsterNameWithColor(targetMonster)}을(를) 처치했습니다!`);
        
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
            addGameLog(`⚡ ${skill.name} ${i + 1}타! ${getMonsterNameWithColor(targetMonster)}에게 ${damage} ${damageType === 'magical' ? '마법' : '물리'} 데미지!`);
        }
    }

    if (attackCount === 1) {
        addGameLog(`⚡ ${player.name}의 ${skill.name}! ${getMonsterNameWithColor(targetMonster)}에게 ${totalDamage} ${damageType === 'magical' ? '마법' : '물리'} 데미지!`);
    } else {
        addGameLog(`💥 총 ${totalDamage} 데미지!`);
    }

    // 상태이상 적용 (적이 살아있을 때만)
    if (skill.effects?.statusEffect && targetMonster.hp > 0) {
        applyStatusEffect(targetMonster, skill.effects.statusEffect, skill.effects.statusDuration, totalDamage);
    }

    // 상급교관 2페이즈 체크 (스킬 공격 후에도 체크)
    checkSeniorInstructorPhase2(targetMonster);

    // 2페이즈 전환 중이면 대화 완료 후 턴이 자동 진행됨
    if (battleState.phase2Transitioning) {
        updateBattleUI();
        return;
    }

    if (targetMonster.hp <= 0) {
        targetMonster.hp = 0;
        addGameLog(`💀 ${getMonsterNameWithColor(targetMonster)}을(를) 처치했습니다!`);
        
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

    // 사망한 대상에게는 상태이상을 적용하지 않음
    if (target.hp <= 0) {
        return;
    }

    // 상태이상 저장 (battleIndex를 사용하여 고유 식별)
    if (!battleState.monsterStatusEffects) battleState.monsterStatusEffects = {};
    
    // 고유 식별자 생성: battleIndex 사용 (없으면 이름+인덱스 조합)
    const monsterId = target.battleIndex !== undefined 
        ? `monster_${target.battleIndex}` 
        : target.name;
    
    if (!battleState.monsterStatusEffects[monsterId]) {
        battleState.monsterStatusEffects[monsterId] = {};
    }

    // 대상에게 monsterId 저장 (나중에 참조용)
    target.statusEffectId = monsterId;

    battleState.monsterStatusEffects[monsterId][effectId] = {
        duration: duration,
        damage: damage  // 화상용 피해량 저장
    };

    addGameLog(`${effect.icon} ${getMonsterNameWithColor(target)}에게 ${effect.name} 상태이상 부여! (${duration}턴)`);
}

/**
 * 몬스터의 상태이상 효과를 처리합니다. (턴마다 호출)
 */
function processMonsterStatusEffects(monster) {
    // 고유 식별자 사용
    const monsterId = monster.statusEffectId || 
        (monster.battleIndex !== undefined ? `monster_${monster.battleIndex}` : monster.name);
    
    if (!battleState.monsterStatusEffects || !battleState.monsterStatusEffects[monsterId]) {
        return;
    }

    const effects = battleState.monsterStatusEffects[monsterId];
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
                addGameLog(`🩸 ${getMonsterNameWithColor(monster)}이(가) 출혈로 ${damage} 피해!`);
                break;

            case 'burn': // 화상: 받은 피해의 20% 마법 피해
                damage = Math.max(1, Math.round(effectData.damage * (effectInfo.effects.damagePercent / 100)));
                monster.hp -= damage;
                addGameLog(`🔥 ${getMonsterNameWithColor(monster)}이(가) 화상으로 ${damage} 피해!`);
                break;

            case 'confusion': // 혼란: 특별한 턴 효과 없음 (공격 시 적용)
                addGameLog(`😵 ${getMonsterNameWithColor(monster)}은(는) 혼란 상태!`);
                break;

            case 'shock': // 감전: 최대HP의 8% 마법 피해 + 15% 확률로 인접 몬스터에 스플래시
                damage = Math.max(1, Math.round(monster.maxHp * 0.08));
                monster.hp -= damage;
                addGameLog(`⚡ ${getMonsterNameWithColor(monster)}이(가) 감전으로 ${damage} 마법 피해!`);
                // 15% 확률로 인접 몬스터에 스플래시 피해
                if (Math.random() < 0.15 && battleState.monsters) {
                    const otherMonsters = battleState.monsters.filter(m => m !== monster && m.hp > 0);
                    const splashTargets = otherMonsters.slice(0, 2); // 인접 2명까지
                    splashTargets.forEach(target => {
                        const splashDamage = Math.max(1, Math.floor(damage * 0.5));
                        target.hp -= splashDamage;
                        if (target.hp < 0) target.hp = 0;
                        addGameLog(`⚡ 감전 스플래시! ${getMonsterNameWithColor(target)}에게 ${splashDamage} 마법 피해!`);
                    });
                }
                break;

            case 'stun': // 기절: 턴 스킵
                addGameLog(`💫 ${getMonsterNameWithColor(monster)}은(는) 기절 상태! 행동 불가!`);
                monster._stunned = true; // 턴 스킵 플래그
                break;
        }

        // 지속시간 감소
        effectData.duration--;

        if (effectData.duration <= 0) {
            effectsToRemove.push(effectId);
            addGameLog(`💨 ${getMonsterNameWithColor(monster)}의 ${effectInfo.name} 효과가 사라졌다!`);
        }

        // 상태이상으로 처치 확인
        if (monster.hp <= 0) {
            monster.hp = 0;
            addGameLog(`💀 ${getMonsterNameWithColor(monster)}을(를) 처치했습니다!`);
            
            // 해당 몬스터의 상태이상 효과 모두 제거
            delete battleState.monsterStatusEffects[monsterId];
            
            // 다음 생존 몬스터로 자동 타겟 변경
            selectNextAliveMonster();
            updateBattleUI();
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
    
    // 고유 식별자 사용
    const monsterId = monster.statusEffectId || 
        (monster.battleIndex !== undefined ? `monster_${monster.battleIndex}` : monster.name);
    
    const effects = battleState.monsterStatusEffects[monsterId];
    if (!effects || !effects.confusion) return false;
    
    return effects.confusion.duration > 0;
}

/**
 * 몬스터 공격 후 상태이상 처리 (피해 및 지속시간 감소)
 */
function processMonsterStatusEffectsAfterAttack(monster) {
    if (!battleState.monsterStatusEffects) return;
    
    // 고유 식별자 사용
    const monsterId = monster.statusEffectId || 
        (monster.battleIndex !== undefined ? `monster_${monster.battleIndex}` : monster.name);
    
    const effects = battleState.monsterStatusEffects[monsterId];
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
                addGameLog(`🩸 ${getMonsterNameWithColor(monster)}이(가) 출혈로 ${damage} 피해!`);
                break;

            case 'burn': // 화상: 받은 피해의 20% 마법 피해
                damage = Math.max(1, Math.round(effectData.damage * (effectInfo.effects.damagePercent / 100)));
                monster.hp -= damage;
                addGameLog(`🔥 ${getMonsterNameWithColor(monster)}이(가) 화상으로 ${damage} 피해!`);
                break;

            case 'confusion': // 혼란: 공격 후 지속시간 감소
                // 공격 후에 지속시간 감소 (공격을 했으므로)
                break;
        }

        // 지속시간 감소 (공격 후)
        effectData.duration--;

        if (effectData.duration <= 0) {
            effectsToRemove.push(effectId);
            addGameLog(`💨 ${getMonsterNameWithColor(monster)}의 ${effectInfo.name} 효과가 사라졌다!`);
        }

        // 상태이상으로 처치 확인
        if (monster.hp <= 0) {
            monster.hp = 0;
            addGameLog(`💀 ${getMonsterNameWithColor(monster)}을(를) 처치했습니다!`);
            
            // 해당 몬스터의 상태이상 효과 모두 제거
            delete battleState.monsterStatusEffects[monsterId];
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
 * - 훈련장: 대련 제외 100% 도주
 * - 일반 맵: 기본 80% + 민첩 5당 +1%
 * - 대련, 보스방, 특수방: 도주 불가
 */
function doBattleEscape() {
    if (!battleState.inBattle || battleState.turn !== 'player') return;

    // 대련 중일 경우 도주 불가
    if (battleState.isSpar) {
        addGameLog('🚫 대련 중에는 도망칠 수 없습니다!');
        return;
    }

    // 도주 불가 지역 체크 (보스방, 특수방 등)
    if (!battleState.canEscape) {
        addGameLog('🚫 이 전투에서는 도망칠 수 없습니다!');
        return;
    }

    // 도주 확률 계산
    let escapeChance = calculateEscapeChance();
    const roll = Math.random() * 100;

    if (roll < escapeChance) {
        addGameLog(`🏃 도주 성공! (확률: ${escapeChance.toFixed(0)}%)`);
        endBattle('escape');
    } else {
        addGameLog(`🏃 도주 실패! (확률: ${escapeChance.toFixed(0)}%)`);
        endPlayerTurn();
    }
}

/**
 * 도주 확률을 계산합니다.
 * @returns {number} 도주 확률 (0~100)
 */
function calculateEscapeChance() {
    // 현재 맵 확인
    const currentMapId = player.currentMap || 'training';
    
    // 훈련장일 경우 100% 도주 (대련 제외 - 대련은 위에서 이미 체크)
    if (currentMapId === 'training') {
        return 100;
    }
    
    // 기본 도주 확률 80%
    let baseChance = 80;
    
    // 민첩 스탯 보너스: 5당 +1%
    const agility = player.agility || 0;
    const agilityBonus = Math.floor(agility / 5);
    
    // 신속 특성 보너스 (도적)
    let traitBonus = 0;
    if (player.trait === 'swift') {
        traitBonus = 10; // 신속 특성: +10% 도주 확률
    }
    
    // 최종 도주 확률 (최대 100%)
    let finalChance = baseChance + agilityBonus + traitBonus;
    return Math.min(100, finalChance);
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
        
        // ★ 턴 시작 시 상태이상 처리 (출혈, 화상 등) - 공격 전에 처리
        processMonsterStatusEffects(monster);
        
        // 상태이상으로 몬스터가 사망한 경우 → 공격 건너뜀
        if (monster.hp <= 0) {
            updateBattleUI();
            // 모든 몬스터 사망 여부 확인
            const remainingAlive = battleState.monsters.filter(m => m.hp > 0);
            if (remainingAlive.length === 0) {
                setTimeout(() => endBattle('victory'), 500);
                return;
            }
            // 다음 몬스터 공격으로 진행
            attackIndex++;
            if (attackIndex < aliveMonsters.length) {
                setTimeout(nextMonsterAttack, 500);
            } else {
                finishMonsterTurn();
            }
            return;
        }
        
        // 자가수복 특성 처리: 매 턴당 최대HP의 3% 회복
        if (monster.traits && monster.traits.includes('self_repair') && monster.hp < monster.maxHp) {
            const healAmount = Math.floor(monster.maxHp * 0.03);
            const actualHeal = Math.min(healAmount, monster.maxHp - monster.hp);
            monster.hp += actualHeal;
            addGameLog(`🔧 ${monster.name}의 자가수복! HP +${actualHeal} 회복!`);
            updateBattleUI();
        }
        
        // 대련 몬스터인 경우 턴당 MP 회복 및 AI 행동 결정
        if (monster.isSpar && monster.aiPattern) {
            // 턴당 MP 3% 회복
            const mpRegen = Math.floor((monster.maxMp || 0) * (monster.aiPattern.mpRegenPercent || 3) / 100);
            monster.currentMp = Math.min(monster.currentMp + mpRegen, monster.maxMp || 0);
            
            // 대련 몬스터 특성 처리: 신속 (swift) - 첫 턴 2회 행동
            if (monster.trait === 'swift') {
                if (!monster.traitState) monster.traitState = {};
                
                // 첫 턴(또는 10턴 쿨타임 후)에 2회 행동
                const swiftCooldown = monster.traitState.swiftCooldown || 0;
                if (battleState.turnCount === 1 || (swiftCooldown <= 0 && !monster.traitState.swiftUsedFirst)) {
                    if (!monster.traitState.swiftActive) {
                        monster.traitState.swiftActive = true;
                        monster.traitState.swiftActionsLeft = 2;
                        monster.traitState.swiftUsedFirst = true;
                        addGameLog(`💨 ${monster.name}의 신속 발동! 이번 턴에 2회 행동!`);
                    }
                }
                
                // 쿨다운 감소
                if (monster.traitState.swiftCooldown > 0) {
                    monster.traitState.swiftCooldown--;
                }
            }
            
            // 대련 몬스터 특성 처리: 명상 (meditation) - 매 턴 MP 2% 추가 회복
            if (monster.trait === 'meditation') {
                const meditationRegen = Math.ceil((monster.maxMp || 0) * 0.02);
                monster.currentMp = Math.min(monster.currentMp + meditationRegen, monster.maxMp || 0);
                if (meditationRegen > 0) {
                    addGameLog(`🧘 ${monster.name}의 명상 효과: MP +${meditationRegen} 회복`);
                }
            }
            
            // 대련 몬스터 AI 행동 실행 함수
            function executeSparAction() {
                // AI 행동 결정 (일반공격 60%, 스킬 30%, 방어 10%)
                const actionRoll = Math.random() * 100;
                const attackChance = monster.aiPattern.attack || 60;
                const skillChance = monster.aiPattern.skill || 30;
                
                if (actionRoll < attackChance) {
                    executeSparAttack(monster);
                } else if (actionRoll < attackChance + skillChance) {
                    if (!tryUseSparSkill(monster)) {
                        if (Math.random() < 0.7) {
                            executeSparAttack(monster);
                        } else {
                            executeSparDefend(monster);
                        }
                    }
                } else {
                    executeSparDefend(monster);
                }
            }
            
            // 신속 특성 2회 행동 처리
            if (monster.traitState?.swiftActive && monster.traitState.swiftActionsLeft > 0) {
                executeSparAction();
                monster.traitState.swiftActionsLeft--;
                
                // 플레이어 HP 0이면 중단
                if (player.hp <= 0) {
                    // 2회차 행동 취소
                    monster.traitState.swiftActive = false;
                } else if (monster.traitState.swiftActionsLeft > 0) {
                    // 추가 행동 (2번째)
                    addGameLog(`💨 ${monster.name}의 신속: 추가 행동! (남은 행동: ${monster.traitState.swiftActionsLeft})`);
                    // 짧은 딜레이 후 추가 행동
                    setTimeout(() => {
                        executeSparAction();
                        monster.traitState.swiftActionsLeft--;
                        if (monster.traitState.swiftActionsLeft <= 0) {
                            monster.traitState.swiftActive = false;
                            monster.traitState.swiftCooldown = 10; // 10턴 쿨다운
                        }
                        updateBattleUI();
                        
                        // 플레이어 HP 확인
                        if (player.hp <= 0) {
                            player.hp = 0;
                            updateBattleUI();
                            setTimeout(() => endBattle('defeat'), 500);
                            return;
                        }
                        
                        attackIndex++;
                        if (attackIndex < aliveMonsters.length) {
                            setTimeout(nextMonsterAttack, 500);
                        } else {
                            finishMonsterTurn();
                        }
                    }, 400);
                    return; // 비동기 처리이므로 여기서 리턴
                } else {
                    monster.traitState.swiftActive = false;
                    monster.traitState.swiftCooldown = 10;
                }
            } else {
                executeSparAction();
            }
        } else {
            // 기존 몬스터 공격 로직
            // 회피 체크
            const evasionRoll = Math.random() * 100;
            if (evasionRoll < (player.evasion || 0)) {
                addGameLog(`💫 ${player.name}이(가) ${getMonsterNameWithColor(monster)}의 공격을 회피했다!`);
            } else {
                // 몬스터 공격 (피해 타입 적용)
                // 혼란 상태면 calculateMonsterDamage에서 데미지 배수가 감소됨
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
                addGameLog(`👹 ${getMonsterNameWithColor(monster)}의 ${damageType === 'magical' ? '마법 ' : ''}공격! ${damage} 데미지!`);
            }
        }
        
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

    // 대련 몬스터 버프 지속시간 감소 처리
    const monsters = battleState.monsters || [];
    monsters.forEach(monster => {
        if (monster.hp <= 0 || !monster.activeBuffs) return;
        
        const expiredBuffs = [];
        Object.entries(monster.activeBuffs).forEach(([buffId, buff]) => {
            buff.duration--;
            if (buff.duration <= 0) {
                expiredBuffs.push(buffId);
                // 버프 종료 시 공격력 보너스 제거
                if (buff.pAtkFlat || buff.pAtkBonus) {
                    monster.pAtk = Math.max(0, (monster.pAtk || 0) - (buff.pAtkFlat || buff.pAtkBonus || 0));
                }
                addGameLog(`💨 ${monster.name}의 ${buff.name} 효과가 종료되었다!`);
            }
        });
        
        // 만료된 버프 제거
        expiredBuffs.forEach(buffId => {
            delete monster.activeBuffs[buffId];
        });
        
        // 스킬 쿨다운 감소
        if (monster.cooldowns) {
            Object.keys(monster.cooldowns).forEach(skillId => {
                if (monster.cooldowns[skillId] > 0) {
                    monster.cooldowns[skillId]--;
                }
            });
        }
    });

    updateBattleUI();

    // 다음 턴 - 자연회복 적용
    battleState.turn = 'player';
    battleState.turnCount++;

    // 턴 시작 시 HP/MP 자연회복
    applyNaturalRegen();

    // 특성 효과 적용 (턴 시작 시)
    processTraitEffectsOnTurnStart();

    addGameLog(`--- 턴 ${battleState.turnCount} ---`);

    // 버튼 활성화
    enableBattleButtons(true);
}

// ============================================
// ⚔️ 대련 AI 시스템
// ============================================

/**
 * 대련 몬스터의 일반 공격을 실행합니다.
 */
function executeSparAttack(monster) {
    // 회피 체크
    const evasionRoll = Math.random() * 100;
    if (evasionRoll < (player.evasion || 0)) {
        addGameLog(`💫 ${player.name}이(가) ${monster.name}의 공격을 회피했다!`);
        updateBattleUI();
        return;
    }

    // 공격력 계산
    const damageType = monster.damageType || 'physical';
    const atk = damageType === 'magical' ? (monster.mAtk || monster.pAtk || 20) : (monster.pAtk || monster.atk || 20);
    const def = damageType === 'magical' ? 
        (player.mDef || 0) + (player.bonusMDef || 0) : 
        (player.pDef || 0) + (player.bonusPDef || 0);
    
    let damage = Math.max(1, atk - Math.floor(def * 0.5));
    
    // 방어 중이면 데미지 감소
    if (battleState.isDefending) {
        damage = Math.max(1, Math.floor(damage * 0.4));
        addGameLog(`🛡️ 방어로 피해 감소!`);
    }
    
    // 투지의 검 버프 공격력 보정 적용
    if (monster.activeBuffs) {
        Object.values(monster.activeBuffs).forEach(buff => {
            if (buff.pAtkPercent) {
                damage = Math.ceil(damage * (1 + buff.pAtkPercent / 100));
            }
        });
    }

    player.hp -= damage;
    if (player.hp < 0) player.hp = 0;
    
    addGameLog(`⚔️ ${monster.name}의 ${damageType === 'magical' ? '마법 ' : ''}공격! ${damage} 데미지!`);
    
    // 투지의 검 흡혈 효과 (가한 피해의 10% HP 회복, 최대HP 초과 불가)
    if (monster.activeBuffs) {
        Object.values(monster.activeBuffs).forEach(buff => {
            if (buff.lifestealPercent && buff.lifestealPercent > 0) {
                const healAmount = Math.floor(damage * buff.lifestealPercent / 100);
                if (healAmount > 0) {
                    monster.hp = Math.min(monster.maxHp, (monster.hp || 0) + healAmount);
                    addGameLog(`💚 ${monster.name}이(가) ${buff.name} 효과로 HP ${healAmount} 회복!`);
                }
            }
        });
    }
    
    updateBattleUI();
}

/**
 * 대련 몬스터의 스킬 사용을 시도합니다.
 * @returns {boolean} 스킬 사용 성공 여부
 */
function tryUseSparSkill(monster) {
    if (!monster.skills || monster.skills.length === 0) return false;
    
    // 사용 가능한 스킬 찾기 (MP, 쿨타임 체크)
    const availableSkills = [];
    
    monster.skills.forEach(skillId => {
        const skill = SKILLS ? SKILLS[skillId] : null;
        if (!skill) return;
        
        // 쿨타임 체크
        if (monster.cooldowns && monster.cooldowns[skillId] > 0) return;
        
        // MP 체크
        const mpCost = skill.mpCost || 0;
        if ((monster.currentMp || 0) < mpCost) return;
        
        availableSkills.push({ skillId, skill });
    });
    
    if (availableSkills.length === 0) return false;
    
    // 랜덤 스킬 선택
    const selected = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    const { skillId, skill } = selected;
    
    // MP 소모
    monster.currentMp -= (skill.mpCost || 0);
    
    // 쿨타임 설정
    if (!monster.cooldowns) monster.cooldowns = {};
    monster.cooldowns[skillId] = skill.cooldown || 0;
    
    // 버프형 스킬 처리 (투지의 검 등)
    if (skill.damageType === 'buff') {
        addGameLog(`🗡️ ${monster.name}의 ${skill.name} 스킬 발동!`);
        
        // 버프 효과 적용
        if (!monster.activeBuffs) monster.activeBuffs = {};
        monster.activeBuffs[skillId] = {
            name: skill.name,
            duration: skill.effects?.buffDuration || 3,
            pAtkFlat: skill.effects?.pAtkFlat || 0,
            pAtkPercent: skill.effects?.pAtkPercent || 0,
            lifestealPercent: skill.effects?.lifestealPercent || 0,
            noTurnEndChance: skill.effects?.noTurnEndChance || 0
        };
        
        // 물리공격력 보너스 즉시 적용
        if (skill.effects?.pAtkFlat) {
            monster.pAtk = (monster.pAtk || 0) + skill.effects.pAtkFlat;
        }
        
        updateBattleUI();
        return true;
    }
    
    // 데미지형 스킬 처리
    const damageType = skill.damageType || monster.damageType || 'physical';
    const atk = damageType === 'magical' ? (monster.mAtk || 20) : (monster.pAtk || monster.atk || 20);
    const damageMultiplier = skill.damageMultiplier || 1.5;
    const baseDamage = Math.floor(atk * damageMultiplier);
    
    // 회피 체크
    const evasionRoll = Math.random() * 100;
    if (evasionRoll < (player.evasion || 0)) {
        addGameLog(`💫 ${player.name}이(가) ${monster.name}의 ${skill.name}을(를) 회피했다!`);
        updateBattleUI();
        return true;
    }
    
    const def = damageType === 'magical' ? 
        (player.mDef || 0) + (player.bonusMDef || 0) : 
        (player.pDef || 0) + (player.bonusPDef || 0);
    
    let damage = Math.max(1, baseDamage - Math.floor(def * 0.5));
    
    // 방어 중이면 데미지 감소
    if (battleState.isDefending) {
        damage = Math.max(1, Math.floor(damage * 0.4));
    }
    
    // 투지의 검 버프 공격력 보정 적용
    if (monster.activeBuffs) {
        Object.values(monster.activeBuffs).forEach(buff => {
            if (buff.pAtkPercent) {
                damage = Math.ceil(damage * (1 + buff.pAtkPercent / 100));
            }
        });
    }
    
    player.hp -= damage;
    if (player.hp < 0) player.hp = 0;
    
    addGameLog(`🌟 ${monster.name}의 ${skill.name}! ${damage} ${damageType === 'magical' ? '마법' : '물리'} 데미지!`);
    
    // 스킬의 상태이상 효과 적용 (감전, 화상 등)
    if (skill.effects?.statusEffect) {
        const statusEffectId = skill.effects.statusEffect;
        const statusDuration = skill.effects.statusDuration || 1;
        const statusChance = skill.effects.statusChance || 100; // 기본 100% (gameData에 별도 정의 없으면)
        const effectInfo = typeof STATUS_EFFECTS !== 'undefined' ? STATUS_EFFECTS[statusEffectId] : null;
        if (effectInfo) {
            // 상태이상 적용 (플레이어에게)
            if (!player.statusEffects) player.statusEffects = {};
            player.statusEffects[statusEffectId] = {
                duration: statusDuration,
                damage: damage
            };
            addGameLog(`${effectInfo.icon} ${player.name}에게 ${effectInfo.name} 상태이상 부여! (${statusDuration}턴)`);
        }
    }
    
    // 투지의 검 흡혈 효과 (가한 피해의 10% HP 회복)
    if (monster.activeBuffs) {
        Object.values(monster.activeBuffs).forEach(buff => {
            if (buff.lifestealPercent && buff.lifestealPercent > 0) {
                const healAmount = Math.floor(damage * buff.lifestealPercent / 100);
                if (healAmount > 0) {
                    monster.hp = Math.min(monster.maxHp, (monster.hp || 0) + healAmount);
                    addGameLog(`💚 ${monster.name}이(가) ${buff.name} 효과로 HP ${healAmount} 회복!`);
                }
            }
        });
    }
    
    updateBattleUI();
    
    return true;
}

/**
 * 대련 몬스터의 방어를 실행합니다.
 */
function executeSparDefend(monster) {
    // 방어 시 다음 공격 데미지 감소 (임시 효과)
    monster.isDefending = true;
    addGameLog(`🛡️ ${monster.name}이(가) 방어 자세를 취했다!`);
    updateBattleUI();
}

// ============================================
// 🌟 특성 시스템
// ============================================

/**
 * 턴 시작 시 특성 효과를 처리합니다.
 */
function processTraitEffectsOnTurnStart() {
    if (!player.trait || typeof TRAITS === 'undefined') return;
    
    const trait = TRAITS[player.trait];
    if (!trait) return;

    // 명상 (마법사): 매 턴 MP 2% 회복
    if (player.trait === 'meditation') {
        const mpRegen = Math.ceil(player.maxMp * (trait.effects.mpRegenPercent / 100));
        const oldMp = player.mp;
        player.mp = Math.min(player.maxMp, player.mp + mpRegen);
        if (player.mp > oldMp) {
            addGameLog(`🧘 명상 효과: MP +${player.mp - oldMp} 회복`);
        }
    }

    // 신속 (도적): 첫 턴 2회 행동, 10턴마다 재사용
    if (player.trait === 'swift') {
        if (!player.traitState) player.traitState = { cooldown: 0 };
        
        // 쿨다운 감소
        if (player.traitState.cooldown > 0) {
            player.traitState.cooldown--;
        }
        
        // 첫 턴 또는 쿨다운 종료 시 2회 행동 활성화
        if (battleState.turnCount === 1 || (player.traitState.cooldown === 0 && battleState.turnCount > 1)) {
            if (!player.traitState.usedThisBattle) {
                player.traitState.doubleAction = true;
                player.traitState.actionsLeft = 2;
                player.traitState.usedThisBattle = true;
                addGameLog(`💨 신속 발동! 이번 턴에 2회 행동 가능!`);
            }
        }
    }

    // 불굴 특성 상태 체크 (HP 30% 이하 확인)
    checkUnyieldingTrait();

    // 불굴 지속시간 감소
    if (player.trait === 'unyielding' && player.traitState?.active) {
        player.traitState.duration--;
        if (player.traitState.duration <= 0) {
            player.traitState.active = false;
            player.traitState.cooldown = trait.effects.cooldown || 5;
            addGameLog(`🔥 불굴 효과가 종료되었습니다. (쿨타임 ${player.traitState.cooldown}턴)`);
        }
    }

    // 불굴 쿨다운 감소
    if (player.trait === 'unyielding' && !player.traitState?.active && player.traitState?.cooldown > 0) {
        player.traitState.cooldown--;
    }
}

/**
 * 불굴 특성 발동 여부를 체크합니다.
 */
function checkUnyieldingTrait() {
    if (player.trait !== 'unyielding' || typeof TRAITS === 'undefined') return;
    
    const trait = TRAITS.unyielding;
    if (!trait) return;
    
    if (!player.traitState) player.traitState = { active: false, duration: 0, cooldown: 0 };
    
    // 이미 활성화되어 있거나 쿨다운 중이면 패스
    if (player.traitState.active || player.traitState.cooldown > 0) return;
    
    // HP 30% 이하 확인
    const hpPercent = (player.hp / player.maxHp) * 100;
    if (hpPercent <= trait.effects.hpThreshold) {
        player.traitState.active = true;
        player.traitState.duration = trait.effects.duration || 4;
        addGameLog(`🔥 불굴 발동! ${player.traitState.duration}턴간 피해 -10%, 공격력 +10%!`);
    }
}

/**
 * 불굴 특성에 의한 피해 보정을 계산합니다.
 * @param {number} damage - 원래 피해량
 * @param {boolean} isPlayerDealing - 플레이어가 가하는 피해인지 여부
 * @returns {number} - 보정된 피해량
 */
function applyUnyieldingDamageModifier(damage, isPlayerDealing) {
    if (player.trait !== 'unyielding' || !player.traitState?.active) return damage;
    
    const trait = TRAITS?.unyielding;
    if (!trait) return damage;
    
    if (isPlayerDealing) {
        // 가하는 피해 10% 증가
        return Math.ceil(damage * (1 + trait.effects.damageBonus / 100));
    } else {
        // 받는 피해 10% 감소
        return Math.ceil(damage * (1 - trait.effects.damageReduction / 100));
    }
}

/**
 * 매의 눈 특성에 의한 회피율 보정을 계산합니다.
 * @param {number} evasion - 상대 회피율
 * @returns {number} - 보정된 회피율
 */
function applyHawksEyeEvasionModifier(evasion) {
    if (player.trait !== 'hawks_eye' || typeof TRAITS === 'undefined') return evasion;
    
    const trait = TRAITS.hawks_eye;
    if (!trait) return evasion;
    
    // 상대 회피율 30% 무시
    const reduction = evasion * (trait.effects.evasionPenetration / 100);
    return Math.max(0, evasion - reduction);
}

/**
 * 신속 특성: 행동 후 추가 행동 가능 여부 확인
 * @returns {boolean} - 추가 행동 가능 여부
 */
function checkSwiftExtraAction() {
    if (player.trait !== 'swift') return false;
    if (!player.traitState?.doubleAction) return false;
    
    player.traitState.actionsLeft--;
    
    if (player.traitState.actionsLeft > 0) {
        addGameLog(`💨 신속: 추가 행동 가능! (남은 행동: ${player.traitState.actionsLeft})`);
        return true;
    } else {
        player.traitState.doubleAction = false;
        player.traitState.cooldown = TRAITS?.swift?.effects?.cooldown || 10;
        return false;
    }
}

/**
 * 전투 시작 시 특성 상태를 초기화합니다.
 */
function resetTraitStateForBattle() {
    if (!player.traitState) player.traitState = {};
    
    player.traitState.active = false;
    player.traitState.duration = 0;
    player.traitState.doubleAction = false;
    player.traitState.actionsLeft = 0;
    player.traitState.usedThisBattle = false;
    // 쿨다운은 전투 간에도 유지
}

/**
 * 플레이어 턴을 종료합니다.
 */
function endPlayerTurn() {
    console.log('🔄 endPlayerTurn 호출');

    // 신속 특성: 추가 행동이 있으면 턴을 넘기지 않음
    if (checkSwiftExtraAction()) {
        updateBattleUI();
        return;
    }

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
 * 일반공격: 0.6~2배, 스킬: 0.7~2.5배
 * 정확도 스탯이 높을수록 높은 배수 확률 증가
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

    // 배수 계산 (정확도 스탯 적용)
    let minMult, maxMult;
    if (isSkill) {
        minMult = 0.7;
        maxMult = 2.5;
    } else {
        minMult = 0.6;
        maxMult = 2.0;
    }

    // 정확도 스탯으로 배수 확률 조정
    const efficiency = attacker.efficiency || 0;
    let multiplier = minMult + Math.random() * (maxMult - minMult);

    // 정확도가 높을수록 높은 배수가 나올 확률 증가
    if (efficiency > 0) {
        const bonus = (efficiency / 100) * 0.3; // 정확도 1%당 0.3% 배수 바이어스
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

    // 혼란 상태 체크 - 피해 배수 감소
    const isConfused = checkMonsterConfusion(monster);
    
    let multiplier;
    if (isConfused) {
        // 혼란 상태: 0.5~1.5배 (기본 0.6~2.0에서 최솟값 -0.1, 최댓값 -0.5)
        multiplier = 0.5 + Math.random() * 1.0;
        addGameLog(`😵 ${monster.name}은(는) 혼란으로 공격력이 감소!`);
    } else {
        // 정상 상태: 0.6~2.0배
        multiplier = 0.6 + Math.random() * 1.4;
    }
    
    let damage = Math.round(monsterAtk * multiplier);

    // 방어력 적용
    damage = Math.max(1, damage - Math.floor(targetDef * 0.3));

    return Math.max(1, Math.round(damage));
}

/**
 * 난이도 배율을 반환합니다. (구버전 호환용 - 평균값 반환)
 */
function getDifficultyMultiplier() {
    const multipliers = getDifficultyMultipliers();
    return (multipliers.hp + multipliers.atk) / 2;
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

        // 식량/수분 회복
        if (typeof player.hunger !== 'undefined') {
            player.hunger = player.maxHunger || 100;
        }
        if (typeof player.thirst !== 'undefined') {
            player.thirst = player.maxThirst || 100;
        }

        addGameLog(`🎉 레벨 업! Lv.${player.level}! (스탯포인트 +${config.statPoints})`);

        // 레벨 5 도달 시 스킬 습득 체크
        if (player.level === 5) {
            checkLevel5SkillUnlock();
        }

        requiredExp = getRequiredExp(player.level);
    }
}

/**
 * 레벨 5 스킬 해금을 확인합니다.
 */
function checkLevel5SkillUnlock() {
    if (!player.job || typeof JOBS === 'undefined') return;
    
    const jobData = JOBS[player.job];
    if (!jobData || !jobData.level5Skill) return;
    
    const skillId = jobData.level5Skill;
    const skill = typeof SKILLS !== 'undefined' ? SKILLS[skillId] : null;
    
    if (!skill) return;
    
    // 이미 스킬을 보유하고 있는지 확인
    if (!player.skills) player.skills = [];
    if (player.skills.includes(skillId)) return;
    
    // 스킬 추가
    player.skills.push(skillId);
    
    // 스킬 쿨다운 초기화
    if (!player.skillCooldowns) player.skillCooldowns = {};
    player.skillCooldowns[skillId] = 0;
    
    // 게임 로그
    addGameLog(`🎊 <span style="color: #f1c40f; font-weight: bold;">${skill.name} Lv.1</span>을 배웠습니다!`);
    
    // 알림창 표시
    showSkillLearnedModal(skill);
}

/**
 * 스킬 습득 알림창을 표시합니다.
 */
function showSkillLearnedModal(skill) {
    // 기존 모달 제거
    const existingModal = document.getElementById('skillLearnedModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'skillLearnedModal';
    modal.className = 'skill-learned-modal';
    modal.innerHTML = `
        <div class="skill-learned-content">
            <div class="skill-learned-icon">${skill.icon}</div>
            <h2>🎊 새로운 스킬 습득!</h2>
            <div class="skill-learned-name">${skill.name} Lv.1</div>
            <p class="skill-learned-desc">${skill.description}</p>
            <div class="skill-learned-info">
                <span>MP: ${skill.mpCost}</span>
                <span>쿨타임: ${skill.cooldown}턴</span>
            </div>
            <button onclick="closeSkillLearnedModal()" class="skill-learned-btn">확인</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * 스킬 습득 알림창을 닫습니다.
 */
function closeSkillLearnedModal() {
    const modal = document.getElementById('skillLearnedModal');
    if (modal) modal.remove();
}

/**
 * 플레이어 파생 스탯을 재계산합니다.
 */
function recalculatePlayerStats() {
    const r = typeof STATS_CONFIG !== 'undefined' ? STATS_CONFIG.ratios : {
        hpPerVit: 2, hpPerStr: 1/3, mpPerInt: 1,
        pAtkPerStr: 0.5, mAtkPerInt: 0.5,
        pDefPerStr: 1 / 6, pDefPerVit: 0.5,
        mDefPerInt: 1 / 6, mDefPerVit: 0.5,
        efficiencyPerAgi: 1 / 8, evasionPerAgi: 1 / 7, healEffPerVit: 1 / 3
    };

    // 장비 보너스 스탯 포함한 총 스탯 계산
    const totalStr = (player.str || 0) + (player.bonusStr || 0);
    const totalVit = (player.vit || 0) + (player.bonusVit || 0);
    const totalInt = (player.int || 0) + (player.bonusInt || 0);
    const totalAgi = (player.agi || 0) + (player.bonusAgi || 0);

    // HP/MP 계산 (근력 3당 HP +1 추가)
    player.maxHp = (player.baseHp || 30) + Math.round(totalVit * r.hpPerVit) + Math.round(totalStr * (r.hpPerStr || 0)) + (player.bonusHp || 0);
    player.maxMp = (player.baseMp || 15) + Math.round(totalInt * r.mpPerInt) + (player.bonusMp || 0);

    // 공격력/방어력 계산
    player.pAtk = Math.round((player.basePAtk || 1) + totalStr * r.pAtkPerStr);
    player.mAtk = Math.round((player.baseMAtk || 1) + totalInt * r.mAtkPerInt);
    player.pDef = Math.round((player.basePDef || 0) + totalStr * r.pDefPerStr + totalVit * r.pDefPerVit);
    player.mDef = Math.round((player.baseMDef || 0) + totalInt * r.mDefPerInt + totalVit * r.mDefPerVit);

    // 퍼센트 스탯
    player.efficiency = Math.round(totalAgi * r.efficiencyPerAgi);
    player.evasion = Math.round(totalAgi * r.evasionPerAgi);
    player.healEff = Math.round(totalVit * r.healEffPerVit);
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

    // 전투 배경 초기화 (대련 배경 제거)
    const battleArena = document.querySelector('.battle-arena');
    if (battleArena) {
        battleArena.style.backgroundImage = '';
        battleArena.style.backgroundSize = '';
        battleArena.style.backgroundPosition = '';
    }

    // 게임 배경 복원 (대련 배경에서 원래 배경으로)
    const gameBackground = document.getElementById('gameBackground');
    if (gameBackground && battleState._originalBackground) {
        gameBackground.style.backgroundImage = battleState._originalBackground;
        battleState._originalBackground = null;
    } else if (gameBackground && battleState.sparBackground) {
        // 원래 배경 정보가 없으면 위치 기반으로 재적용
        if (typeof updateLocationBackground === 'function') {
            const map = typeof getCurrentMap === 'function' ? getCurrentMap() : null;
            const loc = typeof getCurrentLocation === 'function' ? getCurrentLocation() : null;
            if (map && loc) updateLocationBackground(map, loc);
        }
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
        
        // 등급 정보
        const gradeIcon = monster.gradeData?.icon || '';
        const gradeColor = monster.gradeData?.color || '#FFFFFF';
        const gradeName = monster.gradeData?.name || '일반';
        const gradeDisplay = gradeName !== '일반' ? `${gradeIcon}[${gradeName}] ` : '';
        
        monsterCard.innerHTML = `
            <div class="monster-sprite">${monster.image ? `<img src="${monster.image}" alt="${monster.name}" class="monster-image">` : (monster.emoji || '👹')}</div>
            <div class="monster-info">
                <span class="monster-name" style="color: ${gradeColor}; text-shadow: 0 0 5px ${gradeColor}40;">${gradeDisplay}${monster.name}${isDead ? ' ☠️' : ''}</span>
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
// 🎨 대련 배경 및 상급교관 2페이즈 시스템
// ============================================

/**
 * 전투 배경을 적용합니다.
 * @param {string} imagePath - 배경 이미지 경로
 */
function applyBattleBackground(imagePath) {
    // 전체 게임 배경에 대련 배경 적용 (gameBackground)
    const gameBackground = document.getElementById('gameBackground');
    if (gameBackground) {
        // 기존 배경 저장 (전투 종료 후 복원용)
        if (!battleState._originalBackground) {
            battleState._originalBackground = gameBackground.style.backgroundImage || '';
        }
        gameBackground.style.backgroundImage = `url('${imagePath}')`;
        gameBackground.style.backgroundSize = 'cover';
        gameBackground.style.backgroundPosition = 'center';
        console.log('🎨 대련 배경 적용 (gameBackground):', imagePath);
    }

    // 전투 아레나에도 배경 적용
    const battleArena = document.querySelector('.battle-arena');
    if (battleArena) {
        battleArena.style.backgroundImage = `url('${imagePath}')`;
        battleArena.style.backgroundSize = 'cover';
        battleArena.style.backgroundPosition = 'center';
        battleArena.style.borderRadius = '10px';
    }
    
    // 몬스터 컨테이너에도 배경 투명하게 설정
    const monstersContainer = document.getElementById('monstersContainer');
    if (monstersContainer) {
        monstersContainer.style.backgroundColor = 'transparent';
    }
}

/**
 * 상급교관 2페이즈 전환을 체크하고 처리합니다.
 * @param {Object} monster - 몬스터 객체
 */
function checkSeniorInstructorPhase2(monster) {
    // 상급교관이 아니거나 이미 2페이즈면 스킵
    if (!monster.phase2Config || monster.isPhase2) return;
    
    const hpPercent = monster.hp / monster.maxHp;
    
    // HP 30% 이하 시 2페이즈 돌입
    if (hpPercent <= monster.phase2Config.hpThreshold) {
        monster.isPhase2 = true;
        
        // 2페이즈 전환 중 플래그 설정 (대화 완료까지 턴 진행 차단)
        battleState.phase2Transitioning = true;
        
        // 전투 버튼 비활성화 (대화 중)
        enableBattleButtons(false);
        
        // 물리공격력 보너스 적용
        if (monster.phase2Config.pAtkBonus) {
            monster.pAtk = (monster.pAtk || 0) + monster.phase2Config.pAtkBonus;
        }
        
        // 투지의 검 스킬 발동 (발동중이면 지속시간 초기화)
        if (monster.phase2Config.activateSkill === 'will_sword') {
            if (!monster.activeBuffs) monster.activeBuffs = {};
            
            if (monster.activeBuffs.will_sword) {
                monster.activeBuffs.will_sword.duration = 5;
            } else {
                monster.activeBuffs.will_sword = {
                    name: '투지의 검',
                    pAtkBonus: 5,
                    pAtkPercent: 5,
                    lifestealPercent: 10,
                    duration: 5
                };
                monster.pAtk = (monster.pAtk || 0) + 5;
            }
        }
        
        // 이미지 변경
        if (monster.phase2Image) {
            monster.image = monster.phase2Image;
            updateMonsterImage(monster.phase2Image);
        }
        
        // UI 업데이트
        updateBattleUI();
        
        // 2페이즈 대화창 표시 (게임 데이터의 대사 사용)
        const phase2Lines = [];
        if (monster.dialogues && monster.dialogues.phase2) {
            phase2Lines.push(monster.dialogues.phase2);
        }
        if (monster.dialogues && monster.dialogues.lowHp) {
            phase2Lines.push(monster.dialogues.lowHp.trim());
        }
        
        // 대사가 없으면 기본 대사
        if (phase2Lines.length === 0) {
            phase2Lines.push('이제부터 진심으로 상대해주지!');
        }
        
        showPhase2DialogSequence(monster, phase2Lines);
    }
}

/**
 * 2페이즈 전환 대화 시퀀스를 표시합니다 (보스 대화창 스타일)
 */
function showPhase2DialogSequence(monster, lines) {
    let currentLine = 0;
    
    function showNextLine() {
        const existing = document.querySelector('.boss-dialog-modal');
        if (existing) existing.remove();
        
        if (currentLine >= lines.length) {
            // 대화 종료 → 2페이즈 전환 완료
            battleState.phase2Transitioning = false;
            
            addGameLog(`🔥 ${monster.name}이(가) 2페이즈에 돌입했다!`);
            
            // 투지의 검 스킬 발동 메시지 출력
            if (monster.phase2Config && monster.phase2Config.activateSkill === 'will_sword') {
                addGameLog(`🗡️ ${monster.name}의 투지의 검 스킬 발동!`);
            }
            
            // 대화 완료 후 플레이어 턴 종료 → 몬스터 공격 턴으로 진행
            endPlayerTurn();
            return;
        }
        
        const emoji = monster.emoji || '⚔️';
        const overlay = document.createElement('div');
        overlay.className = 'boss-dialog-modal';
        
        overlay.innerHTML = `
            <div class="boss-dialog-content">
                <div class="boss-dialog-portrait">${emoji}</div>
                <div class="boss-dialog-box">
                    <div class="boss-dialog-name">${monster.name}</div>
                    <div class="boss-dialog-text">${lines[currentLine]}</div>
                </div>
                <div class="boss-dialog-continue" onclick="continuePhase2Dialog()">
                    ${currentLine < lines.length - 1 ? '▶ 다음' : '⚔️ 전투 계속!'}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        addGameLog(`⚔️ ${monster.name}: "${lines[currentLine]}"`);
        currentLine++;
        
        window.continuePhase2Dialog = function() {
            showNextLine();
        };
    }
    
    showNextLine();
}

/**
 * 전투 중 몬스터 이미지를 변경합니다.
 * @param {string} imagePath - 새 이미지 경로
 */
function updateMonsterImage(imagePath) {
    const monsterImg = document.querySelector('img.monster-image') || 
                       document.querySelector('.monster-sprite img') ||
                       document.querySelector('.battle-monster-img');
    if (monsterImg) {
        monsterImg.src = imagePath;
        console.log('🖼️ 몬스터 이미지 변경:', imagePath);
    } else {
        // 이미지 요소가 없으면 몬스터 객체의 image 속성을 변경하고 UI 업데이트
        if (battleState.currentMonster) {
            battleState.currentMonster.image = imagePath;
            updateBattleUI();
        }
    }
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('⚔️ battleSystem.js v2 로드 완료!');
