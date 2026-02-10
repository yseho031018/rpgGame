/**
 * ============================================
 * RPG Adventure - 맵 시스템 v2
 * ============================================
 * 맵 이동, 맵 내 위치 이동, 배경 관리를 처리합니다.
 */

// ============================================
// 🗺️ 맵 상태
// ============================================

// 현재 맵
var currentMapId = 'training';

// 현재 맵 내 위치
var currentLocationId = 'entrance';

// 맵별 클리어 상태
let mapClearStatus = {
    training: false,
    village: false,
    cave: false,
    forest: false,
    tower: false,
    lair: false,
    demon_castle: false
};

// 해금된 맵 목록 (모든 맵 해금)
let unlockedMaps = ['training', 'village', 'cave', 'forest', 'tower', 'lair', 'demon_castle'];

// ============================================
// 🎲 랜덤 갈림길 시스템
// ============================================

// 현재 갈림길의 랜덤 경로 배정 (매번 갈림길 도착 시 셔플)
let currentRandomPaths = {};

/**
 * 랜덤 갈림길 경로를 셔플합니다.
 * @param {Object} location - 갈림길 위치 데이터
 * @returns {Array} - 셔플된 경로 배열
 */
function shuffleRandomPaths(location) {
    if (!location.randomPaths) return [];

    // Fisher-Yates 셔플 알고리즘
    const paths = [...location.randomPaths];
    for (let i = paths.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [paths[i], paths[j]] = [paths[j], paths[i]];
    }

    return paths;
}

/**
 * 현재 위치가 랜덤 갈림길인지 확인하고 경로를 설정합니다.
 */
function setupRandomCrossroads() {
    const location = getCurrentLocation();
    if (!location || !location.isRandomCrossroads) return;

    // 새로운 랜덤 경로 배정
    const shuffled = shuffleRandomPaths(location);
    currentRandomPaths = {
        path_1: shuffled[0],
        path_2: shuffled[1],
        path_3: shuffled[2],
        path_4: shuffled[3]
    };

    console.log('🎲 갈림길 경로 배정:', currentRandomPaths);
    addGameLog('🎲 네 갈래의 길이 보인다. 각 길이 어디로 이어지는지 알 수 없다...');
}

/**
 * 랜덤 갈림길 경로 ID를 실제 위치 ID로 변환합니다.
 */
function resolveRandomPath(pathId) {
    if (currentRandomPaths[pathId]) {
        return currentRandomPaths[pathId];
    }
    return pathId;
}

// ============================================
// ⛏️ 광산 통로 랜덤 고정 시스템
// ============================================

// 광산 통로 목적지 (처음엔 랜덤, 선택 후 고정)
let mineTunnelDestinations = {
    mine_tunnel_1: null,  // 아직 탐험 안함
    mine_tunnel_2: null   // 아직 탐험 안함
};

// 광산 통로가 고정되었는지 여부
let mineTunnelsLocked = false;

/**
 * 광산 통로 목적지를 초기화합니다 (게임 시작 또는 리셋 시)
 * 랜덤성 제거: 통로별 고정 경로로 설정
 */
function initMineTunnels() {
    // 고정 경로 설정
    // 좁은 통로(mine_tunnel_1) → 금/은 광산(mine_area_2)
    // 비좁은 통로(mine_tunnel_2) → 보석 광산(mine_area_3)
    mineTunnelDestinations = {
        mine_tunnel_1: 'mine_area_2',  // 좁은 통로 → 금/은 광산
        mine_tunnel_2: 'mine_area_3'   // 비좁은 통로 → 보석 광산
    };
    mineTunnelsLocked = true;  // 처음부터 경로 고정

    console.log('⛏️ 광산 통로 초기화 (고정 경로):', mineTunnelDestinations);
}

/**
 * 광산 통로를 통해 이동할 때 목적지를 결정합니다.
 * 처음 선택 시 해당 통로의 목적지가 고정됩니다.
 */
function resolveMinePassage(tunnelId) {
    // 아직 초기화 안됐으면 초기화
    if (!mineTunnelDestinations.mine_tunnel_1) {
        initMineTunnels();
    }

    // 통로의 목적지 반환
    const destination = mineTunnelDestinations[tunnelId];

    if (destination) {
        // 처음 통로 선택 시 경로 고정
        if (!mineTunnelsLocked) {
            mineTunnelsLocked = true;
            console.log('⛏️ 광산 통로 경로 고정됨!');
            addGameLog('⛏️ 이 통로가 어디로 이어지는지 기억했다!');
        }
        return destination;
    }

    return tunnelId;
}

/**
 * 광산 통로가 고정되었는지 확인합니다.
 */
function areMineTunnelsLocked() {
    return mineTunnelsLocked;
}

/**
 * 광산 통로 목적지 이름을 가져옵니다 (고정된 경우에만)
 */
function getMineTunnelDestinationName(tunnelId) {
    if (!mineTunnelsLocked || !mineTunnelDestinations[tunnelId]) {
        return '???';
    }

    const map = getCurrentMap();
    if (map && map.locations && map.locations[mineTunnelDestinations[tunnelId]]) {
        return map.locations[mineTunnelDestinations[tunnelId]].name;
    }
    return '???';
}

// ============================================
// 🗺️ 맵 함수
// ============================================

/**
 * 현재 맵 정보를 가져옵니다.
 */
function getCurrentMap() {
    return MAPS[currentMapId];
}

/**
 * 현재 위치 정보를 가져옵니다.
 */
function getCurrentLocation() {
    const map = getCurrentMap();
    if (map && map.locations) {
        return map.locations[currentLocationId];
    }
    return null;
}

/**
 * 맵이 해금되었는지 확인합니다.
 */
function isMapUnlocked(mapId) {
    return unlockedMaps.includes(mapId);
}

/**
 * 맵을 해금합니다.
 */
function unlockMap(mapId) {
    if (!unlockedMaps.includes(mapId)) {
        unlockedMaps.push(mapId);
        console.log(`🔓 ${MAPS[mapId].name} 해금!`);
        addGameLog(`🔓 ${MAPS[mapId].name}이(가) 해금되었습니다!`);
    }
}

/**
 * 맵을 클리어 처리합니다.
 */
function clearMap(mapId) {
    mapClearStatus[mapId] = true;

    // 다음 맵 해금
    const currentIndex = MAP_ORDER.indexOf(mapId);
    if (currentIndex < MAP_ORDER.length - 1) {
        const nextMapId = MAP_ORDER[currentIndex + 1];
        unlockMap(nextMapId);
    }

    console.log(`✅ ${MAPS[mapId].name} 클리어!`);
}

