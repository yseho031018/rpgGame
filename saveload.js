/**
 * ============================================
 * RPG 게임 세이브/로드 시스템
 * ============================================
 * 
 * 사용법:
 * 1. HTML에서 로드: <script src="saveload.js"></script>
 * 2. 저장: saveGame() 또는 showSaveLoadMenu()
 * 3. 불러오기: loadGame() 또는 showSaveLoadMenu()
 * 
 * v2.0 - MariaDB 서버 저장 지원
 * - 로그인 시: 서버에 저장 (계정별 저장)
 * - 비로그인 시: localStorage에 저장 (기존 방식)
 */

// ============================================
// 🔧 설정
// ============================================

const SAVE_CONFIG = {
    // localStorage 키 이름
    saveKey: 'rpg_save_data',

    // 최대 세이브 슬롯 수 (비로그인 시)
    maxSlots: 3,

    // 자동 저장 사용 여부
    autoSaveEnabled: true,

    // 자동 저장 간격 (밀리초) - 5분
    autoSaveInterval: 300000,
    
    // API 서버 URL
    apiBaseUrl: 'http://localhost:3001/api'
};

// ============================================
// 🌐 서버 저장/불러오기 (MariaDB)
// ============================================

/**
 * 현재 게임 데이터를 수집합니다.
 * @returns {Object} 저장용 게임 데이터
 */
function collectSaveData() {
    if (typeof player === 'undefined' || player === null) {
        return null;
    }
    
    return {
        // 메타 정보
        savedAt: new Date().toISOString(),
        playTime: getPlayTime(),
        version: '2.0',

        // 플레이어 전체 데이터 (깊은 복사)
        player: JSON.parse(JSON.stringify(player)),

        // 골드
        gold: typeof gold !== 'undefined' ? gold : 0,

        // 인벤토리 아이템
        inventoryItems: typeof inventoryItems !== 'undefined' ? JSON.parse(JSON.stringify(inventoryItems)) : [],

        // 장비
        equipment: typeof equipment !== 'undefined' ? JSON.parse(JSON.stringify(equipment)) : {},

        // 맵 시스템 상태
        mapState: {
            currentMap: typeof currentMapId !== 'undefined' ? currentMapId : null,
            currentLocation: typeof currentLocationId !== 'undefined' ? currentLocationId : null,
            explorationProgress: typeof explorationProgress !== 'undefined' ? JSON.parse(JSON.stringify(explorationProgress)) : {},
            unlockedLocations: typeof unlockedLocations !== 'undefined' ? JSON.parse(JSON.stringify(unlockedLocations)) : {}
        },

        // 시간 시스템 상태
        timeState: (function() {
            if (typeof getGameTime === 'function') {
                const gt = getGameTime();
                return {
                    currentDay: gt.dayCount || 1,
                    currentHour: gt.hour || 8,
                    currentMinute: gt.minute || 0,
                    totalMinutes: gt.totalMinutes || 0
                };
            }
            return { currentDay: 1, currentHour: 8, currentMinute: 0, totalMinutes: 0 };
        })(),

        // 허기/갈증 시스템 상태  
        hungerState: {
            hunger: player.hunger !== undefined ? player.hunger : 100,
            thirst: player.thirst !== undefined ? player.thirst : 100,
            maxHunger: player.maxHunger !== undefined ? player.maxHunger : 100,
            maxThirst: player.maxThirst !== undefined ? player.maxThirst : 100
        },

        // 게임 진행 상태
        progress: {
            currentStage: typeof currentStage !== 'undefined' ? currentStage : 1,
            defeatedBosses: typeof defeatedBosses !== 'undefined' ? JSON.parse(JSON.stringify(defeatedBosses)) : [],
            unlockedAreas: typeof unlockedAreas !== 'undefined' ? JSON.parse(JSON.stringify(unlockedAreas)) : ['훈련장'],
            completedQuests: typeof completedQuests !== 'undefined' ? JSON.parse(JSON.stringify(completedQuests)) : []
        },

        // 설정
        settings: {
            bgmVolume: typeof bgmVolume !== 'undefined' ? bgmVolume : 100,
            sfxVolume: typeof sfxVolume !== 'undefined' ? sfxVolume : 100
        }
    };
}

/**
 * 서버에 게임을 저장합니다. (로그인 필요)
 * @returns {Promise<boolean>} 저장 성공 여부
 */
