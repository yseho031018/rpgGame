/**
 * ============================================
 * RPG Adventure - 시간 시스템
 * ============================================
 * 게임 1일 = 현실 12분
 * 낮/밤에 따라 게임 효과가 달라집니다.
 */

// ============================================
// 🕐 시간 상태
// ============================================

// 게임 시작 시간 (현실 시간)
var gameTimeOrigin = Date.now();

// 게임 내 시작 시간 (기본: 오전 8시)
var gameStartHour = 8;

// ============================================
// 🕐 시간 계산 함수
// ============================================

/**
 * 현재 게임 내 시간을 가져옵니다.
 * @returns {Object} { hour, minute, totalMinutes, dayCount }
 */
function getGameTime() {
    const realElapsed = Date.now() - gameTimeOrigin;

    // 게임 시간 계산 (12분 = 1일 = 1440 게임 분)
    const gameMinutesPerRealMs = 1440 / TIME_CONFIG.gameDayDuration;
    const totalGameMinutes = Math.floor(realElapsed * gameMinutesPerRealMs);

    // 시작 시간 더하기
    const adjustedMinutes = totalGameMinutes + (gameStartHour * 60);

    // 일수 계산
    const dayCount = Math.floor(adjustedMinutes / 1440) + 1;

    // 현재 시간 계산
    const currentDayMinutes = adjustedMinutes % 1440;
    const hour = Math.floor(currentDayMinutes / 60);
    const minute = currentDayMinutes % 60;

    return {
        hour,
        minute,
        totalMinutes: adjustedMinutes,
        dayCount,
        formatted: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    };
}

/**
 * 현재 시간대를 가져옵니다.
 * @returns {string} 'day' 또는 'night'
 */
function getTimeOfDay() {
    const { hour } = getGameTime();

    // 밤: 22시 ~ 6시
    if (hour >= TIME_CONFIG.nightStartHour || hour < TIME_CONFIG.nightEndHour) {
        return 'night';
    }
    return 'day';
}

/**
 * 낮인지 확인합니다.
 */
function isDay() {
    return getTimeOfDay() === 'day';
}

/**
 * 밤인지 확인합니다.
 */
function isNight() {
    return getTimeOfDay() === 'night';
}

// ============================================
// 🌅 시간대 효과
// ============================================

/**
 * 현재 시간대의 효과를 가져옵니다.
 */
function getTimeEffects() {
    return isNight() ? TIME_CONFIG.nightEffects : TIME_CONFIG.dayEffects;
}

/**
 * 경험치에 시간 보너스를 적용합니다.
 */
function applyTimeExpBonus(baseExp) {
    const effects = getTimeEffects();
    return Math.floor(baseExp * effects.expMultiplier);
}

/**
 * 드롭률에 시간 보너스를 적용합니다.
 */
function applyTimeDropBonus(baseRate) {
    const effects = getTimeEffects();
    return baseRate * effects.dropRateMultiplier;
}

/**
 * 밤에 강제 전투가 발생하는지 확인합니다.
 * 밤에는 이동 시 몬스터 강제 전투 확률 증가
 * @returns {boolean} 강제 전투 발생 여부
 */
function checkNightEncounter() {
    if (!isNight()) return false;

    // 밤에는 30% 확률로 강제 전투
    return Math.random() < 0.3;
}

/**
 * 밤 시간 몬스터 강화 배율을 가져옵니다.
 * @returns {number} 강화 배율 (밤에는 1.3배)
 */
function getNightMonsterMultiplier() {
    return isNight() ? 1.3 : 1.0;
}

/**
 * 밤이면 파밍 속도 감소 배율을 반환합니다.
 * @returns {number} 파밍 속도 배율
 */
function getNightFarmingMultiplier() {
    return isNight() ? 0.7 : 1.0;
}

// ============================================
// 🎨 시간 UI
// ============================================

/**
 * 시간에 따른 화면 필터를 가져옵니다.
 */