/**
 * 다른 맵으로 이동합니다.
 */
function travelToMap(mapId) {
    if (!MAPS[mapId]) {
        console.error(`❌ 존재하지 않는 맵: ${mapId}`);
        return false;
    }

    if (!isMapUnlocked(mapId)) {
        addGameLog(`🔒 ${MAPS[mapId].name}은(는) 아직 해금되지 않았습니다.`);
        return false;
    }

    currentMapId = mapId;
    const map = getCurrentMap();

    // 기본 위치로 이동
    currentLocationId = map.defaultLocation || 'entrance';

    // UI 업데이트
    updateMapUI();
    updateLocationUI();

    addGameLog(`🚶 ${map.name}(으)로 이동했습니다!`);
    console.log(`🚶 ${map.name}(으)로 이동!`);

    return true;
}

/**
 * 맵 내 다른 위치로 이동합니다.
 */
function moveToLocation(locationId) {
    const map = getCurrentMap();

    // 랜덤 경로 변환 (path_1, path_2 등을 실제 위치 ID로)
    let resolvedLocationId = resolveRandomPath(locationId);

    // 광산 통로인 경우 목적지로 변환
    if (locationId === 'mine_tunnel_1' || locationId === 'mine_tunnel_2') {
        // 통로를 통해 이동하면 해당 구역으로 이동
        resolvedLocationId = resolveMinePassage(locationId);
    }

    if (!map || !map.locations || !map.locations[resolvedLocationId]) {
        console.error(`❌ 존재하지 않는 위치: ${resolvedLocationId}`);
        return false;
    }

    const currentLoc = getCurrentLocation();

    // 랜덤 갈림길에서 이동하는 경우 path_# 연결 확인
    if (currentLoc && currentLoc.isRandomCrossroads && locationId.startsWith('path_')) {
        // 랜덤 경로는 path_1~4 중 하나로 연결됨
        if (!currentLoc.connections.includes(locationId)) {
            addGameLog(`🚫 해당 경로로는 갈 수 없습니다.`);
            return false;
        }
    } else if (currentLoc && currentLoc.connections && !currentLoc.connections.includes(resolvedLocationId) && !currentLoc.connections.includes(locationId)) {
        addGameLog(`🚫 ${map.locations[resolvedLocationId].name}(으)로는 직접 갈 수 없습니다.`);
        return false;
    }

    // 보스방 진입 경고 체크
    const targetLoc = map.locations[resolvedLocationId];
    if (targetLoc && targetLoc.isBossArea) {
        // 첫 진입 여부 확인
        const bossKey = `${map.id}_${resolvedLocationId}_boss_warned`;
        if (!player.bossWarnings) player.bossWarnings = {};
        
        if (!player.bossWarnings[bossKey]) {
            // 경고 모달 표시
            showBossWarningModal(targetLoc, resolvedLocationId, map.id, bossKey);
            return false; // 모달에서 확인 후 다시 이동
        }
    }

    // 실제 이동 실행
    return executeLocationMove(resolvedLocationId);
}

/**
 * 실제 위치 이동을 실행합니다.
 */
function executeLocationMove(resolvedLocationId) {
    currentLocationId = resolvedLocationId;
    const newLoc = getCurrentLocation();
    const map = getCurrentMap();

    // 갈림길에 도착하면 랜덤 경로 셔플
    if (newLoc && newLoc.isRandomCrossroads) {
        setupRandomCrossroads();
    }

    // 광산 1구역에 처음 도착하면 통로 초기화
    if (newLoc && newLoc.isMineCrossroads && !mineTunnelDestinations.mine_tunnel_1) {
        initMineTunnels();
        addGameLog('⛏️ 더 깊은 곳으로 향하는 두 개의 통로가 보인다. 어디로 이어지는지 알 수 없다...');
    }

    updateLocationUI();
    addGameLog(`🚶 ${newLoc.name}(으)로 이동했습니다.`);

    // 보스방 진입 시 보스 대화 및 전투 시작
    if (newLoc && newLoc.isBossArea && newLoc.bossMonster) {
        setTimeout(() => {
            showBossEncounter(newLoc);
        }, 500);
    }

    return true;
}

/**
 * 보스방 진입 경고 모달을 표시합니다.
 */