async function saveGameToServer() {
    try {
        // 로그인 확인
        if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
            console.log('⚠️ 로그인되지 않음 - localStorage에 저장');
            return saveGame(1, true); // 서버 저장 건너뛰기
        }
        
        const saveData = collectSaveData();
        if (!saveData) {
            console.error('❌ 저장할 플레이어 데이터가 없습니다.');
            return false;
        }
        
        const response = await fetch(`${SAVE_CONFIG.apiBaseUrl}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                saveData: saveData,
                playTimeSeconds: saveData.playTime.totalSeconds,
                playerName: saveData.player.name || '용사',
                playerLevel: saveData.player.level || 1
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ 서버에 저장 완료!', result.savedAt);
            return true;
        } else {
            console.error('❌ 서버 저장 실패:', result.error);
            // 서버 저장 실패 시 localStorage에 백업
            saveGame(1, true); // 서버 저장 건너뛰기
            return false;
        }
    } catch (error) {
        console.error('❌ 서버 연결 실패:', error);
        // 오프라인 시 localStorage에 저장
        console.log('⚠️ 오프라인 모드 - localStorage에 저장');
        return saveGame(1, true); // 서버 저장 건너뛰기
    }
}

/**
 * 서버에서 게임을 불러옵니다. (로그인 필요)
 * @returns {Promise<boolean>} 불러오기 성공 여부
 */
async function loadGameFromServer() {
    try {
        // 로그인 확인
        if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
            console.log('⚠️ 로그인되지 않음 - localStorage에서 불러오기');
            return loadGame(1);
        }
        
        const response = await fetch(`${SAVE_CONFIG.apiBaseUrl}/save`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.hasSave) {
            // 저장 데이터 적용
            applySaveData(result.saveData);
            console.log('✅ 서버에서 불러오기 완료!');
            showToast('✅ 서버에서 불러오기 완료!', 'success');
            return true;
        } else if (result.success && !result.hasSave) {
            console.log('ℹ️ 서버에 저장된 게임이 없습니다.');
            showToast('ℹ️ 저장된 게임이 없습니다.', 'info');
            return false;
        } else {
            console.error('❌ 서버 불러오기 실패:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ 서버 연결 실패:', error);
        // 오프라인 시 localStorage에서 불러오기
        console.log('⚠️ 오프라인 모드 - localStorage에서 불러오기');
        return loadGame(1);
    }
}

/**
 * 저장 데이터를 게임에 적용합니다.
 * @param {Object} saveData - 저장 데이터
 */
function applySaveData(saveData) {
    // 플레이어 데이터 복원
    if (saveData.player) {
        player = JSON.parse(JSON.stringify(saveData.player));
        
        // 직업 데이터(jobData) 복원
        if (player.job && typeof JOBS !== 'undefined' && JOBS[player.job]) {
            player.jobData = JOBS[player.job];
        }
    }

    // 골드 복원
    if (typeof saveData.gold !== 'undefined') {
        gold = saveData.gold;
    }

    // 인벤토리 복원
    if (saveData.inventoryItems) {
        inventoryItems = JSON.parse(JSON.stringify(saveData.inventoryItems));
    } else {
        inventoryItems = [];
    }

    // 장비 복원
    if (saveData.equipment) {
        equipment = JSON.parse(JSON.stringify(saveData.equipment));
    }
    
    // 장비 스탯 재계산
    if (typeof applyEquipmentStats === 'function' && player && equipment) {
        try {
            applyEquipmentStats();
        } catch (e) {
            console.warn('⚠️ 장비 스탯 계산 실패:', e);
        }
    }

    // 맵 시스템 상태 복원
    if (saveData.mapState) {
        if (saveData.mapState.currentMap !== undefined && typeof currentMapId !== 'undefined') {
            currentMapId = saveData.mapState.currentMap;
        }
        if (saveData.mapState.currentLocation !== undefined && typeof currentLocationId !== 'undefined') {
            currentLocationId = saveData.mapState.currentLocation;
        }
        if (saveData.mapState.explorationProgress && typeof explorationProgress !== 'undefined') {
            explorationProgress = JSON.parse(JSON.stringify(saveData.mapState.explorationProgress));
        }
        if (saveData.mapState.unlockedLocations && typeof unlockedLocations !== 'undefined') {
            unlockedLocations = JSON.parse(JSON.stringify(saveData.mapState.unlockedLocations));
        }
    }

    // 시간 시스템 상태 복원
    if (saveData.timeState) {
        // 시간 시스템은 gameTimeOrigin/gameStartHour 기반으로 동작하므로 역산 복원
        if (typeof gameTimeOrigin !== 'undefined' && typeof gameStartHour !== 'undefined') {
            const savedHour = saveData.timeState.currentHour || 8;
            const savedMinute = saveData.timeState.currentMinute || 0;
            const savedDay = saveData.timeState.currentDay || 1;
            
            gameStartHour = 0;
            const totalGameMinutes = ((savedDay - 1) * 1440) + (savedHour * 60) + savedMinute;
            const gameMinutesPerRealMs = 1440 / (typeof TIME_CONFIG !== 'undefined' ? TIME_CONFIG.gameDayDuration : 720000);
            const realMsElapsed = totalGameMinutes / gameMinutesPerRealMs;
            gameTimeOrigin = Date.now() - realMsElapsed;
        }
    }

    // 허기/갈증 상태 복원
    if (saveData.hungerState && player) {
        player.hunger = saveData.hungerState.hunger;
        player.thirst = saveData.hungerState.thirst;
        player.maxHunger = saveData.hungerState.maxHunger;
        player.maxThirst = saveData.hungerState.maxThirst;
    }

    // 게임 진행 상태 복원
    if (saveData.progress) {
        if (saveData.progress.currentStage !== undefined) {
            if (typeof currentStage !== 'undefined') currentStage = saveData.progress.currentStage;
            else window.currentStage = saveData.progress.currentStage;
        }
        if (saveData.progress.defeatedBosses) {
            if (typeof defeatedBosses !== 'undefined') defeatedBosses = JSON.parse(JSON.stringify(saveData.progress.defeatedBosses));
            else window.defeatedBosses = JSON.parse(JSON.stringify(saveData.progress.defeatedBosses));
        }
        if (saveData.progress.unlockedAreas) {
            if (typeof unlockedAreas !== 'undefined') unlockedAreas = JSON.parse(JSON.stringify(saveData.progress.unlockedAreas));
            else window.unlockedAreas = JSON.parse(JSON.stringify(saveData.progress.unlockedAreas));
        }
        if (saveData.progress.completedQuests) {
            if (typeof completedQuests !== 'undefined') completedQuests = JSON.parse(JSON.stringify(saveData.progress.completedQuests));
            else window.completedQuests = JSON.parse(JSON.stringify(saveData.progress.completedQuests));
        }
    }

    // 플레이 시간 복원
    if (saveData.playTime) {
        const savedPlayTimeMs = saveData.playTime.totalSeconds * 1000;
        startTime = Date.now() - savedPlayTimeMs;
        gameStartTime = Date.now() - savedPlayTimeMs;
    }

    // 불러오기 플래그 설정
    window.isLoadingGame = true;

    // 게임 화면으로 전환
    if (typeof showScreen === 'function') {
        showScreen('game');
    }
    
    // UI 갱신
    setTimeout(() => {
        if (typeof updateStatusBars === 'function') updateStatusBars();
        if (typeof updateHungerUI === 'function') updateHungerUI();
        if (typeof updateTimeUI === 'function') updateTimeUI();
        if (typeof updateInventoryUI === 'function') updateInventoryUI();
        if (typeof updateEquipmentUI === 'function') updateEquipmentUI();
        if (typeof updatePlayerUI === 'function') updatePlayerUI();
        // 맵 UI 갱신 (저장된 맵/위치로 배경+행동버튼 복원)
        if (typeof updateMapUI === 'function') updateMapUI();
        if (typeof updateLocationUI === 'function') updateLocationUI();
    }, 100);
}

/**
 * 서버에 저장된 게임 정보를 확인합니다.
 * @returns {Promise<Object|null>} 저장 정보 또는 null
 */
async function checkServerSave() {
    try {
        if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
            return null;
        }
        
        const response = await fetch(`${SAVE_CONFIG.apiBaseUrl}/save/info`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.hasSave) {
            return {
                playerName: result.playerName,
                playerLevel: result.playerLevel,
                playTimeSeconds: result.playTimeSeconds,
                savedAt: result.savedAt
            };
        }
        return null;
    } catch (error) {
        console.error('❌ 서버 저장 확인 실패:', error);
        return null;
    }
}

// ============================================
// 💾 핵심 저장/불러오기 함수
// ============================================

/**
 * 게임 데이터를 저장합니다.
 * @param {number} slotNumber - 슬롯 번호 (1, 2, 3)
 * @param {boolean} skipServerSave - 서버 저장 건너뛰기 여부 (무한 루프 방지)
 * @returns {boolean} 저장 성공 여부
 */
function saveGame(slotNumber = 1, skipServerSave = false) {
    try {
        // player가 없으면 저장 불가
        if (typeof player === 'undefined' || player === null) {
            console.error('❌ 저장할 플레이어 데이터가 없습니다.');
            return false;
        }

        // 현재 게임 상태 수집
        const saveData = {
            // 메타 정보
            slotNumber: slotNumber,
            savedAt: new Date().toISOString(),
            playTime: getPlayTime(),
            version: '1.0',

            // 플레이어 전체 데이터 (깊은 복사)
            player: JSON.parse(JSON.stringify(player)),

            // 골드
            gold: typeof gold !== 'undefined' ? gold : 0,

            // 인벤토리 아이템 (깊은 복사) - inventoryItems 사용
            inventoryItems: typeof inventoryItems !== 'undefined' ? JSON.parse(JSON.stringify(inventoryItems)) : [],

            // 장비 (깊은 복사) - equipment 사용
            equipment: typeof equipment !== 'undefined' ? JSON.parse(JSON.stringify(equipment)) : {},

            // 맵 시스템 상태
            mapState: {
                currentMap: typeof currentMapId !== 'undefined' ? currentMapId : null,
                currentLocation: typeof currentLocationId !== 'undefined' ? currentLocationId : null,
                explorationProgress: typeof explorationProgress !== 'undefined' ? JSON.parse(JSON.stringify(explorationProgress)) : {},
                unlockedLocations: typeof unlockedLocations !== 'undefined' ? JSON.parse(JSON.stringify(unlockedLocations)) : {}
            },

            // 시간 시스템 상태
            timeState: (function() {
            if (typeof getGameTime === 'function') {
                const gt = getGameTime();
                return {
                    currentDay: gt.dayCount || 1,
                    currentHour: gt.hour || 8,
                    currentMinute: gt.minute || 0,
                    totalMinutes: gt.totalMinutes || 0
                };
            }
            return { currentDay: 1, currentHour: 8, currentMinute: 0, totalMinutes: 0 };
        })(),

            // 허기/갈증 시스템 상태  
            hungerState: {
                hunger: typeof player !== 'undefined' && player.hunger !== undefined ? player.hunger : 100,
                thirst: typeof player !== 'undefined' && player.thirst !== undefined ? player.thirst : 100,
                maxHunger: typeof player !== 'undefined' && player.maxHunger !== undefined ? player.maxHunger : 100,
                maxThirst: typeof player !== 'undefined' && player.maxThirst !== undefined ? player.maxThirst : 100
            },

            // 게임 진행 상태
            progress: {
                currentStage: typeof currentStage !== 'undefined' ? currentStage : 1,
                defeatedBosses: typeof defeatedBosses !== 'undefined' ? JSON.parse(JSON.stringify(defeatedBosses)) : [],
                unlockedAreas: typeof unlockedAreas !== 'undefined' ? JSON.parse(JSON.stringify(unlockedAreas)) : ['훈련장'],
                completedQuests: typeof completedQuests !== 'undefined' ? JSON.parse(JSON.stringify(completedQuests)) : []
            },

            // 설정
            settings: {
                bgmVolume: typeof bgmVolume !== 'undefined' ? bgmVolume : 100,
                sfxVolume: typeof sfxVolume !== 'undefined' ? sfxVolume : 100
            }
        };

        // 기존 저장 데이터 불러오기
        let allSaves = getAllSaveData();

        // 해당 슬롯에 저장
        allSaves[`slot${slotNumber}`] = saveData;

        // localStorage에 저장
        localStorage.setItem(SAVE_CONFIG.saveKey, JSON.stringify(allSaves));

        console.log(`✅ 슬롯 ${slotNumber}에 저장 완료!`, saveData);
        
        // 서버 저장 연동 (로그인 시 & skipServerSave가 아닐 때)
        if (!skipServerSave && typeof isLoggedIn === 'function' && isLoggedIn()) {
            // 비동기로 서버 저장 시도 (결과 기다리지 않음)
            saveGameToServer().then(success => {
                if (success) showToast('☁️ 서버에 클라우드 저장 완료', 'success');
            }).catch(e => console.error('서버 저장 실패:', e));
        }

        return true;

    } catch (error) {
        console.error('❌ 저장 실패:', error);
        return false;
    }
}

/**
 * 게임 데이터를 불러옵니다.
 * @param {number} slotNumber - 슬롯 번호 (1, 2, 3)
 * @returns {boolean} 불러오기 성공 여부
 */
function loadGame(slotNumber = 1) {
    try {
        const allSaves = getAllSaveData();
        const saveData = allSaves[`slot${slotNumber}`];

        if (!saveData) {
            console.log(`❌ 슬롯 ${slotNumber}에 저장된 데이터가 없습니다.`);
            return false;
        }

        console.log(`📂 슬롯 ${slotNumber} 데이터 불러오는 중...`, saveData);

        // 플레이어 데이터 복원 (전체 객체)
        if (saveData.player) {
            // player 전역 변수에 저장된 데이터 복사
            player = JSON.parse(JSON.stringify(saveData.player));
            
            // 직업 데이터(jobData) 복원 - JOBS 상수에서 조회
            if (player.job && typeof JOBS !== 'undefined' && JOBS[player.job]) {
                player.jobData = JOBS[player.job];
                console.log(`📋 직업 데이터 복원: ${player.jobData.name}`);
            }
        }

        // 골드 복원
        if (typeof saveData.gold !== 'undefined') {
            gold = saveData.gold;
        } else if (saveData.progress && typeof saveData.progress.gold !== 'undefined') {
            gold = saveData.progress.gold;
        }

        // 인벤토리 아이템 복원 (inventoryItems 전역 변수)
        if (saveData.inventoryItems) {
            inventoryItems = JSON.parse(JSON.stringify(saveData.inventoryItems));
            console.log(`📦 인벤토리 복원: ${inventoryItems.length}개 아이템`);
        } else if (saveData.inventory) {
            // 이전 버전 호환성 (inventory -> inventoryItems)
            inventoryItems = JSON.parse(JSON.stringify(saveData.inventory));
            console.log(`📦 인벤토리 복원 (구버전): ${inventoryItems.length}개 아이템`);
        } else {
            // 인벤토리 데이터가 없으면 빈 배열로 초기화
            inventoryItems = [];
            console.log('📦 인벤토리 초기화 (데이터 없음)');
        }

        // 장비 복원 (equipment 전역 변수)
        if (saveData.equipment) {
            equipment = JSON.parse(JSON.stringify(saveData.equipment));
            console.log('⚔️ 장비 데이터 복원 완료');
        } else {
            // equipment가 없으면 기본값으로 초기화
            equipment = {
                helmet: null,
                armor: null,
                gloves: null,
                boots: null,
                weapon: null,
                accessory: null
            };
            console.log('⚔️ 장비 데이터 초기화');
        }
        
        // 장비 스탯 재계산 (장비가 있는 경우 스탯 적용)
        try {
            if (typeof applyEquipmentStats === 'function' && player && equipment) {
                applyEquipmentStats();
                console.log('📊 장비 스탯 재계산 완료');
            }
        } catch (equipError) {
            console.warn('⚠️ 장비 스탯 계산 실패:', equipError);
        }

        // 맵 시스템 상태 복원
        if (saveData.mapState) {
            if (typeof currentMapId !== 'undefined') {
                currentMapId = saveData.mapState.currentMap || 'training';
            }
            if (typeof currentLocationId !== 'undefined') {
                currentLocationId = saveData.mapState.currentLocation || 'entrance';
            }
            if (saveData.mapState.explorationProgress && typeof explorationProgress !== 'undefined') {
                explorationProgress = JSON.parse(JSON.stringify(saveData.mapState.explorationProgress));
            }
            if (saveData.mapState.unlockedLocations && typeof unlockedLocations !== 'undefined') {
                unlockedLocations = JSON.parse(JSON.stringify(saveData.mapState.unlockedLocations));
            }
        } else {
            // mapState가 없는 이전 저장 데이터 호환성
            if (typeof currentMapId !== 'undefined') currentMapId = 'training';
            if (typeof currentLocationId !== 'undefined') currentLocationId = 'entrance';
        }
        console.log(`🗺️ 맵 상태 복원: ${currentMapId} / ${currentLocationId}`);

        // 시간 시스템 상태 복원
        if (saveData.timeState) {
            // 시간 시스템은 gameTimeOrigin/gameStartHour 기반으로 동작하므로 역산 복원
            if (typeof gameTimeOrigin !== 'undefined' && typeof gameStartHour !== 'undefined') {
                const savedHour = saveData.timeState.currentHour || 8;
                const savedMinute = saveData.timeState.currentMinute || 0;
                const savedDay = saveData.timeState.currentDay || 1;
                
                // gameStartHour를 0으로 설정하고, 전체 경과 시간을 역산
                gameStartHour = 0;
                const totalGameMinutes = ((savedDay - 1) * 1440) + (savedHour * 60) + savedMinute;
                const gameDayDuration = typeof TIME_CONFIG !== 'undefined' ? TIME_CONFIG.gameDayDuration : 720000;
                const gameMinutesPerRealMs = 1440 / gameDayDuration;
                const realMsElapsed = totalGameMinutes / gameMinutesPerRealMs;
                gameTimeOrigin = Date.now() - realMsElapsed;
                
                console.log(`⏰ 시간 복원: Day ${savedDay} ${savedHour}:${String(savedMinute).padStart(2, '0')}`);
            }
        }

        // 허기/갈증 상태 복원 (player 객체에도 있지만 별도 저장된 경우 대비)
        if (saveData.hungerState && player) {
            player.hunger = saveData.hungerState.hunger;
            player.thirst = saveData.hungerState.thirst;
            player.maxHunger = saveData.hungerState.maxHunger;
            player.maxThirst = saveData.hungerState.maxThirst;
        }

        // 게임 진행 상태 복원
        if (saveData.progress) {
            if (typeof saveData.progress.currentStage !== 'undefined') {
                if (typeof currentStage !== 'undefined') currentStage = saveData.progress.currentStage;
                else window.currentStage = saveData.progress.currentStage;
            }
            if (saveData.progress.defeatedBosses) {
                if (typeof defeatedBosses !== 'undefined') defeatedBosses = JSON.parse(JSON.stringify(saveData.progress.defeatedBosses));
                else window.defeatedBosses = JSON.parse(JSON.stringify(saveData.progress.defeatedBosses));
            }
            if (saveData.progress.unlockedAreas) {
                if (typeof unlockedAreas !== 'undefined') unlockedAreas = JSON.parse(JSON.stringify(saveData.progress.unlockedAreas));
                else window.unlockedAreas = JSON.parse(JSON.stringify(saveData.progress.unlockedAreas));
            }
            if (saveData.progress.completedQuests) {
                if (typeof completedQuests !== 'undefined') completedQuests = JSON.parse(JSON.stringify(saveData.progress.completedQuests));
                else window.completedQuests = JSON.parse(JSON.stringify(saveData.progress.completedQuests));
            }
        }

        // 플레이 시간 복원
        if (saveData.playTime) {
            const savedPlayTimeMs = saveData.playTime.totalSeconds * 1000;
            startTime = Date.now() - savedPlayTimeMs;
            gameStartTime = Date.now() - savedPlayTimeMs;
        }

        // 불러오기 플래그 설정 (initGameScreen에서 초기화 건너뛰기 위함)
        window.isLoadingGame = true;

        // 게임 화면으로 전환
        if (typeof showScreen === 'function') {
            showScreen('game');
        }
        
        // UI 갱신 함수들 호출 (화면 전환 후)
        setTimeout(() => {
            if (typeof updateStatusBars === 'function') {
                updateStatusBars();
            }
            if (typeof updateHungerUI === 'function') {
                updateHungerUI();
            }
            if (typeof updateTimeUI === 'function') {
                updateTimeUI();
            }
            if (typeof updateInventoryUI === 'function') {
                updateInventoryUI();
            }
            if (typeof updateEquipmentUI === 'function') {
                updateEquipmentUI();
            }
            if (typeof updatePlayerUI === 'function') {
                updatePlayerUI();
            }
            // 맵 UI 갱신 (저장된 맵/위치로 배경+행동버튼 복원)
            if (typeof updateMapUI === 'function') {
                updateMapUI();
                console.log(`🗺️ 맵 UI 복원: ${currentMapId}`);
            }
            if (typeof updateLocationUI === 'function') {
                updateLocationUI();
                console.log(`📍 위치 UI 복원: ${currentLocationId}`);
            }
        }, 100);

        console.log(`✅ 슬롯 ${slotNumber} 불러오기 완료!`);
        showToast(`✅ 슬롯 ${slotNumber} 불러오기 완료!`, 'success');
        return true;

    } catch (error) {
        console.error('❌ 불러오기 실패:', error);
        showToast(`❌ 불러오기 실패: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 모든 저장 데이터를 가져옵니다.
 */
function getAllSaveData() {
    try {
        const saved = localStorage.getItem(SAVE_CONFIG.saveKey);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

/**
 * 특정 슬롯의 저장 데이터를 가져옵니다.
 */
function getSaveData(slotNumber) {
    const allSaves = getAllSaveData();
    return allSaves[`slot${slotNumber}`] || null;
}

/**
 * 저장 데이터를 삭제합니다.
 */
function deleteSave(slotNumber) {
    try {
        let allSaves = getAllSaveData();
        delete allSaves[`slot${slotNumber}`];
        localStorage.setItem(SAVE_CONFIG.saveKey, JSON.stringify(allSaves));
        console.log(`🗑️ 슬롯 ${slotNumber} 삭제 완료!`);
        return true;
    } catch (error) {
        console.error('❌ 삭제 실패:', error);
        return false;
    }
}

/**
 * 모든 저장 데이터를 삭제합니다.
 */
function deleteAllSaves() {
    localStorage.removeItem(SAVE_CONFIG.saveKey);
    console.log('🗑️ 모든 저장 데이터 삭제 완료!');
}

/**
 * 저장 데이터가 있는지 확인합니다.
 */
function hasSaveData(slotNumber = null) {
    const allSaves = getAllSaveData();

    if (slotNumber) {
        return !!allSaves[`slot${slotNumber}`];
    }

    // 아무 슬롯에나 데이터가 있는지 확인
    return Object.keys(allSaves).length > 0;
}

// ============================================
// 📁 파일 백업/복원 기능
// ============================================

/**
 * 세이브 데이터를 JSON 파일로 내보냅니다.
 * @param {number|null} slotNumber - 특정 슬롯만 내보내려면 번호 지정, null이면 현재 게임 데이터
 */
function exportSaveToFile(slotNumber = null) {
    try {
        let dataToExport;
        let fileName;
        
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '-'); // HH-MM
        
        if (slotNumber) {
            // 특정 슬롯만 내보내기
            const saveData = getSaveData(slotNumber);
            if (!saveData) {
                showToast('❌ 해당 슬롯에 저장된 데이터가 없습니다.', 'error');
                return false;
            }
            dataToExport = { [`slot${slotNumber}`]: saveData };
            fileName = `rpg_save_slot${slotNumber}_${dateStr}_${timeStr}.json`;
        } else {
            // 현재 게임 데이터 직접 내보내기
            if (typeof player === 'undefined' || !player) {
                showToast('❌ 저장된 데이터가 없습니다.', 'error');
                return false;
            }
            
            // 현재 세션 데이터 수집
            const currentSessionData = {
                savedAt: now.toISOString(),
                
                // 플레이어 데이터 전체
                player: JSON.parse(JSON.stringify(player)),
                
                // 골드 (전역 변수)
                gold: typeof gold !== 'undefined' ? gold : 0,
                
                // 인벤토리 아이템 (inventoryItems 사용)
                inventoryItems: typeof inventoryItems !== 'undefined' ? JSON.parse(JSON.stringify(inventoryItems)) : [],
                
                // 장비 데이터 (equipment 사용)
                equipment: typeof equipment !== 'undefined' ? JSON.parse(JSON.stringify(equipment)) : {},
                
                // 플레이 시간
                playTime: getPlayTime(),
                
                // 맵 시스템 상태
                mapState: {
                    currentMap: typeof currentMap !== 'undefined' ? currentMap : 'training_grounds',
                    currentLocation: typeof currentLocation !== 'undefined' ? currentLocation : 'entrance',
                    explorationProgress: typeof explorationProgress !== 'undefined' ? JSON.parse(JSON.stringify(explorationProgress)) : {},
                    unlockedLocations: typeof unlockedLocations !== 'undefined' ? JSON.parse(JSON.stringify(unlockedLocations)) : []
                },
                
                // 시간 시스템 상태
                timeState: {
                    currentDay: typeof currentDay !== 'undefined' ? currentDay : 1,
                    currentHour: typeof currentHour !== 'undefined' ? currentHour : 8,
                    currentMinute: typeof currentMinute !== 'undefined' ? currentMinute : 0,
                    totalMinutes: typeof totalMinutes !== 'undefined' ? totalMinutes : 0
                },
                
                // 허기/갈증 시스템 상태  
                hungerState: {
                    hunger: player.hunger !== undefined ? player.hunger : 100,
                    thirst: player.thirst !== undefined ? player.thirst : 100,
                    maxHunger: player.maxHunger !== undefined ? player.maxHunger : 100,
                    maxThirst: player.maxThirst !== undefined ? player.maxThirst : 100
                },
                
                // 게임 진행 상태
                progress: {
                    currentStage: typeof currentStage !== 'undefined' ? currentStage : 1,
                    defeatedBosses: typeof defeatedBosses !== 'undefined' ? JSON.parse(JSON.stringify(defeatedBosses)) : [],
                    unlockedAreas: typeof unlockedAreas !== 'undefined' ? JSON.parse(JSON.stringify(unlockedAreas)) : ['훈련장'],
                    completedQuests: typeof completedQuests !== 'undefined' ? JSON.parse(JSON.stringify(completedQuests)) : [],
                    gold: typeof gold !== 'undefined' ? gold : 0
                }
            };
            
            dataToExport = { slot1: currentSessionData };
            fileName = `rpg_save_${player.name || 'player'}_${dateStr}_${timeStr}.json`;
        }
        
        // 메타 정보 추가
        const exportData = {
            exportedAt: now.toISOString(),
            gameVersion: '1.0',
            saves: dataToExport
        };
        
        // JSON 문자열로 변환
        const jsonStr = JSON.stringify(exportData, null, 2);
        
        // Blob 생성 및 다운로드
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`📥 ${fileName} 다운로드 완료!`, 'success');
        console.log('📥 세이브 파일 내보내기 완료:', fileName);
        return true;
        
    } catch (error) {
        console.error('❌ 파일 내보내기 실패:', error);
        showToast('❌ 파일 내보내기 실패!', 'error');
        return false;
    }
}

/**
 * JSON 파일에서 세이브 데이터를 가져옵니다.
 */
function importSaveFromFile() {
    // 파일 선택 input 생성
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            // 데이터 유효성 검사
            if (!importData.saves) {
                // 구버전 형식 지원 (saves 래퍼 없이 직접 슬롯 데이터)
                if (importData.slot1 || importData.slot2 || importData.slot3) {
                    importData.saves = importData;
                } else {
                    showToast('❌ 유효하지 않은 세이브 파일입니다.', 'error');
                    return;
                }
            }
            
            // 덮어쓰기 확인
            const existingSaves = getAllSaveData();
            const hasExisting = Object.keys(existingSaves).length > 0;
            
            if (hasExisting) {
                if (!confirm('기존 저장 데이터가 있습니다.\n가져온 데이터로 덮어쓰시겠습니까?')) {
                    return;
                }
            }
            
            // 데이터 병합 또는 덮어쓰기
            const newSaves = { ...existingSaves, ...importData.saves };
            localStorage.setItem(SAVE_CONFIG.saveKey, JSON.stringify(newSaves));
            
            showToast('📤 세이브 파일 가져오기 완료!', 'success');
            console.log('📤 세이브 파일 가져오기 완료:', importData);
            
            // UI 새로고침
            if (document.getElementById('saveLoadOverlay')) {
                switchSaveLoadMode(currentMode);
            }
            
        } catch (error) {
            console.error('❌ 파일 가져오기 실패:', error);
            showToast('❌ 파일 형식이 올바르지 않습니다.', 'error');
        }
    };
    
    input.click();
}

