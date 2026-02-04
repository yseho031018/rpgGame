/**
 * ============================================
 * RPG Adventure - 게임 데이터 v2
 * ============================================
 * 게임의 모든 상수, 맵, 난이도, 세부 위치 등의 데이터를 관리합니다.
 */

// ============================================
// 🗺️ 맵 데이터
// ============================================

const MAPS = {
    training: {
        id: 'training',
        name: '훈련장',
        level: 1,
        description: '게임 초반에 여기서 허수아비를 잡으며 기초를 다질 수 있다. 경험치와 골드, 기초적인 아이템을 획득하고, 조작과 간단한 스킬등을 배울수있다. 상점도 존재하여 게임초반에 필요한 물건을 구매할 수 있다.',
        background: 'training_ground.jpg',
        canEscape: true,
        // 훈련장 특수 규칙: HP 0이 되어도 죽지않고 7시간후 휴식처에서 최상의 상태(hp, mp최대회복및 모든상태이상제거)로 깨어남
        noDeathZone: true,
        reviveLocation: 'rest_area',
        reviveTimeHours: 7,
        // 출현하는 몹
        monsters: ['old_scarecrow', 'scarecrow', 'strong_scarecrow', 'giant_scarecrow', 'training_robot', 'training_golem'],
        actions: ['battle', 'move', 'rest', 'explore', 'shop'],
        unlockCondition: null,

        // 등장 NPC
        npcs: ['instructor1', 'instructor2', 'instructor3', 'instructor4', 'shopkeeper', 'doctor', 'trainee1', 'trainee2', 'trainee3', 'trainee4', 'senior_instructor'],

        // (휴식처X) 탐사로 획득 가능한 아이템
        exploreItems: [
            { id: 'crude_grass', name: '조잡한 풀', chance: 0.1 },
            { id: 'gold_small', name: '소량의 골드', amount: [1, 5], chance: 0.15 },
            { id: 'rusty_scrap', name: '녹슨 철조각', chance: 0.08 },
            { id: 'tiny_exp', name: '극소량의 경험치', amount: [1, 5], chance: 0.1 },
            { id: 'rusty_longsword', name: '녹슨 장검', chance: 0.02 },
            { id: 'rusty_sword', name: '녹슨 검', chance: 0.03 },
            { id: 'old_bow', name: '낡은 활', chance: 0.04 },
            { id: 'old_staff', name: '낡은 지팡이', chance: 0.04 },
            { id: 'old_gloves', name: '낡은 장갑', chance: 0.05 },
            { id: 'old_weed', name: '낡은 부초', chance: 0.06 },
            { id: 'rusty_half_plate', name: '녹슨 철반지', chance: 0.03 },
            { id: 'old_cloth_piece', name: '낡은 천조각', chance: 0.08 }
        ],

        // 휴식처내에서 탐험으로 획득가능한 아이템
        restAreaExploreItems: [
            { id: 'old_bandage', name: '낡은 붕대', chance: 0.1 },
            { id: 'gold_small', name: '소량의 골드', amount: [1, 5], chance: 0.15 },
            { id: 'tiny_exp', name: '극소량의 경험치', amount: [1, 5], chance: 0.12 },
            { id: 'crude_hp_potion', name: '조잡한 체력회복물약', chance: 0.08 },
            { id: 'crude_mp_potion', name: '조잡한 마나회복물약', chance: 0.08 }
        ],

        // 맵 내 세부 위치들
        locations: {
            // 1. 훈련장 입구
            entrance: {
                id: 'entrance',
                name: '훈련장 입구',
                description: '훈련장의 입구입니다. 여기서 다른 지역으로 이동할 수 있습니다. 훈련교관1이 있어 간단한 대화가 가능합니다.',
                actions: ['move', 'talk'],
                canExplore: false,
                canBattle: false,
                npcs: ['instructor1'],
                // 훈련장입구에서 이동가능한 지역: 초급훈련장, 중급훈련장, 상급훈련장, 휴식처, 상점, 상급교관의집, 다른맵(버려진마을, 이상한숲 등)
                connections: ['beginner_field', 'intermediate_field', 'advanced_field', 'rest_area', 'shop', 'senior_instructor_house'],
                worldConnections: ['village', 'forest']  // 다른 맵으로 이동 가능
            },

            // 2. 초급훈련장
            beginner_field: {
                id: 'beginner_field',
                name: '초급훈련장',
                description: '초보자들을 위한 훈련장입니다. 훈련교관2와 수련생1이 있습니다.',
                actions: ['move', 'battle', 'explore', 'talk'],
                canExplore: true,
                canBattle: true,
                monsters: ['old_scarecrow', 'scarecrow'],
                npcs: ['instructor2', 'trainee1'],
                connections: ['intermediate_field', 'entrance', 'rest_area']
            },

            // 3. 중급훈련장
            intermediate_field: {
                id: 'intermediate_field',
                name: '중급훈련장',
                description: '중급자들을 위한 훈련장입니다. 훈련교관3와 수련생2가 있습니다.',
                actions: ['move', 'battle', 'explore', 'talk'],
                canExplore: true,
                canBattle: true,
                monsters: ['strong_scarecrow', 'giant_scarecrow'],
                npcs: ['instructor3', 'trainee2'],
                connections: ['beginner_field', 'advanced_field', 'entrance', 'rest_area']
            },

            // 4. 상급훈련장
            advanced_field: {
                id: 'advanced_field',
                name: '상급훈련장',
                description: '상급자들을 위한 훈련장입니다. 훈련교관4와 수련생3, 수련생4가 있습니다. 훈련용 로봇과 훈련용 골렘이 출현합니다.',
                actions: ['move', 'battle', 'explore', 'talk'],
                canExplore: true,
                canBattle: true,
                monsters: ['training_robot', 'training_golem'],
                npcs: ['instructor4', 'trainee3', 'trainee4'],
                connections: ['intermediate_field', 'entrance', 'rest_area']
            },

            // 5. 휴식처
            rest_area: {
                id: 'rest_area',
                name: '휴식처',
                description: '편하게 휴식이 가능한 지역입니다. 훈련장내에서 HP가 0이되면 이곳에서 깨어납니다. 의사라는 NPC가 존재합니다.',
                actions: ['move', 'rest', 'explore', 'talk'],
                canExplore: true,
                canBattle: false,
                useRestAreaItems: true,  // 휴식처 전용 탐사 아이템 사용
                npcs: ['doctor'],
                connections: ['entrance']
            },

            // 6. 상점
            shop: {
                id: 'shop',
                name: '상점',
                description: '골드로 필요한 물건을 사거나, 획득한 아이템을 판매할 수 있습니다. 상점주인이라는 NPC가 한 명 존재합니다.',
                actions: ['move', 'talk'],
                canExplore: false,
                canBattle: false,
                npcs: ['shopkeeper'],
                connections: ['entrance'],
                // 상점에서 판매하는 아이템
                shopItems: [
                    { id: 'plain_armor_warrior', name: '평범한 직업별 방어구', price: 50 },
                    { id: 'strong_leather_item', name: '튼튼한 가죽으로 만든 직업별 방어구', price: 80 },
                    { id: 'stone_armor_warrior', name: '구리로 만든 직업별 방어구', price: 120 },
                    { id: 'iron_mixed_armor', name: '철로만든 직업별 방어구', price: 180 },
                    { id: 'hp_potion', name: '체력회복물약', price: 15 },
                    { id: 'mp_potion', name: '마나회복물약', price: 20 },
                    { id: 'herb', name: '허브등의 재료', price: 5 }
                ]
            },

            // 7. 상급교관의 집
            senior_instructor_house: {
                id: 'senior_instructor_house',
                name: '상급교관의 집',
                description: '상급교관이 사는 집입니다. 특별한 퀘스트나 이벤트를 경험할 수 있습니다.',
                actions: ['move', 'talk'],
                canExplore: false,
                canBattle: false,
                npcs: ['senior_instructor'],
                connections: ['entrance'],
                hasSpecialQuests: true,
                hasSpecialEvents: true
            }
        },
        defaultLocation: 'entrance'
    },
    // ============================================
    // 버려진 마을 (Abandoned Village)
    // ============================================
    village: {
        id: 'village',
        name: '버려진 마을',
        level: 5,
        description: '전쟁으로 파괴되고 역병과 저주로 황폐화된 마을. 감염된 주민들과 몬스터들이 배회한다.',
        background: 'abandoned_village.jpg',
        canEscape: true,

        // 출현 몬스터 (기본)
        monsters: ['infected_villager', 'ghost', 'rat_swarm', 'bandit', 'infected_dog', 'infected_cow', 'undead', 'goblin'],
        // 강력한 몬스터 (밤에 출현 확률 증가)
        nightMonsters: ['infected_soldier', 'death_knight'],
        // 보스 몬스터
        bossMonsters: ['cursed_lord'],

        // 밤 시간 설정 (20시 ~ 6시)
        nightTimeStart: 20,
        nightTimeEnd: 6,
        nightStrongMonsterChance: 0.3, // 밤에 강력한 몹 등장 확률 30%

        actions: ['battle', 'move', 'explore', 'rest'],
        unlockCondition: { map: 'training', clear: true },

        // 탐사 아이템
        exploreItems: [
            { id: 'tattered_cloth', name: '너덜너덜한 천', chance: 0.12 },
            { id: 'rusty_coin', name: '녹슨 동전', chance: 0.10 },
            { id: 'gold_medium', name: '중간 골드', amount: [5, 15], chance: 0.08 },
            { id: 'cursed_bone', name: '저주받은 뼈', chance: 0.05 },
            { id: 'old_medicine', name: '오래된 약', chance: 0.06 },
            { id: 'broken_jewelry', name: '부서진 장신구', chance: 0.03 },
            { id: 'medium_exp', name: '소량의 경험치', amount: [5, 15], chance: 0.10 }
        ],

        // 권장 레벨
        recommendedLevel: { min: 5, max: 15, boss: 15 },

        // 세부 위치
        locations: {
            // 1. 마을 입구 (안전지대)
            entrance: {
                id: 'entrance',
                name: '마을 입구',
                description: '버려진 마을의 입구. 부서진 문과 경고 표지판이 있다. 훈련장으로 돌아갈 수 있다.',
                actions: ['move'],
                canExplore: false,
                canBattle: false,
                connections: ['ruined_plaza'],
                worldConnections: ['training']  // 훈련장으로 이동 가능
            },

            // 2. 폐허가 된 광장 (중앙 허브)
            ruined_plaza: {
                id: 'ruined_plaza',
                name: '폐허가 된 광장',
                description: '한때 마을의 중심이었던 광장. 감염된 주민들과 유령이 배회한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['infected_villager', 'ghost', 'rat_swarm'],
                connections: ['entrance', 'collapsed_houses', 'abandoned_church', 'village_well']
            },

            // 3. 무너진 집들 (탐사 지역)
            collapsed_houses: {
                id: 'collapsed_houses',
                name: '무너진 집들',
                description: '전쟁으로 파괴된 주거 지역. 도적들이 숨어있고 감염된 개들이 돌아다닌다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['infected_villager', 'bandit', 'infected_dog', 'goblin'],
                connections: ['ruined_plaza', 'lord_mansion']
            },

            // 4. 버려진 교회 외부 (저주 지역)
            abandoned_church: {
                id: 'abandoned_church',
                name: '버려진 교회 (외부)',
                description: '한때 성스러운 곳이었으나 이제는 저주받은 장소. 묘지가 펼쳐져 있고 언데드가 배회한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['ghost', 'undead'],
                connections: ['ruined_plaza', 'abandoned_church_interior', 'lord_mansion']
            },

            // 5. 버려진 교회 내부
            abandoned_church_interior: {
                id: 'abandoned_church_interior',
                name: '버려진 교회 (내부)',
                description: '부서진 스테인드글라스와 무너진 의자들. 저주의 기운이 강하게 느껴진다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['ghost', 'undead', 'infected_soldier'],
                connections: ['abandoned_church']
            },

            // 6. 마을 우물 (역병 근원지)
            village_well: {
                id: 'village_well',
                name: '마을 우물',
                description: '역병의 근원지로 추정되는 우물. 오염된 물에서 기이한 생물들이 나타난다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['rat_swarm', 'infected_cow'],
                connections: ['ruined_plaza']
            },

            // 7. 영주의 저택 외부
            lord_mansion: {
                id: 'lord_mansion',
                name: '영주의 저택 (외부)',
                description: '저주받은 영주가 지배하는 저택의 입구. 강력한 몬스터들이 순찰한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['undead', 'infected_soldier', 'death_knight'],
                connections: ['collapsed_houses', 'abandoned_church', 'lord_mansion_interior']
            },

            // 8. 영주의 저택 내부 (보스 지역)
            lord_mansion_interior: {
                id: 'lord_mansion_interior',
                name: '영주의 저택 (내부)',
                description: '저주받은 영주의 연회장. 영주가 해골 신하들과 함께 있다. 최종 보스가 기다린다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['undead', 'death_knight'],
                bossMonster: 'cursed_lord',
                isBossArea: true,
                connections: ['lord_mansion']
            }
        },
        defaultLocation: 'entrance'
    },
    // ============================================
    // 수상한 동굴 (Mysterious Cave)
    // ============================================
    cave: {
        id: 'cave',
        name: '수상한 동굴',
        level: 10,
        description: '어둡고 습한 동굴. 박쥐와 거미가 서식하고, 버려진 광산과 신비로운 고대 유적이 존재한다.',
        background: 'mysterious_cave.jpg',
        canEscape: true,

        // 출현 몬스터 (기본)
        monsters: ['cave_bat', 'giant_spider', 'zombie', 'orc', 'cave_ghost', 'slime'],
        // 강력한 몬스터 (심층부)
        eliteMonsters: ['orc_warrior', 'ancient_guardian'],
        // 보스 몬스터
        bossMonsters: ['cave_troll'],

        actions: ['battle', 'move', 'explore', 'rest'],
        unlockCondition: { map: 'village', clear: true },

        // 탐사 아이템 (광물 포함)
        exploreItems: [
            { id: 'iron_ore', name: '철광석', chance: 0.12 },
            { id: 'copper_ore', name: '구리 광석', chance: 0.10 },
            { id: 'zinc_ore', name: '아연 광석', chance: 0.08 },
            { id: 'bat_wing', name: '박쥐 날개', chance: 0.10 },
            { id: 'spider_silk', name: '거미줄', chance: 0.08 },
            { id: 'gold_large', name: '큰 골드', amount: [10, 30], chance: 0.06 },
            { id: 'ancient_coin', name: '고대 동전', chance: 0.04 },
            { id: 'large_exp', name: '경험치', amount: [10, 25], chance: 0.08 }
        ],

        // 권장 레벨
        recommendedLevel: { min: 10, max: 25, boss: 20 },

        // 세부 위치
        locations: {
            // 1. 동굴 입구 (안전지대)
            entrance: {
                id: 'entrance',
                name: '동굴 입구',
                description: '동굴의 입구. 안에서 차갑고 습한 바람이 불어온다. 버려진 마을로 돌아갈 수 있다.',
                actions: ['move', 'rest'],
                canExplore: false,
                canBattle: false,
                connections: ['first_passage'],
                worldConnections: ['village']
            },

            // 2. 첫 번째 통로
            first_passage: {
                id: 'first_passage',
                name: '첫 번째 통로',
                description: '동굴로 들어서는 첫 번째 통로. 박쥐들이 천장에 매달려 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['cave_bat', 'giant_spider'],
                connections: ['entrance', 'crossroads']
            },

            // 3. 갈림길 (4갈래 랜덤 연결)
            crossroads: {
                id: 'crossroads',
                name: '갈림길',
                description: '네 갈래로 나뉘는 길. 각 길이 어디로 이어지는지 알 수 없다. 매번 이곳에 올 때마다 길이 달라지는 것 같다...',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['cave_bat', 'zombie', 'slime'],
                // 4갈래 랜덤 연결 시스템
                isRandomCrossroads: true,
                randomPaths: ['underground_lake', 'abandoned_mine', 'ancient_remnants', 'ominous_space'],
                connections: ['path_1', 'path_2', 'path_3', 'path_4']
            },

            // 4. 지하 호수 (갈림길에서 랜덤 연결)
            underground_lake: {
                id: 'underground_lake',
                name: '지하 호수',
                description: '거대한 지하 호수. 차갑고 맑은 물이 신비롭게 빛난다. 유령들이 출몰한다.',
                actions: ['move', 'battle', 'explore', 'rest'],
                canExplore: true,
                canBattle: true,
                monsters: ['cave_ghost', 'slime', 'zombie'],
                connections: ['crossroads']
            },

            // 5. 버려진 광산 1구역 (갈림길에서 랜덤 연결, 기본 광산)
            abandoned_mine: {
                id: 'abandoned_mine',
                name: '버려진 광산 1구역',
                description: '한때 광부들이 일하던 광산의 입구 지역. 돌, 석탄, 구리, 철광석을 캘 수 있다. 더 깊은 곳으로 향하는 두 개의 통로가 보인다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['zombie', 'orc', 'giant_spider'],
                // 1차 광산 광석 (기본 광석)
                specialExploreItems: [
                    { id: 'stone', name: '돌', chance: 0.35 },
                    { id: 'coal', name: '석탄', chance: 0.25 },
                    { id: 'copper_ore', name: '구리 광석', chance: 0.20 },
                    { id: 'iron_ore', name: '철광석', chance: 0.15 }
                ],
                // 랜덤 고정 통로 시스템
                isMineCrossroads: true,
                minePaths: ['mine_area_2', 'mine_area_3'],
                connections: ['crossroads', 'mine_tunnel_1', 'mine_tunnel_2']
            },

            // 5-1. 광산 통로 1 (2구역으로 연결)
            mine_tunnel_1: {
                id: 'mine_tunnel_1',
                name: '좁은 광산 통로',
                description: '좁고 어두운 통로. 곡괭이 자국이 벽에 남아있다. 금과 은이 매장된 구역으로 이어진다.',
                actions: ['move', 'battle'],
                canExplore: false,
                canBattle: true,
                monsters: ['cave_bat', 'giant_spider'],
                isMinePassage: true,
                connections: ['abandoned_mine']
            },

            // 5-2. 광산 통로 2 (3구역으로 연결)
            mine_tunnel_2: {
                id: 'mine_tunnel_2',
                name: '비좁은 광산 통로',
                description: '반짝이는 무언가가 벽에서 빛나는 것 같다. 보석이 매장된 구역으로 이어진다.',
                actions: ['move', 'battle'],
                canExplore: false,
                canBattle: true,
                monsters: ['cave_bat', 'slime'],
                isMinePassage: true,
                connections: ['abandoned_mine']
            },

            // 5-3. 버려진 광산 2구역 (희귀 금속 광산)
            mine_area_2: {
                id: 'mine_area_2',
                name: '버려진 광산 2구역',
                description: '더 깊은 곳에 위치한 광산. 금, 은을 비롯해 미스릴, 흑철, 마나석, 흑요석 등 희귀 광석이 매장되어 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['orc', 'orc_warrior', 'cave_ghost'],
                // 2차 광산 광석 (희귀 금속)
                specialExploreItems: [
                    { id: 'gold_ore', name: '금광석', chance: 0.15 },
                    { id: 'silver_ore', name: '은광석', chance: 0.18 },
                    { id: 'mithril_ore', name: '미스릴 광석', chance: 0.10 },
                    { id: 'black_iron_ore', name: '흑철 광석', chance: 0.12 },
                    { id: 'mana_stone', name: '마나석', chance: 0.08 },
                    { id: 'obsidian', name: '흑요석', chance: 0.10 }
                ],
                connections: ['abandoned_mine']
            },

            // 5-4. 버려진 광산 3구역 (보석 광산)
            mine_area_3: {
                id: 'mine_area_3',
                name: '버려진 광산 3구역',
                description: '벽면이 보석으로 반짝이는 신비로운 광산. 자수정, 루비, 사파이어 등 다양한 보석을 캘 수 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['ancient_guardian', 'cave_ghost', 'slime'],
                // 3차 광산 광석 (보석류)
                specialExploreItems: [
                    { id: 'amethyst', name: '자수정', chance: 0.15 },
                    { id: 'ruby', name: '루비', chance: 0.10 },
                    { id: 'sapphire', name: '사파이어', chance: 0.10 },
                    { id: 'emerald', name: '에메랄드', chance: 0.08 },
                    { id: 'diamond', name: '다이아몬드', chance: 0.03 },
                    { id: 'red_crystal', name: '붉은 수정', chance: 0.12 },
                    { id: 'blue_crystal', name: '푸른 수정', chance: 0.12 },
                    { id: 'green_crystal', name: '녹색 수정', chance: 0.12 },
                    { id: 'purple_crystal', name: '보라 수정', chance: 0.10 }
                ],
                connections: ['abandoned_mine']
            },

            // 6. 고대의 잔재 (고대 유적 전 공간)
            ancient_remnants: {
                id: 'ancient_remnants',
                name: '고대의 잔재',
                description: '고대 문명의 흔적이 남아있는 공간. 무너진 기둥과 희미한 룬 문자가 새겨진 벽이 보인다. 더 깊은 곳에 유적이 있는 것 같다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['zombie', 'cave_ghost', 'giant_spider'],
                specialExploreItems: [
                    { id: 'ancient_coin', name: '고대 동전', chance: 0.10 },
                    { id: 'rune_fragment', name: '룬 파편', chance: 0.08 }
                ],
                connections: ['crossroads', 'ancient_ruins']
            },

            // 7. 고대 유적 (고대의 잔재에서 진입)
            ancient_ruins: {
                id: 'ancient_ruins',
                name: '고대 유적',
                description: '신비로운 고대 문명의 유적. 강력한 수호자가 지키고 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['cave_ghost', 'ancient_guardian'],
                // 고대 유적 특수 아이템
                specialExploreItems: [
                    { id: 'ancient_coin', name: '고대 동전', chance: 0.15 },
                    { id: 'ancient_artifact', name: '고대 유물', chance: 0.05 },
                    { id: 'rune_stone', name: '룬 스톤', chance: 0.08 }
                ],
                connections: ['ancient_remnants']
            },

            // 8. 불길한 공간 (보스방 전 공간)
            ominous_space: {
                id: 'ominous_space',
                name: '불길한 공간',
                description: '불길한 기운이 가득한 공간. 거대한 발자국과 뼈 조각들이 흩어져 있다. 앞에서 무언가 거대한 것이 숨쉬는 소리가 들린다...',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['orc', 'orc_warrior', 'zombie'],
                specialExploreItems: [
                    { id: 'bone_fragment', name: '뼈 파편', chance: 0.12 },
                    { id: 'troll_blood', name: '트롤의 피', chance: 0.05 }
                ],
                connections: ['crossroads', 'deep_cave']
            },

            // 9. 동굴 심층부 (보스 지역, 불길한 공간에서 진입)
            deep_cave: {
                id: 'deep_cave',
                name: '동굴 심층부',
                description: '동굴의 가장 깊은 곳. 거대한 트롤이 이곳을 지배한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['orc', 'orc_warrior', 'zombie'],
                bossMonster: 'cave_troll',
                isBossArea: true,
                connections: ['ominous_space']
            }
        },
        defaultLocation: 'entrance'
    },
    // ============================================
    // 이상한 숲 (Strange Forest)
    // ============================================
    forest: {
        id: 'forest',
        name: '이상한 숲',
        level: 20,
        description: '마법과 어둠, 야생이 공존하는 신비로운 숲. 오염된 지역과 깨끗한 지역이 공존한다.',
        background: 'strange_forest.jpg',
        canEscape: true,

        // 출현 몬스터 (일반)
        monsters: ['wild_wolf', 'forest_spider', 'corrupted_deer', 'dark_fairy', 'treant', 'poison_mushroom'],
        // 깨끗한 지역 몬스터
        pureMonsters: ['forest_fairy', 'forest_elf', 'wild_boar'],
        // 엘리트 몬스터
        eliteMonsters: ['werewolf', 'ancient_treant', 'corrupted_elf'],
        // 보스 몬스터
        bossMonsters: ['forest_guardian'],

        actions: ['battle', 'move', 'explore', 'farming', 'rest'],
        unlockCondition: { map: 'cave', clear: true },

        // 탐사 아이템
        exploreItems: [
            { id: 'herb', name: '약초', chance: 0.15 },
            { id: 'rare_herb', name: '희귀 약초', chance: 0.06 },
            { id: 'mushroom', name: '버섯', chance: 0.12 },
            { id: 'poison_mushroom_item', name: '독버섯', chance: 0.08 },
            { id: 'fairy_dust', name: '요정 가루', chance: 0.05 },
            { id: 'ancient_wood', name: '고대 나무', chance: 0.04 },
            { id: 'gold_large', name: '큰 골드', amount: [15, 40], chance: 0.05 },
            { id: 'large_exp', name: '경험치', amount: [15, 35], chance: 0.08 }
        ],

        // 권장 레벨
        recommendedLevel: { min: 20, max: 35, boss: 30 },

        // 세부 위치
        locations: {
            // 1. 숲 입구 (안전지대)
            entrance: {
                id: 'entrance',
                name: '숲 입구',
                description: '이상한 숲의 입구. 안개가 자욱하고 신비로운 기운이 감돈다. 동굴로 돌아갈 수 있다.',
                actions: ['move', 'rest'],
                canExplore: false,
                canBattle: false,
                connections: ['forest_trail'],
                worldConnections: ['cave']
            },

            // 2. 숲속 오솔길 (야생 지역)
            forest_trail: {
                id: 'forest_trail',
                name: '숲속 오솔길',
                description: '좁은 숲길. 늑대의 울음소리가 들리고 야생 동물들이 출몰한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['wild_wolf', 'wild_boar', 'forest_spider'],
                connections: ['entrance', 'herb_garden', 'fairy_clearing', 'swamp']
            },

            // 3. 약초밭 (깨끗한 지역, 파밍)
            herb_garden: {
                id: 'herb_garden',
                name: '약초밭',
                description: '다양한 약초와 버섯이 자라는 축복받은 땅. 엘프들이 이곳을 보호한다.',
                actions: ['move', 'battle', 'explore', 'farming'],
                canExplore: true,
                canBattle: true,
                isPureZone: true,  // 깨끗한 지역
                monsters: ['forest_elf', 'forest_fairy'],
                specialExploreItems: [
                    { id: 'herb', name: '약초', chance: 0.30 },
                    { id: 'rare_herb', name: '희귀 약초', chance: 0.12 },
                    { id: 'healing_flower', name: '치유의 꽃', chance: 0.08 }
                ],
                connections: ['forest_trail']
            },

            // 4. 요정의 빈터 (마법 지역)
            fairy_clearing: {
                id: 'fairy_clearing',
                name: '요정의 빈터',
                description: '요정들이 춤추는 신비로운 빈터. 마법의 기운이 가득하다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                isPureZone: true,
                monsters: ['forest_fairy', 'dark_fairy'],
                connections: ['forest_trail', 'ancient_grove', 'forest_heart']
            },

            // 5. 늪지대 (오염된 지역)
            swamp: {
                id: 'swamp',
                name: '늪지대',
                description: '어둠과 저주에 오염된 늪. 독기가 퍼져있고 저주받은 생물들이 서식한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                isCorruptedZone: true,  // 오염된 지역
                monsters: ['corrupted_deer', 'poison_mushroom', 'corrupted_elf'],
                connections: ['forest_trail', 'ancient_grove']
            },

            // 6. 고목 지대 (나무 정령)
            ancient_grove: {
                id: 'ancient_grove',
                name: '고목 지대',
                description: '거대한 고대 나무들이 서있는 곳. 나무 정령과 웨어울프가 출몰한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['treant', 'ancient_treant', 'werewolf'],
                connections: ['fairy_clearing', 'swamp', 'forest_heart']
            },

            // 7. 숲의 심장부 (보스 지역)
            forest_heart: {
                id: 'forest_heart',
                name: '숲의 심장부',
                description: '숲의 가장 깊은 곳. 숲의 수호자가 이곳을 지키고 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['ancient_treant', 'werewolf', 'dark_fairy'],
                bossMonster: 'forest_guardian',
                isBossArea: true,
                connections: ['fairy_clearing', 'ancient_grove']
            }
        },
        defaultLocation: 'entrance'
    },
    // ============================================
    // 고대의 탑 (Ancient Tower)
    // ============================================
    tower: {
        id: 'tower',
        name: '고대의 탑',
        level: 5,
        description: '모든 종족, 마법, 악마, 천사, 차원, 고대의 존재가 공존하는 시련의 탑. 층마다 다른 시련이 기다린다.',
        background: 'ancient_tower.jpg',
        canEscape: true,

        // 탑 특수 설정
        isTowerMap: true,           // 탑 맵 플래그
        floorSystem: true,          // 층 시스템 활성화
        trialMode: true,            // 시련 모드 (모든 몬스터 처치 필요)

        actions: ['battle', 'move', 'explore', 'rest'],
        unlockCondition: { map: 'forest', clear: true },

        // 권장 레벨 (층별)
        recommendedLevel: {
            floor1: 5, floor2: 10, floor3: 15, floor4: 20, floor5: 25,
            floor6: 30, floor7: 35, floor8: 40, floor9: 45, floor10: 50
        },

        // 세부 위치 (10층 + 입구)
        locations: {
            // 탑 입구 (안전지대)
            entrance: {
                id: 'entrance',
                name: '탑 입구',
                description: '고대의 탑 입구. 내부에서 다양한 기운이 느껴진다. 시련이 시작되면 돌아올 수 없다.',
                actions: ['move', 'rest'],
                canExplore: false,
                canBattle: false,
                connections: ['floor_1'],
                worldConnections: ['forest']
            },

            // 1층 - 훈련장 (Lv.5)
            floor_1: {
                id: 'floor_1',
                name: '1층 - 훈련장',
                description: '가장 기초적인 시련. 허수아비와 약한 몬스터가 있다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 1,
                recommendedLevel: 5,
                monsters: ['training_robot', 'rat', 'goblin', 'barbarian'],
                trialMonsterCount: 5,  // 처치해야 할 몬스터 수
                connections: ['entrance', 'floor_2']
            },

            // 2층 - 언데드의 묘지 (Lv.10)
            floor_2: {
                id: 'floor_2',
                name: '2층 - 언데드의 묘지',
                description: '언데드들이 배회하는 층. 해골과 좀비가 출몰한다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 2,
                recommendedLevel: 10,
                monsters: ['skeleton', 'zombie', 'ghost', 'undead_soldier', 'necromancer'],
                trialMonsterCount: 6,
                connections: ['floor_1', 'floor_3']
            },

            // 3층 - 야수의 우리 (Lv.15)
            floor_3: {
                id: 'floor_3',
                name: '3층 - 야수의 우리',
                description: '강력한 야수들이 갇혀있던 층. 늑대와 맹수들이 덤벼든다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 3,
                recommendedLevel: 15,
                monsters: ['werewolf', 'wolf', 'bison', 'raging_bear'],
                trialMonsterCount: 6,
                connections: ['floor_2', 'floor_4']
            },

            // 4층 - 마법 연구실 (Lv.20)
            floor_4: {
                id: 'floor_4',
                name: '4층 - 마법 연구실',
                description: '마법사들의 연구실. 골렘과 마법 생물이 경비한다.',
                actions: ['move', 'battle', 'explore'],
                canBattle: true,
                canExplore: true,
                floor: 4,
                recommendedLevel: 20,
                monsters: ['golem', 'apprentice_mage', 'senior_mage', 'magic_swordsman'],
                trialMonsterCount: 7,
                connections: ['floor_3', 'floor_5']
            },

            // 5층 - 엘프와 드워프의 방 (Lv.25)
            floor_5: {
                id: 'floor_5',
                name: '5층 - 종족의 전당',
                description: '엘프와 드워프 전사들의 시험장. 정예 전사들이 기다린다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 5,
                recommendedLevel: 25,
                monsters: ['elf', 'dwarf', 'orc', 'ogre', 'basilisk'],
                trialMonsterCount: 7,
                connections: ['floor_4', 'floor_6']
            },

            // 6층 - 악마의 영역 (Lv.30)
            floor_6: {
                id: 'floor_6',
                name: '6층 - 악마의 영역',
                description: '어둠과 악마의 기운이 가득한 층. 악마와 타락한 존재들이 있다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 6,
                recommendedLevel: 30,
                monsters: ['imp', 'lesser_demon', 'dark_sorcerer', 'manticore'],
                trialMonsterCount: 8,
                connections: ['floor_5', 'floor_7']
            },

            // 7층 - 천사의 시험 (Lv.35)
            floor_7: {
                id: 'floor_7',
                name: '7층 - 천사의 시험',
                description: '빛의 시험장. 타락한 천사와 심판자들이 시험한다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 7,
                recommendedLevel: 35,
                monsters: ['lesser_angel', 'normal_angel', 'saint', 'guardian_angel'],
                trialMonsterCount: 8,
                connections: ['floor_6', 'floor_8']
            },

            // 8층 - 차원의 틈 (Lv.40)
            floor_8: {
                id: 'floor_8',
                name: '8층 - 차원의 틈',
                description: '이계의 존재들이 나타나는 차원의 균열. 현실과 다른 법칙이 적용된다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 8,
                recommendedLevel: 40,
                monsters: ['void_fragment', 'despair_fragment', 'dimension_traveler', 'chaos_elemental'],
                trialMonsterCount: 9,
                connections: ['floor_7', 'floor_9']
            },

            // 9층 - 고대의 존재 (Lv.45)
            floor_9: {
                id: 'floor_9',
                name: '9층 - 고대의 존재',
                description: '태초의 존재들이 잠들어 있던 층. 상상을 초월하는 힘을 가진 존재들.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 9,
                recommendedLevel: 45,
                monsters: ['nephilim', 'giant', 'ancient_beast', 'giant_warlord'],
                trialMonsterCount: 9,
                connections: ['floor_8', 'floor_10']
            },

            // 10층 - 탑의 정상 (Lv.50+ 보스)
            floor_10: {
                id: 'floor_10',
                name: '10층 - 탑의 정상',
                description: '탑의 최상층. 모든 시련을 통과한 자만이 도달할 수 있는 곳. 탑의 주인이 기다린다.',
                actions: ['move', 'battle'],
                canBattle: true,
                floor: 10,
                recommendedLevel: 50,
                monsters: ['tower_guardian', 'tower_guardian'],
                bossMonster: 'tower_ruler',
                isBossArea: true,
                trialMonsterCount: 3,  // 보스 + 수호자 2
                connections: ['floor_9']
            }
        },
        defaultLocation: 'entrance'
    },
    // ============================================
    // 드래곤 레어 (Dragon Lair)
    // ============================================
    lair: {
        id: 'lair',
        name: '드래곤 레어',
        level: 40,
        description: '모든 속성의 드래곤이 서식하는 전설의 동굴. 블루, 레드, 그린, 대지룡, 뇌룡, 성룡, 마룡 등 다양한 드래곤이 존재한다.',
        background: 'dragon_lair.jpg',
        canEscape: true,

        // 출현 몬스터
        monsters: ['lizardman', 'dragon_soldier', 'hatchling', 'young_dragon'],
        // 원소 드래곤
        elementalDragons: ['blue_dragon', 'red_dragon', 'green_dragon', 'earth_dragon', 'thunder_dragon'],
        // 특수 드래곤
        specialDragons: ['holy_dragon', 'dark_dragon'],
        // 보스 몬스터
        bossMonsters: ['ancient_dragon'],

        actions: ['battle', 'move', 'explore', 'rest'],
        unlockCondition: { map: 'tower', clear: true },

        // 탐사 아이템
        exploreItems: [
            { id: 'dragon_scale', name: '드래곤 비늘', chance: 0.08 },
            { id: 'dragon_bone', name: '드래곤 뼈', chance: 0.06 },
            { id: 'dragon_tooth', name: '드래곤 이빨', chance: 0.05 },
            { id: 'dragon_egg_shard', name: '용알 파편', chance: 0.04 },
            { id: 'gold_huge', name: '거대 골드', amount: [50, 150], chance: 0.05 },
            { id: 'huge_exp', name: '막대한 경험치', amount: [50, 100], chance: 0.06 }
        ],

        // 권장 레벨
        recommendedLevel: { min: 40, max: 70, boss: 60 },

        // 세부 위치
        locations: {
            // 1. 레어 입구 (안전지대)
            entrance: {
                id: 'entrance',
                name: '레어 입구',
                description: '드래곤 레어의 입구. 다양한 원소의 기운이 뒤섞여 있다. 고대의 탑으로 돌아갈 수 있다.',
                actions: ['move', 'rest'],
                canExplore: false,
                canBattle: false,
                connections: ['egg_nest'],
                worldConnections: ['tower']
            },

            // 2. 드래곤 알 둥지
            egg_nest: {
                id: 'egg_nest',
                name: '드래곤 알 둥지',
                description: '다양한 드래곤 알이 있는 곳. 해츨링과 어린 드래곤이 서식한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['hatchling', 'young_dragon', 'lizardman'],
                connections: ['entrance', 'elemental_path', 'treasure_vault']
            },

            // 3. 원소의 통로
            elemental_path: {
                id: 'elemental_path',
                name: '원소의 통로',
                description: '불, 얼음, 번개, 자연의 기운이 교차하는 통로. 원소 드래곤들이 영역을 다툰다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['dragon_soldier', 'blue_dragon', 'red_dragon', 'green_dragon', 'earth_dragon', 'thunder_dragon'],
                connections: ['egg_nest', 'dragon_graveyard', 'lair_heart']
            },

            // 4. 보물 창고
            treasure_vault: {
                id: 'treasure_vault',
                name: '보물 창고',
                description: '드래곤들이 수천 년간 모은 보물이 산처럼 쌓여있다. 탐욕스러운 드래곤이 지킨다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['dragon_soldier', 'lizardman', 'young_dragon'],
                specialExploreItems: [
                    { id: 'gold_huge', name: '거대 골드', amount: [100, 300], chance: 0.15 },
                    { id: 'ancient_treasure', name: '고대 보물', chance: 0.08 },
                    { id: 'dragon_hoard_gem', name: '용의 보석', chance: 0.05 }
                ],
                connections: ['egg_nest']
            },

            // 5. 드래곤 무덤
            dragon_graveyard: {
                id: 'dragon_graveyard',
                name: '드래곤 무덤',
                description: '고대 드래곤들의 무덤. 성룡과 마룡의 기운이 교차한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['holy_dragon', 'dark_dragon', 'dragon_soldier'],
                connections: ['elemental_path', 'lair_heart']
            },

            // 6. 레어 심장부 (보스 지역)
            lair_heart: {
                id: 'lair_heart',
                name: '레어 심장부',
                description: '드래곤 레어의 가장 깊은 곳. 태초의 고대 드래곤이 잠들어 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['red_dragon', 'dark_dragon'],
                bossMonster: 'ancient_dragon',
                isBossArea: true,
                connections: ['elemental_path', 'dragon_graveyard']
            }
        },
        defaultLocation: 'entrance'
    },
    // ============================================
    // 악마의 성 (Demon Castle)
    // ============================================
    demon_castle: {
        id: 'demon_castle',
        name: '악마의 성',
        level: 60,
        description: '타락한 천사, 사악한 영혼, 흑마법사, 악마들이 사는 거대한 성. 마왕이 이곳을 다스린다.',
        background: 'demon_castle.jpg',
        canEscape: true,

        // 출현 몬스터
        monsters: ['imp', 'succubus', 'fallen_angel', 'dark_mage', 'hell_hound', 'vampire', 'demon_beast', 'demon_soldier'],
        // 엘리트 몬스터
        eliteMonsters: ['demon_guardian', 'demon_archduke'],
        // 보스 몬스터
        bossMonsters: ['demon_king'],

        actions: ['battle', 'move', 'explore', 'rest'],
        unlockCondition: { map: 'lair', clear: true },

        // 탐사 아이템
        exploreItems: [
            { id: 'demon_essence', name: '악마의 정수', chance: 0.08 },
            { id: 'dark_crystal', name: '어둠의 수정', chance: 0.06 },
            { id: 'corrupted_soul', name: '타락한 영혼', chance: 0.05 },
            { id: 'forbidden_tome', name: '금서', chance: 0.04 },
            { id: 'gold_massive', name: '막대한 골드', amount: [100, 300], chance: 0.04 },
            { id: 'massive_exp', name: '막대한 경험치', amount: [80, 150], chance: 0.05 }
        ],

        // 권장 레벨
        recommendedLevel: { min: 60, max: 100, boss: 80 },

        // 세부 위치
        locations: {
            // 1. 악마성 입구 (안전지대)
            entrance: {
                id: 'entrance',
                name: '악마성 입구',
                description: '거대한 악마의 성 입구. 사악한 기운이 가득하다. 드래곤 레어로 돌아갈 수 있다.',
                actions: ['move', 'rest'],
                canExplore: false,
                canBattle: false,
                connections: ['flame_river'],
                worldConnections: ['lair']
            },

            // 2. 화염의 강
            flame_river: {
                id: 'flame_river',
                name: '화염의 강',
                description: '악마성 내부로 들어가기 위해 건너야 하는 불타는 강. 악마견과 임프가 경비한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['imp', 'hell_hound', 'demon_soldier'],
                connections: ['entrance', 'dungeon', 'demon_city']
            },

            // 3. 지하감옥
            dungeon: {
                id: 'dungeon',
                name: '지하감옥',
                description: '포악한 악마와 흑마법사를 가둔 지하감옥. 탈옥한 죄수들이 배회한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['dark_mage', 'demon_beast', 'vampire'],
                connections: ['flame_river']
            },

            // 4. 악마 도시
            demon_city: {
                id: 'demon_city',
                name: '악마 도시',
                description: '악마들이 모여 사는 거대한 도시. 다양한 악마가 활동한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['imp', 'succubus', 'demon_soldier', 'vampire'],
                connections: ['flame_river', 'pain_lab', 'inner_castle']
            },

            // 5. 고통의 연구소
            pain_lab: {
                id: 'pain_lab',
                name: '고통의 연구소',
                description: '흑마법사와 악마들이 흑마법을 연구하고 실험하는 곳. 실험체들이 배회한다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['dark_mage', 'fallen_angel', 'demon_beast'],
                specialExploreItems: [
                    { id: 'forbidden_tome', name: '금서', chance: 0.12 },
                    { id: 'experiment_data', name: '실험 기록', chance: 0.08 },
                    { id: 'dark_potion', name: '어둠의 물약', chance: 0.1 }
                ],
                connections: ['demon_city']
            },

            // 6. 내성 - 수호자의 홀
            guardian_hall: {
                id: 'guardian_hall',
                name: '수호자의 홀',
                description: '내성을 지키는 악마 수호자들이 경비하는 홀.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['demon_soldier', 'demon_guardian'],
                connections: ['inner_castle', 'archduke_chamber']
            },

            // 7. 내성 - 악마대공의 방
            archduke_chamber: {
                id: 'archduke_chamber',
                name: '악마대공의 방',
                description: '장군급 악마인 악마대공이 거주하는 방. 마왕의 측근이다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['demon_guardian', 'demon_archduke'],
                connections: ['guardian_hall', 'throne_room', 'archduke_chamber_2']
            },

            // 7-1. 내성 - 악마대공의 방 2
            archduke_chamber_2: {
                id: 'archduke_chamber_2',
                name: '악마대공의 방 2',
                description: '또 다른 악마대공이 거주하는 방. 마왕의 또 다른 측근이다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['demon_guardian', 'demon_archduke', 'fallen_angel'],
                connections: ['archduke_chamber', 'demon_banquet_hall', 'demon_barracks']
            },

            // 7-2. 악마의 연회장
            demon_banquet_hall: {
                id: 'demon_banquet_hall',
                name: '악마의 연회장',
                description: '악마들이 만찬을 즐기는 화려한 연회장. 다양한 악마들이 먹고 마시고 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['imp', 'succubus', 'demon_soldier', 'demon_guardian'],
                connections: ['archduke_chamber_2', 'demon_barracks']
            },

            // 7-3. 악마병영
            demon_barracks: {
                id: 'demon_barracks',
                name: '악마병영',
                description: '악마 군단이 훈련하고 대기하는 병영. 수많은 악마 병사들이 전투 준비를 하고 있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['demon_soldier', 'demon_guardian', 'hell_hound'],
                connections: ['archduke_chamber_2', 'demon_banquet_hall', 'inner_castle']
            },

            // 8. 내성 입구
            inner_castle: {
                id: 'inner_castle',
                name: '내성 입구',
                description: '마왕과 측근들이 거주하는 내성의 입구. 정예 악마병사가 지킨다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['demon_soldier', 'fallen_angel', 'succubus'],
                connections: ['demon_city', 'guardian_hall']
            },

            // 9. 마왕의 방 (보스 지역)
            throne_room: {
                id: 'throne_room',
                name: '마왕의 방',
                description: '악마의 성의 최심부. 모든 악마를 다스리는 마왕이 왕좌에 앉아있다.',
                actions: ['move', 'battle', 'explore'],
                canExplore: true,
                canBattle: true,
                monsters: ['demon_archduke', 'fallen_angel'],
                bossMonster: 'demon_king',
                isBossArea: true,
                connections: ['archduke_chamber']
            }
        },
        defaultLocation: 'entrance'
    }
};