function showBossWarningModal(targetLoc, locationId, mapId, bossKey) {
    // 기존 모달 제거
    const existingModal = document.querySelector('.boss-warning-modal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'boss-warning-modal';
    
    overlay.innerHTML = `
        <div class="boss-warning-content">
            <div class="boss-warning-icon">⚠️</div>
            <h2 class="boss-warning-title">위험 경고!</h2>
            <p class="boss-warning-text">
                강력한 기운이 느껴집니다...<br>
                <strong>${targetLoc.name}</strong>에는 매우 강력한 적이 기다리고 있습니다.
            </p>
            <p class="boss-warning-desc">정말 진입하시겠습니까?</p>
            <div class="boss-warning-buttons">
                <button class="boss-warning-btn confirm" onclick="confirmBossEntry('${locationId}', '${bossKey}')">
                    ⚔️ 진입한다
                </button>
                <button class="boss-warning-btn cancel" onclick="cancelBossEntry()">
                    🔙 돌아간다
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    addGameLog('⚠️ 위험한 기운이 느껴집니다...');
}

/**
 * 보스방 진입을 확정합니다.
 */
function confirmBossEntry(locationId, bossKey) {
    // 모달 제거
    const modal = document.querySelector('.boss-warning-modal');
    if (modal) modal.remove();

    // 경고 확인 기록
    if (!player.bossWarnings) player.bossWarnings = {};
    player.bossWarnings[bossKey] = true;

    addGameLog('💀 위험을 감수하고 진입합니다...');

    // 실제 이동 실행
    executeLocationMove(locationId);
}

/**
 * 보스방 진입을 취소합니다.
 */
function cancelBossEntry() {
    const modal = document.querySelector('.boss-warning-modal');
    if (modal) modal.remove();

    addGameLog('🔙 발걸음을 돌립니다.');
}

/**
 * 보스 조우 대화를 표시하고 전투를 시작합니다.
 */
function showBossEncounter(location) {
    const bossType = location.bossMonster;
    const bossData = MONSTERS[bossType];
    
    if (!bossData) {
        console.error('보스 데이터 없음:', bossType);
        startBattle([bossType]);
        return;
    }

    // 보스 대화 데이터
    const bossDialogues = {
        cursed_lord: {
            name: '저주받은 영주',
            emoji: '👻',
            lines: [
                '오호... 누가 내 저택에 감히 발을 들였나?',
                '네 영혼도 내 신하로 삼아주마!',
                '죽음을 맞이할 준비가 되었느냐!'
            ]
        },
        forest_guardian: {
            name: '숲의 수호자',
            emoji: '🌳',
            lines: [
                '이 숲의 심장부에 침입하다니...',
                '자연을 모독한 죄, 용서치 않겠다!',
                '숲의 분노를 느껴보아라!'
            ]
        },
        ancient_golem: {
            name: '고대 골렘',
            emoji: '🗿',
            lines: [
                '... 침입자 감지...',
                '... 고대의 명령... 수호 임무 수행...',
                '... 제거 시작...'
            ]
        },
        demon_archduke: {
            name: '악마 대공',
            emoji: '😈',
            lines: [
                '크크크... 어린 모험가가 여기까지 왔군.',
                '네 영혼은 훌륭한 연료가 될 것이다!',
                '자, 춤을 시작하지!'
            ]
        },
        dragon_lord: {
            name: '드래곤 로드',
            emoji: '🐉',
            lines: [
                '감히 내 둥지에 발을 들이다니...',
                '수천 년 동안 이런 대담한 자는 처음이로군.',
                '재가 되어 바람에 흩어져라!'
            ]
        },
        demon_king: {
            name: '마왕',
            emoji: '👿',
            lines: [
                '후후... 드디어 왔군, 용사여.',
                '네가 여기까지 올 줄 알고 있었다.',
                '이 세상의 멸망을 눈으로 보게 해주마!'
            ]
        }
    };

    // 기본 대화 (데이터에 없는 보스용)
    const defaultDialogue = {
        name: bossData.name,
        emoji: bossData.emoji || '👹',
        lines: [
            '감히 이곳에 발을 들이다니...',
            '네 용기는 인정하마. 하지만 그것이 끝이다!',
            '덤벼라, 모험가!'
        ]
    };

    const dialogue = bossDialogues[bossType] || defaultDialogue;
    
    showBossDialogSequence(dialogue, bossType);
}

/**
 * 보스 대화 시퀀스를 표시합니다.
 */
function showBossDialogSequence(dialogue, bossType) {
    let currentLine = 0;

    function showNextLine() {
        // 기존 대화 모달 제거
        const existing = document.querySelector('.boss-dialog-modal');
        if (existing) existing.remove();

        if (currentLine >= dialogue.lines.length) {
            // 대화 종료, 전투 시작
            addGameLog(`⚔️ ${dialogue.name}과(와)의 전투 시작!`);
            startBattle([bossType]);
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'boss-dialog-modal';
        
        overlay.innerHTML = `
            <div class="boss-dialog-content">
                <div class="boss-dialog-portrait">${dialogue.emoji}</div>
                <div class="boss-dialog-box">
                    <div class="boss-dialog-name">${dialogue.name}</div>
                    <div class="boss-dialog-text">${dialogue.lines[currentLine]}</div>
                </div>
                <div class="boss-dialog-continue" onclick="continueBossDialog()">
                    ${currentLine < dialogue.lines.length - 1 ? '▶ 다음' : '⚔️ 전투 시작!'}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        addGameLog(`${dialogue.emoji} ${dialogue.name}: "${dialogue.lines[currentLine]}"`);
        
        currentLine++;
        
        // 전역 함수로 다음 대화 진행
        window.continueBossDialog = function() {
            showNextLine();
        };
    }

    showNextLine();
}

// ============================================
// 🎨 맵 UI
// ============================================

/**
 * 맵 UI를 업데이트합니다.
 */
function updateMapUI() {
    const map = getCurrentMap();
    const bgElement = document.getElementById('gameBackground');

    if (bgElement && map.background) {
        const bgPath = `assets/backgrounds/${map.background}`;
        bgElement.style.backgroundImage = `url('${bgPath}')`;
        bgElement.style.backgroundSize = 'cover';
        bgElement.style.backgroundPosition = 'center';
    }

    const mapNameDisplay = document.getElementById('currentMapName');
    if (mapNameDisplay) {
        mapNameDisplay.textContent = map.name;
    }
}

/**
 * 위치 UI를 업데이트합니다.
 */
function updateLocationUI() {
    const location = getCurrentLocation();
    const map = getCurrentMap();
    if (!location) return;

    // 위치 설명 업데이트
    const mapDescDisplay = document.getElementById('currentMapDesc');
    if (mapDescDisplay) {
        mapDescDisplay.innerHTML = `
            <strong>${location.name}</strong><br>
            ${location.description}
        `;
    }

    // 배경 이미지 적용
    updateLocationBackground(map, location);

    // 행동 버튼 업데이트
    updateLocationActions();
}

/**
 * 위치별 배경 이미지를 적용합니다.
 */
function updateLocationBackground(map, location) {
    // gameBackground 요소에 배경 적용 (HTML에 별도 div 존재)
    const gameBackground = document.getElementById('gameBackground');

    if (!gameBackground) {
        console.warn('⚠️ gameBackground 요소를 찾을 수 없습니다.');
        return;
    }

    // 위치별 배경 이미지 경로 결정
    let backgroundImage = '';

    // 위치별 개별 배경이 있는 경우
    if (location.background) {
        backgroundImage = `assets/backgrounds/${map.id}/${location.background}`;
    }
    // 위치별 배경 정의가 있는 경우 (LOCATION_BACKGROUNDS)
    else if (typeof LOCATION_BACKGROUNDS !== 'undefined' && LOCATION_BACKGROUNDS[map.id] && LOCATION_BACKGROUNDS[map.id][location.id]) {
        backgroundImage = LOCATION_BACKGROUNDS[map.id][location.id];
    }
    // 맵 기본 배경 사용
    else if (map.background) {
        backgroundImage = `assets/backgrounds/${map.background}`;
    }

    // 배경 적용
    if (backgroundImage) {
        gameBackground.style.backgroundImage = `url('${backgroundImage}')`;
        gameBackground.style.backgroundSize = 'cover';
        gameBackground.style.backgroundPosition = 'center';
        gameBackground.style.backgroundRepeat = 'no-repeat';
        console.log(`🖼️ 배경 적용: ${backgroundImage}`);
    } else {
        // 기본 배경 (그라데이션)
        gameBackground.style.backgroundImage = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    }
}

/**
 * 현재 위치에서 가능한 행동 버튼을 업데이트합니다.
 */