/**
 * 파일 백업 UI를 세이브/로드 모달에 추가합니다.
 */
function getFileBackupButtons() {
    return `
        <div class="file-backup-section">
            <div class="file-backup-title">📁 파일 백업</div>
            <div class="file-backup-buttons">
                <button class="file-backup-btn export" onclick="exportSaveToFile()">
                    📥 파일로 내보내기
                </button>
                <button class="file-backup-btn import" onclick="importSaveFromFile()">
                    📤 파일에서 불러오기
                </button>
            </div>
            <div class="file-backup-note">
                💡 파일로 백업하면 브라우저 데이터를 삭제해도 복원할 수 있습니다
            </div>
        </div>
    `;
}

// ============================================
// ⏱️ 플레이 시간 관리
// ============================================

let startTime = Date.now();

function getPlayTime() {
    const elapsed = Date.now() - startTime;
    const totalSeconds = Math.floor(elapsed / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        totalSeconds,
        formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    };
}

// ============================================
// 🔄 자동 저장
// ============================================

let autoSaveTimer = null;

function startAutoSave() {
    if (!SAVE_CONFIG.autoSaveEnabled) return;

    autoSaveTimer = setInterval(() => {
        saveGame(1); // 슬롯 1에 자동 저장
        console.log('🔄 자동 저장 완료!');
    }, SAVE_CONFIG.autoSaveInterval);
}