function getTimeFilter() {
    const { hour } = getGameTime();

    // 새벽 (4-6시): 약간 파란 빛
    if (hour >= 4 && hour < 6) {
        return 'brightness(0.7) saturate(0.8) hue-rotate(-10deg)';
    }
    // 아침 (6-8시): 따뜻한 빛
    if (hour >= 6 && hour < 8) {
        return 'brightness(0.9) saturate(1.1) sepia(0.1)';
    }
    // 낮 (8-17시): 정상
    if (hour >= 8 && hour < 17) {
        return 'brightness(1.0)';
    }
    // 저녁 (17-20시): 노을
    if (hour >= 17 && hour < 20) {
        return 'brightness(0.9) saturate(1.2) sepia(0.2)';
    }
    // 밤 (20-22시): 어두워짐
    if (hour >= 20 && hour < 22) {
        return 'brightness(0.7) saturate(0.9)';
    }
    // 심야 (22-4시): 가장 어두움
    return 'brightness(0.5) saturate(0.7) hue-rotate(10deg)';
}

/**
 * 시간에 따른 하늘 색상을 가져옵니다.
 */
function getSkyGradient() {
    const { hour } = getGameTime();

    // 새벽
    if (hour >= 4 && hour < 6) {
        return 'linear-gradient(180deg, #1a1a2e 0%, #4a4a6a 50%, #8e6a8e 100%)';
    }
    // 아침
    if (hour >= 6 && hour < 8) {
        return 'linear-gradient(180deg, #87CEEB 0%, #FFD700 50%, #FFA500 100%)';
    }
    // 낮
    if (hour >= 8 && hour < 17) {
        return 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 100%)';
    }
    // 저녁
    if (hour >= 17 && hour < 20) {
        return 'linear-gradient(180deg, #FF6B6B 0%, #FFA500 50%, #FFD700 100%)';
    }
    // 밤
    return 'linear-gradient(180deg, #0a0a20 0%, #1a1a40 50%, #2a2a60 100%)';
}

/**
 * 시간 UI를 업데이트합니다.
 */
function updateTimeUI() {
    const gameTime = getGameTime();
    const timeOfDay = getTimeOfDay();

    // 시간 표시 업데이트
    const timeDisplay = document.getElementById('gameTimeDisplay');
    if (timeDisplay) {
        const icon = isNight() ? '🌙' : '☀️';
        timeDisplay.innerHTML = `${icon} Day ${gameTime.dayCount} - ${gameTime.formatted}`;
    }

    // 배경 필터 업데이트
    const gameBackground = document.getElementById('gameBackground');
    if (gameBackground) {
        gameBackground.style.filter = getTimeFilter();
    }

    return { gameTime, timeOfDay };
}

// ============================================
// ⏱️ 시간 업데이트 루프
// ============================================

let timeUpdateInterval = null;
let regenInterval = null;

// 자연 재생 설정 (4초당 최대 HP/MP의 1%)
const REGEN_CONFIG = {
    intervalMs: 4000,      // 4초
    regenPercent: 0.01     // 1%
};

/**
 * 시간 업데이트를 시작합니다.
 */
function startTimeSystem() {
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    if (regenInterval) clearInterval(regenInterval);

    // 1초마다 업데이트 (게임 내 약 2분)
    timeUpdateInterval = setInterval(() => {
        updateTimeUI();
    }, 1000);

    // 4초마다 자연 재생
    regenInterval = setInterval(() => {
        processNaturalRegen();
    }, REGEN_CONFIG.intervalMs);

    // 초기 업데이트
    updateTimeUI();

    console.log('⏰ 시간 시스템 시작!');
    console.log('💚 자연 재생 시스템 시작! (4초당 1%)');
}

/**
 * 시간 업데이트를 중지합니다.
 */
function stopTimeSystem() {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    }
    if (regenInterval) {
        clearInterval(regenInterval);
        regenInterval = null;
    }
}

/**
 * 게임 시간을 리셋합니다.
 */
function resetGameTime(startHour = 8) {
    gameTimeOrigin = Date.now();
    gameStartHour = startHour;
    updateTimeUI();
}

// ============================================
// 💚 자연 재생 시스템
// ============================================

/**
 * 자연 재생을 처리합니다.
 * 전투 중이 아닐 때만 HP/MP를 회복합니다.
 */