function updateLocationActions() {
    const location = getCurrentLocation();
    const actionsContainer = document.getElementById('exploreActions');

    if (!actionsContainer || !location) return;

    actionsContainer.innerHTML = '';

    // 위치별 가능한 행동
    if (location.actions) {
        location.actions.forEach(actionId => {
            const action = ACTION_TYPES[actionId];
            if (action) {
                const btn = document.createElement('button');
                btn.className = 'action-btn';

                // 'talk' 또는 'npc' 액션이고 해당 위치에 NPC가 있으면 NPC 이름으로 표시
                if ((actionId === 'talk' || actionId === 'npc') && location.npcs && location.npcs.length > 0) {
                    // 첫 번째 NPC 정보 가져오기
                    const npcId = location.npcs[0];
                    const npc = NPCS[npcId];
                    if (npc) {
                        btn.innerHTML = `${npc.emoji || '💬'} ${npc.name}`;
                    } else {
                        btn.innerHTML = `${action.icon} ${action.name}`;
                    }
                } else {
                    btn.innerHTML = `${action.icon} ${action.name}`;
                }

                // HP가 0일 때 전투, 탐험 버튼 비활성화
                if (player && player.hp <= 0 && ['battle', 'explore', 'farming'].includes(actionId)) {
                    btn.disabled = true;
                    btn.classList.add('disabled');
                    btn.title = 'HP가 0입니다. 먼저 회복하세요!';
                    btn.onclick = () => addGameLog('❌ HP가 0입니다. 먼저 회복하세요!');
                } else {
                    btn.onclick = () => executeLocationAction(actionId);
                }

                actionsContainer.appendChild(btn);
            }
        });
    }

    // 광산 위치에서 채굴 버튼 추가
    if (canMineHere()) {
        const mineBtn = document.createElement('button');
        mineBtn.className = 'action-btn mining-btn';

        // 장착된 곡괭이 표시
        const pickaxe = getEquippedPickaxe();
        const pickaxeInfo = pickaxe ? ` (${pickaxe.name})` : ' (맨손)';

        mineBtn.innerHTML = `⛏️ 채굴하기${pickaxeInfo}`;
        mineBtn.onclick = () => doMining();

        actionsContainer.appendChild(mineBtn);
    }
}

/**
 * 맵 선택 UI를 표시합니다.
 */
function showMapSelection() {
    const container = document.getElementById('mapSelectionContainer');
    if (!container) return;

    container.innerHTML = '';

    // 헤더 (닫기 버튼 포함)
    const header = document.createElement('div');
    header.className = 'map-popup-header';
    header.innerHTML = `
        <h3>🗺️ 이동할 곳 선택</h3>
        <button class="map-popup-close" onclick="hideMapSelection()">✕</button>
    `;
    container.appendChild(header);

    // 스크롤 가능한 컨텐츠 영역
    const content = document.createElement('div');
    content.className = 'map-popup-content';

    // 현재 위치의 연결된 장소들 (맵 내 이동)
    const currentLoc = getCurrentLocation();
    if (currentLoc && currentLoc.connections && currentLoc.connections.length > 0) {
        const locSection = document.createElement('div');
        locSection.className = 'map-section';

        const locTitle = document.createElement('h4');
        locTitle.className = 'map-section-title local';
        locTitle.textContent = `📍 ${getCurrentMap().name} 내 이동`;
        locSection.appendChild(locTitle);

        const map = getCurrentMap();

        // 랜덤 갈림길인 경우 특별 처리
        if (currentLoc.isRandomCrossroads) {
            // 뒤로가기 (첫 번째 통로)
            currentLoc.connections.forEach(locId => {
                if (locId === 'first_passage') {
                    const loc = map.locations[locId];
                    if (loc) {
                        const btn = document.createElement('button');
                        btn.className = 'map-btn';
                        btn.innerHTML = `
                            <span class="map-icon">🔙</span>
                            <span class="map-name">${loc.name}</span>
                        `;
                        btn.onclick = () => {
                            moveToLocation(locId);
                            hideMapSelection();
                        };
                        locSection.appendChild(btn);
                    }
                }
            });

            // 랜덤 4갈래 길 표시
            const pathNames = ['첫 번째 길', '두 번째 길', '세 번째 길', '네 번째 길'];
            const pathIcons = ['🚪', '🚪', '🚪', '🚪'];

            ['path_1', 'path_2', 'path_3', 'path_4'].forEach((pathId, index) => {
                const btn = document.createElement('button');
                btn.className = 'map-btn mystery-path';
                btn.innerHTML = `
                    <span class="map-icon">${pathIcons[index]}</span>
                    <span class="map-name">${pathNames[index]}</span>
                    <span class="map-hint">???</span>
                `;
                btn.onclick = () => {
                    moveToLocation(pathId);
                    hideMapSelection();
                };
                locSection.appendChild(btn);
            });
        } else if (currentLoc.isMineCrossroads) {
            // 광산 갈림길인 경우 특별 처리
            currentLoc.connections.forEach(locId => {
                if (locId === 'crossroads') {
                    // 뒤로가기 버튼
                    const loc = map.locations[locId];
                    if (loc) {
                        const btn = document.createElement('button');
                        btn.className = 'map-btn';
                        btn.innerHTML = `
                            <span class="map-icon">🔙</span>
                            <span class="map-name">갈림길로 돌아가기</span>
                        `;
                        btn.onclick = () => {
                            moveToLocation(locId);
                            hideMapSelection();
                        };
                        locSection.appendChild(btn);
                    }
                }
            });

            // 광산 통로 버튼 표시
            ['mine_tunnel_1', 'mine_tunnel_2'].forEach((tunnelId, index) => {
                const btn = document.createElement('button');
                const destName = getMineTunnelDestinationName(tunnelId);
                const isLocked = areMineTunnelsLocked();

                btn.className = `map-btn ${isLocked ? '' : 'mystery-path'}`;
                btn.innerHTML = `
                    <span class="map-icon">⛏️</span>
                    <span class="map-name">${index === 0 ? '좁은 통로' : '비좁은 통로'}</span>
                    <span class="map-hint">${isLocked ? '→ ' + destName : '???'}</span>
                `;
                btn.onclick = () => {
                    moveToLocation(tunnelId);
                    hideMapSelection();
                };
                locSection.appendChild(btn);
            });
        } else {
            // 일반 위치 연결
            currentLoc.connections.forEach(locId => {
                const loc = map.locations[locId];
                if (loc) {
                    const btn = document.createElement('button');
                    btn.className = 'map-btn';
                    btn.innerHTML = `
                        <span class="map-icon">📍</span>
                        <span class="map-name">${loc.name}</span>
                    `;
                    btn.onclick = () => {
                        moveToLocation(locId);
                        hideMapSelection();
                    };
                    locSection.appendChild(btn);
                }
            });
        }

        content.appendChild(locSection);
    }

    // 다른 맵으로 이동 (입구에서만 가능)
    if (currentLocationId === 'entrance' || currentLocationId === getCurrentMap().defaultLocation) {
        const mapSection = document.createElement('div');
        mapSection.className = 'map-section';

        const mapTitle = document.createElement('h4');
        mapTitle.className = 'map-section-title world';
        mapTitle.textContent = '🌍 다른 지역으로 이동';
        mapSection.appendChild(mapTitle);

        MAP_ORDER.forEach(mapId => {
            if (mapId === currentMapId) return;

            const map = MAPS[mapId];
            const isUnlocked = isMapUnlocked(mapId);
            const isCleared = mapClearStatus[mapId];

            const btn = document.createElement('button');
            btn.className = `map-btn ${!isUnlocked ? 'locked' : ''} ${isCleared ? 'cleared' : ''}`;

            if (isUnlocked) {
                btn.innerHTML = `
                    <span class="map-icon">${isCleared ? '✅' : '📍'}</span>
                    <span class="map-name">${map.name}</span>
                    <span class="map-level">Lv.${map.level}</span>
                `;
                btn.onclick = () => {
                    travelToMap(mapId);
                    hideMapSelection();
                };
            } else {
                btn.innerHTML = `
                    <span class="map-icon">🔒</span>
                    <span class="map-name">???</span>
                    <span class="map-level">-</span>
                `;
                btn.disabled = true;
            }

            mapSection.appendChild(btn);
        });

        content.appendChild(mapSection);
    }

    container.appendChild(content);
    container.classList.remove('hidden');
}