// 맵 순서 (레벨 순)
const MAP_ORDER = ['training', 'village', 'cave', 'forest', 'tower', 'lair', 'demon_castle'];

// ============================================
// ⚙️ 난이도 데이터
// ============================================

const DIFFICULTY = {
    easy: {
        id: 'easy',
        name: 'Easy',
        multiplier: 0.8,
        color: '#4CAF50',
        description: '몬스터가 약해집니다.'
    },
    normal: {
        id: 'normal',
        name: 'Normal',
        multiplier: 1.0,
        color: '#2196F3',
        description: '표준 난이도입니다.'
    },
    hard: {
        id: 'hard',
        name: 'Hard',
        multiplier: 1.5,
        color: '#FF9800',
        description: '몬스터가 강해집니다.'
    },
    hell: {
        id: 'hell',
        name: 'Hell',
        multiplier: 2.3,
        color: '#F44336',
        description: '극한의 도전입니다.'
    }
};

// ============================================
// ⚔️ 전투 설정
// ============================================

const BATTLE_CONFIG = {
    attackMultiplierMin: 0.5,
    attackMultiplierMax: 1.5,
    skillMultiplierMin: 2.3,
    skillMultiplierMax: 3.5,
    defenseMultiplierMin: 2.0,
    defenseMultiplierMax: 3.0,
    healDefenseRatio: 0.3,
    healAttackRatio: 0.2,
    healMaxHpRatio: 0.1,
    escapeBaseChance: 70,
    criticalChance: 10,
    criticalMultiplier: 2.0,
    monsterTurnDelay: 1000
};