function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

// ============================================
// 🎨 세이브/로드 UI (모달)
// ============================================

const saveLoadStyles = `
    .save-load-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
    }

    .save-load-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    .save-load-modal {
        background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%);
        border: 3px solid #4da8da;
        border-radius: 20px;
        width: 90%;
        max-width: 600px;
        overflow: hidden;
        box-shadow: 0 0 50px rgba(77, 168, 218, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }

    .save-load-overlay.active .save-load-modal {
        transform: scale(1);
    }

    .save-load-header {
        background: linear-gradient(135deg, #4da8da 0%, #2980b9 100%);
        padding: 20px 25px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .save-load-header h2 {
        margin: 0;
        color: #fff;
        font-size: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .save-load-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: #fff;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .save-load-close:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: rotate(90deg);
    }

    .save-load-tabs {
        display: flex;
        background: rgba(0, 0, 0, 0.3);
    }

    .save-load-tab {
        flex: 1;
        padding: 15px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 3px solid transparent;
    }

    .save-load-tab:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
    }

    .save-load-tab.active {
        color: #4da8da;
        border-bottom-color: #4da8da;
    }

    .save-load-content {
        padding: 25px;
    }

    .save-slot {
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(77, 168, 218, 0.3);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .save-slot:hover {
        border-color: #4da8da;
        transform: translateX(5px);
    }

    .save-slot.empty {
        opacity: 0.5;
    }

    .save-slot-info {
        flex: 1;
    }

    .save-slot-title {
        color: #fff;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .save-slot-title .slot-number {
        background: #4da8da;
        color: #fff;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
    }

    .save-slot-details {
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
    }

    .save-slot-details span {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .save-slot-actions {
        display: flex;
        gap: 10px;
    }

    .slot-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .slot-btn-save {
        background: linear-gradient(135deg, #27ae60, #1e8449);
        color: #fff;
    }

    .slot-btn-save:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(39, 174, 96, 0.5);
    }

    .slot-btn-load {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: #fff;
    }

    .slot-btn-load:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(52, 152, 219, 0.5);
    }

    .slot-btn-delete {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid #e74c3c;
    }

    .slot-btn-delete:hover {
        background: #e74c3c;
        color: #fff;
    }

    .save-load-footer {
        padding: 15px 25px;
        background: rgba(0, 0, 0, 0.3);
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 16px;
        z-index: 10001;
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }

    .toast.success { border-left: 4px solid #27ae60; }
    .toast.error { border-left: 4px solid #e74c3c; }
    .toast.info { border-left: 4px solid #3498db; }

    /* 파일 백업 섹션 */
    .file-backup-section {
        background: rgba(0, 0, 0, 0.3);
        border: 2px dashed rgba(77, 168, 218, 0.4);
        border-radius: 15px;
        padding: 20px;
        margin: 20px 25px;
    }

    .file-backup-title {
        color: #4da8da;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        text-align: center;
    }

    .file-backup-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-bottom: 12px;
    }

    .file-backup-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .file-backup-btn.export {
        background: linear-gradient(135deg, #9b59b6, #8e44ad);
        color: #fff;
    }

    .file-backup-btn.export:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(155, 89, 182, 0.5);
    }

    .file-backup-btn.import {
        background: linear-gradient(135deg, #e67e22, #d35400);
        color: #fff;
    }

    .file-backup-btn.import:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(230, 126, 34, 0.5);
    }

    .file-backup-note {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        text-align: center;
    }
`;