/**
 * 맵 선택 UI를 숨깁니다.
 */
function hideMapSelection() {
    const container = document.getElementById('mapSelectionContainer');
    if (container) {
        container.classList.add('hidden');
    }
}

// ============================================
// 🎯 행동 실행
// ============================================

/**
 * 위치별 행동을 실행합니다.
 */
function executeLocationAction(actionId) {
    console.log('🎮 executeLocationAction:', actionId);

    switch (actionId) {
        case 'battle':
            startLocationBattle();
            break;
        case 'move':
            showMapSelection();
            break;
        case 'explore':
            doExplore();
            break;
        case 'farming':
            doFarming();
            break;
        case 'rest':
            doRest();
            break;
        case 'shop':
            showShop();
            break;
        case 'talk':
        case 'npc':
            showNPCDialog();
            break;
        default:
            console.log(`알 수 없는 행동: ${actionId}`);
    }
}

/**
 * 기존 executeAction 함수 (호환성)
 */
function executeAction(actionId) {
    executeLocationAction(actionId);
}

/**
 * 현재 위치에서 전투를 시작합니다.
 * 다중 몬스터 조우 시스템 적용 (ENCOUNTER_CONFIG 확률 기반)
 */
function startLocationBattle() {
    const location = getCurrentLocation();
    let monsters;

    // 위치에 몬스터가 있으면 그 몬스터, 없으면 맵의 몬스터
    if (location && location.monsters && location.monsters.length > 0) {
        monsters = location.monsters;
    } else {
        const map = getCurrentMap();
        monsters = map.monsters || [];
    }

    if (monsters.length === 0) {
        addGameLog('이 지역에는 몬스터가 없습니다.');
        return;
    }

    // 몬스터 수 결정 (확률 기반)
    const monsterCount = determineMonsterCount();
    
    // 해당 수만큼 몬스터 선택
    const selectedMonsters = [];
    for (let i = 0; i < monsterCount; i++) {
        const randomMonsterType = monsters[Math.floor(Math.random() * monsters.length)];
        selectedMonsters.push(randomMonsterType);
    }

    // 다중 몬스터 전투 시작
    if (typeof startBattle === 'function') {
        startBattle(selectedMonsters);
    }
}

/**
 * ENCOUNTER_CONFIG 확률에 따라 조우할 몬스터 수를 결정합니다.
 * @returns {number} 조우할 몬스터 수
 */
function determineMonsterCount() {
    // ENCOUNTER_CONFIG가 없으면 기본 1마리
    if (typeof ENCOUNTER_CONFIG === 'undefined' || !ENCOUNTER_CONFIG.monsterCountChances) {
        return 1;
    }

    const roll = Math.random();
    let cumulative = 0;

    for (const entry of ENCOUNTER_CONFIG.monsterCountChances) {
        cumulative += entry.chance;
        if (roll < cumulative) {
            return entry.count;
        }
    }

    // 기본값 (확률 합계가 1이 아닐 경우 대비)
    return 1;
}

/**
 * 탐험을 수행합니다.
 * - 위치별 탐사 아이템 사용
 * - 휴식처는 별도 탐사 아이템 사용 (useRestAreaItems)
 * - canBattle이 false인 지역에서는 몬스터 출현 안 함
 */
function doExplore() {
    addGameLog('🔍 주변을 탐험합니다...');

    const location = getCurrentLocation();
    const map = getCurrentMap();

    if (!location || !map) {
        addGameLog('❌ 탐험할 수 없는 지역입니다.');
        return;
    }

    // 탐사 가능 여부 확인
    if (location.canExplore === false) {
        addGameLog('❌ 이 지역에서는 탐사가 불가능합니다.');
        return;
    }

    // 탐사 아이템 목록 결정 (휴식처 전용 vs 일반)
    let exploreItems;
    if (location.useRestAreaItems && map.restAreaExploreItems) {
        exploreItems = map.restAreaExploreItems;
    } else {
        exploreItems = map.exploreItems || [];
    }

    // 탐사 결과 결정
    const roll = Math.random();

    // 전투 가능 지역에서만 몬스터 출현 (20% 확률)
    if (location.canBattle && roll < 0.2) {
        addGameLog('⚔️ 몬스터와 마주쳤습니다!');
        startLocationBattle();
        return;
    }

    // 아이템 발견 시도 (70% 확률)
    if (roll < 0.7 && exploreItems.length > 0) {
        // 아이템 확률 기반 선택
        const foundItem = tryToFindExploreItem(exploreItems);

        if (foundItem) {
            handleExploreItemFound(foundItem);
        } else {
            addGameLog('특별한 것을 발견하지 못했습니다.');
        }
    } else {
        addGameLog('특별한 것을 발견하지 못했습니다.');
    }

    updatePlayerUI();
}