// ============================================
// ⏰ 시간 설정
// ============================================

const TIME_CONFIG = {
    gameDayDuration: 12 * 60 * 1000, // 게임 1일 = 현실 12분
    nightStartHour: 22,
    nightEndHour: 6,
    daysPerMonth: 30,
    monthsPerYear: 12,
    dayEffects: {
        monsterAggression: 1.0,
        expMultiplier: 1.0,
        dropRateMultiplier: 1.0
    },
    nightEffects: {
        monsterAggression: 1.5,
        expMultiplier: 1.2,
        dropRateMultiplier: 1.3,
        forcedBattleChance: 0.3  // 강제 전투 확률 30%
    }
};

// ============================================
// 👾 다중 몬스터 조우 확률 설정
// ============================================

const ENCOUNTER_CONFIG = {
    // 동시 조우 몬스터 수 확률 (합계 100%)
    monsterCountChances: [
        { count: 1, chance: 0.60 },   // 1마리: 60%
        { count: 2, chance: 0.15 },   // 2마리: 15%
        { count: 3, chance: 0.10 },   // 3마리: 10%
        { count: 4, chance: 0.05 },   // 4마리: 5%
        { count: 5, chance: 0.03 },   // 5마리: 3%
        { count: 6, chance: 0.02 },   // 6마리: 2%
        { count: 7, chance: 0.02 },   // 7마리: 2%
        { count: 8, chance: 0.015 },  // 8마리: 1.5%
        { count: 9, chance: 0.01 },   // 9마리: 1%
        { count: 10, chance: 0.005 } // 10마리: 0.5%
    ]
};