let saveLoadStyleInjected = false;
let currentMode = 'save'; // 'save' 또는 'load'

function injectSaveLoadStyles() {
    if (saveLoadStyleInjected) return;

    const style = document.createElement('style');
    style.id = 'save-load-styles';
    style.textContent = saveLoadStyles;
    document.head.appendChild(style);
    saveLoadStyleInjected = true;
}

/**
 * 세이브/로드 메뉴를 표시합니다.
 * @param {string} mode - 'save' 또는 'load'
 */
function showSaveLoadMenu(mode = 'save') {
    injectSaveLoadStyles();
    currentMode = mode;

    // 기존 모달 제거
    const existing = document.getElementById('saveLoadOverlay');
    if (existing) existing.remove();

    // 슬롯 HTML 생성
    let slotsHTML = '';
    for (let i = 1; i <= SAVE_CONFIG.maxSlots; i++) {
        const saveData = getSaveData(i);

        if (saveData) {
            const savedDate = new Date(saveData.savedAt).toLocaleString('ko-KR');
            slotsHTML += `
                <div class="save-slot" data-slot="${i}">
                    <div class="save-slot-info">
                        <div class="save-slot-title">
                            <span class="slot-number">${i}</span>
                            ${saveData.player.name} (Lv.${saveData.player.level || 1})
                        </div>
                        <div class="save-slot-details">
                            <span>📅 ${savedDate}</span>
                            <span>⏱️ ${saveData.playTime?.formatted || '00:00:00'}</span>
                            <span>🏰 Stage ${saveData.progress?.currentStage || 1}</span>
                            <span>💰 ${(saveData.gold !== undefined ? saveData.gold : (saveData.progress?.gold || 0)).toLocaleString()}G</span>
                        </div>
                    </div>
                    <div class="save-slot-actions">
                        ${mode === 'save'
                    ? `<button class="slot-btn slot-btn-save" onclick="onSlotSave(${i})">덮어쓰기</button>`
                    : `<button class="slot-btn slot-btn-load" onclick="onSlotLoad(${i})">불러오기</button>`
                }
                        <button class="slot-btn slot-btn-delete" onclick="onSlotDelete(${i})">🗑️</button>
                    </div>
                </div>
            `;
        } else {
            slotsHTML += `
                <div class="save-slot empty" data-slot="${i}">
                    <div class="save-slot-info">
                        <div class="save-slot-title">
                            <span class="slot-number">${i}</span>
                            빈 슬롯
                        </div>
                        <div class="save-slot-details">
                            <span>저장된 데이터가 없습니다</span>
                        </div>
                    </div>
                    <div class="save-slot-actions">
                        ${mode === 'save'
                    ? `<button class="slot-btn slot-btn-save" onclick="onSlotSave(${i})">저장하기</button>`
                    : ``
                }
                    </div>
                </div>
            `;
        }
    }

    // 모달 HTML
    const modalHTML = `
        <div class="save-load-overlay" id="saveLoadOverlay" onclick="closeSaveLoadOnOverlay(event)">
            <div class="save-load-modal">
                <div class="save-load-header">
                    <h2>${mode === 'save' ? '💾 게임 저장' : '📂 게임 불러오기'}</h2>
                    <button class="save-load-close" onclick="hideSaveLoadMenu()">✕</button>
                </div>
                <div class="save-load-tabs">
                    <button class="save-load-tab ${mode === 'save' ? 'active' : ''}" onclick="switchSaveLoadMode('save')">
                        💾 저장하기
                    </button>
                    <button class="save-load-tab ${mode === 'load' ? 'active' : ''}" onclick="switchSaveLoadMode('load')">
                        📂 불러오기
                    </button>
                </div>
                <div class="save-load-content">
                    ${slotsHTML}
                </div>
                <div class="file-backup-section">
                    <div class="file-backup-title">📁 파일 백업 (영구 저장)</div>
                    <div class="file-backup-buttons">
                        <button class="file-backup-btn export" onclick="exportSaveToFile()">
                            📥 파일로 내보내기
                        </button>
                        <button class="file-backup-btn import" onclick="importSaveFromFile()">
                            📤 파일에서 불러오기
                        </button>
                    </div>
                    <div class="file-backup-note">
                        💡 파일로 백업하면 브라우저 데이터를 삭제해도 복원할 수 있습니다
                    </div>
                </div>
                <div class="save-load-footer">
                    ESC 키를 누르거나 바깥을 클릭하면 닫힙니다
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    setTimeout(() => {
        document.getElementById('saveLoadOverlay').classList.add('active');
    }, 10);

    document.addEventListener('keydown', handleSaveLoadEsc);
}

function hideSaveLoadMenu() {
    const overlay = document.getElementById('saveLoadOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
    document.removeEventListener('keydown', handleSaveLoadEsc);
}

function closeSaveLoadOnOverlay(event) {
    if (event.target.id === 'saveLoadOverlay') {
        hideSaveLoadMenu();
    }
}

function handleSaveLoadEsc(event) {
    if (event.key === 'Escape') {
        hideSaveLoadMenu();
    }
}

function switchSaveLoadMode(mode) {
    hideSaveLoadMenu();
    setTimeout(() => showSaveLoadMenu(mode), 100);
}

// ============================================
// 🔘 슬롯 버튼 핸들러
// ============================================

function onSlotSave(slotNumber) {
    const existingData = getSaveData(slotNumber);

    if (existingData) {
        if (!confirm(`슬롯 ${slotNumber}에 이미 저장된 데이터가 있습니다.\n덮어쓰시겠습니까?`)) {
            return;
        }
    }

    if (saveGame(slotNumber)) {
        showToast('✅ 저장 완료!', 'success');
        switchSaveLoadMode('save'); // 새로고침
    } else {
        showToast('❌ 저장 실패!', 'error');
    }
}

function onSlotLoad(slotNumber) {
    if (!confirm(`슬롯 ${slotNumber}의 데이터를 불러오시겠습니까?\n현재 진행 상황은 저장되지 않습니다.`)) {
        return;
    }

    if (loadGame(slotNumber)) {
        showToast('✅ 불러오기 완료!', 'success');
        hideSaveLoadMenu();
        // 필요시 게임 화면 갱신 함수 호출
        // updateGameUI();
    } else {
        showToast('❌ 불러오기 실패!', 'error');
    }
}

function onSlotDelete(slotNumber) {
    if (!confirm(`정말로 슬롯 ${slotNumber}의 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }

    if (deleteSave(slotNumber)) {
        showToast('🗑️ 삭제 완료!', 'info');
        switchSaveLoadMode(currentMode); // 새로고침
    } else {
        showToast('❌ 삭제 실패!', 'error');
    }
}