/**
 * 탐사 아이템 확률 기반 선택
 */
function tryToFindExploreItem(exploreItems) {
    // 각 아이템에 대해 확률 체크
    for (const item of exploreItems) {
        if (Math.random() < item.chance) {
            return item;
        }
    }
    return null;
}

/**
 * 탐사에서 발견한 아이템 처리
 */
function handleExploreItemFound(foundItem) {
    // 골드인 경우
    if (foundItem.id === 'gold_small' || foundItem.id.includes('gold')) {
        const amount = foundItem.amount
            ? Math.floor(Math.random() * (foundItem.amount[1] - foundItem.amount[0] + 1)) + foundItem.amount[0]
            : Math.floor(Math.random() * 5) + 1;
        gold += amount;
        addGameLog(`💰 ${amount} 골드를 발견했습니다!`);
        return;
    }

    // 경험치인 경우
    if (foundItem.id === 'tiny_exp' || foundItem.id.includes('exp')) {
        const amount = foundItem.amount
            ? Math.floor(Math.random() * (foundItem.amount[1] - foundItem.amount[0] + 1)) + foundItem.amount[0]
            : Math.floor(Math.random() * 5) + 1;
        player.exp = (player.exp || 0) + amount;
        addGameLog(`⭐ ${amount} 경험치를 획득했습니다!`);
        checkLevelUp();
        return;
    }

    // 일반 아이템인 경우 - 인벤토리에 추가
    const itemData = ITEMS_DATABASE[foundItem.id];

    if (itemData) {
        // ITEMS_DATABASE에 있는 아이템
        addItemToInventory(foundItem.id, 1);
        addGameLog(`📦 ${foundItem.name || itemData.name}을(를) 발견했습니다!`);
    } else {
        // ITEMS_DATABASE에 없는 아이템 - 동적 생성 후 추가
        const newItem = createExploreItem(foundItem);
        if (newItem) {
            // ITEMS_DATABASE에 등록
            ITEMS_DATABASE[foundItem.id] = newItem;
            addItemToInventory(foundItem.id, 1);
            addGameLog(`📦 ${foundItem.name}을(를) 발견했습니다!`);
        } else {
            addGameLog(`📦 ${foundItem.name}을(를) 발견했습니다! (인벤토리에 추가되지 않음)`);
        }
    }
}

/**
 * 탐사 아이템 데이터 동적 생성
 */
function createExploreItem(foundItem) {
    // 아이템 ID에 따른 기본 데이터 생성
    const itemTemplates = {
        // 휴식처 아이템
        'old_bandage': {
            type: 'consumable',
            rarity: 'common',
            description: '낡은 붕대입니다. HP를 약간 회복합니다.',
            icon: '🩹',
            effect: { hp: 15 },
            sellPrice: 3,
            stackable: true
        },
        'crude_hp_potion': {
            type: 'consumable',
            rarity: 'common',
            description: '조잡하게 만든 체력회복물약입니다.',
            icon: '❤️',
            effect: { hp: 30 },
            sellPrice: 5,
            stackable: true
        },
        'crude_mp_potion': {
            type: 'consumable',
            rarity: 'common',
            description: '조잡하게 만든 마나회복물약입니다.',
            icon: '💙',
            effect: { mp: 20 },
            sellPrice: 6,
            stackable: true
        },
        // 일반 탐사 아이템
        'crude_grass': {
            type: 'material',
            rarity: 'common',
            description: '조잡한 풀입니다.',
            icon: '🌱',
            sellPrice: 1,
            stackable: true
        },
        'rusty_scrap': {
            type: 'material',
            rarity: 'common',
            description: '녹슨 철조각입니다.',
            icon: '🔩',
            sellPrice: 2,
            stackable: true
        },
        'rusty_longsword': {
            type: 'weapon',
            rarity: 'common',
            description: '녹이 슨 대검입니다.',
            icon: '⚔️',
            stats: { pAtk: 5 },
            sellPrice: 12
        },
        'rusty_sword': {
            type: 'weapon',
            rarity: 'common',
            description: '녹이 슨 단검입니다.',
            icon: '🗡️',
            stats: { pAtk: 3 },
            sellPrice: 8
        },
        'old_bow': {
            type: 'weapon',
            rarity: 'common',
            description: '낡은 활입니다.',
            icon: '🏹',
            stats: { pAtk: 4 },
            sellPrice: 7
        },
        'old_staff': {
            type: 'weapon',
            rarity: 'common',
            description: '낡은 지팡이입니다.',
            icon: '🪄',
            stats: { mAtk: 4 },
            sellPrice: 7
        },
        'old_gloves': {
            type: 'accessory',
            rarity: 'common',
            description: '낡은 장갑입니다.',
            icon: '🧤',
            stats: { pDef: 1 },
            sellPrice: 4
        },
        'old_weed': {
            type: 'material',
            rarity: 'common',
            description: '낡은 부초입니다.',
            icon: '🌿',
            sellPrice: 2,
            stackable: true
        },
        'rusty_half_plate': {
            type: 'accessory',
            rarity: 'common',
            description: '녹슨 철반지입니다.',
            icon: '💍',
            stats: { pDef: 1 },
            sellPrice: 5
        },
        'old_cloth_piece': {
            type: 'material',
            rarity: 'common',
            description: '낡은 천조각입니다.',
            icon: '🧵',
            sellPrice: 2,
            stackable: true
        }
    };

    const template = itemTemplates[foundItem.id];
    if (template) {
        return {
            id: foundItem.id,
            name: foundItem.name,
            ...template
        };
    }

    // 기본 재료 아이템으로 생성
    return {
        id: foundItem.id,
        name: foundItem.name,
        type: 'material',
        rarity: 'common',
        description: `${foundItem.name}입니다.`,
        icon: '📦',
        sellPrice: 1,
        stackable: true
    };
}

/**
 * 파밍을 수행합니다.
 */
function doFarming() {
    addGameLog('🌿 자원을 수집합니다...');

    const goldGained = Math.floor(Math.random() * 15) + 3;
    gold += goldGained;

    addGameLog(`💰 ${goldGained} 골드를 얻었습니다!`);
    updatePlayerUI();
}

/**
 * 휴식을 취합니다.
 */
function doRest() {
    if (!player) return;

    // 휴식처에서 휴식 시 HP/MP 완전 회복
    const hpRecover = player.maxHp - player.hp;
    const mpRecover = player.maxMp - player.mp;

    player.hp = player.maxHp;
    player.mp = player.maxMp;

    addGameLog(`💤 휴식을 취합니다. HP가 최대로 회복되었습니다! (+${hpRecover})`);
    addGameLog(`✨ MP가 최대로 회복되었습니다! (+${mpRecover})`);
    updatePlayerUI();
}

