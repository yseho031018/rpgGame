const fs = require('fs');
const vm = require('vm');

try {
    const code = fs.readFileSync('/Users/a1/workSpace/html:css,javascript/rpg/js/gameData.js', 'utf8');
    const script = new vm.Script(code + '\n; [MAPS, MONSTERS, STATUS_EFFECTS, TRAITS];');
    const context = vm.createContext({});
    const [MAPS, MONSTERS, STATUS_EFFECTS, TRAITS] = script.runInContext(context);

    // 1. 맵 데이터 파싱하여 몬스터의 출현 장소 맵핑
    const monsterLocations = {}; // key: monster ID, value: 배열 [{ mapName, locName }]
    
    // NPC/교관류가 맵에 있는지 확인하기 위함
    const mapNpcToMonster = {
        'spar_instructor2': 'spar_instructor2',
        'instructor2': 'spar_instructor2',
        'instructor3': 'spar_instructor3',
        'instructor4': 'spar_instructor4',
        'senior_instructor': 'spar_senior_instructor'
    };

    for (const mapKey in MAPS) {
        const mapData = MAPS[mapKey];
        if (mapData.locations) {
            for (const locKey in mapData.locations) {
                const locData = mapData.locations[locKey];
                
                // 일반 몬스터들
                if (locData.monsters) {
                    for (const mId of locData.monsters) {
                        if (!monsterLocations[mId]) monsterLocations[mId] = [];
                        monsterLocations[mId].push({ mapName: mapData.name, locName: locData.name });
                    }
                }
                
                // NPC/교관들 (대련교관)
                if (locData.npcs) {
                    for (const npcId of locData.npcs) {
                        const mId = mapNpcToMonster[npcId];
                        if (mId && MONSTERS[mId]) {
                            if (!monsterLocations[mId]) monsterLocations[mId] = [];
                            monsterLocations[mId].push({ mapName: mapData.name, locName: locData.name });
                        }
                    }
                }
                
                // 보스 몬스터들 확인
                if (locData.boss) {
                    const mId = locData.boss;
                    if (!monsterLocations[mId]) monsterLocations[mId] = [];
                    monsterLocations[mId].push({ mapName: mapData.name, locName: locData.name });
                }
            }
        }
    }
    
    // 카테고리별로 몬스터 분류
    const mapCategories = {};
    const unmappedCategories = {
        '대련 교관 (특수/맵에 할당되지 않음)': [],
        '기타/특수/미분류': []
    };
    
    for (const mId in MONSTERS) {
        const m = MONSTERS[mId];
        
        // 몬스터의 출현 장소 문자열 생성
        let locStr = '';
        let belongsToMaps = new Set();
        
        if (monsterLocations[mId]) {
            // 중복 제거 및 정리
            const locGroup = {};
            monsterLocations[mId].forEach(l => {
                if (!locGroup[l.mapName]) locGroup[l.mapName] = [];
                if (!locGroup[l.mapName].includes(l.locName)) {
                    locGroup[l.mapName].push(l.locName);
                }
                belongsToMaps.add(l.mapName);
            });
            
            locStr = Object.keys(locGroup).map(mapName => {
                return `${mapName} 내부의 ${locGroup[mapName].join(', ')}에서 등장`;
            }).join(' / ');
        } else {
             locStr = '구체적인 출현 장소 정보가 맵에 할당되지 않았습니다.';
        }
        
        m.appearLocationStr = locStr;
        
        if (belongsToMaps.size > 0) {
            belongsToMaps.forEach(mapName => {
                if (!mapCategories[mapName]) mapCategories[mapName] = [];
                mapCategories[mapName].push(m);
            });
        } else {
            // 소속된 맵이 없는 경우
            if (m.type === 'spar') {
                unmappedCategories['대련 교관 (특수/맵에 할당되지 않음)'].push(m);
            } else {
                unmappedCategories['기타/특수/미분류'].push(m);
            }
        }
    }

    // 마크다운 작성
    let md = '# 👾 RPG 게임 몬스터 도감\n\n이 문서는 게임 내 맵별로 등장하는 몬스터의 요약 정보를 담고 있습니다.\n\n';

    const renderMonster = (m) => {
        let hp = m.hp || 0;
        let mp = m.mp || m.maxMp || 0;
        let pAtk = m.atk || m.pAtk || 0;
        let mAtk = m.mAtk || 0;
        let pDef = m.pDef || 0;
        let mDef = m.mDef || 0;
        
        let text = `${m.name}) hp : ${hp}, mp ${mp}, 물리공격력 ${pAtk}, 마법공격력 ${mAtk}, 물리방어력 ${pDef}, 마법방어력 ${mDef}\n`;
        
        // 스킬 및 특성
        let skills = [];
        if (m.skills && Array.isArray(m.skills)) {
            m.skills.forEach(s => {
                if (typeof s === 'string') {
                    skills.push(`${s}(스킬)`);
                } else if (s.name) {
                    let detail = '';
                    if (s.name === '감염된 주민 소환') {
                         detail = ' (1명 60%, 2명 30%, 3명 10%)';
                    }
                    if (s.effect && s.effect.description) {
                         detail += ` (${s.effect.description})`;
                    }
                    skills.push(`${s.name}(스킬)${detail}`);
                }
            });
        }
        
        let traits = [];
        if (m.possibleTraits && Array.isArray(m.possibleTraits)) {
            m.possibleTraits.forEach(t => {
                let tName = t.id;
                if (tName === 'self_repair') tName = '자가수복';
                traits.push(`${tName}(특성) ${Math.round((t.chance || 1) * 100)}%`);
            });
        }
        
        // 통합된 스킬 및 특성
        skills = skills.concat(traits);

        if (m.phase2Config) {
            skills.push(`2페이즈 존재 (HP ${(m.phase2Config.hpThreshold || 0)*100}% 이하 시 물리공격력 +${m.phase2Config.pAtkBonus || 0}, ${m.phase2Config.activateSkill||''} 능동발동)`);
        }
        
        if (m.aiPattern && m.aiPattern.mpRegenPercent) {
             skills.push(`매 턴 MP ${m.aiPattern.mpRegenPercent}% 회복(특성)`);
        }

        if (skills.length === 0) {
            skills.push('없음');
        }
        text += `전투시 보유할 가능성있는 스킬 및 특성 : ${skills.join(', ')}\n`;
        
        // 드랍 아이템
        let drops = [];
        if (m.exp) drops.push(`경험치 ${m.exp}(100%)`);
        if (m.gold) drops.push(`골드 ${m.gold}(100%)`);
        
        if (m.drops && Array.isArray(m.drops)) {
            m.drops.forEach(d => {
                // 아이템 이름을 한글로 매핑하는 기능이 있다면 좋으나, 현재는 ID로 표기
                let itemName = d.item;
                drops.push(`${itemName}(${Math.round((d.chance || 1) * 100)}%)`);
            });
        }
        
        if (drops.length === 0) {
            drops.push('없음');
        }
        text += `드랍아이템 : ${drops.join(', ')}\n`;
        
        // 추가 설명
        let desc = m.description || '';
        if (!desc) {
            if (m.type === 'boss') desc = '보스 몬스터입니다. 강력한 체력과 공격력을 주의하세요.';
            else if (m.type === 'elite') desc = '엘리트 몬스터입니다. 일반 몬스터보다 강하므로 주의가 필요합니다.';
            else if (m.type === 'spar') desc = '대련용 NPC입니다.';
            else if (m.type === 'miniboss') desc = '미니 보스 몬스터입니다. 상당한 위협이 될 수 있습니다.';
            else desc = '일반 몬스터입니다.';
        }
        text += `그 외의 추가설명 : ${desc}\n`;
        
        // 출현 장소
        text += `출현장소 : ${m.appearLocationStr}\n\n`;
        
        return text;
    };

    // 출력
    // 정리된 카테고리를 순회
    for (const mapName in mapCategories) {
        md += `## 🗺️ 맵: ${mapName}\n\n`;
        
        // 몬스터들을 티어 오름차순, 이름 오름차순 정렬
        mapCategories[mapName].sort((a, b) => {
            if (a.tier !== b.tier) return a.tier - b.tier;
            return a.name.localeCompare(b.name);
        });
        
        mapCategories[mapName].forEach(m => {
            md += renderMonster(m);
        });
    }
    
    // 소속 맵이 없는 카테고리
    for (const catName in unmappedCategories) {
        if (unmappedCategories[catName].length === 0) continue;
        
        md += `## ❓ ${catName}\n\n`;
        
        unmappedCategories[catName].sort((a, b) => {
            if (a.tier !== b.tier) return a.tier - b.tier;
            return a.name.localeCompare(b.name);
        });
        
        unmappedCategories[catName].forEach(m => {
            md += renderMonster(m);
        });
    }

    fs.writeFileSync('/Users/a1/workSpace/html:css,javascript/rpg/monster_summary.md', md, 'utf8');
    console.log('Successfully updated monster_summary.md');
} catch (e) {
    console.error('Error generating summary:', e);
}