function processNaturalRegen() {
    // player 객체가 없으면 종료
    if (typeof player === 'undefined' || !player) return;

    // 전투 중이면 재생 안 함
    if (typeof battleState !== 'undefined' && battleState && battleState.inBattle) {
        return;
    }

    // HP가 이미 최대면 스킵
    const needsHpRegen = player.hp < player.maxHp;
    // MP가 이미 최대면 스킵
    const needsMpRegen = player.mp < player.maxMp;

    if (!needsHpRegen && !needsMpRegen) return;

    // HP 재생 (최대 HP의 1%)
    if (needsHpRegen) {
        const hpRegen = Math.max(1, Math.floor(player.maxHp * REGEN_CONFIG.regenPercent));
        player.hp = Math.min(player.hp + hpRegen, player.maxHp);
    }

    // MP 재생 (최대 MP의 1%)
    if (needsMpRegen) {
        const mpRegen = Math.max(1, Math.floor(player.maxMp * REGEN_CONFIG.regenPercent));
        player.mp = Math.min(player.mp + mpRegen, player.maxMp);
    }

    // UI 업데이트
    if (typeof updatePlayerUI === 'function') {
        updatePlayerUI();
    }
}

/**
 * 게임 시간을 추가합니다 (분 단위).
 * @param {number} minutes - 추가할 분
 */
function addGameTime(minutes) {
    // 현실 시간으로 변환
    const realMsPerGameMinute = TIME_CONFIG.gameDayDuration / 1440;
    const realMsToAdd = minutes * realMsPerGameMinute;

    // 시간 원점을 과거로 이동
    gameTimeOrigin -= realMsToAdd;

    updateTimeUI();
}

// ============================================
// 🌦️ 날씨 시스템
// ============================================

let currentWeather = 'sunny';  // 현재 날씨
let lastWeatherChange = Date.now();  // 마지막 날씨 변경 시간

/**
 * 랜덤으로 날씨를 변경합니다.
 */
function updateWeather() {
    // SPECIAL_EVENTS가 없으면 맑음 유지
    if (typeof SPECIAL_EVENTS === 'undefined') {
        currentWeather = 'sunny';
        return 'sunny';
    }

    const roll = Math.random();
    let cumulative = 0;

    for (const [weatherId, weatherData] of Object.entries(SPECIAL_EVENTS)) {
        // 붉은 달은 밤에만 발생
        if (weatherId === 'blood_moon' && !isNight()) {
            continue;
        }
        
        cumulative += weatherData.chance || 0;
        if (roll < cumulative) {
            currentWeather = weatherId;
            lastWeatherChange = Date.now();
            updateWeatherUI();
            
            if (typeof addGameLog === 'function' && weatherData.name) {
                addGameLog(`${weatherData.icon} 날씨가 '${weatherData.name}'(으)로 변했습니다!`);
            }
            
            return weatherId;
        }
    }

    currentWeather = 'sunny';
    updateWeatherUI();
    return 'sunny';
}

/**
 * 현재 날씨 정보를 반환합니다.
 * @returns {Object} - 현재 날씨 데이터
 */
function getCurrentWeather() {
    if (typeof SPECIAL_EVENTS === 'undefined') {
        return { id: 'sunny', name: '맑음', icon: '☀️', effects: {} };
    }
    return SPECIAL_EVENTS[currentWeather] || SPECIAL_EVENTS.sunny || { id: 'sunny', name: '맑음', icon: '☀️', effects: {} };
}

/**
 * 현재 날씨의 효과를 반환합니다.
 * @returns {Object} - 날씨 효과 객체
 */
function getWeatherEffects() {
    const weather = getCurrentWeather();
    return weather.effects || {};
}

/**
 * 날씨 UI를 업데이트합니다.
 */
function updateWeatherUI() {
    const weather = getCurrentWeather();
    const weatherDisplay = document.getElementById('weatherDisplay');
    
    if (weatherDisplay) {
        weatherDisplay.textContent = `${weather.icon} ${weather.name}`;
        weatherDisplay.title = weather.description || '';
    }
}

/**
 * 날씨 시스템을 시작합니다.
 */
function startWeatherSystem() {
    // 초기 날씨 설정
    updateWeather();
    
    // 5분(게임 내 약 1시간)마다 날씨 변경 가능
    setInterval(() => {
        // 30% 확률로 날씨 변경
        if (Math.random() < 0.3) {
            updateWeather();
        }
    }, 5 * 60 * 1000);
    
    console.log('🌦️ 날씨 시스템 시작!');
}

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('⏰ timeSystem.js 로드 완료!');