// ============================================
// 🌦️ 특수 이벤트 시스템
// ============================================

const SPECIAL_EVENTS = {
    rain: {
        id: 'rain',
        name: '비',
        icon: '🌧️',
        description: '비가 내립니다. 파밍 효율이 증가합니다.',
        effects: { farmingBonus: 1.3, speedPenalty: 0.9 },
        chance: 0.15  // 15% 확률
    },
    storm: {
        id: 'storm',
        name: '폭풍',
        icon: '⛈️',
        description: '폭풍이 몰아칩니다. 이동이 위험합니다.',
        effects: { farmingBonus: 0.5, speedPenalty: 0.6, forcedBattleChance: 0.4 },
        chance: 0.05  // 5% 확률
    },
    blood_moon: {
        id: 'blood_moon',
        name: '붉은 달',
        icon: '🌑',
        description: '붉은 달이 떴습니다. 몬스터가 강화됩니다.',
        effects: { monsterMultiplier: 1.5, expBonus: 1.5, dropBonus: 2.0 },
        chance: 0.03  // 3% 확률 (밤에만)
    },
    sunny: {
        id: 'sunny',
        name: '맑음',
        icon: '☀️',
        description: '맑은 날씨입니다.',
        effects: {},
        chance: 0.5  // 50% 확률
    }
};

// ============================================
// 🎯 행동 타입
// ============================================

const ACTION_TYPES = {
    battle: {
        id: 'battle',
        name: '전투',
        icon: '⚔️',
        description: '몬스터와 전투를 시작합니다.'
    },
    move: {
        id: 'move',
        name: '이동',
        icon: '🚶',
        description: '다른 지역으로 이동합니다.'
    },
    explore: {
        id: 'explore',
        name: '탐험',
        icon: '🔍',
        description: '주변을 탐험합니다.'
    },
    farming: {
        id: 'farming',
        name: '파밍',
        icon: '🌿',
        description: '자원을 수집합니다.'
    },
    rest: {
        id: 'rest',
        name: '휴식',
        icon: '💤',
        description: 'HP와 MP를 회복합니다.'
    },
    shop: {
        id: 'shop',
        name: '상점',
        icon: '🏪',
        description: '아이템을 사고 팝니다.'
    },
    talk: {
        id: 'talk',
        name: 'NPC',
        icon: '💬',
        description: 'NPC와 대화합니다.'
    },
    npc: {
        id: 'npc',
        name: 'NPC',
        icon: '💬',
        description: 'NPC와 대화합니다.'
    }
};

// ============================================
// 📊 레벨업 테이블
// ============================================