// ============================================
// 🍞 토스트 메시지
// ============================================

function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ============================================
// 🎮 게임 시작 시 체크
// ============================================

/**
 * 게임 시작 시 저장 데이터 확인
 * 게임 시작 부분에서 호출하세요.
 */
/**
 * 게임 시작 시 저장 데이터 확인
 * 게임 시작 부분에서 호출하세요.
 */
async function checkSaveOnStart() {
    console.log('🔄 저장 데이터 확인 중...');
    
    // 1. 서버 저장 데이터 확인 (로그인 상태일 때)
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        try {
            const serverSave = await checkServerSave();
            if (serverSave) {
                const date = new Date(serverSave.savedAt).toLocaleString();
                const msg = `☁️ 서버에 저장된 데이터가 있습니다.\n` +
                           `플레이어: ${serverSave.playerName} (Lv.${serverSave.playerLevel})\n` +
                           `저장일시: ${date}\n\n` +
                           `서버 데이터를 불러오시겠습니까?`;
                           
                if (confirm(msg)) {
                    await loadGameFromServer();
                    return true;
                }
            }
        } catch (e) {
            console.error('서버 데이터 확인 중 오류:', e);
        }
    }

    // 2. 로컬 저장 데이터 확인 (기존 로직)
    if (hasSaveData()) {
        if (confirm('브라우저에 저장된 게임이 있습니다.\n이어서 하시겠습니까?')) {
            showSaveLoadMenu('load');
            return true;
        }
    }
    return false;
}

// ============================================
// 📢 사용 예시
// ============================================
/*
    <!-- HTML에서 사용 -->
    <script src="saveload.js"></script>
    
    <!-- 버튼 예시 -->
    <button onclick="showSaveLoadMenu('save')">💾 저장</button>
    <button onclick="showSaveLoadMenu('load')">📂 불러오기</button>
    
    <!-- 또는 기본 모드(save)로 열기 -->
    <button onclick="showSaveLoadMenu()">💾 세이브/로드</button>
    
    <!-- 빠른 저장 (슬롯 1) -->
    <button onclick="saveGame(1)">빠른 저장</button>
    
    <!-- 게임 시작 시 -->
    <script>
        // 저장 데이터 있으면 물어보기
        if (!checkSaveOnStart()) {
            // 새 게임 시작
            createPlayer();
        }
    </script>
*/

console.log('💾 세이브/로드 시스템 로드 완료!');