/**
 * 상점을 표시합니다.
 * 이 함수는 shopSystem.js에서 재정의됩니다.
 */
// showShop() 함수는 shopSystem.js에서 정의됨

/**
 * NPC 대화를 표시합니다.
 * 이 함수는 shopSystem.js에서 재정의됩니다.
 */
// showNPCDialog() 함수는 shopSystem.js에서 정의됨

// ============================================
// 📝 게임 로그
// ============================================

/**
 * 게임 로그에 메시지를 추가합니다.
 * HTML 태그를 지원합니다 (색상 등).
 */
function addGameLog(message) {
    const logBox = document.getElementById('gameLogBox');
    if (logBox) {
        const entry = document.createElement('p');
        entry.innerHTML = message;  // HTML 태그 지원
        logBox.appendChild(entry);
        logBox.scrollTop = logBox.scrollHeight;

        while (logBox.children.length > 50) {
            logBox.removeChild(logBox.firstChild);
        }
    }

    // 콘솔에는 태그 제거 후 출력
    console.log(`📝 ${message.replace(/<[^>]*>/g, '')}`);
}

/**
 * 게임 로그를 초기화합니다.
 */
function clearGameLog() {
    const logBox = document.getElementById('gameLogBox');
    if (logBox) {
        logBox.innerHTML = '';
    }
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('🗺️ mapSystem.js v2 로드 완료!');

// ============================================
// ⛏️ 채굴 시스템
// ============================================

// 구역별 광석 채굴 확률 (성공 시 확률 분배)
const MINING_ORES = {
    // 1구역: 기본 광석
    abandoned_mine: {
        baseFailRate: 0.30,  // 기본 실패 확률 30%
        ores: [
            { id: 'stone', name: '돌', chance: 0.20, icon: '🪨' },
            { id: 'coal', name: '석탄', chance: 0.35, icon: '⬛' },
            { id: 'copper_ore', name: '구리 광석', chance: 0.30, icon: '🟫' },
            { id: 'iron_ore', name: '철광석', chance: 0.15, icon: '⬜' }
        ]
    },
    // 2구역: 희귀 금속
    mine_area_2: {
        baseFailRate: 0.40,  // 기본 실패 확률 40%
        ores: [
            { id: 'gold_ore', name: '금광석', chance: 0.20, icon: '🟡' },
            { id: 'silver_ore', name: '은광석', chance: 0.25, icon: '⚪' },
            { id: 'mithril_ore', name: '미스릴 광석', chance: 0.15, icon: '💎' },
            { id: 'black_iron_ore', name: '흑철 광석', chance: 0.18, icon: '⚫' },
            { id: 'mana_stone', name: '마나석', chance: 0.12, icon: '🔮' },
            { id: 'obsidian', name: '흑요석', chance: 0.10, icon: '🖤' }
        ]
    },
    // 3구역: 보석류
    mine_area_3: {
        baseFailRate: 0.45,  // 기본 실패 확률 45%
        ores: [
            { id: 'amethyst', name: '자수정', chance: 0.18, icon: '💜' },
            { id: 'ruby', name: '루비', chance: 0.12, icon: '❤️' },
            { id: 'sapphire', name: '사파이어', chance: 0.12, icon: '💙' },
            { id: 'emerald', name: '에메랄드', chance: 0.10, icon: '💚' },
            { id: 'diamond', name: '다이아몬드', chance: 0.05, icon: '💎' },
            { id: 'red_crystal', name: '붉은 수정', chance: 0.15, icon: '🔴' },
            { id: 'blue_crystal', name: '푸른 수정', chance: 0.14, icon: '🔵' },
            { id: 'green_crystal', name: '녹색 수정', chance: 0.09, icon: '🟢' },
            { id: 'purple_crystal', name: '보라 수정', chance: 0.05, icon: '🟣' }
        ]
    }
};

// ============================================
// ⛏️ 광석 희귀도 및 판매가 헬퍼 함수
// ============================================

/**
 * 광석 희귀도를 반환합니다.
 */
function getOreRarity(oreId) {
    const rarities = {
        stone: 'common', coal: 'common', copper_ore: 'common', iron_ore: 'common',
        gold_ore: 'uncommon', silver_ore: 'uncommon', mithril_ore: 'rare',
        black_iron_ore: 'uncommon', mana_stone: 'rare', obsidian: 'uncommon',
        amethyst: 'uncommon', ruby: 'rare', sapphire: 'rare', emerald: 'rare',
        diamond: 'epic', red_crystal: 'uncommon', blue_crystal: 'uncommon',
        green_crystal: 'uncommon', purple_crystal: 'rare'
    };
    return rarities[oreId] || 'common';
}

/**
 * 광석 판매가를 반환합니다.
 */
function getOreSellPrice(oreId) {
    const prices = {
        stone: 1, coal: 3, copper_ore: 5, iron_ore: 8,
        gold_ore: 25, silver_ore: 20, mithril_ore: 50,
        black_iron_ore: 30, mana_stone: 45, obsidian: 35,
        amethyst: 40, ruby: 60, sapphire: 60, emerald: 70,
        diamond: 150, red_crystal: 35, blue_crystal: 35,
        green_crystal: 35, purple_crystal: 45
    };
    return prices[oreId] || 5;
}

/**
 * 광석 아이콘을 반환합니다.
 */
function getOreIcon(oreId) {
    const icons = {
        stone: '🪨', coal: '⬛', copper_ore: '🟫', iron_ore: '⬜',
        gold_ore: '🟡', silver_ore: '⚪', mithril_ore: '💎',
        black_iron_ore: '⚫', mana_stone: '🔮', obsidian: '🖤',
        amethyst: '💜', ruby: '❤️', sapphire: '💙', emerald: '💚',
        diamond: '💎', red_crystal: '🔴', blue_crystal: '🔵',
        green_crystal: '🟢', purple_crystal: '🟣'
    };
    return icons[oreId] || '📦';
}

/**
 * 광석을 ITEMS_DATABASE에 등록합니다.
 */
function registerOreToDatabase(oreId, oreName) {
    if (typeof ITEMS_DATABASE !== 'undefined' && !ITEMS_DATABASE[oreId]) {
        ITEMS_DATABASE[oreId] = {
            id: oreId,
            name: oreName,
            type: 'material',
            rarity: getOreRarity(oreId),
            description: `${oreName}입니다. 제련하거나 판매할 수 있습니다.`,
            icon: getOreIcon(oreId),
            sellPrice: getOreSellPrice(oreId),
            stackable: true
        };
        console.log(`📦 광석 등록: ${oreName} (${oreId})`);
    }
}

// 곡괭이 장비 데이터
const PICKAXE_DATA = {
    wooden_pickaxe: {
        id: 'wooden_pickaxe',
        name: '나무 곡괭이',
        type: 'tool',
        icon: '⛏️',
        rarity: 'common',
        description: '기본적인 나무 곡괭이. 채굴 실패 확률을 5% 감소시킨다.',
        failReduction: 0.05,
        rareBonus: 0,
        price: 30,
        sellPrice: 15
    },
    stone_pickaxe: {
        id: 'stone_pickaxe',
        name: '돌 곡괭이',
        type: 'tool',
        icon: '⛏️',
        rarity: 'common',
        description: '튼튼한 돌 곡괭이. 채굴 실패 확률을 10% 감소시킨다.',
        failReduction: 0.10,
        rareBonus: 0.02,
        price: 80,
        sellPrice: 40
    },
    iron_pickaxe: {
        id: 'iron_pickaxe',
        name: '철 곡괭이',
        type: 'tool',
        icon: '⛏️',
        rarity: 'uncommon',
        description: '단단한 철 곡괭이. 채굴 실패 확률을 15% 감소, 귀한 광물 확률 5% 증가.',
        failReduction: 0.15,
        rareBonus: 0.05,
        price: 200,
        sellPrice: 100
    },
    mithril_pickaxe: {
        id: 'mithril_pickaxe',
        name: '미스릴 곡괭이',
        type: 'tool',
        icon: '⛏️',
        rarity: 'rare',
        description: '마법이 깃든 미스릴 곡괭이. 채굴 실패 확률을 25% 감소, 귀한 광물 확률 10% 증가.',
        failReduction: 0.25,
        rareBonus: 0.10,
        price: 500,
        sellPrice: 250
    }
};

// 현재 장착된 곡괭이
let equippedPickaxe = null;

/**
 * 곡괭이를 장착합니다.
 */
function equipPickaxe(pickaxeId) {
    if (PICKAXE_DATA[pickaxeId]) {
        equippedPickaxe = PICKAXE_DATA[pickaxeId];
        addGameLog(`⛏️ ${equippedPickaxe.name}을(를) 장착했습니다!`);
        updatePlayerUI();
        return true;
    }
    return false;
}

/**
 * 곡괭이를 해제합니다.
 */
function unequipPickaxe() {
    if (equippedPickaxe) {
        addGameLog(`⛏️ ${equippedPickaxe.name}을(를) 해제했습니다.`);
        equippedPickaxe = null;
        updatePlayerUI();
    }
}

/**
 * 현재 장착된 곡괭이 정보를 가져옵니다.
 */
function getEquippedPickaxe() {
    return equippedPickaxe;
}

/**
 * 채굴을 시도합니다.
 */
function doMining() {
    const location = getCurrentLocation();

    // 현재 위치가 광산인지 확인
    const mineData = MINING_ORES[location.id];
    if (!mineData) {
        addGameLog('❌ 이곳에서는 채굴할 수 없습니다!');
        return;
    }

    // 곡괭이 효과 계산
    let failRate = mineData.baseFailRate;
    let rareBonus = 0;

    if (equippedPickaxe) {
        failRate = Math.max(0.05, failRate - equippedPickaxe.failReduction);
        rareBonus = equippedPickaxe.rareBonus;
        console.log(`⛏️ 곡괭이 효과: 실패율 ${(equippedPickaxe.failReduction * 100).toFixed(0)}% 감소, 희귀 보너스 ${(rareBonus * 100).toFixed(0)}%`);
    }

    // 채굴 시도
    const roll = Math.random();

    if (roll < failRate) {
        // 실패! 돌 1개만 획득
        addGameLog('⛏️ 채굴에 실패했습니다... 돌 1개를 획득했습니다.');
        // 돌을 ITEMS_DATABASE에 등록 후 추가
        registerOreToDatabase('stone', '돌');
        addItemToInventory('stone', 1);
        return;
    }

    // 성공! 광석 선택
    let ores = [...mineData.ores];

    // 희귀 보너스 적용 (확률 재분배)
    if (rareBonus > 0) {
        ores = ores.map((ore, index) => {
            // 후반 광석일수록 희귀하다고 가정
            const rarityWeight = (index + 1) / ores.length;
            const bonusChance = ore.chance * (1 + rareBonus * rarityWeight * 2);
            return { ...ore, chance: bonusChance };
        });

        // 확률 정규화
        const totalChance = ores.reduce((sum, ore) => sum + ore.chance, 0);
        ores = ores.map(ore => ({ ...ore, chance: ore.chance / totalChance }));
    }

    // 광석 랜덤 선택
    const oreRoll = Math.random();
    let cumulative = 0;
    let selectedOre = ores[0];

    for (const ore of ores) {
        cumulative += ore.chance;
        if (oreRoll <= cumulative) {
            selectedOre = ore;
            break;
        }
    }

    // 광석 획득
    const amount = Math.floor(Math.random() * 2) + 1;  // 1~2개
    addGameLog(`⛏️ 채굴 성공! ${selectedOre.icon} ${selectedOre.name} ${amount}개를 획득했습니다!`);

    // 광석을 ITEMS_DATABASE에 등록 후 인벤토리에 추가
    registerOreToDatabase(selectedOre.id, selectedOre.name);
    addItemToInventory(selectedOre.id, amount);
}

/**
 * 인벤토리에 아이템을 추가합니다.
 * 이 함수는 inventorySystem.js에서 재정의될 수 있습니다.
 */
function addItemToInventory(item) {
    if (typeof window.addToInventory === 'function') {
        window.addToInventory(item.id, item.amount || 1);
    } else if (player && player.inventory) {
        // 간단한 인벤토리 추가 로직
        const existingItem = player.inventory.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.amount = (existingItem.amount || 1) + (item.amount || 1);
        } else {
            player.inventory.push({
                id: item.id,
                name: item.name,
                icon: item.icon,
                amount: item.amount || 1
            });
        }
        addGameLog(`📦 ${item.icon} ${item.name} x${item.amount || 1} 획득!`);
    }
}

/**
 * 현재 위치가 채굴 가능한지 확인합니다.
 */
function canMineHere() {
    const location = getCurrentLocation();
    return location && MINING_ORES[location.id];
}