function getRequiredExp(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// 레벨업 시 스탯 증가량
const LEVEL_UP_STATS = {
    hp: 15,
    mp: 8,
    atk: 10,    // 레벨당 공격력 +10
    def: 7      // 레벨당 방어력 +7
};

// ============================================
// 👔 직업 시스템 (완전 재설계)
// ============================================

/**
 * 스탯 계산 공식:
 * - HP = 기본HP + (체력 × 2) + 장비
 * - MP = 기본MP + 지능 + 장비 (턴당 5% 회복)
 * - 물리공격력 = 기본물공 + round(근력 / 2) + 장비
 * - 마법공격력 = 기본마공 + round(지능 / 2) + 장비
 * - 물리방어력 = 기본물방 + round(근력 / 6) + round(체력 / 2) + 장비
 * - 마법방어력 = 기본마방 + round(지능 / 6) + round(체력 / 2) + 장비
 * - 효율 = round(민첩 / 8) % (배수 확률 조정)
 * - 회피율 = round(민첩 / 7) %
 * - 회복효율 = round(체력 / 3) % (모든 회복량 증가)
 */

const JOBS = {
    warrior: {
        id: 'warrior',
        name: '전사',
        description: '근력과 체력이 높은 근접 전투 전문가입니다. 튼튼한 맷집으로 오래 버티며 물리 피해를 가합니다.',
        mainStat: 'str',
        damageType: 'physical',
        baseStats: {
            hp: 50, mp: 20,
            pAtk: 8, mAtk: 2,
            pDef: 5, mDef: 2,
            str: 12, vit: 10, int: 3, agi: 4
        },
        startingEquipment: ['old_longsword', 'old_heavy_leather_armor'],
        startingSkill: 'smash',
        icon: '⚔️'
    },
    archer: {
        id: 'archer',
        name: '궁수',
        description: '민첩이 높아 회피와 효율이 뛰어납니다. 강력한 한 방으로 적을 처치합니다.',
        mainStat: 'agi',
        damageType: 'physical',
        baseStats: {
            hp: 35, mp: 35,
            pAtk: 10, mAtk: 3,
            pDef: 3, mDef: 3,
            str: 7, vit: 5, int: 4, agi: 14
        },
        startingEquipment: ['crude_bow', 'old_hunting_clothes'],
        startingSkill: 'multishot',
        icon: '🏹'
    },
    mage: {
        id: 'mage',
        name: '마법사',
        description: '지능이 높아 강력한 마법 공격을 사용합니다. MP와 마법 피해량이 뛰어납니다.',
        mainStat: 'int',
        damageType: 'magical',
        baseStats: {
            hp: 30, mp: 50,
            pAtk: 3, mAtk: 10,
            pDef: 2, mDef: 4,
            str: 3, vit: 4, int: 14, agi: 6
        },
        startingEquipment: ['crude_staff', 'old_robe'],
        startingSkill: 'fireball',
        icon: '🧙'
    },
    skirmisher: {
        id: 'skirmisher',
        name: '스커미셔',
        description: '근력과 민첩을 균형있게 사용하는 올라운더입니다. 연속 공격이 특기입니다.',
        mainStat: 'str',
        subStat: 'agi',
        damageType: 'physical',
        baseStats: {
            hp: 40, mp: 30,
            pAtk: 9, mAtk: 2,
            pDef: 4, mDef: 3,
            str: 10, vit: 6, int: 3, agi: 11
        },
        startingEquipment: ['old_sword', 'old_leather_armor'],
        startingSkill: 'slash_combo',
        icon: '🗡️'
    }
};

// ============================================
// 📈 스탯 설정 (새로운 공식)
// ============================================

const STATS_CONFIG = {
    // 주 스탯 공격력 보너스 비율
    mainStatAtkRatio: 0.3,
    // 스탯 계산 비율
    ratios: {
        hpPerVit: 2,           // 체력 1당 HP +2
        mpPerInt: 1,           // 지능 1당 MP +1
        pAtkPerStr: 0.5,       // 근력 2당 물리공격력 +1
        mAtkPerInt: 0.5,       // 지능 2당 마법공격력 +1
        pDefPerStr: 1 / 6,       // 근력 6당 물리방어력 +1
        pDefPerVit: 0.5,       // 체력 2당 물리방어력 +1
        mDefPerInt: 1 / 6,       // 지능 6당 마법방어력 +1
        mDefPerVit: 0.5,       // 체력 2당 마법방어력 +1
        efficiencyPerAgi: 1 / 8, // 민첩 8당 효율 +1%
        evasionPerAgi: 1 / 7,    // 민첩 7당 회피율 +1%
        healEffPerVit: 1 / 3     // 체력 3당 회복효율 +1%
    },
    // 자연 회복 (턴당)
    naturalRegen: {
        hpPercent: 1,   // 턴당 최대HP의 1% 회복
        mpPercent: 5    // 턴당 최대MP의 5% 회복
    },
    // 스탯 설명
    stats: {
        hp: { name: 'HP', desc: '생명력', icon: '❤️' },
        mp: { name: 'MP', desc: '마나', icon: '💙' },
        pAtk: { name: '물리공격력', desc: '물리 피해량', icon: '⚔️' },
        mAtk: { name: '마법공격력', desc: '마법 피해량', icon: '🔮' },
        pDef: { name: '물리방어력', desc: '물리 피해 감소', icon: '🛡️' },
        mDef: { name: '마법방어력', desc: '마법 피해 감소', icon: '🔰' },
        str: { name: '근력', desc: '물리공격/방어 증가', icon: '💪' },
        vit: { name: '체력', desc: 'HP/방어/회복효율 증가', icon: '🫀' },
        int: { name: '지능', desc: 'MP/마법공격/방어 증가', icon: '🧠' },
        agi: { name: '민첩', desc: '효율/회피율 증가', icon: '💨' },
        efficiency: { name: '효율', desc: '피해 배수 확률 조정', icon: '🎯' },
        evasion: { name: '회피율', desc: '공격 회피 확률', icon: '💫' },
        healEff: { name: '회복효율', desc: '모든 회복량 증가', icon: '💚' }
    }
};

// ============================================
// ⚡ 스킬 데이터
// ============================================

const SKILLS = {
    // === 전사 스킬 ===
    smash: {
        id: 'smash',
        name: '강타',
        description: '강력한 일격으로 적 1명에게 물리공격력의 200% 피해를 주고 혼란 상태를 1턴간 부여합니다.',
        type: 'active',
        damageType: 'physical',
        mpCost: 15,
        cooldown: 2,
        targetType: 'single',  // 단일 대상
        effects: {
            damagePercent: 200,
            statusEffect: 'confusion',
            statusDuration: 1
        },
        icon: '💥'
    },
    // === 궁수 스킬 ===
    multishot: {
        id: 'multishot',
        name: '멀티샷',
        description: '최대 2명의 적에게 일반공격을 합니다. 1명 선택 시 2회 공격합니다.',
        type: 'active',
        damageType: 'physical',
        mpCost: 12,
        cooldown: 2,
        targetType: 'multi',   // 다중 대상
        maxTargets: 2,
        effects: {
            attackCount: 1,    // 대상당 공격 횟수
            singleTargetBonus: 2  // 1명 선택시 2회 공격
        },
        icon: '🎯'
    },
    // === 마법사 스킬 ===
    fireball: {
        id: 'fireball',
        name: '파이어볼',
        description: '최대 3명의 적에게 마법공격력의 200% 피해를 주고 화상 상태를 2턴간 부여합니다.',
        type: 'active',
        damageType: 'magical',
        mpCost: 20,
        cooldown: 3,
        targetType: 'multi',
        maxTargets: 3,
        effects: {
            damagePercent: 200,
            statusEffect: 'burn',
            statusDuration: 2
        },
        icon: '🔥'
    },
    // === 스커미셔 스킬 ===
    slash_combo: {
        id: 'slash_combo',
        name: '연속베기',
        description: '적 1명에게 물리공격력의 110%로 2회 공격하고 출혈 상태를 2턴간 부여합니다.',
        type: 'active',
        damageType: 'physical',
        mpCost: 10,
        cooldown: 2,
        targetType: 'single',
        effects: {
            damagePercent: 110,
            attackCount: 2,
            statusEffect: 'bleed',
            statusDuration: 2
        },
        icon: '⚡'
    }
};

// ============================================
// 💀 상태이상 데이터
// ============================================

const STATUS_EFFECTS = {
    confusion: {
        id: 'confusion',
        name: '혼란',
        description: '다음 공격의 배수 범위가 감소합니다.',
        icon: '😵',
        effects: {
            maxMultiplierReduction: 0.5,  // 최대 배수 -0.5
            minMultiplierReduction: 0.1   // 최소 배수 -0.1
        }
    },
    burn: {
        id: 'burn',
        name: '화상',
        description: '턴마다 받은 피해의 20%만큼 마법 피해를 입습니다.',
        icon: '🔥',
        effects: {
            damagePercent: 20,  // 스킬 피해의 20%
            damageType: 'magical'
        }
    },
    bleed: {
        id: 'bleed',
        name: '출혈',
        description: '턴마다 최대HP의 4%만큼 물리 피해를 입습니다. (방어 불가)',
        icon: '🩸',
        effects: {
            hpPercent: 4,       // 최대HP의 4%
            ignoreDefense: true // 방어력 무시
        }
    }
};

// ============================================
// 📊 레벨업 설정
// ============================================

const LEVEL_UP_CONFIG = {
    maxLevel: 999,
    perLevel: {
        str: 1, vit: 1, int: 1, agi: 1,  // 기본 스탯 +1씩
        hp: 10, mp: 7,                    // HP +10, MP +7
        pAtk: 1, mAtk: 1,                 // 공격력 +1씩
        pDef: 1, mDef: 1                  // 방어력 +1씩
    },
    statPoints: 2  // 레벨당 자유 배분 스탯포인트
};

// ============================================
// 👾 몬스터 데이터
// ============================================

const MONSTERS = {
    // ===== 훈련장 몬스터 =====
    old_scarecrow: {
        id: 'old_scarecrow',
        name: '낡은 허수아비',
        type: 'normal',
        tier: 1,
        hp: 25, atk: 4, def: 1,
        exp: 8, gold: 3,
        drops: [{ item: 'old_straw', chance: 0.5 }],
        emoji: '🥸'
    },
    scarecrow: {
        id: 'scarecrow',
        name: '일반 허수아비',
        type: 'normal',
        tier: 1,
        hp: 50, atk: 8, def: 3,
        exp: 15, gold: 8,
        drops: [{ item: 'straw', chance: 0.4 }, { item: 'cloth', chance: 0.2 }],
        emoji: '🧿'
    },
    strong_scarecrow: {
        id: 'strong_scarecrow',
        name: '튼튼한 허수아비',
        type: 'normal',
        tier: 2,
        hp: 80, atk: 12, def: 5,
        exp: 25, gold: 12,
        drops: [{ item: 'straw', chance: 0.5 }, { item: 'wood', chance: 0.3 }],
        emoji: '🎃'
    },
    giant_scarecrow: {
        id: 'giant_scarecrow',
        name: '거대 허수아비',
        type: 'normal',
        tier: 3,
        hp: 120, atk: 18, def: 8,
        exp: 40, gold: 20,
        drops: [{ item: 'straw', chance: 0.6 }, { item: 'wood', chance: 0.4 }],
        emoji: '👹'
    },
    training_robot: {
        id: 'training_robot',
        name: '훈련용 로봇',
        type: 'special',
        tier: 3,
        hp: 100, atk: 15, def: 10,
        exp: 35, gold: 25,
        drops: [{ item: 'scrap_metal', chance: 0.4 }],
        emoji: '🤖'
    },
    training_golem: {
        id: 'training_golem',
        name: '훈련용 골렘',
        type: 'boss',
        tier: 4,
        hp: 200, atk: 25, def: 15,
        exp: 100, gold: 80,
        drops: [{ item: 'golem_core', chance: 0.3 }, { item: 'stone', chance: 0.6 }],
        emoji: '🗿',
        isBoss: true
    },

    // ===== 버려진 마을 몬스터 =====
    // 일반 몬스터
    infected_villager: {
        id: 'infected_villager',
        name: '감염된 주민',
        type: 'normal',
        tier: 2,
        hp: 80, atk: 18, pDef: 2, mDef: 2,
        exp: 25, gold: 15,
        drops: [{ item: 'tattered_cloth', chance: 0.3 }, { item: 'cursed_bone', chance: 0.1 }],
        emoji: '🧟'
    },
    ghost: {
        id: 'ghost',
        name: '유령',
        type: 'normal',
        tier: 2,
        hp: 60, atk: 22, pDef: 0, mDef: 5,
        damageType: 'magical',
        exp: 30, gold: 20,
        drops: [{ item: 'ectoplasm', chance: 0.25 }],
        emoji: '👻'
    },
    rat_swarm: {
        id: 'rat_swarm',
        name: '쥐떼',
        type: 'normal',
        tier: 1,
        hp: 40, atk: 12, pDef: 1, mDef: 1,
        exp: 15, gold: 8,
        drops: [{ item: 'rat_tail', chance: 0.5 }],
        emoji: '🐀'
    },
    bandit: {
        id: 'bandit',
        name: '도적',
        type: 'normal',
        tier: 2,
        hp: 100, atk: 20, pDef: 4, mDef: 2,
        exp: 35, gold: 30,
        drops: [{ item: 'stolen_gold', chance: 0.4 }, { item: 'dagger', chance: 0.1 }],
        emoji: '🗡️'
    },
    infected_dog: {
        id: 'infected_dog',
        name: '감염된 개',
        type: 'normal',
        tier: 2,
        hp: 70, atk: 25, pDef: 2, mDef: 1,
        exp: 28, gold: 12,
        drops: [{ item: 'infected_fang', chance: 0.2 }],
        emoji: '🐕'
    },
    infected_cow: {
        id: 'infected_cow',
        name: '감염된 소',
        type: 'normal',
        tier: 3,
        hp: 150, atk: 15, pDef: 6, mDef: 3,
        exp: 40, gold: 25,
        drops: [{ item: 'infected_hide', chance: 0.25 }],
        emoji: '🐄'
    },
    undead: {
        id: 'undead',
        name: '언데드',
        type: 'normal',
        tier: 3,
        hp: 120, atk: 18, pDef: 5, mDef: 5,
        exp: 35, gold: 22,
        drops: [{ item: 'bone', chance: 0.4 }, { item: 'cursed_bone', chance: 0.15 }],
        emoji: '💀'
    },
    goblin: {
        id: 'goblin',
        name: '고블린',
        type: 'normal',
        tier: 2,
        hp: 60, atk: 15, pDef: 3, mDef: 2,
        exp: 20, gold: 18,
        drops: [{ item: 'goblin_ear', chance: 0.3 }, { item: 'cloth', chance: 0.2 }],
        emoji: '👺'
    },

    // 강력한 몬스터 (밤에 출현 확률 증가)
    infected_soldier: {
        id: 'infected_soldier',
        name: '감염된 병사',
        type: 'elite',
        tier: 4,
        hp: 125, atk: 27, pDef: 3, mDef: 3,
        exp: 100, gold: 70,
        drops: [{ item: 'soldier_badge', chance: 0.2 }, { item: 'rusty_sword', chance: 0.15 }],
        emoji: '⚔️'
    },
    death_knight: {
        id: 'death_knight',
        name: '데스나이트',
        type: 'miniboss',
        tier: 5,
        hp: 350, atk: 35, pDef: 10, mDef: 10,
        exp: 750, gold: 500,
        drops: [{ item: 'dark_essence', chance: 0.3 }, { item: 'knight_armor', chance: 0.1 }],
        emoji: '🗡️',
        isMiniBoss: true
    },

    // 보스 몬스터
    cursed_lord: {
        id: 'cursed_lord',
        name: '저주받은 영주',
        type: 'boss',
        tier: 6,
        hp: 500, atk: 45, pDef: 10, mDef: 10,
        exp: 1500, gold: 1000,
        drops: [
            { item: 'lord_ring', chance: 0.2 },
            { item: 'cursed_crown', chance: 0.1 },
            { item: 'dark_essence', chance: 0.5 }
        ],
        emoji: '👑',
        isBoss: true,
        // 특수 스킬: 감염된 주민 소환 (3턴마다)
        skills: [{
            id: 'summon_infected',
            name: '감염된 주민 소환',
            cooldown: 3,
            description: '저주받은 영주가 감염된 주민을 소환합니다.',
            effect: {
                type: 'summon',
                summonId: 'infected_villager',
                // 소환 확률: 1마리 60%, 2마리 30%, 3마리 10%
                countChances: [
                    { count: 1, chance: 0.6 },
                    { count: 2, chance: 0.3 },
                    { count: 3, chance: 0.1 }
                ]
            }
        }]
    },

    // ===== 수상한 동굴 몬스터 =====
    // 일반 몬스터
    cave_bat: {
        id: 'cave_bat',
        name: '동굴 박쥐',
        type: 'normal',
        tier: 3,
        hp: 80, atk: 20, pDef: 3, mDef: 3,
        exp: 40, gold: 22,
        drops: [{ item: 'bat_wing', chance: 0.4 }],
        emoji: '🦇'
    },
    giant_spider: {
        id: 'giant_spider',
        name: '거대 거미',
        type: 'normal',
        tier: 3,
        hp: 100, atk: 25, pDef: 5, mDef: 4,
        exp: 55, gold: 30,
        drops: [{ item: 'spider_silk', chance: 0.45 }, { item: 'venom', chance: 0.2 }],
        emoji: '🕷️'
    },
    zombie: {
        id: 'zombie',
        name: '좀비',
        type: 'normal',
        tier: 3,
        hp: 120, atk: 22, pDef: 6, mDef: 2,
        exp: 50, gold: 25,
        drops: [{ item: 'rotten_flesh', chance: 0.35 }, { item: 'bone', chance: 0.25 }],
        emoji: '🧟'
    },
    orc: {
        id: 'orc',
        name: '오크',
        type: 'normal',
        tier: 4,
        hp: 150, atk: 30, pDef: 8, mDef: 4,
        exp: 70, gold: 45,
        drops: [{ item: 'orc_tooth', chance: 0.3 }, { item: 'crude_axe', chance: 0.1 }],
        emoji: '👹'
    },
    cave_ghost: {
        id: 'cave_ghost',
        name: '동굴 유령',
        type: 'normal',
        tier: 3,
        hp: 70, atk: 28, pDef: 0, mDef: 8,
        damageType: 'magical',
        exp: 60, gold: 35,
        drops: [{ item: 'ectoplasm', chance: 0.3 }],
        emoji: '👻'
    },
    slime: {
        id: 'slime',
        name: '슬라임',
        type: 'normal',
        tier: 2,
        hp: 60, atk: 15, pDef: 10, mDef: 10,
        exp: 35, gold: 20,
        drops: [{ item: 'slime_gel', chance: 0.5 }],
        emoji: '🟢'
    },

    // 엘리트 몬스터
    orc_warrior: {
        id: 'orc_warrior',
        name: '오크 전사',
        type: 'elite',
        tier: 5,
        hp: 250, atk: 40, pDef: 12, mDef: 6,
        exp: 150, gold: 100,
        drops: [{ item: 'orc_sword', chance: 0.2 }, { item: 'warrior_badge', chance: 0.15 }],
        emoji: '⚔️'
    },
    ancient_guardian: {
        id: 'ancient_guardian',
        name: '고대 수호자',
        type: 'elite',
        tier: 5,
        hp: 300, atk: 35, pDef: 15, mDef: 15,
        exp: 180, gold: 120,
        drops: [{ item: 'ancient_artifact', chance: 0.15 }, { item: 'rune_stone', chance: 0.2 }],
        emoji: '🗿'
    },

    // 보스 몬스터
    cave_troll: {
        id: 'cave_troll',
        name: '동굴 트롤',
        type: 'boss',
        tier: 6,
        hp: 600, atk: 55, pDef: 15, mDef: 8,
        exp: 2000, gold: 1500,
        drops: [
            { item: 'troll_hide', chance: 0.4 },
            { item: 'troll_club', chance: 0.2 },
            { item: 'cave_crystal', chance: 0.15 }
        ],
        emoji: '👾',
        isBoss: true,
        // 특수 스킬: 대지 진동 (3턴마다)
        skills: [{
            id: 'earthquake',
            name: '대지 진동',
            cooldown: 3,
            description: '트롤이 땅을 내리쳐 강력한 진동을 일으킵니다.',
            effect: {
                type: 'aoe_damage',
                damageMultiplier: 1.5
            }
        }]
    },

    // ===== 이상한 숲 몬스터 =====
    // 일반 몬스터 (야생)
    wild_wolf: {
        id: 'wild_wolf',
        name: '야생 늑대',
        type: 'normal',
        tier: 4,
        hp: 150, atk: 35, pDef: 8, mDef: 5,
        exp: 80, gold: 45,
        drops: [{ item: 'wolf_pelt', chance: 0.4 }, { item: 'wolf_fang', chance: 0.2 }],
        emoji: '🐺'
    },
    wild_boar: {
        id: 'wild_boar',
        name: '야생 멧돼지',
        type: 'normal',
        tier: 4,
        hp: 180, atk: 30, pDef: 12, mDef: 4,
        exp: 85, gold: 50,
        drops: [{ item: 'boar_tusk', chance: 0.35 }, { item: 'raw_meat', chance: 0.4 }],
        emoji: '🐗'
    },
    forest_spider: {
        id: 'forest_spider',
        name: '숲 거미',
        type: 'normal',
        tier: 4,
        hp: 120, atk: 38, pDef: 6, mDef: 6,
        exp: 75, gold: 40,
        drops: [{ item: 'spider_silk', chance: 0.45 }, { item: 'venom', chance: 0.25 }],
        emoji: '🕷️'
    },

    // 깨끗한 지역 몬스터
    forest_fairy: {
        id: 'forest_fairy',
        name: '숲의 요정',
        type: 'special',
        tier: 4,
        hp: 100, atk: 30, pDef: 4, mDef: 15,
        damageType: 'magical',
        exp: 90, gold: 60,
        drops: [{ item: 'fairy_dust', chance: 0.3 }, { item: 'fairy_wing', chance: 0.1 }],
        emoji: '🧚'
    },
    forest_elf: {
        id: 'forest_elf',
        name: '숲의 엘프',
        type: 'special',
        tier: 5,
        hp: 140, atk: 35, pDef: 8, mDef: 12,
        exp: 100, gold: 70,
        drops: [{ item: 'elf_arrow', chance: 0.25 }, { item: 'rare_herb', chance: 0.15 }],
        emoji: '🧝'
    },

    // 오염된 지역 몬스터
    corrupted_deer: {
        id: 'corrupted_deer',
        name: '저주받은 사슴',
        type: 'normal',
        tier: 4,
        hp: 130, atk: 32, pDef: 7, mDef: 7,
        exp: 85, gold: 45,
        drops: [{ item: 'cursed_antler', chance: 0.3 }, { item: 'dark_essence', chance: 0.1 }],
        emoji: '🦌'
    },
    dark_fairy: {
        id: 'dark_fairy',
        name: '어둠의 요정',
        type: 'normal',
        tier: 5,
        hp: 110, atk: 40, pDef: 5, mDef: 18,
        damageType: 'magical',
        exp: 100, gold: 65,
        drops: [{ item: 'dark_fairy_dust', chance: 0.25 }, { item: 'cursed_gem', chance: 0.1 }],
        emoji: '🖤'
    },
    poison_mushroom: {
        id: 'poison_mushroom',
        name: '독버섯 괴물',
        type: 'normal',
        tier: 4,
        hp: 100, atk: 25, pDef: 10, mDef: 10,
        exp: 70, gold: 35,
        drops: [{ item: 'poison_spore', chance: 0.4 }, { item: 'toxic_cap', chance: 0.2 }],
        emoji: '🍄'
    },
    corrupted_elf: {
        id: 'corrupted_elf',
        name: '타락한 엘프',
        type: 'elite',
        tier: 5,
        hp: 220, atk: 45, pDef: 10, mDef: 15,
        exp: 180, gold: 120,
        drops: [{ item: 'corrupted_bow', chance: 0.15 }, { item: 'dark_essence', chance: 0.25 }],
        emoji: '🧝‍♂️'
    },

    // 나무 정령
    treant: {
        id: 'treant',
        name: '나무 정령',
        type: 'normal',
        tier: 5,
        hp: 200, atk: 35, pDef: 18, mDef: 10,
        exp: 110, gold: 70,
        drops: [{ item: 'ancient_bark', chance: 0.3 }, { item: 'living_wood', chance: 0.2 }],
        emoji: '🌳'
    },
    ancient_treant: {
        id: 'ancient_treant',
        name: '고대 나무 정령',
        type: 'elite',
        tier: 6,
        hp: 350, atk: 45, pDef: 22, mDef: 15,
        exp: 220, gold: 150,
        drops: [{ item: 'ancient_heart', chance: 0.2 }, { item: 'world_tree_branch', chance: 0.1 }],
        emoji: '🌲'
    },

    // 웨어울프 (엘리트)
    werewolf: {
        id: 'werewolf',
        name: '웨어울프',
        type: 'elite',
        tier: 6,
        hp: 320, atk: 55, pDef: 12, mDef: 8,
        exp: 250, gold: 180,
        drops: [{ item: 'werewolf_claw', chance: 0.3 }, { item: 'lycanthropy_blood', chance: 0.1 }],
        emoji: '🐺'
    },

    // 보스 몬스터
    forest_guardian: {
        id: 'forest_guardian',
        name: '숲의 수호자',
        type: 'boss',
        tier: 7,
        hp: 800, atk: 65, pDef: 20, mDef: 20,
        exp: 3000, gold: 2000,
        drops: [
            { item: 'guardian_seed', chance: 0.3 },
            { item: 'world_tree_fruit', chance: 0.15 },
            { item: 'nature_essence', chance: 0.4 }
        ],
        emoji: '🌿',
        isBoss: true,
        // 특수 스킬: 자연의 분노 (3턴마다)
        skills: [{
            id: 'natures_wrath',
            name: '자연의 분노',
            cooldown: 3,
            description: '숲의 수호자가 자연의 힘을 불러 강력한 공격을 한다.',
            effect: {
                type: 'aoe_damage',
                damageMultiplier: 1.8
            }
        }]
    },

    // ===== 고대의 탑 몬스터 =====
    // 1층 - 훈련장 (Lv.5)
    training_dummy: {
        id: 'training_dummy',
        name: '훈련용 허수아비',
        type: 'normal', tier: 1,
        hp: 30, atk: 5, pDef: 0, mDef: 0,
        exp: 10, gold: 5,
        drops: [{ item: 'straw', chance: 0.5 }],
        emoji: '🎯'
    },
    tower_rat: {
        id: 'tower_rat',
        name: '탑의 쥐',
        type: 'normal', tier: 1,
        hp: 25, atk: 8, pDef: 1, mDef: 1,
        exp: 12, gold: 8,
        drops: [{ item: 'rat_tail', chance: 0.4 }],
        emoji: '🐀'
    },
    tower_goblin: {
        id: 'tower_goblin',
        name: '탑의 고블린',
        type: 'normal', tier: 2,
        hp: 40, atk: 12, pDef: 2, mDef: 2,
        exp: 18, gold: 12,
        drops: [{ item: 'goblin_ear', chance: 0.35 }],
        emoji: '👺'
    },

    // 2층 - 언데드의 묘지 (Lv.10)
    tower_skeleton: {
        id: 'tower_skeleton',
        name: '해골 전사',
        type: 'normal', tier: 3,
        hp: 70, atk: 18, pDef: 5, mDef: 3,
        exp: 35, gold: 25,
        drops: [{ item: 'bone', chance: 0.4 }],
        emoji: '💀'
    },
    tower_zombie: {
        id: 'tower_zombie',
        name: '좀비 병사',
        type: 'normal', tier: 3,
        hp: 90, atk: 20, pDef: 6, mDef: 2,
        exp: 40, gold: 28,
        drops: [{ item: 'rotten_flesh', chance: 0.35 }],
        emoji: '🧟'
    },
    tower_ghost: {
        id: 'tower_ghost',
        name: '원한의 유령',
        type: 'normal', tier: 3,
        hp: 55, atk: 22, pDef: 0, mDef: 8,
        damageType: 'magical',
        exp: 45, gold: 30,
        drops: [{ item: 'ectoplasm', chance: 0.3 }],
        emoji: '👻'
    },

    // 3층 - 야수의 우리 (Lv.15)
    tower_wolf: {
        id: 'tower_wolf',
        name: '흉폭한 늑대',
        type: 'normal', tier: 4,
        hp: 110, atk: 28, pDef: 7, mDef: 4,
        exp: 55, gold: 40,
        drops: [{ item: 'wolf_pelt', chance: 0.35 }],
        emoji: '🐺'
    },
    tower_bear: {
        id: 'tower_bear',
        name: '거대 곰',
        type: 'normal', tier: 4,
        hp: 150, atk: 32, pDef: 12, mDef: 5,
        exp: 65, gold: 50,
        drops: [{ item: 'bear_claw', chance: 0.3 }],
        emoji: '🐻'
    },
    tower_lion: {
        id: 'tower_lion',
        name: '황금 사자',
        type: 'normal', tier: 4,
        hp: 130, atk: 35, pDef: 8, mDef: 6,
        exp: 70, gold: 55,
        drops: [{ item: 'lion_mane', chance: 0.25 }],
        emoji: '🦁'
    },

    // 4층 - 마법 연구실 (Lv.20)
    tower_golem: {
        id: 'tower_golem',
        name: '마법 골렘',
        type: 'normal', tier: 5,
        hp: 200, atk: 35, pDef: 18, mDef: 10,
        exp: 90, gold: 70,
        drops: [{ item: 'golem_core', chance: 0.2 }],
        emoji: '🗿'
    },
    tower_mage: {
        id: 'tower_mage',
        name: '탑의 마법사',
        type: 'normal', tier: 5,
        hp: 120, atk: 45, pDef: 5, mDef: 18,
        damageType: 'magical',
        exp: 100, gold: 80,
        drops: [{ item: 'mage_robe', chance: 0.15 }],
        emoji: '🧙'
    },
    magic_construct: {
        id: 'magic_construct',
        name: '마법 구조체',
        type: 'normal', tier: 5,
        hp: 160, atk: 40, pDef: 12, mDef: 15,
        exp: 95, gold: 75,
        drops: [{ item: 'magic_crystal', chance: 0.25 }],
        emoji: '💎'
    },

    // 5층 - 종족의 전당 (Lv.25)
    tower_elf_warrior: {
        id: 'tower_elf_warrior',
        name: '엘프 전사',
        type: 'elite', tier: 5,
        hp: 180, atk: 45, pDef: 10, mDef: 15,
        exp: 130, gold: 100,
        drops: [{ item: 'elven_blade', chance: 0.15 }],
        emoji: '🧝'
    },
    tower_dwarf: {
        id: 'tower_dwarf',
        name: '드워프 중장병',
        type: 'elite', tier: 5,
        hp: 220, atk: 40, pDef: 20, mDef: 8,
        exp: 140, gold: 110,
        drops: [{ item: 'dwarven_hammer', chance: 0.15 }],
        emoji: '⛏️'
    },
    tower_orc_champion: {
        id: 'tower_orc_champion',
        name: '오크 챔피언',
        type: 'elite', tier: 5,
        hp: 250, atk: 50, pDef: 15, mDef: 8,
        exp: 150, gold: 120,
        drops: [{ item: 'orc_axe', chance: 0.15 }],
        emoji: '👹'
    },

    // 6층 - 악마의 영역 (Lv.30)
    tower_imp: {
        id: 'tower_imp',
        name: '임프',
        type: 'normal', tier: 6,
        hp: 150, atk: 50, pDef: 8, mDef: 15,
        damageType: 'magical',
        exp: 160, gold: 130,
        drops: [{ item: 'imp_horn', chance: 0.3 }],
        emoji: '😈'
    },
    tower_demon: {
        id: 'tower_demon',
        name: '악마',
        type: 'elite', tier: 6,
        hp: 280, atk: 55, pDef: 15, mDef: 18,
        damageType: 'magical',
        exp: 200, gold: 160,
        drops: [{ item: 'demon_essence', chance: 0.2 }],
        emoji: '👿'
    },
    dark_sorcerer: {
        id: 'dark_sorcerer',
        name: '암흑 마법사',
        type: 'elite', tier: 6,
        hp: 200, atk: 65, pDef: 8, mDef: 22,
        damageType: 'magical',
        exp: 220, gold: 180,
        drops: [{ item: 'dark_tome', chance: 0.15 }],
        emoji: '🖤'
    },

    // 7층 - 천사의 시험 (Lv.35)
    tower_fallen_angel: {
        id: 'tower_fallen_angel',
        name: '타락 천사',
        type: 'elite', tier: 6,
        hp: 300, atk: 60, pDef: 15, mDef: 20,
        exp: 280, gold: 220,
        drops: [{ item: 'fallen_feather', chance: 0.2 }],
        emoji: '🪽'
    },
    tower_seraph: {
        id: 'tower_seraph',
        name: '세라핌',
        type: 'elite', tier: 7,
        hp: 350, atk: 65, pDef: 18, mDef: 25,
        damageType: 'magical',
        exp: 320, gold: 250,
        drops: [{ item: 'holy_essence', chance: 0.15 }],
        emoji: '👼'
    },
    light_guardian: {
        id: 'light_guardian',
        name: '빛의 수호자',
        type: 'elite', tier: 7,
        hp: 380, atk: 55, pDef: 22, mDef: 22,
        exp: 350, gold: 280,
        drops: [{ item: 'light_crystal', chance: 0.2 }],
        emoji: '✨'
    },

    // 8층 - 차원의 틈 (Lv.40)
    void_creature: {
        id: 'void_creature',
        name: '공허의 존재',
        type: 'elite', tier: 7,
        hp: 400, atk: 70, pDef: 15, mDef: 25,
        damageType: 'magical',
        exp: 400, gold: 320,
        drops: [{ item: 'void_essence', chance: 0.2 }],
        emoji: '🌀'
    },
    dimension_walker: {
        id: 'dimension_walker',
        name: '차원 여행자',
        type: 'elite', tier: 7,
        hp: 350, atk: 75, pDef: 12, mDef: 28,
        exp: 420, gold: 350,
        drops: [{ item: 'dimension_shard', chance: 0.15 }],
        emoji: '🌌'
    },
    chaos_elemental: {
        id: 'chaos_elemental',
        name: '혼돈의 정령',
        type: 'elite', tier: 7,
        hp: 420, atk: 65, pDef: 20, mDef: 20,
        exp: 450, gold: 380,
        drops: [{ item: 'chaos_orb', chance: 0.15 }],
        emoji: '🔮'
    },

    // 9층 - 고대의 존재 (Lv.45)
    ancient_titan: {
        id: 'ancient_titan',
        name: '고대 거인',
        type: 'elite', tier: 8,
        hp: 600, atk: 80, pDef: 25, mDef: 15,
        exp: 550, gold: 450,
        drops: [{ item: 'titan_bone', chance: 0.2 }],
        emoji: '🦴'
    },
    primordial_beast: {
        id: 'primordial_beast',
        name: '원초의 야수',
        type: 'elite', tier: 8,
        hp: 550, atk: 85, pDef: 20, mDef: 18,
        exp: 580, gold: 480,
        drops: [{ item: 'primordial_fang', chance: 0.18 }],
        emoji: '🐲'
    },
    elder_spirit: {
        id: 'elder_spirit',
        name: '태초의 정령',
        type: 'elite', tier: 8,
        hp: 500, atk: 90, pDef: 15, mDef: 30,
        damageType: 'magical',
        exp: 600, gold: 500,
        drops: [{ item: 'elder_essence', chance: 0.15 }],
        emoji: '👁️'
    },

    // 10층 - 탑의 정상 (Lv.50)
    tower_guardian_left: {
        id: 'tower_guardian_left',
        name: '좌측 수호자',
        type: 'miniboss', tier: 8,
        hp: 700, atk: 85, pDef: 25, mDef: 25,
        exp: 800, gold: 650,
        drops: [{ item: 'guardian_gem', chance: 0.3 }],
        emoji: '🛡️',
        isMiniBoss: true
    },
    tower_guardian_right: {
        id: 'tower_guardian_right',
        name: '우측 수호자',
        type: 'miniboss', tier: 8,
        hp: 700, atk: 85, pDef: 25, mDef: 25,
        exp: 800, gold: 650,
        drops: [{ item: 'guardian_gem', chance: 0.3 }],
        emoji: '🛡️',
        isMiniBoss: true
    },
    tower_master: {
        id: 'tower_master',
        name: '탑의 주인',
        type: 'boss', tier: 10,
        hp: 1500, atk: 100, pDef: 30, mDef: 30,
        exp: 5000, gold: 5000,
        drops: [
            { item: 'tower_crown', chance: 0.2 },
            { item: 'master_staff', chance: 0.15 },
            { item: 'dimensional_key', chance: 0.1 }
        ],
        emoji: '👑',
        isBoss: true,
        skills: [{
            id: 'ultimate_trial',
            name: '궁극의 시련',
            cooldown: 4,
            description: '탑의 주인이 모든 힘을 집중하여 강력한 공격을 한다.',
            effect: { type: 'aoe_damage', damageMultiplier: 2.0 }
        }]
    },

    // ===== 드래곤 레어 몬스터 =====
    // 기본 몬스터
    lizardman: {
        id: 'lizardman',
        name: '리자드맨',
        type: 'normal', tier: 7,
        hp: 350, atk: 55, pDef: 15, mDef: 10,
        exp: 280, gold: 200,
        drops: [{ item: 'lizard_scale', chance: 0.35 }],
        emoji: '🦎'
    },
    dragon_soldier: {
        id: 'dragon_soldier',
        name: '용아병',
        type: 'elite', tier: 7,
        hp: 450, atk: 65, pDef: 20, mDef: 15,
        exp: 380, gold: 280,
        drops: [{ item: 'dragon_armor_piece', chance: 0.2 }],
        emoji: '⚔️'
    },
    hatchling: {
        id: 'hatchling',
        name: '해츨링',
        type: 'normal', tier: 6,
        hp: 250, atk: 45, pDef: 10, mDef: 10,
        exp: 200, gold: 150,
        drops: [{ item: 'dragon_scale', chance: 0.3 }],
        emoji: '🥚'
    },
    young_dragon: {
        id: 'young_dragon',
        name: '어린 드래곤',
        type: 'normal', tier: 7,
        hp: 400, atk: 60, pDef: 15, mDef: 15,
        exp: 320, gold: 250,
        drops: [{ item: 'dragon_scale', chance: 0.35 }, { item: 'dragon_tooth', chance: 0.15 }],
        emoji: '🐉'
    },

    // 원소 드래곤
    blue_dragon: {
        id: 'blue_dragon',
        name: '블루 드래곤',
        type: 'elite', tier: 8,
        hp: 600, atk: 75, pDef: 18, mDef: 25,
        damageType: 'magical',
        exp: 550, gold: 400,
        element: 'ice',
        drops: [{ item: 'ice_dragon_scale', chance: 0.25 }, { item: 'frost_essence', chance: 0.15 }],
        emoji: '🧊'
    },
    red_dragon: {
        id: 'red_dragon',
        name: '레드 드래곤',
        type: 'elite', tier: 8,
        hp: 650, atk: 85, pDef: 20, mDef: 18,
        damageType: 'physical',
        exp: 600, gold: 450,
        element: 'fire',
        drops: [{ item: 'fire_dragon_scale', chance: 0.25 }, { item: 'flame_essence', chance: 0.15 }],
        emoji: '🔥'
    },
    green_dragon: {
        id: 'green_dragon',
        name: '그린 드래곤',
        type: 'elite', tier: 8,
        hp: 580, atk: 70, pDef: 15, mDef: 22,
        damageType: 'magical',
        exp: 520, gold: 380,
        element: 'nature',
        drops: [{ item: 'nature_dragon_scale', chance: 0.25 }, { item: 'nature_essence', chance: 0.15 }],
        emoji: '🌿'
    },
    earth_dragon: {
        id: 'earth_dragon',
        name: '대지룡',
        type: 'elite', tier: 8,
        hp: 700, atk: 70, pDef: 30, mDef: 15,
        damageType: 'physical',
        exp: 580, gold: 420,
        element: 'earth',
        drops: [{ item: 'earth_dragon_scale', chance: 0.25 }, { item: 'earth_essence', chance: 0.15 }],
        emoji: '🪨'
    },
    thunder_dragon: {
        id: 'thunder_dragon',
        name: '뇌룡',
        type: 'elite', tier: 8,
        hp: 550, atk: 90, pDef: 15, mDef: 20,
        damageType: 'magical',
        exp: 600, gold: 450,
        element: 'lightning',
        drops: [{ item: 'thunder_dragon_scale', chance: 0.25 }, { item: 'lightning_essence', chance: 0.15 }],
        emoji: '⚡'
    },

    // 특수 드래곤
    holy_dragon: {
        id: 'holy_dragon',
        name: '성룡',
        type: 'elite', tier: 9,
        hp: 750, atk: 80, pDef: 22, mDef: 30,
        damageType: 'magical',
        exp: 700, gold: 550,
        element: 'holy',
        drops: [{ item: 'holy_dragon_scale', chance: 0.2 }, { item: 'divine_essence', chance: 0.1 }],
        emoji: '✨'
    },
    dark_dragon: {
        id: 'dark_dragon',
        name: '마룡',
        type: 'elite', tier: 9,
        hp: 720, atk: 95, pDef: 18, mDef: 25,
        damageType: 'magical',
        exp: 750, gold: 580,
        element: 'dark',
        drops: [{ item: 'dark_dragon_scale', chance: 0.2 }, { item: 'demonic_essence', chance: 0.1 }],
        emoji: '🖤'
    },

    // 보스 몬스터
    ancient_dragon: {
        id: 'ancient_dragon',
        name: '고대 드래곤',
        type: 'boss', tier: 10,
        hp: 2500, atk: 120, pDef: 35, mDef: 35,
        exp: 8000, gold: 8000,
        drops: [
            { item: 'ancient_dragon_heart', chance: 0.2 },
            { item: 'dragon_king_scale', chance: 0.15 },
            { item: 'primordial_flame', chance: 0.1 }
        ],
        emoji: '🐲',
        isBoss: true,
        skills: [{
            id: 'dragons_breath',
            name: '드래곤 브레스',
            cooldown: 3,
            description: '고대 드래곤이 모든 원소의 힘을 담은 브레스를 내뿜는다.',
            effect: { type: 'aoe_damage', damageMultiplier: 2.5 }
        }]
    },

    // ===== 악마의 성 몬스터 =====
    // 일반 몬스터
    imp: {
        id: 'imp',
        name: '임프',
        type: 'normal', tier: 8,
        hp: 400, atk: 70, pDef: 12, mDef: 18,
        damageType: 'magical',
        exp: 350, gold: 280,
        drops: [{ item: 'imp_horn', chance: 0.35 }],
        emoji: '😈'
    },
    succubus: {
        id: 'succubus',
        name: '서큐버스',
        type: 'normal', tier: 8,
        hp: 380, atk: 85, pDef: 10, mDef: 22,
        damageType: 'magical',
        exp: 400, gold: 320,
        drops: [{ item: 'charm_essence', chance: 0.25 }, { item: 'succubus_wing', chance: 0.15 }],
        emoji: '💋'
    },
    fallen_angel: {
        id: 'fallen_angel',
        name: '타락 천사',
        type: 'normal', tier: 9,
        hp: 500, atk: 90, pDef: 18, mDef: 25,
        damageType: 'magical',
        exp: 500, gold: 400,
        drops: [{ item: 'fallen_feather', chance: 0.25 }, { item: 'corrupted_halo', chance: 0.1 }],
        emoji: '🪽'
    },
    dark_mage: {
        id: 'dark_mage',
        name: '흑마법사',
        type: 'normal', tier: 8,
        hp: 350, atk: 95, pDef: 8, mDef: 28,
        damageType: 'magical',
        exp: 420, gold: 350,
        drops: [{ item: 'forbidden_tome', chance: 0.2 }, { item: 'dark_crystal', chance: 0.15 }],
        emoji: '🖤'
    },
    hell_hound: {
        id: 'hell_hound',
        name: '악마견',
        type: 'normal', tier: 8,
        hp: 450, atk: 80, pDef: 15, mDef: 12,
        exp: 380, gold: 300,
        drops: [{ item: 'hellhound_fang', chance: 0.3 }],
        emoji: '🐕‍🦺'
    },
    vampire: {
        id: 'vampire',
        name: '뱀파이어',
        type: 'normal', tier: 9,
        hp: 480, atk: 88, pDef: 15, mDef: 20,
        exp: 450, gold: 380,
        drops: [{ item: 'vampire_fang', chance: 0.25 }, { item: 'blood_essence', chance: 0.15 }],
        emoji: '🧛'
    },
    demon_beast: {
        id: 'demon_beast',
        name: '마수',
        type: 'normal', tier: 9,
        hp: 550, atk: 85, pDef: 20, mDef: 15,
        exp: 480, gold: 400,
        drops: [{ item: 'demon_claw', chance: 0.3 }],
        emoji: '👹'
    },
    demon_soldier: {
        id: 'demon_soldier',
        name: '악마병사',
        type: 'elite', tier: 9,
        hp: 600, atk: 95, pDef: 25, mDef: 20,
        exp: 550, gold: 450,
        drops: [{ item: 'demon_armor_piece', chance: 0.2 }, { item: 'demon_sword', chance: 0.1 }],
        emoji: '⚔️'
    },

    // 엘리트 몬스터
    demon_guardian: {
        id: 'demon_guardian',
        name: '악마 수호자',
        type: 'elite', tier: 10,
        hp: 800, atk: 105, pDef: 30, mDef: 25,
        exp: 700, gold: 600,
        drops: [{ item: 'guardian_emblem', chance: 0.2 }, { item: 'demon_essence', chance: 0.25 }],
        emoji: '🛡️'
    },
    demon_archduke: {
        id: 'demon_archduke',
        name: '악마 대공',
        type: 'elite', tier: 10,
        hp: 1000, atk: 115, pDef: 28, mDef: 28,
        exp: 900, gold: 800,
        drops: [{ item: 'archduke_crown', chance: 0.15 }, { item: 'demon_essence', chance: 0.3 }],
        emoji: '👑',
        isMiniBoss: true
    },

    // 보스 몬스터
    demon_king: {
        id: 'demon_king',
        name: '마왕',
        type: 'boss', tier: 11,
        hp: 5000, atk: 150, pDef: 40, mDef: 40,
        exp: 15000, gold: 15000,
        drops: [
            { item: 'demon_king_crown', chance: 0.2 },
            { item: 'demon_king_sword', chance: 0.15 },
            { item: 'soul_of_darkness', chance: 0.1 }
        ],
        emoji: '👿',
        isBoss: true,
        skills: [{
            id: 'hell_fire',
            name: '지옥의 불꽃',
            cooldown: 3,
            description: '마왕이 지옥의 불꽃을 소환하여 모든 것을 태운다.',
            effect: { type: 'aoe_damage', damageMultiplier: 3.0 }
        }]
    }
};

// ============================================
// 📦 아이템 등급
// ============================================

const ITEM_RARITY = {
    E: { name: 'E급', color: '#9e9e9e', multiplier: 0.8 },
    D: { name: 'D급', color: '#8bc34a', multiplier: 1.0 },
    C: { name: 'C급', color: '#03a9f4', multiplier: 1.3 },
    B: { name: 'B급', color: '#9c27b0', multiplier: 1.6 },
    A: { name: 'A급', color: '#ff9800', multiplier: 2.0 },
    S: { name: 'S급', color: '#f44336', multiplier: 2.5 }
};

// ============================================
// 🍖 포만감/수분 설정
// ============================================

const HUNGER_CONFIG = {
    maxHunger: 100,
    maxThirst: 100,
    hungerDecreasePerMinute: 1,    // 분당 포만감 감소
    thirstDecreasePerMinute: 1.5,  // 분당 수분 감소
    lowThreshold: 30,              // 이 이하면 디버프
    criticalThreshold: 10,         // 심각한 디버프
    debuffs: {
        low: { speedMod: 0.8, hpRegenMod: 0.5 },
        critical: { speedMod: 0.5, hpRegenMod: 0, hpDamagePerMinute: 2 }
    }
};

// ============================================
// 💰 보상 설정
// ============================================

const REWARD_CONFIG = {
    goldBase: 10,
    goldVariance: 0.3,
    expBase: 20,
    expVariance: 0.2
};

// ============================================
// 👥 NPC 데이터
// ============================================

const NPCS = {
    // ===== 훈련장 NPC =====

    // 훈련장 입구 - 훈련교관1
    instructor1: {
        id: 'instructor1',
        name: '훈련교관1',
        location: 'training.entrance',
        emoji: '🧑‍🏫',
        description: '훈련장 입구를 지키는 교관입니다.',
        dialogues: {
            greeting: '어서 오게, 신입이군. 이곳은 훈련장이야. 기초를 다지기에 좋은 곳이지.',
            info: '훈련장 곳곳을 돌아다니며 훈련하게. 초급, 중급, 상급 훈련장이 있고, 휴식처와 상점도 있어.',
            quest: '아직 자네에게 줄 임무는 없네. 더 강해지고 오게.'
        },
        canGiveQuest: false,
        canTrade: false
    },

    // 초급훈련장 - 훈련교관2
    instructor2: {
        id: 'instructor2',
        name: '훈련교관2',
        location: 'training.beginner_field',
        emoji: '👨‍🏫',
        description: '초급훈련장을 담당하는 교관입니다.',
        dialogues: {
            greeting: '초급훈련장에 온 것을 환영한다! 낡은 허수아비부터 시작해보게.',
            info: '여기서는 낡은 허수아비와 일반 허수아비를 상대할 수 있어. 기초를 다지기 좋지.',
            quest: '허수아비 5마리를 처치해 보게. 그러면 내가 보상을 주겠네.'
        },
        canGiveQuest: true,
        canTrade: false,
        quests: ['defeat_scarecrows_5']
    },

    // 초급훈련장 - 수련생1
    trainee1: {
        id: 'trainee1',
        name: '수련생1',
        location: 'training.beginner_field',
        emoji: '👦',
        description: '초급훈련장에서 열심히 훈련하는 수련생입니다.',
        dialogues: {
            greeting: '안녕하세요! 저도 여기서 훈련 중이에요.',
            info: '허수아비가 생각보다 튼튼해요... 계속 연습해야겠어요!',
            hint: '휴식처에서 쉬면 체력이 회복된다는 거 알고 계세요?'
        },
        canGiveQuest: false,
        canTrade: false
    },

    // 중급훈련장 - 훈련교관3
    instructor3: {
        id: 'instructor3',
        name: '훈련교관3',
        location: 'training.intermediate_field',
        emoji: '👩‍🏫',
        description: '중급훈련장을 담당하는 교관입니다.',
        dialogues: {
            greeting: '중급훈련장에 온 것을 환영한다. 여기서는 더 강한 허수아비들이 기다리고 있지.',
            info: '튼튼한 허수아비와 거대 허수아비를 상대해야 해. 준비는 됐나?',
            quest: '거대 허수아비를 3마리 처치해 보게.'
        },
        canGiveQuest: true,
        canTrade: false,
        quests: ['defeat_giant_scarecrows_3']
    },

    // 중급훈련장 - 수련생2
    trainee2: {
        id: 'trainee2',
        name: '수련생2',
        location: 'training.intermediate_field',
        emoji: '👧',
        description: '중급훈련장에서 훈련하는 수련생입니다.',
        dialogues: {
            greeting: '아, 새로운 얼굴이네요! 저도 여기서 훈련 중이에요.',
            info: '거대 허수아비는 정말 강해요. 방어도 중요하다는 걸 배웠어요.',
            hint: '상점에서 물약을 사두면 좋아요!'
        },
        canGiveQuest: false,
        canTrade: false
    },

    // 상급훈련장 - 훈련교관4
    instructor4: {
        id: 'instructor4',
        name: '훈련교관4',
        location: 'training.advanced_field',
        emoji: '🧔',
        description: '상급훈련장을 총괄하는 베테랑 교관입니다.',
        dialogues: {
            greeting: '상급훈련장이다. 여기까지 왔다면 실력이 좀 되는 것 같군.',
            info: '훈련용 로봇과 훈련용 골렘을 상대해야 한다. 골렘은 보스급이니 각오해라.',
            quest: '훈련용 골렘을 1마리 처치해 보게. 그러면 특별한 보상을 주겠다.'
        },
        canGiveQuest: true,
        canTrade: false,
        quests: ['defeat_training_golem']
    },

    // 상급훈련장 - 수련생3
    trainee3: {
        id: 'trainee3',
        name: '수련생3',
        location: 'training.advanced_field',
        emoji: '🧒',
        description: '상급훈련장에서 훈련하는 실력있는 수련생입니다.',
        dialogues: {
            greeting: '여기까지 온 거 보니 실력이 좀 되시나 봐요.',
            info: '훈련용 로봇은 공격이 빠르고, 골렘은 방어가 단단해요.',
            hint: '스킬을 적절히 사용하면 훨씬 수월해요!'
        },
        canGiveQuest: false,
        canTrade: false
    },

    // 상급훈련장 - 수련생4
    trainee4: {
        id: 'trainee4',
        name: '수련생4',
        location: 'training.advanced_field',
        emoji: '👱',
        description: '상급훈련장의 고참 수련생입니다.',
        dialogues: {
            greeting: '골렘... 정말 강하더라고요. 저도 아직 이기기 힘들어요.',
            info: '저도 곧 다른 지역으로 떠날 거예요. 버려진 마을이 다음 목적지래요.',
            hint: '상급교관님께 가면 특별한 퀘스트를 받을 수 있대요.'
        },
        canGiveQuest: false,
        canTrade: false
    },

    // 휴식처 - 의사
    doctor: {
        id: 'doctor',
        name: '의사',
        location: 'training.rest_area',
        emoji: '👨‍⚕️',
        description: '휴식처에서 부상자를 치료하는 의사입니다.',
        dialogues: {
            greeting: '어서 오게. 다친 곳이 있으면 말해주게.',
            info: '여기서 푹 쉬면 체력과 마나가 회복된다네. 상태이상도 치료되지.',
            heal: '자, 치료해주겠네. 푹 쉬게나.',
            shop_hint: '물약이 필요하면 상점에서 구매할 수 있어.'
        },
        canGiveQuest: false,
        canTrade: false,
        canHeal: true
    },

    // 상점 - 상점주인
    shopkeeper: {
        id: 'shopkeeper',
        name: '상점주인',
        location: 'training.shop',
        emoji: '🧓',
        description: '훈련장 상점을 운영하는 상인입니다.',
        dialogues: {
            greeting: '어서 오게! 무엇이 필요한가?',
            info: '초보자에게 필요한 물건들을 구비해 두었네. 편하게 둘러보게.',
            buy: '좋은 선택이야! 더 필요한 건 없나?',
            sell: '음, 이거라면 이 정도 가격에 살 수 있네.',
            farewell: '또 오게나! 언제든 환영이야.'
        },
        canGiveQuest: false,
        canTrade: true,
        shopItems: ['plain_armor_warrior', 'strong_leather_item', 'hp_potion', 'mp_potion', 'herb']
    },

    // 상급교관의 집 - 상급교관
    senior_instructor: {
        id: 'senior_instructor',
        name: '상급교관',
        location: 'training.senior_instructor_house',
        emoji: '🧙',
        description: '훈련장의 최고 교관입니다. 특별한 퀘스트와 이벤트를 제공합니다.',
        dialogues: {
            greeting: '오, 여기까지 찾아왔군. 관심이 있나 보구나.',
            info: '나는 특별한 임무를 줄 수 있네. 준비가 되면 말해주게.',
            quest: '훈련장을 졸업하고 싶다면 내 시험을 통과해야 하네. 어떤가, 도전해볼 텐가?',
            special_event: '오늘은 특별한 날이군. 너에게 특별한 선물을 주겠네.'
        },
        canGiveQuest: true,
        canTrade: false,
        quests: ['training_graduation_exam'],
        hasSpecialEvents: true
    },

    // 휴식처 - 의사
    doctor: {
        id: 'doctor',
        name: '의사',
        location: 'training.rest_area',
        emoji: '👨‍⚕️',
        description: '훈련장 휴식처에서 부상자들을 치료하는 의사입니다.',
        dialogues: {
            greeting: '어서 오게. 어디 다친 곳은 없나?',
            info: '무리하지 말게. 건강이 최고야. 여기서 충분히 쉬어가도록 해.',
            heal: '상처를 보자... 괜찮네, 금방 나을 거야.',
            revive: '아 일어났는가? 내가 쓰러진 자네를 데려왔네. 무리하지 말고 천천히 회복하게나.',
            farewell: '몸조심하게! 또 다치면 안 되네.'
        },
        canGiveQuest: false,
        canTrade: false
    }
};

// ============================================
// 🖼️ 위치별 배경 이미지
// ============================================

const LOCATION_BACKGROUNDS = {
    // 훈련장 배경
    training: {
        entrance: 'assets/backgrounds/training/entrance.png',
        beginner_field: 'assets/backgrounds/training/beginner_field.png',
        intermediate_field: 'assets/backgrounds/training/intermediate_field.png',
        advanced_field: 'assets/backgrounds/training/advanced_field.png',
        rest_area: 'assets/backgrounds/training/rest_area.png',
        shop: 'assets/backgrounds/training/shop.jpg',
        senior_instructor_house: 'assets/backgrounds/training/senior_instructor_house.png'
    },

    // 버려진 마을 배경
    village: {
        entrance: 'assets/backgrounds/village/entrance.jpg',
        ruined_plaza: 'assets/backgrounds/village/ruined_plaza.jpg',
        collapsed_houses: 'assets/backgrounds/village/collapsed_houses.jpg',
        abandoned_church: 'assets/backgrounds/village/abandoned_church.jpg',
        abandoned_church_interior: 'assets/backgrounds/village/abandoned_church_interior.jpg',
        village_well: 'assets/backgrounds/village/village_well.jpg',
        lord_mansion: 'assets/backgrounds/village/lord_mansion.jpg',
        lord_mansion_interior: 'assets/backgrounds/village/lord_mansion_interior.jpg'
    },

    // 수상한 동굴 배경
    cave: {
        entrance: 'assets/backgrounds/cave/entrance.jpg',
        first_passage: 'assets/backgrounds/cave/first_passage.jpg',
        crossroads: 'assets/backgrounds/cave/crossroads.jpg',
        underground_lake: 'assets/backgrounds/cave/underground_lake.jpg',
        abandoned_mine: 'assets/backgrounds/cave/abandoned_mine.jpg',
        mine_tunnel_1: 'assets/backgrounds/cave/mine_tunnel.jpg',
        mine_tunnel_2: 'assets/backgrounds/cave/mine_tunnel.jpg',
        mine_area_2: 'assets/backgrounds/cave/mine_area_2.jpg',
        mine_area_3: 'assets/backgrounds/cave/mine_area_3.jpg',
        ancient_remnants: 'assets/backgrounds/cave/ancient_remnants.jpg',
        ancient_ruins: 'assets/backgrounds/cave/ancient_ruins.jpg',
        ominous_space: 'assets/backgrounds/cave/ominous_space.jpg',
        deep_cave: 'assets/backgrounds/cave/deep_cave.jpg'
    },

    // 이상한 숲 배경
    forest: {
        entrance: 'assets/backgrounds/forest/entrance.jpg',
        forest_trail: 'assets/backgrounds/forest/forest_trail.jpg',
        herb_garden: 'assets/backgrounds/forest/herb_garden.jpg',
        fairy_clearing: 'assets/backgrounds/forest/fairy_clearing.jpg',
        swamp: 'assets/backgrounds/forest/swamp.jpg',
        ancient_grove: 'assets/backgrounds/forest/ancient_grove.jpg',
        forest_heart: 'assets/backgrounds/forest/forest_heart.jpg'
    },

    // 고대의 탑 배경
    tower: {
        entrance: 'assets/backgrounds/tower/entrance.jpg',
        floor_1: 'assets/backgrounds/tower/floor_1.jpg',
        floor_2: 'assets/backgrounds/tower/floor_2.jpg',
        floor_3: 'assets/backgrounds/tower/floor_3.jpg',
        floor_4: 'assets/backgrounds/tower/floor_4.jpg',
        floor_5: 'assets/backgrounds/tower/floor_5.jpg',
        floor_6: 'assets/backgrounds/tower/floor_6.png',
        floor_7: 'assets/backgrounds/tower/floor_7.jpg',
        floor_8: 'assets/backgrounds/tower/floor_8.png',
        floor_9: 'assets/backgrounds/tower/floor_9.png',
        floor_10: 'assets/backgrounds/tower/floor_10.png'
    },

    // 드래곤 레어 배경
    lair: {
        entrance: 'assets/backgrounds/lair/entrance.jpg',
        egg_nest: 'assets/backgrounds/lair/egg_nest.jpg',
        elemental_path: 'assets/backgrounds/lair/elemental_path.jpg',
        treasure_vault: 'assets/backgrounds/lair/treasure_vault.jpg',
        dragon_graveyard: 'assets/backgrounds/lair/dragon_graveyard.png',
        lair_heart: 'assets/backgrounds/lair/lair_heart.jpg'
    },

    // 악마의 성 배경
    demon_castle: {
        entrance: 'assets/backgrounds/demon_castle/entrance.png',
        flame_river: 'assets/backgrounds/demon_castle/flame_river.png',
        dungeon: 'assets/backgrounds/demon_castle/dungeon.png',
        demon_city: 'assets/backgrounds/demon_castle/demon_city.png',
        pain_lab: 'assets/backgrounds/demon_castle/pain_lab.png',
        guardian_hall: 'assets/backgrounds/demon_castle/guardian_hall.png',
        archduke_chamber: 'assets/backgrounds/demon_castle/archduke_chamber.png',
        archduke_chamber_2: 'assets/backgrounds/demon_castle/demon_archduke_room_2.png',
        demon_banquet_hall: 'assets/backgrounds/demon_castle/demon_banquet_hall.png',
        demon_barracks: 'assets/backgrounds/demon_castle/demon_barracks.png',
        inner_castle: 'assets/backgrounds/demon_castle/inner_castle.png',
        throne_room: 'assets/backgrounds/demon_castle/throne_room.png'
    }
};

// ============================================
// 🔊 콘솔 로그
// ============================================

console.log('📦 gameData.js v3 로드 완료! (훈련장 재설계, NPC 추가, 배경 이미지)');

