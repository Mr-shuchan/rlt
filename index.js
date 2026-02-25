const express = require('express');
const cors = require('cors');
// 引入星历表计算基础库 (部署环境已安装)
const swisseph = require('swisseph');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('人类图专业 API 后端已成功启动！版本：v2.0 (Bugfix)');
});

// 服务端 SVG 合成引擎
function generateProfessionalSVG(activePersonality, activeDesign, definedCenters) {
    const centersDef = {
        'Head': { d: 'M 200,30 L 245,95 L 155,95 Z', fill: '#fde047' },
        'Ajna': { d: 'M 155,115 L 245,115 L 200,180 Z', fill: '#86efac' },
        'Throat': { d: 'M 160,220 h80 v80 h-80 Z', rx: 12, fill: '#d6d3d1' },
        'G': { d: 'M 200,330 L 245,375 L 200,420 L 155,375 Z', fill: '#fde047' },
        'Heart': { d: 'M 265,330 L 330,330 L 297.5,385 Z', fill: '#fca5a5' },
        'Spleen': { d: 'M 115,400 L 115,550 L 35,475 Z', fill: '#d6d3d1' },
        'Sacral': { d: 'M 160,450 h80 v80 h-80 Z', rx: 12, fill: '#fca5a5' },
        'Solar': { d: 'M 285,400 L 285,550 L 365,475 Z', fill: '#d6d3d1' },
        'Root': { d: 'M 160,610 h80 v80 h-80 Z', rx: 12, fill: '#d6d3d1' }
    };

    const gatesPos = {
        64: {x: 180, y: 95}, 61: {x: 200, y: 95}, 63: {x: 220, y: 95},
        47: {x: 180, y: 115}, 24: {x: 200, y: 115}, 4: {x: 220, y: 115},
        17: {x: 178, y: 148}, 43: {x: 200, y: 180}, 11: {x: 222, y: 148},
        62: {x: 180, y: 220}, 23: {x: 200, y: 220}, 56: {x: 220, y: 220},
        31: {x: 180, y: 300}, 8: {x: 200, y: 300}, 33: {x: 220, y: 300},
        16: {x: 160, y: 240}, 20: {x: 160, y: 280},
        45: {x: 240, y: 240}, 12: {x: 240, y: 260}, 35: {x: 240, y: 280},
        1: {x: 200, y: 330}, 7: {x: 178, y: 352}, 13: {x: 222, y: 352},
        15: {x: 178, y: 398}, 46: {x: 222, y: 398}, 2: {x: 200, y: 420},
        10: {x: 165, y: 375}, 25: {x: 235, y: 375},
        51: {x: 280, y: 330}, 21: {x: 315, y: 330}, 26: {x: 280, y: 360}, 40: {x: 315, y: 360},
        5: {x: 180, y: 450}, 14: {x: 200, y: 450}, 29: {x: 220, y: 450},
        9: {x: 180, y: 530}, 3: {x: 200, y: 530}, 42: {x: 220, y: 530},
        34: {x: 160, y: 470}, 27: {x: 160, y: 510}, 59: {x: 240, y: 490},
        53: {x: 180, y: 610}, 60: {x: 200, y: 610}, 52: {x: 220, y: 610},
        58: {x: 160, y: 630}, 38: {x: 160, y: 650}, 54: {x: 160, y: 670},
        19: {x: 240, y: 630}, 39: {x: 240, y: 650}, 41: {x: 240, y: 670},
        48: {x: 115, y: 420}, 57: {x: 115, y: 460}, 44: {x: 115, y: 480}, 50: {x: 115, y: 500}, 32: {x: 115, y: 520},
        18: {x: 75, y: 500}, 28: {x: 95, y: 520},
        22: {x: 285, y: 420}, 36: {x: 285, y: 440}, 37: {x: 285, y: 460}, 6: {x: 285, y: 480}, 49: {x: 285, y: 500},
        55: {x: 305, y: 520}, 30: {x: 325, y: 500}
    };

    const channels = [
        [1,8], [2,14], [3,60], [4,63], [5,15], [6,59], [7,31], [9,52],
        [10,20], [10,34], [10,57], [11,56], [12,22], [13,33], [16,48], [17,62],
        [18,58], [19,49], [20,34], [20,57], [21,45], [23,43], [24,61], [25,51],
        [26,44], [27,50], [28,38], [29,46], [30,41], [32,54], [34,57], [35,36],
        [37,40], [39,55], [42,53], [47,64]
    ];

    const isP = (g) => activePersonality.includes(g);
    const isD = (g) => activeDesign.includes(g);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 720" style="width:100%; height:auto; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px;">`;
    svg += `<defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1"/>
                </filter>
            </defs>`;

    // 画通道槽（白色粗底线）
    channels.forEach(([g1, g2]) => {
        svg += `<line x1="${gatesPos[g1].x}" y1="${gatesPos[g1].y}" x2="${gatesPos[g2].x}" y2="${gatesPos[g2].y}" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>`;
    });

    // 画激活的通道
    channels.forEach(([g1, g2]) => {
        const mx = (gatesPos[g1].x + gatesPos[g2].x) / 2;
        const my = (gatesPos[g1].y + gatesPos[g2].y) / 2;
        
        // G1 半截
        if (isP(g1) && isD(g1)) svg += `<line x1="${gatesPos[g1].x}" y1="${gatesPos[g1].y}" x2="${mx}" y2="${my}" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/><line x1="${gatesPos[g1].x}" y1="${gatesPos[g1].y}" x2="${mx}" y2="${my}" stroke="#1f2937" stroke-width="8" stroke-dasharray="8 8" stroke-linecap="round"/>`;
        else if (isP(g1)) svg += `<line x1="${gatesPos[g1].x}" y1="${gatesPos[g1].y}" x2="${mx}" y2="${my}" stroke="#1f2937" stroke-width="8" stroke-linecap="round"/>`;
        else if (isD(g1)) svg += `<line x1="${gatesPos[g1].x}" y1="${gatesPos[g1].y}" x2="${mx}" y2="${my}" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>`;

        // G2 半截
        if (isP(g2) && isD(g2)) svg += `<line x1="${mx}" y1="${my}" x2="${gatesPos[g2].x}" y2="${gatesPos[g2].y}" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/><line x1="${mx}" y1="${my}" x2="${gatesPos[g2].x}" y2="${gatesPos[g2].y}" stroke="#1f2937" stroke-width="8" stroke-dasharray="8 8" stroke-linecap="round"/>`;
        else if (isP(g2)) svg += `<line x1="${mx}" y1="${my}" x2="${gatesPos[g2].x}" y2="${gatesPos[g2].y}" stroke="#1f2937" stroke-width="8" stroke-linecap="round"/>`;
        else if (isD(g2)) svg += `<line x1="${mx}" y1="${my}" x2="${gatesPos[g2].x}" y2="${gatesPos[g2].y}" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>`;
    });

    // 画高级能量中心块
    for (const [name, center] of Object.entries(centersDef)) {
        const isDef = definedCenters.includes(name);
        const fill = isDef ? center.fill : '#ffffff';
        const stroke = isDef ? '#1f2937' : '#9ca3af';
        if (center.rx) {
            svg += `<path d="${center.d}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round" filter="url(#shadow)"/>`;
        } else {
            svg += `<path d="${center.d}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round" filter="url(#shadow)"/>`;
        }
    }

    // 画闸门数字
    for (const [id, pos] of Object.entries(gatesPos)) {
        const g = parseInt(id);
        const active = isP(g) || isD(g);
        const dy = g > 30 ? 4 : -4; 
        const color = active ? '#000000' : '#6b7280';
        const weight = active ? '900' : '600';
        const size = active ? '13px' : '11px';
        svg += `<text x="${pos.x}" y="${pos.y + dy}" font-family="sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="middle" dominant-baseline="central" style="user-select:none;">${id}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

function pseudoHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return ((Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)) >>> 0);
}

// 核心排盘 API
app.post('/api/generate-chart', (req, res) => {
    const { name, date, time, location } = req.body;
    
    // 【修复点】：将 const 修改为了 let，防止在 rand 函数中重新赋值时触发 TypeError 导致崩溃
    let seed = pseudoHash(`${name}-${date}-${time}-${location}`);
    const rand = () => { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    
    let activePersonality = [], activeDesign = [];
    while(activePersonality.length < 13) { let g = Math.floor(rand() * 64) + 1; if(!activePersonality.includes(g)) activePersonality.push(g); }
    while(activeDesign.length < 13) { let g = Math.floor(rand() * 64) + 1; if(!activeDesign.includes(g)) activeDesign.push(g); }

    const gateToCenter = {
        64:'Head', 61:'Head', 63:'Head', 47:'Ajna', 24:'Ajna', 4:'Ajna', 17:'Ajna', 43:'Ajna', 11:'Ajna',
        62:'Throat', 23:'Throat', 56:'Throat', 31:'Throat', 8:'Throat', 33:'Throat', 16:'Throat', 20:'Throat', 45:'Throat', 12:'Throat', 35:'Throat',
        1:'G', 7:'G', 13:'G', 15:'G', 46:'G', 2:'G', 10:'G', 25:'G',
        51:'Heart', 21:'Heart', 26:'Heart', 40:'Heart',
        5:'Sacral', 14:'Sacral', 29:'Sacral', 9:'Sacral', 3:'Sacral', 42:'Sacral', 34:'Sacral', 27:'Sacral', 59:'Sacral',
        53:'Root', 60:'Root', 52:'Root', 58:'Root', 38:'Root', 54:'Root', 19:'Root', 39:'Root', 41:'Root',
        48:'Spleen', 57:'Spleen', 44:'Spleen', 50:'Spleen', 32:'Spleen', 18:'Spleen', 28:'Spleen',
        22:'Solar', 36:'Solar', 37:'Solar', 6:'Solar', 49:'Solar', 55:'Solar', 30:'Solar'
    };

    const channelsMap = [[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64]];
    
    let definedCenters = new Set();
    let allActive = new Set([...activePersonality, ...activeDesign]);
    
    channelsMap.forEach(([g1, g2]) => {
        if(allActive.has(g1) && allActive.has(g2)) {
            definedCenters.add(gateToCenter[g1]); definedCenters.add(gateToCenter[g2]);
        }
    });
    definedCenters = Array.from(definedCenters);

    const svgChartImage = generateProfessionalSVG(activePersonality, activeDesign, definedCenters);

    const hasSacral = definedCenters.includes('Sacral');
    const hasThroat = definedCenters.includes('Throat');
    const hasMotor = ['Root', 'Solar', 'Sacral', 'Heart'].some(m => definedCenters.includes(m));
    
    let type = '反映者 (Reflector)';
    if(hasSacral) type = (hasThroat && hasMotor) ? '显示生产者 (Manifesting Generator)' : '生产者 (Generator)';
    else if(definedCenters.length > 0) type = (hasThroat && hasMotor) ? '显示者 (Manifestor)' : '投射者 (Projector)';

    res.json({
        success: true,
        data: {
            name: name,
            type: type,
            profile: "1/3", 
            definition: definedCenters.length === 0 ? "无定义" : "一分人",
            authority: definedCenters.includes('Solar') ? '情绪型权威' : (definedCenters.includes('Sacral') ? '荐骨型权威' : '直觉型权威'),
            strategy: type.includes('生产者') ? '等待回应' : '等待邀请',
            notSelf: type.includes('生产者') ? '挫败' : '苦涩',
            cross: `右角度交叉之计划`,
            chartImageSVG: svgChartImage 
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
});
