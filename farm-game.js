(() => {
const assetUrl = (path) => path;

const CROPS = [
  {
    id: "tide-kelp",
    name: "潮纹藻",
    icon: "🌿",
    seedCost: 10,
    growMs: 150_000,
    sellPrice: 6,
    commissionPrice: 8,
    yield: 2,
    color: "#73d7a6",
    accent: "#d9f5bd",
  },
  {
    id: "sea-bell",
    name: "海铃花",
    icon: "🪷",
    seedCost: 22,
    growMs: 330_000,
    sellPrice: 13,
    commissionPrice: 17,
    yield: 2,
    color: "#8fa9ff",
    accent: "#dce5ff",
  },
  {
    id: "moon-berry",
    name: "月潮莓",
    icon: "🫐",
    seedCost: 40,
    growMs: 540_000,
    sellPrice: 24,
    commissionPrice: 32,
    yield: 2,
    color: "#8a73d9",
    accent: "#e3d6ff",
  },
  {
    id: "coral-fruit",
    name: "珊瑚果",
    icon: "🍊",
    seedCost: 65,
    growMs: 780_000,
    sellPrice: 40,
    commissionPrice: 52,
    yield: 2,
    color: "#ef8f66",
    accent: "#ffe0c6",
  },
];

const FARM_ACTION_RULES = {
  plant: { cooldown: 10_000, label: "播种" },
  water: { cooldown: 35_000, label: "浇水" },
  harvest: { cooldown: 20_000, label: "收获" },
  batchPlant: { cooldown: 60_000, label: "一键播种" },
  batchWater: { cooldown: 180_000, label: "一键浇水" },
  batchHarvest: { cooldown: 90_000, label: "一键收获" },
  charge: { cooldown: 180_000, label: "潮汛催生" },
  fishing: { cooldown: 45_000, label: "再次抛竿" },
};

const FARM_BATCH_COSTS = {
  plant: { materials: (count) => 2 + Math.ceil(count / 2), tideCharges: 1 },
  water: { materials: (count) => count + 2, tideCharges: 1 },
  harvest: { coins: (count) => count * 2 + 2, tideCharges: 1 },
};

const FARM_COMMAND_COOLDOWN_KEYS = {
  plant: "batchPlant",
  water: "batchWater",
  harvest: "batchHarvest",
  charge: "charge",
};

const TIDE_CHARGE_DAILY_LIMIT = 8;
const TIDE_CHARGE_STORAGE_LIMIT = 6;
const STREAK_MILESTONES = {
  3: { materials: 2, tideCharges: 1 },
  5: { materials: 3, tideCharges: 1 },
  7: { materials: 4, tideCharges: 1 },
  14: { materials: 6, tideCharges: 2 },
  21: { materials: 8, tideCharges: 2 },
  30: { materials: 10, tideCharges: 3 },
};
const BATCH_STORY_UNLOCKS = {
  plant: "chapter-04",
  water: "chapter-09",
  harvest: "chapter-14",
};
const MAP_LEARNING_REQUIREMENTS = {
  "moon-bay": { perfectDays: 3, focusMinutes: 150 },
  "coral-terrace": { perfectDays: 7, focusMinutes: 400 },
};
const HOUSE_LEARNING_REQUIREMENTS = {
  2: { perfectDays: 3, focusMinutes: 150 },
  3: { perfectDays: 7, focusMinutes: 400 },
};

function batchLaborCost(kind, count) {
  const rule = FARM_BATCH_COSTS[kind];
  if (!rule || count <= 0) return { materials: 0, coins: 0, tideCharges: 0 };
  return {
    materials: Number(rule.materials?.(count)) || 0,
    coins: Number(rule.coins?.(count)) || 0,
    tideCharges: Number(rule.tideCharges) || 0,
  };
}

const DECORATIONS = [
  {
    id: "tide-lanterns",
    name: "潮汐灯串",
    icon: "sparkles",
    cost: 26,
    color: "#f4c96d",
    sprite: assetUrl("./assets/farm/doubao/decorations/v1/tide-lanterns.png"),
    spriteWidth: 240,
    spriteAnchorY: 0.86,
  },
  {
    id: "shell-fountain",
    name: "贝壳涌泉",
    icon: "droplets",
    cost: 58,
    color: "#76d8e8",
    sprite: assetUrl("./assets/farm/doubao/decorations/v1/shell-fountain.png"),
    spriteWidth: 237,
    spriteAnchorY: 0.84,
  },
  {
    id: "coral-arch",
    name: "珊瑚花门",
    icon: "flower-2",
    cost: 92,
    color: "#ef8f9e",
    sprite: assetUrl("./assets/farm/doubao/decorations/v1/coral-arch.png"),
    spriteWidth: 269,
    spriteAnchorY: 0.88,
  },
  {
    id: "moon-shell-stage",
    name: "月贝潮音台",
    icon: "music",
    cost: 148,
    color: "#9fc6ff",
    sprite: assetUrl("./assets/farm/doubao/decorations/v1/moon-shell-stage.png"),
    spriteWidth: 250,
    spriteAnchorY: 0.84,
  },
  {
    id: "pearl-tree",
    name: "珍珠火树",
    icon: "trees",
    cost: 186,
    color: "#f4d18d",
    sprite: assetUrl("./assets/farm/doubao/decorations/v1/pearl-tree.png"),
    spriteWidth: 275,
    spriteAnchorY: 0.88,
  },
  {
    id: "whale-cloud-lantern",
    name: "鲸云巡游灯",
    icon: "sparkles",
    cost: 236,
    color: "#8be1cc",
    sprite: assetUrl("./assets/farm/doubao/decorations/v1/whale-cloud-lantern.png"),
    spriteWidth: 294,
    spriteAnchorY: 0.85,
  },
];

const FARM_MAPS = [
  {
    id: "tide-meadow",
    order: 1,
    name: "潮畔田庄",
    subtitle: "第一张海图 · 风车、潮田与临海灯塔",
    accent: "#79d9bf",
    backdrop: assetUrl("./assets/farm/doubao/map-tide-meadow-v2-2560.webp"),
    homeSprite: assetUrl("./assets/farm/doubao/buildings/tide-meadow-cottage.png"),
    homeSpriteWidth: 400,
    homeSpriteAnchorY: 0.83,
    worldWidth: 3200,
    worldHeight: 1760,
    perk: "潮田沃土：收获时有小概率获得高品质作物。",
    startUnlocked: 1,
    baseCost: 18,
    stepCost: 16,
    gateCost: 0,
    requiredLevel: 1,
    anchors: {
      house: { x: 1008, y: 1076 },
      npc: { x: 1128, y: 950 },
      level: { x: 1704, y: 977 },
      decorations: {
        "tide-lanterns": { x: 1104, y: 911 },
        "shell-fountain": { x: 852, y: 911 },
        "coral-arch": { x: 432, y: 950 },
        "moon-shell-stage": { x: 1368, y: 634 },
        "pearl-tree": { x: 1416, y: 1082 },
        "whale-cloud-lantern": { x: 2184, y: 686 },
      },
    },
    positions: [
      { x: 930, y: 470 },
      { x: 1140, y: 470 },
      { x: 1350, y: 470 },
      { x: 1560, y: 470 },
      { x: 1080, y: 610 },
      { x: 1290, y: 610 },
      { x: 1500, y: 610 },
      { x: 1710, y: 610 },
      { x: 640, y: 780 },
      { x: 850, y: 780 },
      { x: 1060, y: 780 },
      { x: 1270, y: 780 },
    ],
    fishSpots: [
      { id: "reed-stream", name: "芦苇溪", x: 600, y: 568 },
      { id: "sunset-cove", name: "落日湾", x: 2160, y: 554 },
      { id: "mist-estuary", name: "雾禾河口", x: 1104, y: 224 },
    ],
    treasures: [
      { id: "brass-sundial", name: "古铜日晷", x: 780, y: 340, icon: "sun" },
      { id: "seed-cache", name: "漂流种匣", x: 1550, y: 1030, icon: "package" },
      { id: "lighthouse-key", name: "灯塔旧钥", x: 1580, y: 180, icon: "key-round" },
    ],
    gatherNodes: [
      { id: "reed-dew", name: "晨露芦苇", x: 660, y: 560, icon: "sprout" },
      { id: "shell-cove", name: "浅湾贝床", x: 2080, y: 690, icon: "shell" },
      { id: "wind-herb", name: "风车药草", x: 520, y: 880, icon: "flower-2" },
      { id: "tide-driftwood", name: "潮痕漂流木", x: 1450, y: 1030, icon: "trees" },
    ],
    landmark: {
      id: "lighthouse-prayer",
      name: "灯塔祈愿",
      icon: "lamp-desk",
      x: 1540,
      y: 300,
      reward: { xp: 9 },
    },
  },
  {
    id: "moon-bay",
    order: 2,
    name: "月潮海湾",
    subtitle: "第二张海图 · 银潮、月贝码头与观星台",
    accent: "#8fbaff",
    backdrop: assetUrl("./assets/farm/doubao/map-moon-bay-v2-2560.webp"),
    homeSprite: assetUrl("./assets/farm/doubao/buildings/tide-meadow-cottage.png"),
    homeSpriteWidth: 400,
    homeSpriteAnchorY: 0.83,
    worldWidth: 3200,
    worldHeight: 1760,
    perk: "月潮渔汛：钓鱼等待更短，稀有海物概率提升。",
    startUnlocked: 3,
    baseCost: 62,
    stepCost: 22,
    gateCost: 480,
    requiredLevel: 3,
    anchors: {
      house: { x: 125, y: 832 },
      npc: { x: 381, y: 858 },
      level: { x: 688, y: 792 },
      decorations: {
        "tide-lanterns": { x: 816, y: 779 },
        "shell-fountain": { x: 509, y: 924 },
        "coral-arch": { x: 1379, y: 1082 },
        "moon-shell-stage": { x: 1789, y: 911 },
        "pearl-tree": { x: 2173, y: 1056 },
        "whale-cloud-lantern": { x: 1200, y: 779 },
      },
    },
    positions: [
      { x: 22, y: 594 },
      { x: 176, y: 607 },
      { x: 330, y: 620 },
      { x: 483, y: 634 },
      { x: 637, y: 647 },
      { x: 99, y: 713 },
      { x: 253, y: 726 },
      { x: 406, y: 739 },
      { x: 560, y: 752 },
    ],
    fishSpots: [
      { id: "moon-pier", name: "月贝码头", x: 1686, y: 1082 },
      { id: "star-lagoon", name: "星辉潟湖", x: 944, y: 726 },
      { id: "cloud-reef", name: "云影暗礁", x: 1917, y: 554 },
    ],
    treasures: [
      { id: "moon-compass", name: "逆潮罗盘", x: 355, y: 317, icon: "compass" },
      { id: "pearl-crown", name: "失落珠冠", x: 1814, y: 898, icon: "crown" },
      { id: "astral-chart", name: "星海旧图", x: 1072, y: 264, icon: "map" },
    ],
    gatherNodes: [
      { id: "moon-salt", name: "月盐晶簇", x: 202, y: 634, icon: "sparkles" },
      { id: "star-coral", name: "星砂珊瑚", x: 1277, y: 898, icon: "shell" },
      { id: "night-lily", name: "夜光潮莲", x: 662, y: 779, icon: "flower-2" },
      { id: "lunar-pearl", name: "月影蚌珠", x: 2045, y: 1201, icon: "gem" },
    ],
    landmark: {
      id: "moon-ring-blessing",
      name: "月环赐福",
      icon: "orbit",
      x: 1507,
      y: 370,
      reward: { xp: 13 },
    },
  },
  {
    id: "coral-terrace",
    order: 3,
    name: "珊瑚梯田",
    subtitle: "第三张海图 · 彩色珊瑚、瀑布梯田与珍珠宫",
    accent: "#f3a989",
    backdrop: assetUrl("./assets/farm/doubao/map-coral-terrace-v2-2560.webp"),
    homeSprite: assetUrl("./assets/farm/doubao/buildings/tide-meadow-cottage.png"),
    homeSpriteWidth: 400,
    homeSpriteAnchorY: 0.83,
    worldWidth: 3200,
    worldHeight: 1760,
    perk: "珊瑚温室：作物成长速度提升 12%，收获品质更高。",
    startUnlocked: 3,
    baseCost: 96,
    stepCost: 28,
    gateCost: 1680,
    requiredLevel: 5,
    anchors: {
      house: { x: 125, y: 950 },
      npc: { x: 432, y: 990 },
      level: { x: 688, y: 964 },
      decorations: {
        "tide-lanterns": { x: 1123, y: 818 },
        "shell-fountain": { x: 816, y: 1003 },
        "coral-arch": { x: 1482, y: 898 },
        "moon-shell-stage": { x: 278, y: 713 },
        "pearl-tree": { x: 1302, y: 1056 },
        "whale-cloud-lantern": { x: 2019, y: 568 },
      },
    },
    positions: [
      { x: 22, y: 396 },
      { x: 253, y: 436 },
      { x: 509, y: 475 },
      { x: 765, y: 515 },
      { x: 1021, y: 607 },
      { x: 74, y: 686 },
      { x: 330, y: 726 },
      { x: 842, y: 779 },
      { x: 1072, y: 845 },
    ],
    fishSpots: [
      { id: "pearl-spring", name: "珍珠泉", x: 739, y: 581 },
      { id: "abyss-garden", name: "深渊珊瑚园", x: 1482, y: 1135 },
      { id: "sunken-orchard", name: "沉光果园", x: 2173, y: 792 },
    ],
    treasures: [
      { id: "coral-idol", name: "珊瑚小像", x: 227, y: 396, icon: "sparkles" },
      { id: "pearl-heart", name: "潮汐珠心", x: 1891, y: 1162, icon: "gem" },
      { id: "whale-score", name: "鲸歌残谱", x: 1200, y: 238, icon: "music" },
    ],
    gatherNodes: [
      { id: "prism-fern", name: "虹光蕨", x: 176, y: 581, icon: "sprout" },
      { id: "sun-coral", name: "日光珊瑚", x: 995, y: 502, icon: "flower-2" },
      { id: "pearl-dust", name: "珍珠矿砂", x: 1251, y: 898, icon: "gem" },
      { id: "abyss-shell", name: "深潮螺贝", x: 1712, y: 1082, icon: "shell" },
    ],
    landmark: {
      id: "pearl-palace-blessing",
      name: "珠宫赐福",
      icon: "crown",
      x: 483,
      y: 238,
      reward: { xp: 18 },
    },
  },
];

const MAP_REFERENCE_WIDTH = 2400;
const MAP_REFERENCE_HEIGHT = 1320;

FARM_MAPS.forEach((map) => {
  const scaleX = map.worldWidth / MAP_REFERENCE_WIDTH;
  const scaleY = map.worldHeight / MAP_REFERENCE_HEIGHT;
  const scalePoint = (point) => ({
    ...point,
    x: Math.round(Number(point.x) * scaleX),
    y: Math.round(Number(point.y) * scaleY),
  });
  map.positions = map.positions.map(scalePoint);
  map.fishSpots = map.fishSpots.map(scalePoint);
  map.treasures = map.treasures.map(scalePoint);
  map.gatherNodes = map.gatherNodes.map(scalePoint);
  map.landmark = scalePoint(map.landmark);
  map.anchors = {
    house: scalePoint(map.anchors.house),
    npc: scalePoint(map.anchors.npc),
    level: scalePoint(map.anchors.level),
    decorations: Object.fromEntries(
      Object.entries(map.anchors.decorations).map(([id, point]) => [
        id,
        scalePoint(point),
      ]),
    ),
  };
});

const FARM_MAP_LOOKUP = new Map(FARM_MAPS.map((map) => [map.id, map]));

// 地形分区：坐标为图片归一化比例（0~1），按 cover 规则换算到世界坐标。
const FARM_TERRAIN = {
  "tide-meadow": {
    imageWidth: 2560,
    imageHeight: 1440,
    zones: [
      { type: "water", shape: "rect", x: 0, y: 0, w: 1, h: 0.035 },
      {
        type: "water",
        shape: "polygon",
        points: [
          [0.55, 0],
          [1, 0],
          [1, 1],
          [0.82, 1],
          [0.845, 0.9],
          [0.8, 0.78],
          [0.83, 0.62],
          [0.88, 0.5],
          [0.9, 0.42],
          [0.86, 0.33],
          [0.8, 0.22],
          [0.73, 0.12],
          [0.64, 0.05],
        ],
      },
      {
        type: "water",
        shape: "polygon",
        points: [
          [0.469, 0.195],
          [0.42, 0.247],
          [0.361, 0.317],
          [0.293, 0.36],
          [0.22, 0.391],
          [0.146, 0.421],
          [0.073, 0.451],
          [0, 0.469],
          [0, 0.495],
          [0.073, 0.477],
          [0.146, 0.447],
          [0.22, 0.417],
          [0.293, 0.386],
          [0.361, 0.343],
          [0.42, 0.273],
          [0.469, 0.221],
        ],
      },
      { type: "water", shape: "ellipse", cx: 0.052, cy: 0.132, rx: 0.017, ry: 0.024 },
      { type: "water", shape: "ellipse", cx: 0.545, cy: 0.115, rx: 0.042, ry: 0.062 },
      {
        type: "cliff",
        shape: "polygon",
        points: [
          [0.625, 0.208],
          [0.659, 0.156],
          [0.732, 0.122],
          [0.83, 0.13],
          [0.893, 0.2],
          [0.908, 0.286],
          [0.854, 0.339],
          [0.781, 0.365],
          [0.698, 0.356],
          [0.644, 0.295],
        ],
      },
    ],
  },
  "moon-bay": {
    imageWidth: 2560,
    imageHeight: 1320,
    zones: [
      {
        type: "water",
        shape: "polygon",
        points: [
          [0.42, 1],
          [0.34, 0.88],
          [0.29, 0.76],
          [0.28, 0.66],
          [0.31, 0.56],
          [0.39, 0.49],
          [0.47, 0.44],
          [0.53, 0.37],
          [0.57, 0.29],
          [0.59, 0.21],
          [0.57, 0.12],
          [0.53, 0.06],
          [0.53, 0],
          [1, 0],
          [1, 0.34],
          [0.96, 0.46],
          [0.93, 0.6],
          [0.9, 0.72],
          [0.86, 0.8],
          [0.8, 0.86],
          [0.72, 0.9],
          [0.64, 0.94],
          [0.56, 0.97],
        ],
      },
      { type: "waterfall", shape: "rect", x: 0.775, y: 0.34, w: 0.035, h: 0.24 },
      { type: "waterfall", shape: "rect", x: 0.935, y: 0.29, w: 0.03, h: 0.24 },
      { type: "waterfall", shape: "rect", x: 0.026, y: 0.56, w: 0.032, h: 0.22 },
      {
        type: "cliff",
        shape: "polygon",
        points: [
          [0.13, 0.7],
          [0.18, 0.67],
          [0.22, 0.71],
          [0.22, 0.79],
          [0.17, 0.84],
          [0.13, 0.82],
          [0.11, 0.76],
        ],
      },
      {
        type: "cliff",
        shape: "polygon",
        points: [
          [0.27, 0.42],
          [0.34, 0.38],
          [0.4, 0.42],
          [0.41, 0.5],
          [0.35, 0.55],
          [0.29, 0.52],
        ],
      },
      {
        type: "cliff",
        shape: "polygon",
        points: [
          [0.62, 0.4],
          [0.7, 0.37],
          [0.78, 0.41],
          [0.79, 0.48],
          [0.72, 0.53],
          [0.65, 0.5],
        ],
      },
    ],
  },
  "coral-terrace": {
    imageWidth: 2560,
    imageHeight: 1320,
    zones: [
      {
        type: "water",
        shape: "polygon",
        points: [
          [0.55, 0.1],
          [0.62, 0.06],
          [0.72, 0.05],
          [0.86, 0.05],
          [1, 0.04],
          [1, 0.62],
          [0.93, 0.66],
          [0.88, 0.72],
          [0.82, 0.72],
          [0.77, 0.66],
          [0.72, 0.6],
          [0.66, 0.55],
          [0.6, 0.5],
          [0.56, 0.4],
          [0.55, 0.25],
        ],
      },
      {
        type: "water",
        shape: "polygon",
        points: [
          [0.47, 0.68],
          [0.52, 0.63],
          [0.6, 0.64],
          [0.7, 0.68],
          [0.78, 0.74],
          [0.82, 0.85],
          [0.78, 0.95],
          [0.68, 1],
          [0.5, 1],
          [0.4, 0.94],
          [0.36, 0.84],
          [0.37, 0.74],
        ],
      },
      { type: "water", shape: "ellipse", cx: 0.3, cy: 0.3, rx: 0.055, ry: 0.075 },
      { type: "waterfall", shape: "rect", x: 0.245, y: 0.2, w: 0.035, h: 0.13 },
      { type: "waterfall", shape: "rect", x: 0.255, y: 0.35, w: 0.06, h: 0.2 },
      { type: "waterfall", shape: "rect", x: 0.305, y: 0.43, w: 0.035, h: 0.16 },
      { type: "waterfall", shape: "rect", x: 0.433, y: 0.4, w: 0.01, h: 0.19 },
      {
        type: "cliff",
        shape: "polygon",
        points: [
          [0.11, 0.19],
          [0.18, 0.17],
          [0.24, 0.2],
          [0.25, 0.27],
          [0.2, 0.33],
          [0.13, 0.32],
          [0.09, 0.26],
        ],
      },
      {
        type: "cliff",
        shape: "polygon",
        points: [
          [0.13, 0.78],
          [0.19, 0.75],
          [0.25, 0.79],
          [0.26, 0.86],
          [0.2, 0.92],
          [0.13, 0.9],
          [0.1, 0.84],
        ],
      },
      {
        type: "cliff",
        shape: "polygon",
        points: [
          [0.78, 0.56],
          [0.86, 0.52],
          [0.92, 0.57],
          [0.92, 0.66],
          [0.85, 0.71],
          [0.78, 0.66],
        ],
      },
    ],
  },
};

const TERRAIN_PRIORITY = { ground: 0, cliff: 1, water: 2, waterfall: 3 };

// 移动形态：行走、游泳、攀爬。美术资源接入前先复用待机帧并加状态标记。
const TERRAIN_TRAVEL = {
  ground: { mode: "walk", label: "行走", icon: "footprints", speed: 22, maxDuration: 1100 },
  cliff: { mode: "climb", label: "攀爬", icon: "mountain", speed: 46, maxDuration: 1600 },
  water: { mode: "swim", label: "游泳", icon: "waves", speed: 30, maxDuration: 1400 },
  waterfall: { mode: "swim", label: "瀑布戏水", icon: "waves", speed: 34, maxDuration: 1400 },
};

function terrainCoverTransform(map, terrain) {
  const scale = Math.max(
    map.worldWidth / terrain.imageWidth,
    map.worldHeight / terrain.imageHeight,
  );
  const width = terrain.imageWidth * scale;
  const height = terrain.imageHeight * scale;
  return {
    width,
    height,
    offsetX: (map.worldWidth - width) / 2,
    offsetY: (map.worldHeight - height) / 2,
  };
}

function normalizeTerrainZone(zone, transform) {
  const toWorld = (x, y) => ({
    x: x * transform.width + transform.offsetX,
    y: y * transform.height + transform.offsetY,
  });
  if (zone.shape === "rect") {
    const start = toWorld(zone.x, zone.y);
    const end = toWorld(zone.x + zone.w, zone.y + zone.h);
    return {
      type: zone.type,
      shape: "rect",
      minX: start.x,
      minY: start.y,
      maxX: end.x,
      maxY: end.y,
    };
  }
  if (zone.shape === "ellipse") {
    const center = toWorld(zone.cx, zone.cy);
    return {
      type: zone.type,
      shape: "ellipse",
      cx: center.x,
      cy: center.y,
      rx: zone.rx * transform.width,
      ry: zone.ry * transform.height,
    };
  }
  return {
    type: zone.type,
    shape: "polygon",
    points: zone.points.map(([x, y]) => toWorld(x, y)),
  };
}

FARM_MAPS.forEach((map) => {
  const terrain = FARM_TERRAIN[map.id];
  if (!terrain) {
    map.terrainZones = [];
    return;
  }
  const transform = terrainCoverTransform(map, terrain);
  map.terrainZones = terrain.zones.map((zone) => normalizeTerrainZone(zone, transform));
});

function terrainZoneContains(zone, x, y) {
  if (zone.shape === "rect") {
    return x >= zone.minX && x <= zone.maxX && y >= zone.minY && y <= zone.maxY;
  }
  if (zone.shape === "ellipse") {
    const dx = (x - zone.cx) / (zone.rx || 1);
    const dy = (y - zone.cy) / (zone.ry || 1);
    return dx * dx + dy * dy <= 1;
  }
  const points = zone.points;
  let inside = false;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
    const current = points[index];
    const last = points[previous];
    if ((current.y > y) === (last.y > y)) continue;
    const cross = ((last.x - current.x) * (y - current.y)) / (last.y - current.y) + current.x;
    if (x < cross) inside = !inside;
  }
  return inside;
}

function terrainAt(map, x, y) {
  let result = "ground";
  (map.terrainZones || []).forEach((zone) => {
    if (TERRAIN_PRIORITY[zone.type] <= TERRAIN_PRIORITY[result]) return;
    if (terrainZoneContains(zone, x, y)) result = zone.type;
  });
  return result;
}

// 沿直线采样整段路径：途经水域触发游泳、峭壁触发攀爬、瀑布按游泳处理。
function terrainAlongPath(map, fromX, fromY, toX, toY) {
  const distance = Math.hypot(toX - fromX, toY - fromY);
  const steps = clamp(Math.ceil(distance / 42), 2, 72);
  let result = terrainAt(map, fromX, fromY);
  for (let index = 1; index <= steps; index += 1) {
    const ratio = index / steps;
    const type = terrainAt(
      map,
      fromX + (toX - fromX) * ratio,
      fromY + (toY - fromY) * ratio,
    );
    if (TERRAIN_PRIORITY[type] > TERRAIN_PRIORITY[result]) result = type;
  }
  return result;
}

// 在地形区块内找一个能真实判定为对应类型的位置，用于自动行走检查。
function terrainZoneProbePoint(map, zone) {
  const bounds =
    zone.shape === "polygon"
      ? zone.points.reduce(
          (box, point) => ({
            minX: Math.min(box.minX, point.x),
            maxX: Math.max(box.maxX, point.x),
            minY: Math.min(box.minY, point.y),
            maxY: Math.max(box.maxY, point.y),
          }),
          { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
        )
      : zone.shape === "ellipse"
        ? {
            minX: zone.cx - zone.rx,
            maxX: zone.cx + zone.rx,
            minY: zone.cy - zone.ry,
            maxY: zone.cy + zone.ry,
          }
        : { minX: zone.minX, maxX: zone.maxX, minY: zone.minY, maxY: zone.maxY };
  for (let column = 1; column <= 12; column += 1) {
    for (let row = 1; row <= 12; row += 1) {
      // 与 moveAvatarTo 的可达范围保持一致，避免选到被裁掉的边界点。
      const x = clamp(
        bounds.minX + ((bounds.maxX - bounds.minX) * column) / 13,
        65,
        map.worldWidth - 65,
      );
      const y = clamp(
        bounds.minY + ((bounds.maxY - bounds.minY) * row) / 13,
        90,
        map.worldHeight - 70,
      );
      if (terrainAt(map, x, y) === zone.type) return { x, y };
    }
  }
  return {
    x: clamp((bounds.minX + bounds.maxX) / 2, 65, map.worldWidth - 65),
    y: clamp((bounds.minY + bounds.maxY) / 2, 90, map.worldHeight - 70),
  };
}

const TIDE_EVENTS = [
  {
    id: "calm",
    name: "缓潮",
    icon: "waves",
    color: "#79d9bf",
    copy: "海面安稳，潮田缓慢积蓄养分。",
    cropMultiplier: 0.94,
    fishMultiplier: 1,
    gatherBonus: 1,
  },
  {
    id: "high-tide",
    name: "满潮",
    icon: "droplets",
    color: "#76d8e8",
    copy: "潮水漫上田埂，采集物更加丰盛。",
    cropMultiplier: 1,
    fishMultiplier: 0.88,
    gatherBonus: 3,
  },
  {
    id: "low-tide",
    name: "退潮",
    icon: "shell",
    color: "#f3a989",
    copy: "浅滩显露，贝床与漂流物刷新更快。",
    cropMultiplier: 1.08,
    fishMultiplier: 1.1,
    gatherBonus: 2,
  },
  {
    id: "moon-tide",
    name: "月潮",
    icon: "moon-star",
    color: "#b8a5ff",
    copy: "月光牵动洋流，稀有海物与作物同时苏醒。",
    cropMultiplier: 0.82,
    fishMultiplier: 0.74,
    gatherBonus: 2,
  },
];

const TIDE_EVENT_DURATION = 6 * 60 * 1000;

const FISH = [
  {
    id: "silver-minnow",
    name: "银潮小町",
    icon: "🐟",
    rarity: "常见",
    sellPrice: 14,
    color: "#b9e3ef",
    maps: ["tide-meadow", "moon-bay", "coral-terrace"],
  },
  {
    id: "moon-koi",
    name: "月纹锦鲤",
    icon: "🐠",
    rarity: "珍稀",
    sellPrice: 48,
    color: "#8fbaff",
    maps: ["moon-bay", "tide-meadow"],
  },
  {
    id: "coral-seahorse",
    name: "珊瑚海马",
    icon: "🦐",
    rarity: "珍稀",
    sellPrice: 56,
    color: "#f3a989",
    maps: ["coral-terrace"],
  },
  {
    id: "star-jelly",
    name: "星辉水母",
    icon: "🪼",
    rarity: "稀有",
    sellPrice: 96,
    color: "#b8a5ff",
    maps: ["moon-bay"],
  },
  {
    id: "pearl-dragonet",
    name: "珍珠龙鱼",
    icon: "🐉",
    rarity: "传说",
    sellPrice: 188,
    color: "#f4d18d",
    maps: ["coral-terrace", "moon-bay"],
  },
  {
    id: "mist-cod",
    name: "雾海银鳕",
    icon: "🐟",
    rarity: "常见",
    sellPrice: 28,
    color: "#d6f1ee",
    maps: ["tide-meadow", "moon-bay"],
  },
  {
    id: "sunset-ray",
    name: "夕霞鳐",
    icon: "🛸",
    rarity: "珍稀",
    sellPrice: 72,
    color: "#f3a989",
    maps: ["tide-meadow", "coral-terrace"],
  },
  {
    id: "crown-seadragon",
    name: "星冠海龙",
    icon: "🐲",
    rarity: "传说",
    sellPrice: 236,
    color: "#8be1cc",
    maps: ["coral-terrace"],
  },
];

const WORKSHOP_RECIPES = [
  {
    id: "tide-compass",
    name: "潮汐罗盘",
    icon: "compass",
    color: "#79d9bf",
    description: "扩大每张地图的探索视野，让可行动区域更清晰。",
    cost: { materials: 22, coins: 16, tideCharges: 1, crops: { "tide-kelp": 3 } },
    learning: { perfectDays: 3, focusMinutes: 150 },
  },
  {
    id: "coral-charm",
    name: "珊瑚丰饶符",
    icon: "sparkles",
    color: "#f3a989",
    description: "高品质作物出现概率提升，并点亮对应的丰饶图鉴。",
    cost: { materials: 38, coins: 28, tideCharges: 1, fish: { "coral-seahorse": 1 } },
    learning: { perfectDays: 3, focusMinutes: 150 },
  },
  {
    id: "moon-net",
    name: "月银渔网",
    icon: "fish-symbol",
    color: "#9fc6ff",
    description: "钓鱼等待缩短 35%，更容易遇到稀有海物。",
    cost: { materials: 30, coins: 36, tideCharges: 1, crops: { "moon-berry": 3 } },
    learning: { perfectDays: 3, focusMinutes: 150 },
  },
  {
    id: "whale-greenhouse",
    name: "鲸梦温室",
    icon: "sprout",
    color: "#b7e36f",
    description: "所有作物成长速度永久提升 15%。",
    cost: { materials: 55, coins: 52, tideCharges: 1, fish: { "star-jelly": 1 } },
    learning: { perfectDays: 7, focusMinutes: 400 },
  },
];

const FISH_LOOKUP = new Map(FISH.map((fish) => [fish.id, fish]));
const RECIPE_LOOKUP = new Map(WORKSHOP_RECIPES.map((recipe) => [recipe.id, recipe]));

const HOUSE_LEVELS = [
  { level: 1, name: "潮线小屋", cost: 0, requiredLevel: 1 },
  { level: 2, name: "蓝瓦望海屋", cost: 42, requiredLevel: 2 },
  { level: 3, name: "鲸歌潮栖庭", cost: 96, requiredLevel: 4 },
];

const STORY_CHAPTERS = [
  {
    id: "chapter-01",
    act: "启航",
    chapter: "01",
    title: "第一项任务，第一枚潮矿",
    speaker: "澜音",
    narrative: "学习先留下真实记录。确认完成第一项任务，潮矿、潮汛与第一份种子才会抵达书斋。",
    hint: "第一次按 Space 只进入确认，再按一次才会写入完成。",
    action: "today",
    actionLabel: "去确认任务",
    reward: { xp: 12 },
    requirements: [
      { label: "确认完成第一项任务", value: (s) => s.tasksCompleted, target: 1, learning: true },
      { label: "进入农场回访", value: (s) => s.farmVisited, target: 1 },
      { label: "手动照料 1 次", value: (s) => s.manualActions, target: 1 },
    ],
  },
  {
    id: "chapter-02",
    act: "启航",
    chapter: "02",
    title: "把二十五分钟交给专注",
    speaker: "澜音",
    narrative: "专注结束后先读总结，再确认关联任务。专注本身也会留下 4 潮矿与 1 次潮汛。",
    hint: "完成一轮 25 分钟专注，并手动播下一块田。",
    action: "focus",
    actionLabel: "开始专注",
    reward: { xp: 16 },
    requirements: [
      { label: "完成 25 分钟专注", value: (s) => s.focusSessions, target: 1, learning: true },
      { label: "手动播种 1 块田", value: (s) => s.manualPlants, target: 1 },
      { label: "手动浇水 1 次", value: (s) => s.manualWaters, target: 1 },
    ],
  },
  {
    id: "chapter-03",
    act: "启航",
    chapter: "03",
    title: "让学习跨过第一天",
    speaker: "澜音",
    narrative: "农场不能替学习签字。让学习日增加到 2 天，再完成第一次收获。",
    hint: "学习日只统计有已确认任务或完整专注的日期。",
    action: "farm",
    actionLabel: "查看农场",
    reward: { xp: 22, unlock: "潮田沃土观察记录" },
    requirements: [
      { label: "累计 2 个学习日", value: (s) => s.learningDays, target: 2, learning: true },
      { label: "确认完成 3 项任务", value: (s) => s.tasksCompleted, target: 3, learning: true },
      { label: "手动收获 1 次", value: (s) => s.manualHarvests, target: 1 },
    ],
  },
  {
    id: "chapter-04",
    act: "启航",
    chapter: "04",
    title: "一键播种，不替学习加速",
    speaker: "澜音",
    narrative: "掌握单块照料后，才允许把重复点击交给工具。一键操作不会提高产量，也不会推进主线。",
    hint: "完成一次全清日，并手动完成播种、浇水、收获各一次。",
    action: "today",
    actionLabel: "推进全清",
    reward: { xp: 28, unlock: "一键播种" },
    requirements: [
      { label: "累计 1 个全清日", value: (s) => s.perfectDays, target: 1, learning: true },
      { label: "手动动作累计 3 次", value: (s) => s.manualActions, target: 3 },
      { label: "累计收获 2 次", value: (s) => s.manualHarvests, target: 2 },
    ],
  },
  {
    id: "chapter-05",
    act: "初潮",
    chapter: "05",
    title: "三次委托形成市场",
    speaker: "澜音",
    narrative: "只有学习产生的潮汛才能完成学习委托。完成 3 次委托，月潮海峡的航标才会亮起。",
    hint: "委托价格高于普通回收价，但仍要消耗 1 次潮汛。",
    action: "order",
    actionLabel: "查看委托",
    reward: { xp: 34, unlock: "月潮海湾航标" },
    requirements: [
      { label: "累计 3 个全清日", value: (s) => s.perfectDays, target: 3, learning: true },
      { label: "完成 3 次学习委托", value: (s) => s.ordersClaimed, target: 3 },
      { label: "手动收获 4 次", value: (s) => s.manualHarvests, target: 4 },
    ],
  },
  {
    id: "chapter-06",
    act: "初潮",
    chapter: "06",
    title: "让田庄留下五日回声",
    speaker: "澜音",
    narrative: "跨日回访比一次性冲刺更重要。五天的学习记录，配合六块可用田地，才算真正站稳。",
    hint: "扩建会消耗海币，而海币必须先通过学习获得的潮汛来变现。",
    action: "expand",
    actionLabel: "查看扩建",
    reward: { xp: 40, unlock: "潮湾扩建图纸" },
    requirements: [
      { label: "累计 5 个学习日", value: (s) => s.learningDays, target: 5, learning: true },
      { label: "开放 6 块田地", value: (s) => s.unlockedPlots, target: 6 },
      { label: "完成 5 项已确认任务", value: (s) => s.tasksCompleted, target: 5, learning: true },
    ],
  },
  {
    id: "chapter-07",
    act: "初潮",
    chapter: "07",
    title: "一百五十分钟的潮线",
    speaker: "澜音",
    narrative: "专注总时长会留在学习账本里，农场只能读取，不能伪造。让累计专注达到 150 分钟。",
    hint: "开启月潮海湾还需要潮栖 3 级、开放潮畔田庄 12 块田地、3 个全清日、150 分钟专注与 480 海币。",
    action: "map",
    actionLabel: "查看海图",
    reward: { xp: 46, unlock: "月潮海湾" },
    requirements: [
      { label: "累计专注 150 分钟", value: (s) => s.focusMinutes, target: 150, learning: true },
      { label: "开启月潮海湾", value: (s) => s.unlockedMaps, target: 2 },
      { label: "完成 3 次委托", value: (s) => s.ordersClaimed, target: 3 },
    ],
  },
  {
    id: "chapter-08",
    act: "守序",
    chapter: "08",
    title: "连续五天，修好住处",
    speaker: "澜音",
    narrative: "学习节奏稳定后，居所才值得继续修缮。连续学习 5 天，并把小屋提升到 2 级。",
    hint: "居所 2 级同样要求 3 个全清日与 150 分钟专注。",
    action: "house",
    actionLabel: "前往小屋",
    reward: { xp: 54, unlock: "高阶家具图样" },
    requirements: [
      { label: "连续学习 5 天", value: (s) => s.streak, target: 5, learning: true },
      { label: "居所达到 2 级", value: (s) => s.houseLevel, target: 2 },
      { label: "手动播种 6 块田", value: (s) => s.manualPlants, target: 6 },
    ],
  },
  {
    id: "chapter-09",
    act: "守序",
    chapter: "09",
    title: "十封委托与一键浇水",
    speaker: "澜音",
    narrative: "稳定市场来自持续学习，而不是农场内部滚雪球。完成 10 次委托后，解锁一键浇水。",
    hint: "一键浇水每块田消耗 1 潮矿，另加手续费与 1 潮汛。",
    action: "order",
    actionLabel: "查看委托",
    reward: { xp: 62, unlock: "一键浇水" },
    requirements: [
      { label: "累计 7 个全清日", value: (s) => s.perfectDays, target: 7, learning: true },
      { label: "完成 10 次委托", value: (s) => s.ordersClaimed, target: 10 },
      { label: "累计收获 12 次", value: (s) => s.manualHarvests, target: 12 },
    ],
  },
  {
    id: "chapter-10",
    act: "守序",
    chapter: "10",
    title: "三百分钟后的居所",
    speaker: "澜音",
    narrative: "高阶家具会把海币降为辅助成本，真正门槛是学习里程碑与潮汛。累计专注达到 300 分钟。",
    hint: "点亮一件纪念装饰，并继续完成委托。",
    action: "house",
    actionLabel: "查看居所",
    reward: { xp: 70, unlock: "鲸歌居所图纸" },
    requirements: [
      { label: "累计专注 300 分钟", value: (s) => s.focusMinutes, target: 300, learning: true },
      { label: "完成 10 次委托", value: (s) => s.ordersClaimed, target: 10 },
      { label: "点亮 1 件装饰", value: (s) => s.decorations, target: 1 },
    ],
  },
  {
    id: "chapter-11",
    act: "深潮",
    chapter: "11",
    title: "十四天之后遇见传说",
    speaker: "澜音",
    narrative: "深海收藏拒绝被海币直接购买。累计 14 个学习日，并亲手钓起一条稀有海物。",
    hint: "稀有鱼进入图鉴与家具材料，不直接兑换大量海币。",
    action: "farm",
    actionLabel: "查看图鉴",
    reward: { xp: 82, unlock: "传说收藏页" },
    requirements: [
      { label: "累计 14 个学习日", value: (s) => s.learningDays, target: 14, learning: true },
      { label: "发现 1 条稀有鱼", value: (s) => s.rareFish, target: 1 },
      { label: "收录 3 件遗物", value: (s) => s.treasures, target: 3 },
    ],
  },
  {
    id: "chapter-12",
    act: "深潮",
    chapter: "12",
    title: "四百分钟的珊瑚潮",
    speaker: "澜音",
    narrative: "第三张海图只认长期学习、完整经营与积累的海币。累计专注 400 分钟，并把月潮海湾全部田地开放，才能踏上珊瑚梯田。",
    hint: "开启珊瑚梯田还需要潮栖 5 级、开放月潮海湾 9 块田地、7 个全清日、400 分钟专注与 1680 海币。",
    action: "map",
    actionLabel: "查看海图",
    reward: { xp: 96, unlock: "珊瑚梯田" },
    requirements: [
      { label: "累计专注 400 分钟", value: (s) => s.focusMinutes, target: 400, learning: true },
      { label: "开启珊瑚梯田", value: (s) => s.unlockedMaps, target: 3 },
      { label: "手动收获 20 次", value: (s) => s.manualHarvests, target: 20 },
    ],
  },
  {
    id: "chapter-13",
    act: "深潮",
    chapter: "13",
    title: "把深潮收进典藏",
    speaker: "澜音",
    narrative: "收藏不提供跳章资源，只留下身份与故事。集齐三件遗物回声，并完成两件工坊收藏。",
    hint: "工坊配方需要学习里程碑、潮汛与少量海币。",
    action: "treasure",
    actionLabel: "寻找遗物",
    reward: { xp: 112, unlock: "深潮典藏柜" },
    requirements: [
      { label: "收录 6 件遗物", value: (s) => s.treasures, target: 6 },
      { label: "完成 2 件工坊收藏", value: (s) => s.crafted, target: 2 },
      { label: "发现 3 条稀有鱼", value: (s) => s.rareFish, target: 3 },
    ],
  },
  {
    id: "chapter-14",
    act: "典藏",
    chapter: "14",
    title: "二十一天，一键收获",
    speaker: "澜音",
    narrative: "最后的一键操作仍只节省点击。累计 21 个学习日、居所满级并完成核心收藏后解锁。",
    hint: "一键收获每块田仍需 2 海币，另加手续费与 1 潮汛。",
    action: "farm",
    actionLabel: "查看农场",
    reward: { xp: 130, unlock: "一键收获" },
    requirements: [
      { label: "累计 21 个学习日", value: (s) => s.learningDays, target: 21, learning: true },
      { label: "居所达到 3 级", value: (s) => s.houseLevel, target: 3 },
      { label: "完成核心收藏", value: (s) => s.coreCollection, target: 1 },
    ],
  },
  {
    id: "chapter-15",
    act: "典藏",
    chapter: "15",
    title: "千分钟后的最终典藏",
    speaker: "澜音",
    narrative: "最后一章不赠送资源，只装订所有学习与农场回声。累计专注 1000 分钟，完成三套居所典藏。",
    hint: "真正完成主线后，农场仍可自由经营，但没有学习就不会产生新的潮矿与潮汛。",
    action: "today",
    actionLabel: "查看今日",
    reward: { xp: 180, unlock: "最终典藏卡" },
    requirements: [
      { label: "累计专注 1000 分钟", value: (s) => s.focusMinutes, target: 1000, learning: true },
      { label: "三套居所典藏完成", value: (s) => s.fullCollection, target: 1 },
      { label: "连续学习 7 天", value: (s) => s.streak, target: 7, learning: true },
    ],
  },
];

const FURNITURE = [
  {
    id: "wallpaper",
    name: "潮纹墙纸",
    icon: "paint-roller",
    minHouse: 1,
    maxLevel: 3,
    baseCost: 12,
    copy: "从素色墙面过渡到带鲸鳞暗纹的潮光墙纸。",
  },
  {
    id: "floor",
    name: "海盐木地板",
    icon: "panels-top-left",
    minHouse: 1,
    maxLevel: 3,
    baseCost: 14,
    copy: "让潮气不再侵入，增添温润的木色与贝壳拼花。",
  },
  {
    id: "bed",
    name: "鲸梦床",
    icon: "bed-double",
    minHouse: 1,
    maxLevel: 3,
    baseCost: 20,
    copy: "柔软床铺会随着等级增加鲸尾靠枕与夜灯帷幔。",
  },
  {
    id: "desk",
    name: "观潮书桌",
    icon: "book-open",
    minHouse: 1,
    maxLevel: 3,
    baseCost: 22,
    copy: "学习时最常停留的位置，可升级为更完整的书具组合。",
  },
  {
    id: "lamp",
    name: "月贝吊灯",
    icon: "lamp-ceiling",
    minHouse: 2,
    maxLevel: 3,
    baseCost: 28,
    copy: "为小屋提供暖色潮光，夜间会映出缓慢流动的波纹。",
  },
  {
    id: "aquarium",
    name: "微型鲸潮缸",
    icon: "fish-symbol",
    minHouse: 2,
    maxLevel: 3,
    baseCost: 38,
    copy: "在屋内收进一小片海，并逐渐点亮珊瑚与水母。",
  },
];

const ORDER_POOL = [
  { kind: "crop", cropId: "tide-kelp", amount: 3 },
  { kind: "crop", cropId: "sea-bell", amount: 2 },
  { kind: "crop", cropId: "moon-berry", amount: 2 },
  { kind: "crop", cropId: "coral-fruit", amount: 2 },
  { kind: "crop", cropId: "tide-kelp", amount: 5 },
  { kind: "crop", cropId: "sea-bell", amount: 3 },
  { kind: "crop", cropId: "moon-berry", amount: 1 },
  { kind: "crop", cropId: "coral-fruit", amount: 1 },
];

const ACTION_ROWS = {
  idle: 0,
  walk: 1,
  water: 2,
  harvest: 3,
  swim: 4,
  climb: 5,
};
const AVATAR_IDLE_SPRITE_COLUMNS = 8;
const AVATAR_IDLE_SPRITE_ROWS = 4;
const AVATAR_IDLE_SPRITE_INTERVAL_MS = 125;
const AVATAR_IDLE_SPRITE_CACHE_LIMIT = 2;

const CROP_LOOKUP = new Map(CROPS.map((crop) => [crop.id, crop]));

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashText(value) {
  return [...String(value)].reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
    2166136261,
  );
}

function createMapPlots(map, sourcePlots = []) {
  const initialUnlocked = new Set(
    map.positions
      .map((position, index) => ({
        index,
        distance: Math.hypot(
          position.x - map.anchors.house.x,
          position.y - map.anchors.house.y,
        ),
      }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, map.startUnlocked)
      .map((item) => item.index),
  );
  return map.positions.map((position, index) => ({
    id: index,
    unlocked: initialUnlocked.has(index),
    cropId: null,
    plantedAt: null,
    watered: false,
    readyNotified: false,
    x: position.x,
    y: position.y,
    ...(sourcePlots[index] || {}),
  }));
}

function createDefaultFarmState(dateKey) {
  return {
    version: 8,
    materials: 0,
    coins: 0,
    xp: 0,
    seeds: {},
    crops: {},
    cropQuality: {},
    fish: {},
    fishCaught: {},
    relicMaterials: {},
    npcFavor: {},
    activeMapId: FARM_MAPS[0].id,
    unlockedMaps: [FARM_MAPS[0].id],
    plotSets: Object.fromEntries(
      FARM_MAPS.map((map) => [map.id, createMapPlots(map)]),
    ),
    discoveries: Object.fromEntries(FARM_MAPS.map((map) => [map.id, []])),
    crafted: [],
    fishing: null,
    gatherCooldowns: {},
    gatherCounts: {},
    actionCooldowns: {},
    landmarkClaims: {},
    selectedSeedId: "tide-kelp",
    selectedPlotId: null,
    characterForm: "cute",
    houseLevel: 1,
    houseDecor: Object.fromEntries(
      FURNITURE.map((item) => [
        item.id,
        ["wallpaper", "floor", "bed", "desk"].includes(item.id) ? 1 : 0,
      ]),
    ),
    decorations: [],
    avatar: {
      x: FARM_MAPS[0].anchors.house.x,
      y: FARM_MAPS[0].anchors.house.y + 58,
      flip: 1,
    },
    tideCharges: 0,
    tideChargeClaims: {},
    claimedPerfectDays: {},
    streakMilestones: {},
    storyClaimed: [],
    storyUnlocks: [],
    orders: [],
    totalOrdersClaimed: 0,
    manualPlantCount: 0,
    manualWaterCount: 0,
    manualHarvestCount: 0,
    dailyHarvestCounts: {},
    lastMaturityAt: null,
    farmVisited: false,
    totalHarvests: 0,
    totalTasksRewarded: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function normalizeFarmState(raw, dateKey) {
  const base = createDefaultFarmState(dateKey);
  const source = raw && typeof raw === "object" ? raw : {};
  const sourceVersion = Number(source.version || 0) || 1;
  const normalized = {
    version: 8,
    ...base,
    ...source,
    version: 8,
    seeds: { ...base.seeds, ...(source.seeds || {}) },
    crops: { ...base.crops, ...(source.crops || {}) },
    cropQuality: { ...base.cropQuality, ...(source.cropQuality || {}) },
    fish: { ...base.fish, ...(source.fish || {}) },
    fishCaught: { ...base.fishCaught, ...(source.fishCaught || {}) },
    relicMaterials: { ...base.relicMaterials, ...(source.relicMaterials || {}) },
    npcFavor: { ...base.npcFavor, ...(source.npcFavor || {}) },
    decorations: Array.isArray(source.decorations) ? [...new Set(source.decorations)] : [],
    crafted: Array.isArray(source.crafted)
      ? [...new Set(source.crafted.filter((id) => RECIPE_LOOKUP.has(id)))]
      : [],
    discoveries: Object.fromEntries(
      FARM_MAPS.map((map) => [
        map.id,
        Array.isArray(source.discoveries?.[map.id])
          ? [...new Set(source.discoveries[map.id].filter((id) => map.treasures.some((item) => item.id === id)))]
          : [],
      ]),
    ),
    fishing:
      source.fishing && typeof source.fishing === "object"
        ? { ...source.fishing }
        : null,
    gatherCooldowns:
      source.gatherCooldowns && typeof source.gatherCooldowns === "object"
        ? { ...source.gatherCooldowns }
        : {},
    gatherCounts:
      source.gatherCounts && typeof source.gatherCounts === "object"
        ? { ...source.gatherCounts }
        : {},
    actionCooldowns:
      source.actionCooldowns && typeof source.actionCooldowns === "object"
        ? { ...source.actionCooldowns }
        : {},
    landmarkClaims:
      source.landmarkClaims && typeof source.landmarkClaims === "object"
        ? { ...source.landmarkClaims }
        : {},
    claimedPerfectDays:
      source.claimedPerfectDays && typeof source.claimedPerfectDays === "object"
        ? { ...source.claimedPerfectDays }
        : {},
    tideChargeClaims:
      source.tideChargeClaims && typeof source.tideChargeClaims === "object"
        ? { ...source.tideChargeClaims }
        : {},
    streakMilestones:
      source.streakMilestones && typeof source.streakMilestones === "object"
        ? { ...source.streakMilestones }
        : {},
    dailyHarvestCounts:
      source.dailyHarvestCounts && typeof source.dailyHarvestCounts === "object"
        ? { ...source.dailyHarvestCounts }
        : {},
    storyClaimed: Array.isArray(source.storyClaimed)
      ? [...new Set(source.storyClaimed.filter((id) => STORY_CHAPTERS.some((chapter) => chapter.id === id)))]
      : [],
    storyUnlocks: Array.isArray(source.storyUnlocks)
      ? [...new Set(source.storyUnlocks.map(String))]
      : [],
    orders: Array.isArray(source.orders)
      ? source.orders
          .filter((order) => order && getCrop(order.cropId))
          .map((order) => ({ ...order }))
      : [],
    unlockedMaps: Array.isArray(source.unlockedMaps)
      ? [...new Set(source.unlockedMaps.filter((id) => FARM_MAP_LOOKUP.has(id)))]
      : [FARM_MAPS[0].id],
    houseDecor: {
      ...base.houseDecor,
      ...(source.houseDecor && typeof source.houseDecor === "object"
        ? source.houseDecor
        : {}),
    },
    avatar: { ...base.avatar, ...(source.avatar || {}) },
  };

  if (!normalized.unlockedMaps.includes(FARM_MAPS[0].id)) {
    normalized.unlockedMaps.unshift(FARM_MAPS[0].id);
  }
  if (!FARM_MAP_LOOKUP.has(normalized.activeMapId)) {
    normalized.activeMapId = FARM_MAPS[0].id;
  }
  if (!normalized.unlockedMaps.includes(normalized.activeMapId)) {
    normalized.activeMapId = normalized.unlockedMaps.at(-1);
  }
  normalized.characterForm = ["cute", "pretty", "collection"].includes(
    source.characterForm,
  )
    ? source.characterForm
    : "cute";
  normalized.plotSets = Object.fromEntries(
    FARM_MAPS.map((map, mapIndex) => {
      const sourcePlots =
        source.plotSets?.[map.id] ||
        (mapIndex === 0 && Array.isArray(source.plots) ? source.plots : []);
      const plots = createMapPlots(map, sourcePlots);
      if (sourceVersion < 8) {
        const unlockedCount = plots.filter((plot) => plot.unlocked).length;
        const radialUnlocks = new Set(
          map.positions
            .map((position, index) => ({
              index,
              distance: Math.hypot(
                position.x - map.anchors.house.x,
                position.y - map.anchors.house.y,
              ),
            }))
            .sort((left, right) => left.distance - right.distance)
            .slice(0, unlockedCount)
            .map((item) => item.index),
        );
        plots.forEach((plot, index) => {
          if (plot.cropId || plot.plantedAt) radialUnlocks.add(index);
          plot.unlocked = radialUnlocks.has(index);
        });
      }
      return [
        map.id,
        plots.map((plot, index) => ({
          ...plot,
          id: index,
          x: map.positions[index].x,
          y: map.positions[index].y,
        })),
      ];
    }),
  );
  delete normalized.plots;
  const activeMapDefinition = getFarmMap(normalized.activeMapId);
  const rawAvatarX = Number(source.avatar?.x);
  const rawAvatarY = Number(source.avatar?.y);
  const hasStoredAvatarX = Number.isFinite(rawAvatarX) && rawAvatarX > 0;
  const hasStoredAvatarY = Number.isFinite(rawAvatarY) && rawAvatarY > 0;
  const migrateToHouse = sourceVersion < 8;
  const legacyAvatar = sourceVersion < 3;
  const resizedAvatar = sourceVersion >= 3 && sourceVersion < 4;
  normalized.avatar = {
    x: clamp(
      !migrateToHouse && hasStoredAvatarX
        ? legacyAvatar
          ? (rawAvatarX / 100) * activeMapDefinition.worldWidth
          : resizedAvatar
            ? (rawAvatarX / MAP_REFERENCE_WIDTH) * activeMapDefinition.worldWidth
            : rawAvatarX
        : activeMapDefinition.anchors.house.x,
      90,
      activeMapDefinition.worldWidth - 90,
    ),
    y: clamp(
      !migrateToHouse && hasStoredAvatarY
        ? legacyAvatar
          ? (rawAvatarY / 100) * activeMapDefinition.worldHeight
          : resizedAvatar
            ? (rawAvatarY / MAP_REFERENCE_HEIGHT) * activeMapDefinition.worldHeight
            : rawAvatarY
        : activeMapDefinition.anchors.house.y + 58,
      90,
      activeMapDefinition.worldHeight - 90,
    ),
    flip: Number(normalized.avatar?.flip) < 0 ? -1 : 1,
  };

  // 出生保障：存档点若落在尚未解锁的区域（旧档或改过地图），就回到小屋附近，
  // 让可行动范围始终以小屋为圆心向外辐射。
  const activePlots = normalized.plotSets[activeMapDefinition.id] || [];
  const activeMapCleared =
    activePlots.length > 0 && activePlots.every((plot) => plot.unlocked);
  if (!activeMapCleared) {
    const house = activeMapDefinition.anchors.house;
    const nearHouse =
      Math.hypot(normalized.avatar.x - house.x, normalized.avatar.y - house.y) <=
      390;
    const onUnlockedPlot = activePlots.some(
      (plot) =>
        plot.unlocked &&
        Math.hypot(normalized.avatar.x - plot.x, normalized.avatar.y - plot.y) <=
          260,
    );
    if (!nearHouse && !onUnlockedPlot) {
      normalized.avatar.x = house.x;
      normalized.avatar.y = house.y + 58;
    }
  }
  Object.defineProperty(normalized, "plots", {
    configurable: true,
    enumerable: false,
    get() {
      return normalized.plotSets[normalized.activeMapId] || [];
    },
  });

  return normalized;
}

function getFarmMap(mapId) {
  return FARM_MAP_LOOKUP.get(mapId) || FARM_MAPS[0];
}

function getCrop(cropId) {
  return CROP_LOOKUP.get(cropId) || null;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds} 秒`;
  return `${minutes} 分 ${String(seconds).padStart(2, "0")} 秒`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createFarmGame({
  root,
  state,
  saveState,
  showToast,
  getMetrics,
  todayKey,
  characters = [],
  getSelectedCharacterId,
  onSelectCharacter,
  characterIsUnlocked,
  formThresholds = { cute: 1, pretty: 10, collection: 20 },
  onStoryAction,
}) {
  if (!root) return null;

  const inspectMode = new URLSearchParams(window.location.search).get("qa");
  const inspectAll = inspectMode === "all";
  const useMobileAssets = window.matchMedia(
    "(max-width: 820px), (pointer: coarse)",
  ).matches;
  const houseAssetRoot = useMobileAssets
    ? "./assets/mobile/farm/doubao"
    : "./assets/farm/doubao";
  const houseAssetExtension = useMobileAssets ? "webp" : "png";
  const houseAssetUrl = (name) => `${houseAssetRoot}/${name}.${houseAssetExtension}`;
  const HOUSE_UNLOCK_RADIUS = 390;
  const PLOT_UNLOCK_RADIUS = 260;

  const ART = window.TidalFarmArt || {
    itemArt: () => '<span aria-hidden="true">◇</span>',
    levelArt: () => '<span aria-hidden="true">◇</span>',
    npcImage: "",
  };
  const art = (id, label = "") => ART.itemArt?.(id, label) || "";

  const storedFarm = inspectMode ? null : state.farm;
  const normalizedFarm = normalizeFarmState(storedFarm || {}, todayKey());
  const farm =
    normalizedFarm && typeof normalizedFarm === "object"
      ? normalizedFarm
      : createDefaultFarmState(todayKey());
  state.farm = farm;
  if (inspectMode) {
    farm.coins = 99999;
    farm.materials = 99999;
    farm.tideCharges = 6;
    farm.xp = 1200;
    farm.houseLevel = HOUSE_LEVELS.at(-1)?.level ?? 3;
    farm.unlockedMaps = FARM_MAPS.map((map) => map.id);
    Object.values(farm.plotSets).forEach((plots) => {
      plots.forEach((plot) => {
        plot.unlocked = true;
      });
    });
    CROPS.forEach((crop) => {
      farm.seeds[crop.id] = Math.max(99, Number(farm.seeds[crop.id]) || 0);
    });
    if (inspectAll) {
      farm.decorations = DECORATIONS.map((decoration) => decoration.id);
      farm.crafted = WORKSHOP_RECIPES.map((recipe) => recipe.id);
      farm.storyClaimed = STORY_CHAPTERS.map((chapter) => chapter.id);
      FURNITURE.forEach((item) => {
        farm.houseDecor[item.id] = Math.max(
          Number(farm.houseDecor[item.id]) || 0,
          item.maxLevel ?? 3,
        );
      });
      FISH.forEach((fish) => {
        farm.fish[fish.id] = Math.max(9, Number(farm.fish[fish.id]) || 0);
        farm.fishCaught[fish.id] = Math.max(
          9,
          Number(farm.fishCaught[fish.id]) || 0,
        );
      });
      FARM_MAPS.forEach((map) => {
        farm.discoveries[map.id] = map.treasures.map((treasure) => treasure.id);
        map.gatherNodes.forEach((node) => {
          farm.gatherCounts[`${map.id}:${node.id}`] = Math.max(
            1,
            Number(farm.gatherCounts[`${map.id}:${node.id}`]) || 0,
          );
        });
      });
    }
    document.documentElement.dataset.qaMode = inspectAll ? "all" : "1";
    document.documentElement.dataset.qaCoins = String(farm.coins);
    document.documentElement.dataset.qaMaps = farm.unlockedMaps.join(",");
    document.documentElement.dataset.qaDecorations = String(farm.decorations.length);
  }
  // 检查模式可指定地图：?qa=1&qamap=moon-bay#farm
  if (inspectMode) {
    const inspectMapId = new URLSearchParams(window.location.search).get("qamap");
    const inspectMap = inspectMapId ? FARM_MAP_LOOKUP.get(inspectMapId) : null;
    if (inspectMap) {
      farm.activeMapId = inspectMap.id;
      farm.avatar = {
        x: inspectMap.anchors.house.x,
        y: inspectMap.anchors.house.y + 58,
        flip: 1,
      };
    }
  }
  const characterLookup = new Map(
    characters.filter((item) => item.artStatus !== "pending").map((item) => [item.id, item]),
  );
  const fallbackCharacter = characters[0] || {
    id: "deep-current",
    name: "深汐",
    color: "#6ea8ff",
    cuteImage: "./assets/characters/cute/cutouts/deep-current-cute-cutout-v1.png",
    prettyImage: "./assets/characters/pretty/cutouts/deep-current-pretty-cutout-v1.png",
    image: "./assets/characters/collection/final/deep-current-collection-final-v1.png",
    idleFrames: ["./assets/characters/idle/deep-current/idle-01.png"],
  };
  let activeAction = "idle";
  let actionFrame = 0;
  let actionTimer = null;
  let spriteTimer = null;
  let avatarSpriteKey = "";
  let avatarSpriteLayers = [];
  let avatarIdleCanvas = null;
  let avatarIdleSpriteImage = null;
  let avatarIdleTimer = null;
  let avatarIdleFrame = 0;
  const preloadedIdleFrames = new Map();
  const preloadedIdleSprites = new Map();
  let motionFrame = null;
  let saveTimer = null;
  let cameraFrame = null;
  let plotMenuReady = false;
  let plotInspectorSignature = "";
  let plotListSignature = "";
  let maturityListSignature = "";
  let fishingSpotsSignature = "";
  let gatherNodesSignature = "";
  let landmarkSignature = "";
  let resourceLevelSignature = "";
  let clockMinuteSignature = "";
  let tideIconSignature = "";
  let lastAreaWarningAt = 0;
  let hasRenderedOnce = false;
  let lastRenderedLevel = null;
  let pendingLevelCelebration = null;
  let houseFocusItem = "desk";
  let avatarTerrainType = "ground";
  // 检查模式下 ?qa=panel 直接展开伙伴列表，便于核对面板与缩放控件不再重叠。
  let farmCharactersExpanded = inspectMode === "panel";
  const cameras = new Map();
  const drag = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    cameraX: 0,
    cameraY: 0,
    moved: false,
  };

  function selectedFarmCharacter() {
    const selectedId = getSelectedCharacterId?.() || state.selectedCharacterId;
    return characterLookup.get(selectedId) || characterLookup.get(fallbackCharacter.id) || fallbackCharacter;
  }

  function farmCharacterUnlocked(character) {
    if (typeof characterIsUnlocked === "function") {
      return characterIsUnlocked(character);
    }
    return true;
  }

  function activeFarmMap() {
    return getFarmMap(farm.activeMapId);
  }

  function formIsUnlocked(formId, character = selectedFarmCharacter()) {
    const metrics = getMetrics?.() || {};
    if (typeof characterIsUnlocked === "function") {
      return characterIsUnlocked(character, metrics, formId);
    }
    if (formId === "cute") return true;
    const marks = Number(metrics.characterMarks?.[character.id]) || 0;
    if (formId === "pretty") return marks >= formThresholds.pretty;
    if (formId === "collection") return marks >= formThresholds.collection;
    return false;
  }

  function characterForm() {
    return formIsUnlocked(farm.characterForm) ? farm.characterForm : "cute";
  }

  function characterArt(character, form = characterForm()) {
    if (form === "cute") {
      return character.cuteImage || character.image;
    }
    if (form === "pretty") {
      return character.prettyImage || character.image;
    }
    return character.image || character.prettyImage || character.cuteImage;
  }

  function characterIdleFrames(character, form = characterForm()) {
    if (form === "cute" && character.idleFrames?.length && !useMobileAssets) {
      return character.idleFrames;
    }
    return [characterArt(character, form)];
  }

  function preloadIdleFrames(frames) {
    return Promise.all(
      frames.map((source) => {
        if (!source) return Promise.resolve(null);
        if (preloadedIdleFrames.has(source)) {
          return preloadedIdleFrames.get(source);
        }
        const pending = new Promise((resolve) => {
          const image = new Image();
          image.decoding = "async";
          image.onload = () => {
            const decoded = image.decode ? image.decode() : Promise.resolve();
            decoded.catch(() => {}).finally(() => resolve(image));
          };
          image.onerror = () => resolve(null);
          image.src = source;
        });
        preloadedIdleFrames.set(source, pending);
        return pending;
      }),
    );
  }

  function clearAvatarIdleCanvas() {
    window.clearInterval(avatarIdleTimer);
    avatarIdleTimer = null;
    avatarIdleFrame = 0;
    avatarIdleSpriteImage = null;
    if (avatarIdleCanvas) {
      const context = avatarIdleCanvas.getContext("2d");
      context.clearRect(0, 0, avatarIdleCanvas.width, avatarIdleCanvas.height);
      avatarIdleCanvas.hidden = true;
    }
    elements.avatar.classList.remove("has-idle-canvas");
  }

  function preloadIdleSprite(source) {
    if (preloadedIdleSprites.has(source)) {
      return preloadedIdleSprites.get(source);
    }
    const pending = new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        const decoded = image.decode ? image.decode() : Promise.resolve();
        decoded.catch(() => {}).finally(() => resolve(image));
      };
      image.onerror = () => resolve(null);
      image.src = source;
    });
    preloadedIdleSprites.set(source, pending);
    while (preloadedIdleSprites.size > AVATAR_IDLE_SPRITE_CACHE_LIMIT) {
      preloadedIdleSprites.delete(preloadedIdleSprites.keys().next().value);
    }
    return pending;
  }

  function drawAvatarIdleSprite() {
    if (!avatarIdleCanvas || !avatarIdleSpriteImage) return;
    const frameCount = AVATAR_IDLE_SPRITE_COLUMNS * AVATAR_IDLE_SPRITE_ROWS;
    const frame = avatarIdleFrame % frameCount;
    const cellWidth = avatarIdleCanvas.width;
    const cellHeight = avatarIdleCanvas.height;
    const sourceX = (frame % AVATAR_IDLE_SPRITE_COLUMNS) * cellWidth;
    const sourceY = Math.floor(frame / AVATAR_IDLE_SPRITE_COLUMNS) * cellHeight;
    const context = avatarIdleCanvas.getContext("2d");
    context.clearRect(0, 0, cellWidth, cellHeight);
    context.drawImage(
      avatarIdleSpriteImage,
      sourceX,
      sourceY,
      cellWidth,
      cellHeight,
      0,
      0,
      cellWidth,
      cellHeight,
    );
  }

  function mountAvatarIdleCanvas(image, character, form) {
    if (!image || !elements.avatarIdleCanvas) return false;
    avatarIdleCanvas = elements.avatarIdleCanvas;
    const cellWidth = Math.round(image.naturalWidth / AVATAR_IDLE_SPRITE_COLUMNS);
    const cellHeight = Math.round(image.naturalHeight / AVATAR_IDLE_SPRITE_ROWS);
    avatarIdleCanvas.width = cellWidth;
    avatarIdleCanvas.height = cellHeight;
    avatarIdleCanvas.hidden = false;
    elements.avatar.classList.add("has-idle-canvas");
    elements.avatarSprite.classList.remove("is-visible");
    avatarIdleSpriteImage = image;
    avatarIdleFrame = 0;
    drawAvatarIdleSprite();
    window.clearInterval(avatarIdleTimer);
    avatarIdleTimer = window.setInterval(() => {
      const panel = root.closest(".screen-panel");
      if (
        document.hidden ||
        !panel?.classList.contains("is-active") ||
        form !== "cute" ||
        !avatarIdleCanvas ||
        selectedFarmCharacter().id !== character.id
      ) {
        return;
      }
      avatarIdleFrame =
        (avatarIdleFrame + 1) %
        (AVATAR_IDLE_SPRITE_COLUMNS * AVATAR_IDLE_SPRITE_ROWS);
      drawAvatarIdleSprite();
    }, AVATAR_IDLE_SPRITE_INTERVAL_MS);
    return true;
  }

  function clearAvatarSpriteStack() {
    avatarSpriteLayers.slice(1).forEach((layer) => layer.remove());
    avatarSpriteLayers = [];
    avatarSpriteKey = "";
    elements.avatarSprite.classList.remove("is-visible");
  }

  function mountAvatarSpriteStack(frames, images, character, form) {
    const key = `${character.id}:${form}:${frames.join("|")}`;
    if (avatarSpriteKey === key) return;
    clearAvatarSpriteStack();
    avatarSpriteLayers = frames.map((source, index) => {
      const image = index === 0 ? elements.avatarSprite : new Image();
      if (index > 0) {
        image.className = "farm-avatar-sprite farm-avatar-frame-layer";
        elements.avatar.insertBefore(image, elements.avatarSprite.nextSibling);
      }
      image.src = images[index]?.src || source;
      image.alt = index === 0 ? `${character.name}${form}形态` : "";
      image.dataset.frameIndex = String(index);
      return image;
    });
    avatarSpriteKey = key;
  }

  function showAvatarSpriteFrame(index) {
    avatarSpriteLayers.forEach((layer, layerIndex) => {
      layer.classList.toggle("is-visible", layerIndex === index);
    });
  }

  function mapPlots(mapId) {
    return farm.plotSets[mapId] || [];
  }

  function mapIsCleared(mapId) {
    const plots = mapPlots(mapId);
    return plots.length > 0 && plots.every((plot) => plot.unlocked);
  }

  function previousMapFor(map) {
    if (!map) return null;
    return FARM_MAPS.find((candidate) => candidate.order === map.order - 1) || null;
  }

  function mapUnlockStatus(map) {
    const unlocked = Boolean(map && farm.unlockedMaps.includes(map.id));
    const previousMap = previousMapFor(map);
    const previousPlots = previousMap ? mapPlots(previousMap.id) : [];
    const previousUnlockedPlotCount = previousPlots.filter(
      (plot) => plot.unlocked,
    ).length;
    const previousMapCleared =
      !previousMap ||
      (previousPlots.length > 0 &&
        previousUnlockedPlotCount === previousPlots.length);
    const requirements = map ? MAP_LEARNING_REQUIREMENTS[map.id] || {} : {};
    const level = currentLevel();
    const requiredLevel = Number(map?.requiredLevel) || 1;
    const gateCost = Number(map?.gateCost) || 0;
    const coins = Number(farm.coins) || 0;
    const learning = learningSnapshot();
    return {
      map,
      unlocked,
      previousMap,
      previousPlotCount: previousPlots.length,
      previousUnlockedPlotCount,
      previousMapCleared,
      level,
      requiredLevel,
      levelMet: level >= requiredLevel,
      requirements,
      learning,
      learningMet: learningRequirementsMet(requirements),
      gateCost,
      coins,
      coinsMet: coins >= gateCost,
      ready:
        unlocked ||
        Boolean(
          map &&
            previousMapCleared &&
            level >= requiredLevel &&
            learningRequirementsMet(requirements) &&
            coins >= gateCost,
        ),
    };
  }

  function mapUnlockRequirementsCopy(mapOrStatus, { onlyMissing = false } = {}) {
    const status = mapOrStatus?.map ? mapOrStatus : mapUnlockStatus(mapOrStatus);
    const parts = [];
    if (status.previousMap && (!onlyMissing || !status.previousMapCleared)) {
      parts.push(
        `开放${status.previousMap.name}全部 ${status.previousPlotCount} 块田地`,
      );
    }
    if (!onlyMissing || !status.levelMet) {
      parts.push(`潮栖 ${status.requiredLevel} 级`);
    }
    const learningCopy = learningRequirementCopy(status.requirements);
    if (learningCopy && (!onlyMissing || !status.learningMet)) {
      parts.push(learningCopy);
    }
    if (!onlyMissing || !status.coinsMet) {
      parts.push(`${status.gateCost} 海币`);
    }
    return parts.join(" · ");
  }

  function mapExplorationProgress(map) {
    const plots = mapPlots(map.id);
    const plotProgress = plots.length
      ? plots.filter((plot) => plot.unlocked).length / plots.length
      : 0;
    const treasureProgress = map.treasures.length
      ? (farm.discoveries?.[map.id]?.length || 0) / map.treasures.length
      : 0;
    const gathered = map.gatherNodes.reduce(
      (total, node) =>
        total + (Number(farm.gatherCounts?.[`${map.id}:${node.id}`]) > 0 ? 1 : 0),
      0,
    );
    const gatherProgress = map.gatherNodes.length ? gathered / map.gatherNodes.length : 0;
    return clamp(plotProgress * 0.68 + treasureProgress * 0.2 + gatherProgress * 0.12, 0, 1);
  }

  function nextLockedMap() {
    return FARM_MAPS.find((map) => !farm.unlockedMaps.includes(map.id)) || null;
  }

  function distanceFromHouse(point, map = activeFarmMap()) {
    return Math.hypot(
      point.x - map.anchors.house.x,
      point.y - map.anchors.house.y,
    );
  }

  function nextLandPlot(map = activeFarmMap()) {
    return (
      mapPlots(map.id)
        .filter((plot) => !plot.unlocked)
        .sort((left, right) => distanceFromHouse(left, map) - distanceFromHouse(right, map))[0] ||
      null
    );
  }

  function pointIsUnlocked(x, y, map = activeFarmMap()) {
    if (mapIsCleared(map.id)) return true;
    if (
      Math.hypot(x - map.anchors.house.x, y - map.anchors.house.y) <=
      HOUSE_UNLOCK_RADIUS
    ) {
      return true;
    }
    return mapPlots(map.id).some((plot) => {
      if (!plot.unlocked) return false;
      return Math.hypot(x - plot.x, y - plot.y) <= PLOT_UNLOCK_RADIUS;
    });
  }

  function notifyAreaLocked(label = "这片区域") {
    const now = Date.now();
    if (now - lastAreaWarningAt < 1400) return;
    lastAreaWarningAt = now;
    showToast({
      title: `${label}尚未解锁`,
      message: "先回到小屋附近，再通过扩建田地让可行动区域向外逐步延伸。",
      icon: "map-pinned",
    });
  }

  function recipeIsCrafted(recipeId) {
    return farm.crafted.includes(recipeId);
  }

  function mapHasPerk(perkId) {
    return activeFarmMap().id === perkId;
  }

  function tideEvent(now = Date.now()) {
    const slot = Math.floor(now / TIDE_EVENT_DURATION);
    return TIDE_EVENTS[slot % TIDE_EVENTS.length];
  }

  function tideEventRemaining(now = Date.now()) {
    return TIDE_EVENT_DURATION - (now % TIDE_EVENT_DURATION);
  }

  function landmarkClaimedToday(map = activeFarmMap()) {
    return farm.landmarkClaims?.[map.id] === todayKey();
  }

  function fishingDuration() {
    const map = activeFarmMap();
    const base = map.id === "moon-bay" ? 18_000 : 24_000;
    return (
      base *
      (recipeIsCrafted("moon-net") ? 0.65 : 1) *
      tideEvent().fishMultiplier
    );
  }

  function cropGrowthMultiplier() {
    let multiplier = activeFarmMap().id === "coral-terrace" ? 0.88 : 1;
    if (recipeIsCrafted("whale-greenhouse")) multiplier *= 0.85;
    return multiplier * tideEvent().cropMultiplier;
  }

  function cropYieldBonus() {
    return recipeIsCrafted("coral-charm") ? 1 : 0;
  }

  function cameraFor(map = activeFarmMap()) {
    if (!cameras.has(map.id)) {
      cameras.set(map.id, {
        x: clamp(farm.avatar.x - 420, 0, map.worldWidth),
        y: clamp(farm.avatar.y - 360, 0, map.worldHeight),
        scale: 0.82,
      });
    }
    return cameras.get(map.id);
  }

  function cameraBounds(map = activeFarmMap(), scale = cameraFor(map).scale) {
    const rect = elements.viewport?.getBoundingClientRect();
    const viewportWidth = rect?.width || 760;
    const viewportHeight = rect?.height || 520;
    return {
      maxX: Math.max(0, map.worldWidth * scale - viewportWidth),
      maxY: Math.max(0, map.worldHeight * scale - viewportHeight),
      viewportWidth,
      viewportHeight,
    };
  }

  function clampCamera(map = activeFarmMap(), camera = cameraFor(map)) {
    const bounds = cameraBounds(map, camera.scale);
    camera.x = clamp(camera.x, 0, bounds.maxX);
    camera.y = clamp(camera.y, 0, bounds.maxY);
    return camera;
  }

  function centerCameraOn(x, y, map = activeFarmMap(), animate = true) {
    const camera = cameraFor(map);
    const bounds = cameraBounds(map, camera.scale);
    camera.x = clamp(x * camera.scale - bounds.viewportWidth / 2, 0, bounds.maxX);
    camera.y = clamp(y * camera.scale - bounds.viewportHeight / 2, 0, bounds.maxY);
    if (!animate && cameraFrame) {
      window.cancelAnimationFrame(cameraFrame);
      cameraFrame = null;
    }
    applyCamera();
  }

  function updateMinimap(map = activeFarmMap()) {
    if (!elements.minimapView) return;
    const camera = cameraFor(map);
    const bounds = cameraBounds(map, camera.scale);
    const visibleWidth = clamp((bounds.viewportWidth / (map.worldWidth * camera.scale)) * 100, 5, 100);
    const visibleHeight = clamp((bounds.viewportHeight / (map.worldHeight * camera.scale)) * 100, 5, 100);
    elements.minimapView.style.left = `${clamp((camera.x / (map.worldWidth * camera.scale)) * 100, 0, 100 - visibleWidth)}%`;
    elements.minimapView.style.top = `${clamp((camera.y / (map.worldHeight * camera.scale)) * 100, 0, 100 - visibleHeight)}%`;
    elements.minimapView.style.width = `${visibleWidth}%`;
    elements.minimapView.style.height = `${visibleHeight}%`;
  }

  function applyCamera() {
    const map = activeFarmMap();
    const camera = clampCamera(map, cameraFor(map));
    elements.world.style.transform = `translate3d(${-camera.x}px, ${-camera.y}px, 0) scale(${camera.scale})`;
    // 地图整体缩放时，标签字号按反比例布局后再随镜头缩放，避免文字被低分辨率栅格化。
    elements.world.style.setProperty(
      "--farm-label-inverse-scale",
      String(1 / camera.scale),
    );
    if (elements.zoomCopy) elements.zoomCopy.textContent = `${Math.round(camera.scale * 100)}%`;
    updateMinimap(map);
  }

  function scheduleCameraUpdate() {
    if (cameraFrame) return;
    cameraFrame = window.requestAnimationFrame(() => {
      cameraFrame = null;
      applyCamera();
    });
  }

  root.innerHTML = `
    <div class="farm-shell">
      <header class="farm-hero">
        <div class="farm-title-block">
          <p class="section-label">TIDAL HOMESTEAD</p>
          <h2>潮汐农场</h2>
          <p>学习产生潮矿与潮汛；农场只消耗、照料与展示，不能自行生成学习凭证。</p>
        </div>
        <div class="farm-resource-strip" aria-label="农场资源">
          <div class="farm-resource is-material">
            <i data-lucide="gem"></i>
            <span>潮矿 · 仅学习</span>
            <strong data-farm-value="materials">0</strong>
          </div>
          <div class="farm-resource is-coin">
            <i data-lucide="circle-dollar-sign"></i>
            <span>海币</span>
            <strong data-farm-value="coins">0</strong>
          </div>
          <div class="farm-resource is-level">
            <span data-farm-level-icon>${ART.levelArt(1)}</span>
            <span>潮栖等级</span>
            <strong data-farm-value="level">1</strong>
          </div>
          <div class="farm-resource is-charge">
            <i data-lucide="zap"></i>
            <span>潮汛 · 上限 6</span>
            <strong data-farm-value="charges">0</strong>
          </div>
        </div>
      </header>

      <section class="farm-story-band" data-farm-story aria-live="polite"></section>

      <div class="farm-grid">
        <aside class="farm-rail farm-inventory-rail">
          <div class="farm-rail-heading">
            <div>
              <span>SEED DECK</span>
              <h3>潮种仓</h3>
            </div>
            <span class="farm-level-pill" data-farm-level-copy>LV.1</span>
          </div>
          <div class="farm-level-track" aria-label="潮栖等级进度">
            <span data-farm-level-fill></span>
          </div>
          <div class="farm-seed-list" data-farm-seeds></div>
          <div class="farm-rail-heading is-compact farm-maturity-heading">
            <div>
              <span>GROWTH TIMER</span>
              <h3>作物成熟时刻</h3>
            </div>
            <span class="farm-level-pill" data-farm-maturity-ready>0 成熟</span>
          </div>
          <div class="farm-maturity-list" data-farm-maturity-list></div>
          <div class="farm-inventory-summary">
            <div>
              <span>仓中收成</span>
              <strong data-farm-stock-count>0</strong>
            </div>
            <div>
              <span>累计收获</span>
              <strong data-farm-harvest-count>0</strong>
            </div>
          </div>
          <div class="farm-growth-summary" aria-label="田地成熟状态">
            <div>
              <span>成熟数量</span>
              <strong data-farm-ready-total>0</strong>
            </div>
            <div>
              <span>成长数量</span>
              <strong data-farm-growing-total>0</strong>
            </div>
            <div>
              <span>最近成熟</span>
              <strong data-farm-recent-maturity>--:--</strong>
            </div>
            <div>
              <span>今日已收</span>
              <strong data-farm-today-harvest>0</strong>
            </div>
          </div>
          <button class="farm-warehouse-trigger" type="button" data-farm-action="open-warehouse">
            <span class="farm-warehouse-icon"><i data-lucide="warehouse"></i></span>
            <span class="farm-warehouse-copy">
              <strong>海物仓库</strong>
              <small><b data-farm-warehouse-count>0</b> 份作物可出售</small>
            </span>
            <i data-lucide="chevron-right"></i>
          </button>
        </aside>

        <section class="farm-stage-column">
          <div class="farm-stage" data-farm-stage>
            <div class="farm-viewport" data-farm-viewport>
              <div class="farm-world" data-farm-world>
                <img
                  class="farm-backdrop"
                  data-farm-backdrop
                  src="${assetUrl("./assets/farm/doubao/map-tide-meadow-v2-2560.webp")}"
                  alt="潮汐农场"
                />
                <div class="farm-lightwash" aria-hidden="true"></div>
                <canvas
                  class="farm-vision-canvas"
                  data-farm-vision-canvas
                  width="3200"
                  height="1760"
                  aria-hidden="true"
                ></canvas>
                <canvas
                  class="farm-terrain-canvas"
                  data-farm-terrain-canvas
                  width="3200"
                  height="1760"
                  hidden
                  aria-hidden="true"
                ></canvas>
                <div class="farm-decor-layer" aria-hidden="true">
                  <span class="farm-decor farm-decor-lanterns"></span>
                  <span class="farm-decor farm-decor-fountain"></span>
                  <span class="farm-decor farm-decor-arch"></span>
                  <span class="farm-decor farm-decor-moon-stage"></span>
                  <span class="farm-decor farm-decor-pearl-tree"></span>
                  <span class="farm-decor farm-decor-whale-lantern"></span>
                </div>
                <div class="farm-world-layer farm-decoration-layer" data-farm-world-decorations></div>
                <div class="farm-world-layer farm-home-layer" data-farm-world-home></div>
                <div class="farm-world-layer farm-level-layer" data-farm-level-shrine></div>
                <div class="farm-world-layer farm-fishing-layer" data-farm-fishing-spots></div>
                <div class="farm-world-layer farm-treasure-layer" data-farm-treasures></div>
                <div class="farm-world-layer farm-gather-layer" data-farm-gather-nodes></div>
                <div class="farm-world-layer farm-landmark-layer" data-farm-landmarks></div>
                <div class="farm-world-layer farm-npc-layer" data-farm-npc></div>
                <div class="farm-plot-layer" data-farm-plots></div>
              <div class="farm-avatar" data-farm-avatar>
                <span class="farm-avatar-shadow" aria-hidden="true"></span>
                <img class="farm-avatar-sprite" data-farm-avatar-sprite alt="" />
                <canvas class="farm-avatar-idle-canvas" data-farm-avatar-idle-canvas aria-hidden="true" hidden></canvas>
                <span class="farm-avatar-name">深汐 · 幼潮</span>
              </div>
              </div>
              <div class="farm-viewport-edge" aria-hidden="true"></div>
            </div>
            <div class="farm-plot-inspector" data-farm-plot-inspector hidden></div>
            <div class="farm-map-nav" data-farm-map-nav aria-label="农场地块"></div>
            <div class="farm-map-minimap" data-farm-minimap title="点击小地图快速移动视野">
              <img data-farm-minimap-image src="${assetUrl("./assets/farm/doubao/map-tide-meadow-v2-2560.webp")}" alt="" />
              <i data-farm-minimap-view aria-hidden="true"></i>
            </div>
            <div class="farm-tide-card" data-farm-tide-card>
              <span class="farm-tide-icon" data-farm-tide-icon><i data-lucide="waves"></i></span>
              <span>
                <small>当前潮候</small>
                <strong data-farm-tide-name>缓潮</strong>
              </span>
              <em data-farm-tide-time>06:00</em>
            </div>
            <div class="farm-terrain-chip" data-farm-terrain-chip data-terrain="walk">
              <i data-lucide="footprints"></i>
              <span data-farm-terrain-label>行走</span>
            </div>
            <div class="farm-stage-help">
              <span><i data-lucide="move"></i>拖动地图</span>
              <span><i data-lucide="mouse-pointer-click"></i>点击移动</span>
              <span><i data-lucide="shell"></i>海岸采集</span>
            </div>
            <div class="farm-map-perk">
              <i data-lucide="wand-sparkles"></i>
              <span data-farm-map-perk></span>
            </div>
            <div class="farm-zoom-controls" aria-label="地图缩放">
              <button type="button" data-farm-zoom="out" title="缩小">
                <i data-lucide="minus"></i>
              </button>
              <span data-farm-zoom-copy>82%</span>
              <button type="button" data-farm-zoom="in" title="放大">
                <i data-lucide="plus"></i>
              </button>
              <button type="button" data-farm-zoom="reset" title="回到伙伴身边">
                <i data-lucide="locate-fixed"></i>
              </button>
            </div>
            <div class="farm-character-dock" data-farm-character-dock></div>
            <div class="farm-form-dock" data-farm-form-dock></div>
            <div class="farm-stage-clock">
              <i data-lucide="sun-medium"></i>
              <span data-farm-clock>--:--</span>
            </div>
          </div>

          <div class="farm-action-deck">
            <div class="farm-action-heading">
              <div>
                <span>FIELD WORK</span>
                <strong>一键劳作 · 只省点击</strong>
              </div>
              <small>一键操作的收益或成本始终不优于单块照料，且不参与主线进度。</small>
            </div>
            <div class="farm-command-row">
              <button type="button" data-farm-action="auto-plant" data-farm-command="plant">
                <span class="farm-command-icon"><i data-lucide="sprout"></i></span>
                <span class="farm-command-copy">
                  <strong>一键播种</strong>
                  <small data-farm-command-cost="plant">等待盘点田地</small>
                </span>
                <em data-farm-command-state="plant">待命</em>
              </button>
              <button type="button" data-farm-action="auto-water" data-farm-command="water">
                <span class="farm-command-icon"><i data-lucide="droplets"></i></span>
                <span class="farm-command-copy">
                  <strong>一键浇水</strong>
                  <small data-farm-command-cost="water">等待盘点田地</small>
                </span>
                <em data-farm-command-state="water">待命</em>
              </button>
              <button type="button" data-farm-action="auto-harvest" data-farm-command="harvest">
                <span class="farm-command-icon"><i data-lucide="shopping-basket"></i></span>
                <span class="farm-command-copy">
                  <strong>一键收获</strong>
                  <small data-farm-command-cost="harvest">等待盘点田地</small>
                </span>
                <em data-farm-command-state="harvest">待命</em>
              </button>
              <button type="button" data-farm-action="charge" data-farm-command="charge">
                <span class="farm-command-icon"><i data-lucide="zap"></i></span>
                <span class="farm-command-copy">
                  <strong>潮汛催生</strong>
                  <small data-farm-command-cost="charge">消耗 1 次潮汛</small>
                </span>
                <em data-farm-command-state="charge">待命</em>
              </button>
            </div>
          </div>

          <div class="farm-loop-strip" aria-label="学习与农场循环">
            <div class="farm-loop-copy">
              <span>今日学习</span>
              <strong data-farm-today-progress>0 / 0</strong>
            </div>
            <i data-lucide="arrow-right"></i>
            <div class="farm-loop-copy">
              <span>任务产出</span>
              <strong data-farm-task-rewards>0</strong>
            </div>
            <i data-lucide="arrow-right"></i>
            <div class="farm-loop-copy">
              <span>成熟作物</span>
              <strong data-farm-ready-count>0</strong>
            </div>
            <i data-lucide="arrow-right"></i>
            <div class="farm-loop-copy is-highlight">
              <span>潮栖愿景</span>
              <strong data-farm-next-upgrade>扩建田地</strong>
            </div>
          </div>
        </section>

        <aside class="farm-rail farm-market-rail">
          <div class="farm-rail-heading farm-market-heading">
            <div>
              <span>MARKET</span>
              <h3>潮汐商栈</h3>
            </div>
            <button class="farm-icon-button" type="button" data-farm-action="sell-all" title="出售全部成熟作物">
              <i data-lucide="badge-dollar-sign"></i>
            </button>
          </div>
          <div class="farm-shop-list" data-farm-shop></div>

          <div class="farm-rail-heading is-compact farm-homestead-heading">
            <div>
              <span>HOMESTEAD</span>
              <h3>居所与扩建</h3>
            </div>
          </div>
          <div class="farm-upgrade-list" data-farm-upgrades></div>
          <div class="farm-decor-list" data-farm-decorations></div>

          <div class="farm-rail-heading is-compact farm-workshop-heading">
            <div>
              <span>WORKSHOP</span>
              <h3>潮汐工坊</h3>
            </div>
            <span class="farm-level-pill" data-farm-discovery-count>0 宝藏</span>
          </div>
          <div class="farm-recipe-list" data-farm-recipes></div>

          <div class="farm-rail-heading is-compact farm-codex-heading">
            <div>
              <span>SEA CODEX</span>
              <h3>海物图鉴</h3>
            </div>
            <span class="farm-level-pill" data-farm-fish-count>0 / 0</span>
          </div>
          <div class="farm-fish-codex" data-farm-fish-codex></div>
        </aside>
      </div>

      <div class="farm-bottom-grid">
        <section class="farm-order-board">
          <div class="farm-order-copy">
            <span class="farm-board-label">DAILY ORDER</span>
            <h3>海边来客委托</h3>
            <p data-farm-order-copy>等待今日委托。</p>
          </div>
          <button class="primary-button" type="button" data-farm-action="claim-order">
            <i data-lucide="package-check"></i>
            <span>交付委托</span>
          </button>
        </section>

        <section class="farm-companion-board">
          <div class="farm-companion-art">
            <img
              data-farm-companion-image
              src="${useMobileAssets ? "./assets/mobile/characters/cute/deep-current-cute-cutout-v1.webp" : "./assets/characters/cute/cutouts/deep-current-cute-cutout-v1.png"}"
              alt="深汐"
            />
            <span class="farm-companion-ring" aria-hidden="true"></span>
          </div>
          <div class="farm-companion-copy">
            <span class="farm-board-label">COMPANION GROWTH</span>
            <h3 data-farm-companion-title>深汐 · 幼潮形态</h3>
            <p data-farm-companion-copy>收集专属印记，依次解锁幼态、鲸歌与典藏形态。</p>
            <div class="farm-companion-progress">
              <span data-farm-companion-progress></span>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div class="farm-house-overlay" data-farm-house aria-hidden="true">
      <div class="farm-house-room" data-farm-house-room>
        <button class="farm-house-close" type="button" data-farm-action="close-house" aria-label="关闭小屋">
          <i data-lucide="x"></i>
        </button>
        <div class="farm-house-heading">
          <div>
            <span class="farm-board-label">TIDAL COTTAGE</span>
            <h3>鲸梦小屋</h3>
            <p>外观、室内与家具会分别成长；消耗海币升级后，可直接看到整间屋子的材质与布局变化。</p>
          </div>
          <span class="farm-house-balance"><i data-lucide="circle-dollar-sign"></i><strong data-house-coins>0</strong></span>
        </div>
        <div class="farm-house-level-track" data-house-level-track></div>
        <div class="farm-house-preview-grid">
          <figure class="farm-house-exterior-card">
            <img data-house-exterior src="${houseAssetUrl("cottage-level-1")}" alt="鲸梦小屋外观" loading="lazy" decoding="async" />
            <figcaption data-house-exterior-copy>潮线小屋 · 基础外观</figcaption>
          </figure>
          <div class="farm-room-scene has-photo" data-house-room data-wallpaper="0" data-floor="0" data-bed="0" data-desk="0" data-lamp="0" data-aquarium="0">
            <img class="farm-room-backdrop" data-house-interior src="${houseAssetUrl("room-level-1")}" alt="鲸梦小屋室内" loading="lazy" decoding="async" />
            <span class="farm-room-window" aria-hidden="true"></span>
            <span class="farm-room-light" aria-hidden="true"></span>
            <span class="farm-room-rug" aria-hidden="true"></span>
            <span class="farm-room-bookshelf" aria-hidden="true"></span>
            <span class="farm-room-aquarium" aria-hidden="true"><i></i><i></i></span>
            <span class="farm-room-bed" aria-hidden="true"><i></i></span>
            <span class="farm-room-desk" aria-hidden="true"><i></i></span>
            <span class="farm-room-lamp" aria-hidden="true"></span>
            <div class="farm-room-furniture-layer" data-house-furniture-layer></div>
            <img class="farm-room-avatar" data-house-avatar alt="" />
            <span class="farm-room-caption">家具会随等级改变细节，角色会保留当前伙伴形态。</span>
          </div>
        </div>
        <div class="farm-house-catalog" data-house-catalog></div>
      </div>
    </div>
    <div class="farm-warehouse-overlay" data-farm-warehouse aria-hidden="true">
      <div class="farm-warehouse-panel" data-farm-warehouse-panel>
        <button class="farm-warehouse-close" type="button" data-farm-action="close-warehouse" aria-label="关闭仓库">
          <i data-lucide="x"></i>
        </button>
        <div class="farm-warehouse-heading">
          <span class="farm-board-label">SEA HARVEST WAREHOUSE</span>
          <h3>海物仓库</h3>
          <p>逐份出售或一次清仓。每次出售结算都会消耗 1 次学习获得的潮汛。</p>
        </div>
        <div class="farm-warehouse-balance">
          <span><i data-lucide="circle-dollar-sign"></i><strong data-farm-warehouse-coins>0</strong> 海币</span>
          <span><i data-lucide="zap"></i><strong data-farm-warehouse-charges>0</strong> 潮汛</span>
        </div>
        <div class="farm-crop-bag" data-farm-crop-bag></div>
      </div>
    </div>
  `;

  const elements = {
    stage: root.querySelector("[data-farm-stage]"),
    story: root.querySelector("[data-farm-story]"),
    viewport: root.querySelector("[data-farm-viewport]"),
    world: root.querySelector("[data-farm-world]"),
    plotInspector: root.querySelector("[data-farm-plot-inspector]"),
    backdrop: root.querySelector("[data-farm-backdrop]"),
    visionCanvas: root.querySelector("[data-farm-vision-canvas]"),
    terrainCanvas: root.querySelector("[data-farm-terrain-canvas]"),
    terrainChip: root.querySelector("[data-farm-terrain-chip]"),
    terrainLabel: root.querySelector("[data-farm-terrain-label]"),
    mapNav: root.querySelector("[data-farm-map-nav]"),
    minimap: root.querySelector("[data-farm-minimap]"),
    minimapImage: root.querySelector("[data-farm-minimap-image]"),
    minimapView: root.querySelector("[data-farm-minimap-view]"),
    plots: root.querySelector("[data-farm-plots]"),
    treasures: root.querySelector("[data-farm-treasures]"),
    fishingSpots: root.querySelector("[data-farm-fishing-spots]"),
    gatherNodes: root.querySelector("[data-farm-gather-nodes]"),
    landmarks: root.querySelector("[data-farm-landmarks]"),
    npcLayer: root.querySelector("[data-farm-npc]"),
    worldHome: root.querySelector("[data-farm-world-home]"),
    worldDecorations: root.querySelector("[data-farm-world-decorations]"),
    levelShrine: root.querySelector("[data-farm-level-shrine]"),
    avatar: root.querySelector("[data-farm-avatar]"),
    avatarSprite: root.querySelector("[data-farm-avatar-sprite]"),
    avatarIdleCanvas: root.querySelector("[data-farm-avatar-idle-canvas]"),
    characterDock: root.querySelector("[data-farm-character-dock]"),
    formDock: root.querySelector("[data-farm-form-dock]"),
    seeds: root.querySelector("[data-farm-seeds]"),
    maturityList: root.querySelector("[data-farm-maturity-list]"),
    cropBag: root.querySelector("[data-farm-crop-bag]"),
    warehouseOverlay: root.querySelector("[data-farm-warehouse]"),
    shop: root.querySelector("[data-farm-shop]"),
    upgrades: root.querySelector("[data-farm-upgrades]"),
    decorations: root.querySelector("[data-farm-decorations]"),
    orderCopy: root.querySelector("[data-farm-order-copy]"),
    orderButton: root.querySelector('[data-farm-action="claim-order"]'),
    companionImage: root.querySelector("[data-farm-companion-image]"),
    companionTitle: root.querySelector("[data-farm-companion-title]"),
    companionCopy: root.querySelector("[data-farm-companion-copy]"),
    companionProgress: root.querySelector("[data-farm-companion-progress]"),
    houseOverlay: root.querySelector("[data-farm-house]"),
    houseRoom: root.querySelector("[data-house-room]"),
    houseAvatar: root.querySelector("[data-house-avatar]"),
    houseFurnitureLayer: root.querySelector("[data-house-furniture-layer]"),
    houseCatalog: root.querySelector("[data-house-catalog]"),
    houseCoins: root.querySelector("[data-house-coins]"),
    houseExterior: root.querySelector("[data-house-exterior]"),
    houseExteriorCopy: root.querySelector("[data-house-exterior-copy]"),
    houseInterior: root.querySelector("[data-house-interior]"),
    houseLevelTrack: root.querySelector("[data-house-level-track]"),
    recipes: root.querySelector("[data-farm-recipes]"),
    fishCodex: root.querySelector("[data-farm-fish-codex]"),
    discoveryCount: root.querySelector("[data-farm-discovery-count]"),
    fishCount: root.querySelector("[data-farm-fish-count]"),
    mapPerk: root.querySelector("[data-farm-map-perk]"),
    tideCard: root.querySelector("[data-farm-tide-card]"),
    tideIcon: root.querySelector("[data-farm-tide-icon]"),
    tideName: root.querySelector("[data-farm-tide-name]"),
    tideTime: root.querySelector("[data-farm-tide-time]"),
    zoomCopy: root.querySelector("[data-farm-zoom-copy]"),
    clock: root.querySelector("[data-farm-clock]"),
    commandButtons: new Map(
      [...root.querySelectorAll("[data-farm-command]")].map((node) => [
        node.dataset.farmCommand,
        node,
      ]),
    ),
    commandCosts: new Map(
      [...root.querySelectorAll("[data-farm-command-cost]")].map((node) => [
        node.dataset.farmCommandCost,
        node,
      ]),
    ),
    commandStates: new Map(
      [...root.querySelectorAll("[data-farm-command-state]")].map((node) => [
        node.dataset.farmCommandState,
        node,
      ]),
    ),
    levelCopy: root.querySelector("[data-farm-level-copy]"),
    levelFill: root.querySelector("[data-farm-level-fill]"),
    valueNodes: new Map(
      [...root.querySelectorAll("[data-farm-value]")].map((node) => [
        node.dataset.farmValue,
        node,
      ]),
    ),
  };

  function currentLevel() {
    return clamp(1 + Math.floor((farm.xp || 0) / 120), 1, 9);
  }

  function addTideCharges(amount, dateKey = todayKey()) {
    const requested = Math.max(0, Number(amount) || 0);
    if (!requested) return { requested: 0, granted: 0, dailyRemaining: 0 };
    const claimed = Math.max(0, Number(farm.tideChargeClaims?.[dateKey]) || 0);
    const dailyRemaining = Math.max(0, TIDE_CHARGE_DAILY_LIMIT - claimed);
    const storageSpace = Math.max(
      0,
      TIDE_CHARGE_STORAGE_LIMIT - (Number(farm.tideCharges) || 0),
    );
    const granted = Math.min(requested, dailyRemaining, storageSpace);
    farm.tideCharges = (Number(farm.tideCharges) || 0) + granted;
    farm.tideChargeClaims[dateKey] = claimed + granted;
    return {
      requested,
      granted,
      dailyRemaining: Math.max(0, dailyRemaining - granted),
      storageRemaining: Math.max(0, storageSpace - granted),
    };
  }

  function learningSnapshot() {
    const metrics = getMetrics?.() || {};
    return {
      tasksCompleted: Number(metrics.totalTasksCompleted) || 0,
      learningDays: Number(metrics.learningDays) || 0,
      focusSessions: Number(metrics.focusSessions) || 0,
      focusMinutes: Number(metrics.focusMinutes) || 0,
      perfectDays: Number(metrics.perfectDays) || 0,
      streak: Number(metrics.streak) || 0,
    };
  }

  function learningRequirementsMet(requirements = {}) {
    const learning = learningSnapshot();
    return (
      learning.perfectDays >= (Number(requirements.perfectDays) || 0) &&
      learning.focusMinutes >= (Number(requirements.focusMinutes) || 0) &&
      learning.learningDays >= (Number(requirements.learningDays) || 0) &&
      learning.streak >= (Number(requirements.streak) || 0)
    );
  }

  function learningRequirementCopy(requirements = {}) {
    return [
      requirements.perfectDays ? `${requirements.perfectDays} 个全清日` : "",
      requirements.focusMinutes ? `${requirements.focusMinutes} 分钟专注` : "",
      requirements.learningDays ? `${requirements.learningDays} 个学习日` : "",
      requirements.streak ? `连续学习 ${requirements.streak} 天` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function storySnapshot() {
    const learning = learningSnapshot();
    const unlockedPlots = farm.plots.filter((plot) => plot.unlocked).length;
    const discovered = Object.values(farm.discoveries || {}).reduce(
      (total, entries) => total + (Array.isArray(entries) ? entries.length : 0),
      0,
    );
    const fishSpecies = Object.values(farm.fishCaught || {}).filter(
      (count) => Number(count) > 0,
    ).length;
    const rareFish = FISH.filter(
      (fish) =>
        ["稀有", "传说"].includes(fish.rarity) &&
        Number(farm.fishCaught?.[fish.id]) > 0,
    ).length;
    const coreCollection =
      discovered >= 9 && fishSpecies >= FISH.length && farm.crafted.length >= 4 ? 1 : 0;
    return {
      ...learning,
      unlockedPlots,
      houseLevel: farm.houseLevel,
      discovered,
      treasures: discovered,
      ordersClaimed: Number(farm.totalOrdersClaimed) || 0,
      manualPlants: Number(farm.manualPlantCount) || 0,
      manualWaters: Number(farm.manualWaterCount) || 0,
      manualHarvests: Number(farm.manualHarvestCount) || 0,
      manualActions:
        (Number(farm.manualPlantCount) || 0) +
        (Number(farm.manualWaterCount) || 0) +
        (Number(farm.manualHarvestCount) || 0),
      unlockedMaps: farm.unlockedMaps.length,
      decorations: farm.decorations.length,
      crafted: farm.crafted.length,
      rareFish,
      coreCollection,
      fullCollection:
        coreCollection && farm.houseLevel >= 3 && farm.decorations.length >= 3 ? 1 : 0,
      farmVisited: farm.farmVisited ? 1 : 0,
    };
  }

  function storyChapterState(chapter, snapshot = storySnapshot()) {
    const claimed = farm.storyClaimed.includes(chapter.id);
    const requirements = (chapter.requirements || []).map((requirement) => {
      const value = Math.max(0, Number(requirement.value(snapshot)) || 0);
      return {
        ...requirement,
        value: Math.min(value, requirement.target),
        rawValue: value,
        met: value >= requirement.target,
      };
    });
    const metCount = requirements.filter((requirement) => requirement.met).length;
    const ready = requirements.length > 0 && metCount === requirements.length;
    const learningReady = requirements
      .filter((requirement) => requirement.learning)
      .every((requirement) => requirement.met);
    const practiceReady = requirements
      .filter((requirement) => !requirement.learning)
      .every((requirement) => requirement.met);
    const activeRequirement =
      requirements.find((requirement) => !requirement.met) || requirements.at(-1) || null;
    return {
      claimed,
      ready: !claimed && ready,
      complete: claimed,
      value: metCount,
      target: requirements.length,
      ratio: requirements.length ? metCount / requirements.length : 0,
      requirements,
      activeRequirement,
      waitingForLearning: !claimed && !ready && practiceReady && !learningReady,
    };
  }

  function currentStory() {
    const snapshot = storySnapshot();
    const index = STORY_CHAPTERS.findIndex((chapter) => {
      const chapterState = storyChapterState(chapter, snapshot);
      return !chapterState.claimed;
    });
    if (index < 0) {
      return {
        chapter: null,
        index: STORY_CHAPTERS.length,
        state: {
          claimed: true,
          ready: false,
          complete: true,
          value: STORY_CHAPTERS.length,
          target: STORY_CHAPTERS.length,
          ratio: 1,
          requirements: [],
          waitingForLearning: false,
        },
        snapshot,
      };
    }
    const chapter = STORY_CHAPTERS[index];
    return {
      chapter,
      index,
      state: storyChapterState(chapter, snapshot),
      snapshot,
    };
  }

  function levelProgress() {
    const level = currentLevel();
    const currentFloor = (level - 1) * 120;
    return level >= 9 ? 100 : clamp(((farm.xp || 0) - currentFloor) / 120, 0, 1) * 100;
  }

  function totalCropCount() {
    return Object.values(farm.crops || {}).reduce(
      (total, count) => total + Math.max(0, Number(count) || 0),
      0,
    );
  }

  function actionCooldownKey(key) {
    return `farm-action:${key}`;
  }

  function actionCooldownRemaining(key, now = Date.now()) {
    const readyAt = Number(farm.actionCooldowns?.[actionCooldownKey(key)]) || 0;
    return Math.max(0, readyAt - now);
  }

  function markActionCooldown(key) {
    const rule = FARM_ACTION_RULES[key];
    if (!rule) return;
    farm.actionCooldowns[actionCooldownKey(key)] = Date.now() + rule.cooldown;
  }

  function actionIsCooling(key) {
    const rule = FARM_ACTION_RULES[key];
    if (!rule) return false;
    const remaining = actionCooldownRemaining(key);
    if (remaining <= 0) return false;
    showToast({
      title: `${rule.label}尚未恢复`,
      message: `还需要等待 ${formatDuration(remaining)}。`,
      icon: "timer",
    });
    return true;
  }

  function readyPlots() {
    return farm.plots.filter((plot) => plot.unlocked && plotIsReady(plot));
  }

  function growingPlots() {
    return farm.plots.filter((plot) => plot.unlocked && plotIsGrowing(plot));
  }

  function plotDuration(plot) {
    const crop = getCrop(plot.cropId);
    if (!crop) return 0;
    const reduction = plot.watered
      ? clamp(Number(plot.waterReduction) || 0.06, 0, 0.12)
      : 0;
    const wateredMultiplier = 1 - reduction;
    return crop.growMs * wateredMultiplier * cropGrowthMultiplier();
  }

  function plotHarvestYield(plot) {
    const crop = getCrop(plot.cropId);
    if (!crop) return 0;
    return crop.yield;
  }

  function plotQualityChance() {
    const map = activeFarmMap();
    const mapChance = map.id === "coral-terrace" ? 0.12 : map.id === "moon-bay" ? 0.08 : 0.05;
    return clamp(
      mapChance +
        (recipeIsCrafted("coral-charm") ? 0.09 : 0) +
        (mapHasPerk("tide-meadow") ? 0.01 : 0),
      0,
      0.3,
    );
  }

  function plotIsGrowing(plot) {
    return Boolean(plot.cropId && plot.plantedAt);
  }

  function plotIsReady(plot) {
    const crop = getCrop(plot.cropId);
    if (!crop || !plot.plantedAt) return false;
    return Date.now() - plot.plantedAt >= plotDuration(plot);
  }

  function plotProgress(plot) {
    const crop = getCrop(plot.cropId);
    if (!crop || !plot.plantedAt) return 0;
    const duration = plotDuration(plot);
    return clamp((Date.now() - plot.plantedAt) / duration, 0, 1);
  }

  function plotRemaining(plot) {
    if (!plot.cropId || !plot.plantedAt) return 0;
    const duration = plotDuration(plot);
    return Math.max(0, duration - (Date.now() - plot.plantedAt));
  }

  function plotMaturityTime(plot) {
    if (!plot.cropId || !plot.plantedAt) return null;
    return new Date(plot.plantedAt + plotDuration(plot));
  }

  function formatClockTime(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--:--";
    return new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function persistSoon() {
    farm.updatedAt = Date.now();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(inspectMode ? () => {} : saveState, 120);
  }

  function refreshIcons() {
    window.lucide?.createIcons({
      attrs: {
        "stroke-width": 1.7,
      },
    });
  }

  function buildDailyOrder(dateKey) {
    const seed = hashText(dateKey);
    const count = 2 + (seed % 2);
    return Array.from({ length: count }, (_, index) => ({
      ...ORDER_POOL[(seed + index * 3) % ORDER_POOL.length],
      id: `${dateKey}-${index + 1}`,
      date: dateKey,
      claimed: false,
    }));
  }

  function ensureDailyOrder() {
    const dateKey = todayKey();
    if (
      !Array.isArray(farm.orders) ||
      !farm.orders.length ||
      farm.orders.some((order) => order.date !== dateKey)
    ) {
      farm.orders = buildDailyOrder(dateKey);
      persistSoon();
    }
    return farm.orders;
  }

  function setAction(action) {
    const nextAction = ACTION_ROWS[action] === undefined ? "idle" : action;
    if (activeAction !== nextAction) {
      activeAction = nextAction;
      actionFrame = 0;
      updateSprite();
    }
    window.clearTimeout(actionTimer);
    if (nextAction !== "idle" && nextAction !== "walk") {
      actionTimer = window.setTimeout(() => {
        setAction("idle");
      }, 1150);
    }
  }

  function updateSprite() {
    const character = selectedFarmCharacter();
    const form = characterForm();
    const frames = characterIdleFrames(character, form);
    const frameIndex =
      activeAction === "idle"
        ? actionFrame % frames.length
        : Math.min(actionFrame, frames.length - 1);
    const safeIndex = Math.max(0, frameIndex);
    const idleSprite =
      form === "cute" && !useMobileAssets ? character.idleSprite : "";
    if (idleSprite) {
      const key = `${character.id}:${form}:sprite:${idleSprite}`;
      if (avatarSpriteKey !== key) {
        clearAvatarIdleCanvas();
        clearAvatarSpriteStack();
        avatarSpriteKey = key;
        elements.avatarSprite.classList.remove("is-visible");
        preloadIdleSprite(idleSprite).then((image) => {
          if (character.id !== selectedFarmCharacter().id || form !== characterForm()) {
            return;
          }
          if (!mountAvatarIdleCanvas(image, character, form)) {
            elements.avatarSprite.src = frames[0] || characterArt(character, form);
            elements.avatarSprite.classList.add("is-visible");
          }
        });
      }
    } else if (frames.length > 1) {
      clearAvatarIdleCanvas();
      const key = `${character.id}:${form}:${frames.join("|")}`;
      if (avatarSpriteKey !== key) {
        elements.avatarSprite.src = frames[safeIndex];
        elements.avatarSprite.classList.add("is-visible");
        preloadIdleFrames(frames).then((images) => {
          if (character.id !== selectedFarmCharacter().id || form !== characterForm()) return;
          mountAvatarSpriteStack(frames, images, character, form);
          showAvatarSpriteFrame(safeIndex);
        });
      } else {
        showAvatarSpriteFrame(safeIndex);
      }
    } else {
      clearAvatarIdleCanvas();
      if (avatarSpriteKey || avatarSpriteLayers.length > 1) {
        clearAvatarSpriteStack();
      }
      elements.avatarSprite.src = frames[0] || characterArt(character, form);
      elements.avatarSprite.classList.add("is-visible");
    }
    elements.avatarSprite.alt = `${character.name}${characterForm()}形态`;
    elements.avatar.dataset.action = activeAction;
    elements.avatar.dataset.form = characterForm();
    elements.avatar.dataset.character = character.id;
    elements.avatar.classList.toggle("is-walking", activeAction === "walk");
  }

  function positionAvatar() {
    elements.avatar.style.left = `${farm.avatar.x}px`;
    elements.avatar.style.top = `${farm.avatar.y}px`;
    elements.avatar.classList.toggle("is-facing-left", farm.avatar.flip < 0);
    elements.avatar.dataset.form = characterForm();
  }

  function avatarTravel() {
    return TERRAIN_TRAVEL[avatarTerrainType] || TERRAIN_TRAVEL.ground;
  }

  function renderTerrainChip() {
    if (!elements.terrainChip || !elements.terrainLabel) return;
    const travel = avatarTravel();
    elements.terrainChip.dataset.terrain = travel.mode;
    if (elements.terrainLabel.textContent !== travel.label) {
      elements.terrainLabel.textContent = travel.label;
    }
    const icon = elements.terrainChip.querySelector("i");
    if (icon && icon.getAttribute("data-lucide") !== travel.icon) {
      icon.setAttribute("data-lucide", travel.icon);
      refreshIcons();
    }
  }

  // 记录当前所处地形：行走 / 游泳 / 攀爬，形态动画接入后直接读取这个状态。
  function setAvatarTerrain(type) {
    const next = TERRAIN_TRAVEL[type] ? type : "ground";
    const changed = avatarTerrainType !== next;
    avatarTerrainType = next;
    const mode = TERRAIN_TRAVEL[next].mode;
    if (elements.avatar.dataset.terrain !== mode) {
      elements.avatar.dataset.terrain = mode;
    }
    if (changed) renderTerrainChip();
    return mode;
  }

  // QA 模式下把地形分区叠加到地图上，方便核对范围。
  function renderTerrainDebug() {
    const canvas = elements.terrainCanvas;
    if (!canvas) return;
    if (inspectMode !== "terrain") {
      canvas.hidden = true;
      return;
    }
    canvas.hidden = false;
    const map = activeFarmMap();
    if (canvas.width !== map.worldWidth || canvas.height !== map.worldHeight) {
      canvas.width = map.worldWidth;
      canvas.height = map.worldHeight;
    }
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 4;
    (map.terrainZones || []).forEach((zone) => {
      const palette = {
        water: { fill: "rgba(58, 146, 255, 0.28)", stroke: "rgba(126, 200, 255, 0.85)" },
        cliff: { fill: "rgba(255, 176, 74, 0.3)", stroke: "rgba(255, 214, 140, 0.85)" },
        waterfall: { fill: "rgba(255, 96, 186, 0.34)", stroke: "rgba(255, 170, 220, 0.9)" },
      }[zone.type];
      if (!palette) return;
      context.beginPath();
      if (zone.shape === "rect") {
        context.rect(zone.minX, zone.minY, zone.maxX - zone.minX, zone.maxY - zone.minY);
      } else if (zone.shape === "ellipse") {
        context.ellipse(zone.cx, zone.cy, zone.rx, zone.ry, 0, 0, Math.PI * 2);
      } else {
        zone.points.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.closePath();
      }
      context.fillStyle = palette.fill;
      context.strokeStyle = palette.stroke;
      context.fill();
      context.stroke();
    });
  }

  function moveAvatarTo(x, y, nextAction = "idle", onArrive = null) {
    const map = activeFarmMap();
    const targetX = clamp(x, 65, map.worldWidth - 65);
    const targetY = clamp(y, 90, map.worldHeight - 70);
    if (!pointIsUnlocked(targetX, targetY, map)) {
      notifyAreaLocked();
      setAction("idle");
      return false;
    }
    const startX = farm.avatar.x;
    const startY = farm.avatar.y;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const distance = Math.hypot(deltaX, deltaY);
    const travel = TERRAIN_TRAVEL[terrainAlongPath(map, startX, startY, targetX, targetY)];

    window.cancelAnimationFrame(motionFrame);
    if (distance < 0.7) {
      setAvatarTerrain(terrainAt(map, targetX, targetY));
      setAction(nextAction);
      centerCameraOn(farm.avatar.x, farm.avatar.y, map, false);
      onArrive?.();
      return true;
    }

    farm.avatar.flip = deltaX < 0 ? -1 : 1;
    setAvatarTerrain(terrainAt(map, startX, startY));
    setAction(travel.mode);
    const startedAt = performance.now();
    const duration = clamp(distance * travel.speed, 260, travel.maxDuration);

    const step = (now) => {
      const progress = clamp((now - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      farm.avatar.x = startX + deltaX * eased;
      farm.avatar.y = startY + deltaY * eased;
      positionAvatar();
      centerCameraOn(farm.avatar.x, farm.avatar.y, map, false);
      // 移动途中按脚下地形实时切换形态，跨水会自动转入游泳。
      const stepTerrain = terrainAt(map, farm.avatar.x, farm.avatar.y);
      const stepMode = setAvatarTerrain(stepTerrain);
      if (stepMode !== activeAction) setAction(stepMode);

      if (progress < 1) {
        motionFrame = window.requestAnimationFrame(step);
        return;
      }

      farm.avatar.x = targetX;
      farm.avatar.y = targetY;
      positionAvatar();
      setAvatarTerrain(terrainAt(map, targetX, targetY));
      setAction(nextAction);
      persistSoon();
      onArrive?.();
    };

    motionFrame = window.requestAnimationFrame(step);
    return true;
  }

  function moveToPlot(plot, action = "idle", onArrive = null) {
    moveAvatarTo(plot.x, plot.y + 58, action, onArrive);
  }

  function selectedSeed() {
    return getCrop(farm.selectedSeedId) || CROPS[0];
  }

  function plantPlot(plot) {
    if (!plot.unlocked) {
      showToast({
        title: "这块田还没有扩建",
        message: "先收获作物换取海币，再从右侧扩建下一块田地。",
        icon: "fence",
      });
      return false;
    }

    if (plot.cropId) return false;
    const crop = selectedSeed();
    const seedCount = Number(farm.seeds[crop.id]) || 0;
    if (seedCount <= 0) {
      showToast({
        title: "这种种子已经用完",
        message: "完成学习任务获得潮矿，再到商栈换取新种子。",
        icon: "package-open",
      });
      return false;
    }

    farm.seeds[crop.id] = seedCount - 1;
    plot.cropId = crop.id;
    plot.plantedAt = Date.now();
    plot.watered = false;
    plot.waterReduction = 0;
    plot.readyNotified = false;
    farm.selectedPlotId = plot.id;
    farm.manualPlantCount = (Number(farm.manualPlantCount) || 0) + 1;
    moveToPlot(plot, "idle");
    persistSoon();
    refresh();
    showToast({
      title: `${crop.name}已经播下`,
      message: `预计 ${formatClockTime(plotMaturityTime(plot))} 成熟；单块浇水可缩短 6%。`,
      tone: "success",
      icon: "sprout",
    });
    return true;
  }

  function waterPlot(plot) {
    if (!plot.unlocked || !plotIsGrowing(plot) || plotIsReady(plot)) return false;
    if (plot.watered) {
      showToast({
        title: "这片田已经喝饱潮水",
        message: `还需要 ${formatDuration(plotRemaining(plot))}。`,
        icon: "droplets",
      });
      moveToPlot(plot, "water");
      return false;
    }

    plot.watered = true;
    plot.waterReduction = 0.06;
    farm.manualWaterCount = (Number(farm.manualWaterCount) || 0) + 1;
    moveToPlot(plot, "water");
    persistSoon();
    refresh();
    showToast({
      title: "潮水浸润了根系",
      message: `已缩短 6% · 预计 ${formatClockTime(plotMaturityTime(plot))} 成熟。`,
      tone: "success",
      icon: "waves",
    });
    return true;
  }

  function collectPlotHarvest(plot, manual = true) {
    if (!plot.unlocked || !plotIsReady(plot)) return false;
    const crop = getCrop(plot.cropId);
    if (!crop) return false;
    const amount = plotHarvestYield(plot);
    const qualityCount = Math.random() < plotQualityChance() ? amount : 0;
    farm.crops[crop.id] = (Number(farm.crops[crop.id]) || 0) + amount;
    if (qualityCount) {
      farm.cropQuality[crop.id] =
        (Number(farm.cropQuality[crop.id]) || 0) + qualityCount;
    }
    farm.xp = (Number(farm.xp) || 0) + 8;
    farm.totalHarvests = (Number(farm.totalHarvests) || 0) + 1;
    if (manual) {
      farm.manualHarvestCount = (Number(farm.manualHarvestCount) || 0) + 1;
    }
    const dateKey = todayKey();
    farm.dailyHarvestCounts[dateKey] =
      (Number(farm.dailyHarvestCounts[dateKey]) || 0) + amount;
    farm.lastMaturityAt = Date.now();
    const returnsSeed = qualityCount > 0 && Math.random() < 0.03;
    if (returnsSeed) {
      farm.seeds[crop.id] = (Number(farm.seeds[crop.id]) || 0) + 1;
    }
    plot.cropId = null;
    plot.plantedAt = null;
    plot.watered = false;
    plot.waterReduction = 0;
    plot.readyNotified = false;
    return { crop, amount, qualityCount, returnsSeed };
  }

  function harvestPlot(plot) {
    const result = collectPlotHarvest(plot);
    if (!result) return false;
    moveToPlot(plot, "harvest");
    persistSoon();
    refresh();
    showToast({
      title: `收获 ${result.amount} 份${result.crop.name}`,
      message: `${
        result.qualityCount
          ? `其中 ${result.qualityCount} 份为高品质；`
          : ""
      }${result.returnsSeed ? `稀有种子回收 1 份；` : ""}普通回收价 ${result.crop.sellPrice} 海币，委托价 ${result.crop.commissionPrice} 海币。`,
      tone: "success",
      icon: "shopping-basket",
    });
    return true;
  }

  function activatePlot(plotId) {
    const plot = farm.plots.find((item) => item.id === Number(plotId));
    if (!plot) return;
    if (!plot.unlocked) {
      notifyAreaLocked(`田地 ${plot.id + 1}`);
      return;
    }
    farm.selectedPlotId = plot.id;
    plotMenuReady = false;
    persistSoon();
    refresh();
    moveToPlot(plot, "idle", () => {
      if (farm.selectedPlotId !== plot.id) return;
      plotMenuReady = true;
      refresh();
      window.requestAnimationFrame(() => {
        elements.plotInspector
          ?.querySelector('[data-plot-action="plant"]:not(:disabled), [data-plot-action="water"]:not(:disabled), [data-plot-action="harvest"]:not(:disabled)')
          ?.focus();
      });
    });
  }

  function performPlotAction(action) {
    if (!plotMenuReady) return false;
    const plot = farm.plots.find((item) => item.id === Number(farm.selectedPlotId));
    if (!plot) return false;
    if (actionIsCooling(action)) return false;
    const changed =
      action === "plant"
        ? plantPlot(plot)
        : action === "harvest"
          ? harvestPlot(plot)
          : action === "water"
            ? waterPlot(plot)
            : false;
    if (changed) {
      markActionCooldown(action);
      refresh();
    }
    return changed;
  }

  function closePlotMenu() {
    plotMenuReady = false;
    farm.selectedPlotId = null;
    persistSoon();
    refresh();
  }

  function batchPlant() {
    if (!batchUnlocked("plant")) {
      showBatchLockState("plant");
      return;
    }
    if (actionIsCooling("batchPlant")) return;
    const plan = batchPlan("plant");
    if (!plan.count) {
      const crop = plan.crop;
      const hasEmptyPlot = farm.plots.some((plot) => plot.unlocked && !plot.cropId);
      showToast({
        title: hasEmptyPlot ? `${crop.name}种子不足` : "所有开放田地都已播种",
        message: hasEmptyPlot
          ? `一键播种仍按每块田消耗 1 份${crop.name}种子，可完成学习任务换取潮矿后购买。`
          : "等待成熟、使用一键浇水，或者扩建一块新田。",
        icon: hasEmptyPlot ? "package-open" : "calendar-clock",
      });
      return;
    }
    if (!plan.affordable) {
      showToast({
        title: "一键播种资源不足",
        message: plan.missingCopy,
        tone: "danger",
        icon: "gem",
      });
      return;
    }

    const now = Date.now();
    farm.materials -= plan.cost.materials;
    farm.tideCharges -= plan.cost.tideCharges;
    farm.seeds[plan.crop.id] = Math.max(
      0,
      (Number(farm.seeds[plan.crop.id]) || 0) - plan.count,
    );
    plan.plots.forEach((plot, index) => {
      plot.cropId = plan.crop.id;
      plot.plantedAt = now + index;
      plot.watered = false;
      plot.waterReduction = 0;
      plot.readyNotified = false;
    });
    farm.selectedPlotId = plan.plots[0].id;
    markActionCooldown("batchPlant");
    moveToPlot(plan.plots[0], "idle");
    persistSoon();
    refresh();
    showToast({
      title: `一键播下 ${plan.count} 块田`,
      message: `消耗 ${plan.count} 份${plan.crop.name}种子、${plan.cost.materials} 潮矿与 ${plan.cost.tideCharges} 潮汛；不增加产量。`,
      tone: "success",
      icon: "sprout",
    });
  }

  function batchWater() {
    if (!batchUnlocked("water")) {
      showBatchLockState("water");
      return;
    }
    if (actionIsCooling("batchWater")) return;
    const plan = batchPlan("water");
    if (!plan.count) {
      showToast({
        title: "当前没有可浇水的作物",
        message: "先播种；已经浇过水的作物需要等待这一轮成长完成。",
        icon: "droplets",
      });
      return;
    }
    if (!plan.affordable) {
      showToast({
        title: "一键浇水资源不足",
        message: plan.missingCopy,
        tone: "danger",
        icon: "gem",
      });
      return;
    }

    farm.materials -= plan.cost.materials;
    farm.tideCharges -= plan.cost.tideCharges;
    plan.plots.forEach((plot) => {
      plot.watered = true;
      plot.waterReduction = 0.04;
    });
    markActionCooldown("batchWater");
    moveToPlot(plan.plots[0], "water");
    persistSoon();
    refresh();
    showToast({
      title: `潮润 ${plan.count} 块田`,
      message: `消耗 ${plan.cost.materials} 潮矿与 ${plan.cost.tideCharges} 潮汛，本轮成长时间统一缩短 4%。`,
      tone: "success",
      icon: "waves",
    });
  }

  function batchHarvest() {
    if (!batchUnlocked("harvest")) {
      showBatchLockState("harvest");
      return;
    }
    if (actionIsCooling("batchHarvest")) return;
    const plan = batchPlan("harvest");
    if (!plan.count) {
      showToast({
        title: "还没有成熟作物",
        message: "成长中的作物会在提示条上显示剩余时间。",
        icon: "timer",
      });
      return;
    }
    if (!plan.affordable) {
      showToast({
        title: "一键收获资源不足",
        message: plan.missingCopy,
        tone: "danger",
        icon: "circle-dollar-sign",
      });
      return;
    }

    farm.coins -= plan.cost.coins;
    farm.tideCharges -= plan.cost.tideCharges;
    const summary = plan.plots.reduce(
      (result, plot) => {
        const harvested = collectPlotHarvest(plot, false);
        if (!harvested) return result;
        result.total += harvested.amount;
        result.quality += harvested.qualityCount;
        result.seedReturns += harvested.returnsSeed ? 1 : 0;
        const record = result.crops.get(harvested.crop.id) || {
          crop: harvested.crop,
          amount: 0,
        };
        record.amount += harvested.amount;
        result.crops.set(harvested.crop.id, record);
        return result;
      },
      { total: 0, quality: 0, seedReturns: 0, crops: new Map() },
    );
    if (!summary.total) {
      farm.coins += plan.cost.coins;
      farm.tideCharges += plan.cost.tideCharges;
      return;
    }

    markActionCooldown("batchHarvest");
    moveToPlot(plan.plots[0], "harvest");
    persistSoon();
    refresh();
    const cropCopy = [...summary.crops.values()]
      .map((record) => `${record.crop.name} ${record.amount}`)
      .join("、");
    showToast({
      title: `一次收下 ${summary.total} 份作物`,
      message: `${cropCopy} 已进入潮种仓，消耗 ${plan.cost.coins} 海币与 ${plan.cost.tideCharges} 潮汛${summary.quality ? `，其中 ${summary.quality} 份为高品质` : ""}。一键收获不提高产量。`,
      tone: "success",
      icon: "package-check",
    });
  }

  function useTideCharge() {
    if (actionIsCooling("charge")) return;
    if (farm.tideCharges <= 0) {
      showToast({
        title: "潮汛能量尚未积蓄",
        message: "完成当日全部任务，可以获得 1 次潮汛催生。",
        icon: "zap",
      });
      return;
    }
    const plot = growingPlots().find((item) => !plotIsReady(item));
    if (!plot) {
      showToast({
        title: "当前没有需要催生的作物",
        message: "先播种一块田，再使用潮汛能量。",
        icon: "sprout",
      });
      return;
    }
    farm.tideCharges -= 1;
    const crop = getCrop(plot.cropId);
    const duration = plotDuration(plot);
    plot.plantedAt = Date.now() - duration;
    markActionCooldown("charge");
    moveToPlot(plot, "water");
    persistSoon();
    refresh();
    showToast({
      title: `${crop.name}瞬间成熟`,
      message: "潮汛能量已经转化为这一季的收成。",
      tone: "success",
      icon: "wand-sparkles",
    });
  }

  function buySeed(cropId) {
    const crop = getCrop(cropId);
    if (!crop) return;
    if (farm.materials < crop.seedCost) {
      showToast({
        title: "潮矿不足",
        message: `购买 ${crop.name}种子还需要 ${crop.seedCost - farm.materials} 单位潮矿。`,
        tone: "danger",
        icon: "gem",
      });
      return;
    }
    farm.materials -= crop.seedCost;
    farm.seeds[crop.id] = (Number(farm.seeds[crop.id]) || 0) + 1;
    farm.selectedSeedId = crop.id;
    persistSoon();
    refresh();
    showToast({
      title: `购入 1 份${crop.name}种子`,
      message: `当前持有 ${farm.seeds[crop.id]} 份。`,
      tone: "success",
      icon: "shopping-basket",
    });
  }

  function consumeCropUnits(cropId, amount) {
    const total = Number(farm.crops[cropId]) || 0;
    const quality = Math.min(Number(farm.cropQuality[cropId]) || 0, total);
    const normal = Math.max(0, total - quality);
    const normalUsed = Math.min(normal, amount);
    const qualityUsed = Math.min(quality, amount - normalUsed);
    farm.crops[cropId] = Math.max(0, total - amount);
    farm.cropQuality[cropId] = Math.max(0, quality - qualityUsed);
    return { normalUsed, qualityUsed };
  }

  function sellCrop(cropId, sellAll = false) {
    const crop = getCrop(cropId);
    const count = Number(farm.crops[cropId]) || 0;
    if (!crop || count <= 0) return;
    if (farm.tideCharges < 1) {
      showToast({
        title: "潮汛不足，无法变现",
        message: "普通回收与学习委托都必须消耗 1 次潮汛；潮汛只能通过学习获得。",
        tone: "danger",
        icon: "waves",
      });
      return;
    }
    const amount = sellAll ? count : 1;
    const units = consumeCropUnits(cropId, amount);
    const income =
      units.normalUsed * crop.sellPrice +
      units.qualityUsed * Math.ceil(crop.sellPrice * 1.5);
    farm.tideCharges -= 1;
    farm.coins += income;
    farm.xp += amount * 2;
    persistSoon();
    refresh();
    showToast({
      title: `售出 ${amount} 份${crop.name}`,
      message: `获得 ${income} 枚海币，消耗 1 次潮汛。`,
      tone: "success",
      icon: "badge-dollar-sign",
    });
  }

  function sellAllCrops() {
    if (totalCropCount() <= 0) {
      showToast({
        title: "仓里还没有可售作物",
        message: "成熟后点击田地收获，再到商栈出售。",
        icon: "package-open",
      });
      return;
    }
    if (farm.tideCharges < 1) {
      showToast({
        title: "潮汛不足，无法变现",
        message: "每次回收操作消耗 1 次潮汛，完成后一次只能处理一次出售。",
        tone: "danger",
        icon: "waves",
      });
      return;
    }
    let income = 0;
    let sold = 0;
    CROPS.forEach((crop) => {
      const count = Number(farm.crops[crop.id]) || 0;
      if (count <= 0) return;
      const units = consumeCropUnits(crop.id, count);
      income +=
        units.normalUsed * crop.sellPrice +
        units.qualityUsed * Math.ceil(crop.sellPrice * 1.5);
      sold += count;
      farm.xp += count * 2;
    });
    farm.tideCharges -= 1;
    farm.coins += income;
    persistSoon();
    refresh();
    showToast({
      title: `售出 ${sold} 份作物`,
      message: `获得 ${income} 枚海币，消耗 1 次潮汛。`,
      tone: "success",
      icon: "circle-dollar-sign",
    });
  }

  function discoverTreasure(treasureId) {
    const map = activeFarmMap();
    const treasure = map.treasures.find((item) => item.id === treasureId);
    if (!treasure) return;
    if (!pointIsUnlocked(treasure.x, treasure.y, map)) {
      notifyAreaLocked(treasure.name);
      return;
    }
    if (farm.discoveries[map.id].includes(treasure.id)) {
      showToast({
        title: `${treasure.name}已经收录`,
        message: "这件遗物已经陈列在鲸梦小屋的藏品柜里。",
        icon: "package-check",
      });
      return;
    }

    const rewards = [
      { relicMaterial: 1, xp: 18 },
      { relicMaterial: 2, xp: 24 },
      { relicMaterial: 2, xp: 32 },
    ];
    const reward = rewards[farm.discoveries[map.id].length % rewards.length];
    farm.discoveries[map.id].push(treasure.id);
    farm.relicMaterials[treasure.id] =
      (Number(farm.relicMaterials[treasure.id]) || 0) + reward.relicMaterial;
    farm.npcFavor.lanyin = (Number(farm.npcFavor.lanyin) || 0) + 1;
    farm.xp += reward.xp;
    moveAvatarTo(treasure.x, treasure.y + 42, "harvest");
    persistSoon();
    refresh();
    showToast({
      title: `发现 ${treasure.name}`,
      message: `遗物进入收藏，获得 ${reward.relicMaterial} 份家具材料、澜音好感 +1 与 ${reward.xp} 经验。`,
      tone: "success",
      icon: treasure.icon,
    });
  }

  function fishingReady() {
    return Boolean(
      farm.fishing &&
        Date.now() >= Number(farm.fishing.readyAt || 0),
    );
  }

  function castLine(spotId) {
    if (actionIsCooling("fishing")) return;
    const map = activeFarmMap();
    const spot = map.fishSpots.find((item) => item.id === spotId);
    if (!spot) return;
    if (!pointIsUnlocked(spot.x, spot.y, map)) {
      notifyAreaLocked(spot.name);
      return;
    }
    if (farm.fishing?.mapId === map.id && farm.fishing.spotId === spot.id) {
      if (fishingReady()) {
        reelLine(spot);
      } else {
        const remaining = Math.max(0, Number(farm.fishing.readyAt) - Date.now());
        showToast({
          title: "浮漂正在随潮水起伏",
          message: `${formatDuration(remaining)} 后会出现咬钩提示。`,
          icon: "fish-symbol",
        });
      }
      return;
    }

    if (farm.fishing && farm.fishing.mapId !== map.id) {
      showToast({
        title: "另一张海图的鱼线还没有收起",
        message: "先回到抛竿的海图完成收线。",
        icon: "fish-off",
      });
      return;
    }

    const duration = fishingDuration();
    farm.fishing = {
      mapId: map.id,
      spotId: spot.id,
      castAt: Date.now(),
      readyAt: Date.now() + duration,
      readyNotified: false,
    };
    moveAvatarTo(spot.x, spot.y + 48, "water");
    persistSoon();
    refresh();
    showToast({
      title: `在${spot.name}抛下鱼线`,
      message: `等待约 ${formatDuration(duration)}，浮漂动时再次点击收线。`,
      tone: "success",
      icon: "fish-symbol",
    });
  }

  function chooseFish(map) {
    const available = FISH.filter((fish) => fish.maps.includes(map.id));
    const rareBoost =
      (map.id === "moon-bay" ? 0.12 : 0) + (recipeIsCrafted("moon-net") ? 0.16 : 0);
    const weighted = available.flatMap((fish) => {
      const base = fish.rarity === "传说" ? 1 : fish.rarity === "稀有" ? 3 : fish.rarity === "珍稀" ? 7 : 13;
      const weight = Math.max(1, Math.round(base * (1 + rareBoost * (fish.sellPrice / 50))));
      return Array.from({ length: weight }, () => fish);
    });
    return weighted[Math.floor(Math.random() * weighted.length)] || available[0];
  }

  function reelLine(spot) {
    if (!farm.fishing || farm.fishing.spotId !== spot.id || !fishingReady()) return;
    const fish = chooseFish(activeFarmMap());
    farm.fish[fish.id] = (Number(farm.fish[fish.id]) || 0) + 1;
    farm.fishCaught[fish.id] = (Number(farm.fishCaught[fish.id]) || 0) + 1;
    farm.xp += fish.rarity === "传说" ? 32 : fish.rarity === "稀有" ? 20 : 12;
    farm.fishing = null;
    markActionCooldown("fishing");
    persistSoon();
    refresh();
    showToast({
      title: `钓获 ${fish.name}`,
      message: `${fish.rarity}海物 · 已收入图鉴，可通过好感与工坊继续收藏。`,
      tone: "success",
      icon: "fish-symbol",
    });
  }

  function sellFish(fishId, sellAll = false) {
    const fish = FISH_LOOKUP.get(fishId);
    const count = Number(farm.fish[fishId]) || 0;
    if (!fish || count <= 0) return;
    if (["稀有", "传说"].includes(fish.rarity)) {
      showToast({
        title: `${fish.name}只进入收藏`,
        message: "稀有鱼与传说鱼用于图鉴、NPC 好感和家具材料，不直接兑换大量海币。",
        icon: "book-marked",
      });
      return;
    }
    if (farm.tideCharges < 1) {
      showToast({
        title: "潮汛不足，无法出售海物",
        message: "每次变现都要消耗 1 次潮汛，潮汛只能通过学习获得。",
        tone: "danger",
        icon: "waves",
      });
      return;
    }
    const amount = sellAll ? count : 1;
    farm.fish[fishId] = count - amount;
    farm.tideCharges -= 1;
    farm.coins += fish.sellPrice * amount;
    farm.xp += amount * 3;
    persistSoon();
    refresh();
    showToast({
      title: `售出 ${amount} 尾${fish.name}`,
      message: `获得 ${fish.sellPrice * amount} 枚海币，消耗 1 次潮汛。`,
      tone: "success",
      icon: "badge-dollar-sign",
    });
  }

  function recipeCanAfford(recipe) {
    if (
      farm.materials < (recipe.cost.materials || 0) ||
      farm.coins < (recipe.cost.coins || 0) ||
      farm.tideCharges < (recipe.cost.tideCharges || 0) ||
      !learningRequirementsMet(recipe.learning)
    ) {
      return false;
    }
    return Object.entries(recipe.cost.crops || {}).every(
      ([cropId, amount]) => (Number(farm.crops[cropId]) || 0) >= amount,
    ) && Object.entries(recipe.cost.fish || {}).every(
      ([fishId, amount]) => (Number(farm.fish[fishId]) || 0) >= amount,
    );
  }

  function craftRecipe(recipeId) {
    const recipe = RECIPE_LOOKUP.get(recipeId);
    if (!recipe || recipeIsCrafted(recipe.id)) return;
    if (!recipeCanAfford(recipe)) {
      showToast({
        title: `${recipe.name}的材料还不够`,
        message: "继续种植、钓鱼或在海图中寻找宝藏。",
        tone: "danger",
        icon: "lock-keyhole",
      });
      return;
    }
    farm.materials -= recipe.cost.materials || 0;
    farm.coins -= recipe.cost.coins || 0;
    farm.tideCharges -= recipe.cost.tideCharges || 0;
    Object.entries(recipe.cost.crops || {}).forEach(([cropId, amount]) => {
      farm.crops[cropId] = Math.max(0, (Number(farm.crops[cropId]) || 0) - amount);
    });
    Object.entries(recipe.cost.fish || {}).forEach(([fishId, amount]) => {
      farm.fish[fishId] = Math.max(0, (Number(farm.fish[fishId]) || 0) - amount);
    });
    farm.crafted.push(recipe.id);
    farm.xp += 54;
    const housePoint = activeFarmMap().anchors.house;
    moveAvatarTo(housePoint.x, housePoint.y + 58, "harvest", () => pulseStage());
    persistSoon();
    refresh();
    showToast({
      title: `${recipe.name}已经完成`,
      message: recipe.description,
      tone: "success",
      icon: recipe.icon,
    });
  }

  function expansionCost() {
    const map = activeFarmMap();
    const unlockedCount = farm.plots.filter((plot) => plot.unlocked).length;
    return map.baseCost + Math.max(0, unlockedCount - map.startUnlocked) * map.stepCost;
  }

  function upgradeLand() {
    const nextPlot = nextLandPlot();
    if (!nextPlot) {
      showToast({
        title: `${activeFarmMap().name}已经全部开放`,
        message: nextLockedMap()
          ? "在右侧开启下一张海图，进入新的农场场景。"
          : "所有海图都已经完成。",
        tone: "success",
        icon: "map-check",
      });
      return;
    }
    const cost = expansionCost();
    if (farm.coins < cost) {
      showToast({
        title: "海币不足",
        message: `扩建下一块田还需要 ${cost - farm.coins} 枚海币。`,
        tone: "danger",
        icon: "circle-dollar-sign",
      });
      return;
    }
    farm.coins -= cost;
    nextPlot.unlocked = true;
    const position = activeFarmMap().positions[nextPlot.id];
    nextPlot.x = position.x;
    nextPlot.y = position.y;
    moveAvatarTo(nextPlot.x, nextPlot.y, "idle", () => pulseStage());
    persistSoon();
    refresh();
    showToast({
      title: "新田地已经归入农场",
      message: mapIsCleared(activeFarmMap().id)
        ? "整张海图已经全部开放，可以开启下一张地图。"
        : "现在可以在新的地块播种。",
      tone: "success",
      icon: mapIsCleared(activeFarmMap().id) ? "map-check" : "fence",
    });
  }

  function unlockNextMap() {
    const stateMap = activeFarmMap();
    const nextMap = nextLockedMap();
    if (!nextMap) {
      showToast({
        title: "所有海图已经抵达",
        message: "继续经营、装修与收集典藏即可。",
        tone: "success",
        icon: "map-check",
      });
      return;
    }
    const unlockStatus = mapUnlockStatus(nextMap);
    if (!unlockStatus.previousMapCleared) {
      showToast({
        title: "前置海图尚未完整开放",
        message: `开启${nextMap.name}前，需要先开放${unlockStatus.previousMap.name}全部 ${unlockStatus.previousPlotCount} 块田地（已开放 ${unlockStatus.previousUnlockedPlotCount} / ${unlockStatus.previousPlotCount}）。`,
        tone: "danger",
        icon: "fence",
      });
      return;
    }
    if (!unlockStatus.levelMet) {
      showToast({
        title: "潮栖等级不足",
        message: `开启${nextMap.name}需要潮栖 ${unlockStatus.requiredLevel} 级，当前为 ${unlockStatus.level} 级。`,
        tone: "danger",
        icon: "badge-check",
      });
      return;
    }
    if (!unlockStatus.learningMet) {
      showToast({
        title: "等待学习回响",
        message: `${nextMap.name}还需要 ${learningRequirementCopy(unlockStatus.requirements)}。`,
        tone: "danger",
        icon: "lock-keyhole",
      });
      return;
    }
    if (!unlockStatus.coinsMet) {
      showToast({
        title: "海币不足",
        message: `开启${nextMap.name}还需要 ${unlockStatus.gateCost - unlockStatus.coins} 枚海币。`,
        tone: "danger",
        icon: "circle-dollar-sign",
      });
      return;
    }
    farm.coins -= nextMap.gateCost;
    farm.unlockedMaps.push(nextMap.id);
    farm.activeMapId = nextMap.id;
    farm.selectedPlotId = null;
    plotMenuReady = false;
    farm.avatar = {
      x: nextMap.anchors.house.x,
      y: nextMap.anchors.house.y + 58,
      flip: 1,
    };
    farm.xp += 72;
    centerCameraOn(farm.avatar.x, farm.avatar.y, nextMap, false);
    persistSoon();
    refresh();
    showToast({
      title: `${nextMap.name}已经解锁`,
      message: "新的田地和海图主题已经进入农场。",
      tone: "success",
      icon: "map",
    });
  }

  function switchFarmMap(mapId) {
    const map = getFarmMap(mapId);
    if (!farm.unlockedMaps.includes(map.id)) {
      showToast({
        title: `${map.name}尚未解锁`,
        message: `还需 ${mapUnlockRequirementsCopy(map, { onlyMissing: true })}。`,
        tone: "danger",
        icon: "lock-keyhole",
      });
      return;
    }
    if (farm.activeMapId === map.id) return;
    farm.activeMapId = map.id;
    farm.selectedPlotId = null;
    plotMenuReady = false;
    farm.avatar = {
      x: map.anchors.house.x,
      y: map.anchors.house.y + 58,
      flip: 1,
    };
    persistSoon();
    refresh();
    centerCameraOn(farm.avatar.x, farm.avatar.y, map, false);
    showToast({
      title: `进入${map.name}`,
      message: map.subtitle,
      tone: "success",
      icon: "map-pinned",
    });
  }

  function selectFarmCharacter(characterId) {
    const character = characterLookup.get(characterId);
    if (!character) return;
    if (!farmCharacterUnlocked(character)) {
      const metrics = getMetrics?.() || {};
      const marks = Number(metrics.characterMarks?.[character.id]) || 0;
      showToast({
        title: `${character.name}的幼态尚未解锁`,
        message: `再收集 ${Math.max(0, 1 - marks)} 枚${character.name}专属印记，她就会来到农场。`,
        icon: "lock-keyhole",
      });
      return;
    }
    onSelectCharacter?.(characterId);
    state.selectedCharacterId = characterId;
    persistSoon();
    refresh();
  }

  function selectFarmForm(formId) {
    if (!formIsUnlocked(formId)) {
      const character = selectedFarmCharacter();
      const metrics = getMetrics?.() || {};
      const marks = Number(metrics.characterMarks?.[character.id]) || 0;
      const threshold = formThresholds[formId] || formThresholds.cute;
      const formName = formId === "collection" ? "典藏" : "鲸歌";
      showToast({
        title: "这个形态仍在沉睡",
        message: `再收集 ${Math.max(0, threshold - marks)} 枚${character.name}专属印记，即可切换到${formName}形态。`,
        icon: "lock-keyhole",
      });
      return;
    }
    farm.characterForm = formId;
    persistSoon();
    refresh();
    showToast({
      title: "伙伴形态已经切换",
      message: `${selectedFarmCharacter().name}现在以${
        formId === "cute" ? "幼态" : formId === "pretty" ? "鲸歌" : "典藏"
      }形态留在农场。`,
      tone: "success",
      icon: "sparkles",
    });
  }

  function nextHouseUpgrade() {
    return HOUSE_LEVELS.find((item) => item.level === farm.houseLevel + 1) || null;
  }

  function upgradeHouse() {
    const next = nextHouseUpgrade();
    if (!next) {
      showToast({
        title: "鲸歌潮栖庭已经完全修建",
        message: "深汐的精致鲸歌形态已经常驻农场。",
        tone: "success",
        icon: "sparkles",
      });
      return;
    }
    const requirements = HOUSE_LEARNING_REQUIREMENTS[next.level] || {};
    if (!learningRequirementsMet(requirements)) {
      showToast({
        title: "等待学习回响",
        message: `${next.name}需要 ${learningRequirementCopy(requirements)}。`,
        tone: "danger",
        icon: "lock-keyhole",
      });
      return;
    }
    if (farm.coins < next.cost) {
      showToast({
        title: "海币不足",
        message: `${next.name}还需要 ${next.cost - farm.coins} 枚海币。`,
        tone: "danger",
        icon: "circle-dollar-sign",
      });
      return;
    }
    farm.coins -= next.cost;
    farm.houseLevel = next.level;
    farm.xp += 32;
    const housePoint = activeFarmMap().anchors.house;
    moveAvatarTo(housePoint.x, housePoint.y + 58, "harvest", () => pulseStage());
    persistSoon();
    refresh();
    showToast({
      title: `${next.name}修缮完成`,
      message:
        farm.houseLevel >= 3
          ? "深汐苏醒为精致鲸歌形态，农场舞台也出现潮光设施。"
          : "居所外观与农场氛围已经升级。",
      tone: "success",
      icon: "home",
    });
  }

  function openHouse() {
    renderHouse();
    elements.houseOverlay.classList.add("is-visible");
    elements.houseOverlay.setAttribute("aria-hidden", "false");
  }

  function closeHouse() {
    elements.houseOverlay?.classList.remove("is-visible");
    elements.houseOverlay?.setAttribute("aria-hidden", "true");
  }

  function upgradeFurniture(furnitureId) {
    const item = FURNITURE.find((furniture) => furniture.id === furnitureId);
    if (!item) return;
    const level = clamp(Number(farm.houseDecor?.[item.id]) || 0, 0, item.maxLevel);
    if (farm.houseLevel < item.minHouse) {
      showToast({
        title: `${item.name}尚未开放`,
        message: `先将居所修缮至等级 ${item.minHouse}。`,
        icon: "lock-keyhole",
      });
      return;
    }
    if (level >= item.maxLevel) {
      showToast({
        title: `${item.name}已经满级`,
        message: "这件家具已经达到当前最佳状态。",
        tone: "success",
        icon: "sparkles",
      });
      return;
    }
    const cost = furnitureCost(item, level + 1);
    const nextLevel = level + 1;
    const requirements =
      nextLevel >= 3
        ? HOUSE_LEARNING_REQUIREMENTS[3]
        : nextLevel >= 2
          ? HOUSE_LEARNING_REQUIREMENTS[2]
          : {};
    if (nextLevel >= 2 && !learningRequirementsMet(requirements)) {
      showToast({
        title: "高阶家具等待学习里程碑",
        message: `${item.name} Lv.${nextLevel} 需要 ${learningRequirementCopy(requirements)}。`,
        tone: "danger",
        icon: "book-heart",
      });
      return;
    }
    if (nextLevel >= 2 && farm.tideCharges < 1) {
      showToast({
        title: "潮汛不足",
        message: "高阶家具需要 1 次学习产生的潮汛，海币只作为辅助成本。",
        tone: "danger",
        icon: "waves",
      });
      return;
    }
    if (farm.coins < cost) {
      showToast({
        title: "海币不足",
        message: `${item.name}升级还需要 ${cost - farm.coins} 枚海币。`,
        tone: "danger",
        icon: "circle-dollar-sign",
      });
      return;
    }
    farm.coins -= cost;
    if (nextLevel >= 2) farm.tideCharges -= 1;
    farm.houseDecor[item.id] = level + 1;
    farm.xp += 18;
    houseFocusItem = item.id;
    persistSoon();
    refresh();
    const furnitureNode = elements.houseFurnitureLayer?.querySelector(
      `[data-room-furniture="${item.id}"]`,
    );
    furnitureNode?.classList.add("is-changing");
    window.setTimeout(() => furnitureNode?.classList.remove("is-changing"), 900);
    showToast({
      title: `${item.name}升级至 Lv.${level + 1}`,
      message: "角色已经走到家具旁，新的陈设细节已经点亮。",
      tone: "success",
      icon: item.icon,
    });
  }

  function buyDecoration(decorationId) {
    const decoration = DECORATIONS.find((item) => item.id === decorationId);
    if (!decoration || farm.decorations.includes(decoration.id)) return;
    if (farm.coins < decoration.cost) {
      showToast({
        title: "海币不足",
        message: `${decoration.name}还需要 ${decoration.cost - farm.coins} 枚海币。`,
        tone: "danger",
        icon: "circle-dollar-sign",
      });
      return;
    }
    farm.coins -= decoration.cost;
    farm.decorations.push(decoration.id);
    const point = activeFarmMap().anchors.decorations[decoration.id];
    if (point) {
      moveAvatarTo(point.x, point.y + 48, "harvest", () => pulseStage());
    }
    persistSoon();
    refresh();
    pulseStage();
    showToast({
      title: `${decoration.name}已经点亮`,
      message: "农场舞台获得了新的装饰层次。",
      tone: "success",
      icon: "sparkles",
    });
  }

  function claimOrder() {
    const orders = ensureDailyOrder();
    const order = orders.find((item) => !item.claimed);
    if (!order) {
      showToast({
        title: "今日学习委托已经全部完成",
        message: "明天会刷新 2-3 个新的学习委托。",
        tone: "success",
        icon: "package-check",
      });
      return;
    }
    const item = getCrop(order.cropId);
    const count = Number(farm.crops[order.cropId]) || 0;
    if (count < order.amount) {
      showToast({
        title: `委托作物还不够`,
        message: `需要 ${order.amount} 份${item?.name || "物品"}，当前持有 ${count} 份。`,
        tone: "danger",
        icon: "package-x",
      });
      return;
    }
    if (farm.tideCharges < 1) {
      showToast({
        title: "潮汛不足，无法交付委托",
        message: "学习委托的完整价格仍需要消耗 1 次学习潮汛。",
        tone: "danger",
        icon: "waves",
      });
      return;
    }
    consumeCropUnits(order.cropId, order.amount);
    const income = order.amount * (item?.commissionPrice || item?.sellPrice || 0);
    farm.tideCharges -= 1;
    farm.coins += income;
    farm.xp += 22;
    order.claimed = true;
    farm.totalOrdersClaimed = (Number(farm.totalOrdersClaimed) || 0) + 1;
    persistSoon();
    refresh();
    showToast({
      title: "海边来客的委托已经交付",
      message: `按学习委托价获得 ${income} 海币，消耗 1 次潮汛。`,
      tone: "success",
      icon: "package-check",
    });
  }

  function rewardTask(task) {
    const firstTask = (Number(farm.totalTasksRewarded) || 0) === 0;
    const materialReward = 3;
    const tideReward = addTideCharges(1);
    const xpReward = 12;
    farm.materials += materialReward;
    farm.xp += xpReward;
    farm.totalTasksRewarded += 1;
    if (firstTask) {
      farm.seeds["tide-kelp"] = (Number(farm.seeds["tide-kelp"]) || 0) + 1;
      farm.selectedSeedId = "tide-kelp";
    }
    persistSoon();
    refresh();
    return {
      materials: materialReward,
      xp: xpReward,
      tideCharges: tideReward.granted,
      firstTask,
      seedCount: firstTask ? 1 : 0,
      tideReward,
    };
  }

  function rewardPerfectDay(dayKey) {
    if (!dayKey || farm.claimedPerfectDays?.[dayKey]) return null;
    farm.claimedPerfectDays[dayKey] = true;
    const tideReward = addTideCharges(2);
    farm.materials += 5;
    farm.xp += 26;
    persistSoon();
    refresh();
    return {
      materials: 5,
      xp: 26,
      tideCharges: tideReward.granted,
      requestedTideCharges: 2,
      dailyRemaining: tideReward.dailyRemaining,
    };
  }

  function rewardFocusSession(session) {
    const tideReward = addTideCharges(1);
    farm.materials += 4;
    farm.xp += 16;
    persistSoon();
    refresh();
    return {
      materials: 4,
      xp: 16,
      tideCharges: tideReward.granted,
      taskTitle: session?.taskTitle || "自由专注",
      tideReward,
    };
  }

  function rewardStreakMilestone(streak) {
    const milestone = Number(streak) || 0;
    const reward = STREAK_MILESTONES[milestone];
    if (!reward || farm.streakMilestones?.[String(milestone)]) return null;
    const tideReward = addTideCharges(reward.tideCharges);
    farm.streakMilestones[String(milestone)] = true;
    farm.materials += reward.materials;
    farm.xp += milestone * 4;
    persistSoon();
    refresh();
    return {
      streak: milestone,
      materials: reward.materials,
      tideCharges: tideReward.granted,
      requestedTideCharges: reward.tideCharges,
      xp: milestone * 4,
      tideReward,
    };
  }

  function renderResources() {
    elements.valueNodes.get("materials").textContent = String(farm.materials);
    elements.valueNodes.get("coins").textContent = String(farm.coins);
    elements.valueNodes.get("level").textContent = String(currentLevel());
    elements.valueNodes.get("charges").textContent = String(farm.tideCharges);
    elements.levelCopy.textContent = `LV.${currentLevel()}`;
    elements.levelFill.style.width = `${levelProgress()}%`;
    const levelSignature = String(currentLevel());
    if (levelSignature !== resourceLevelSignature) {
      resourceLevelSignature = levelSignature;
      const levelIcon = root.querySelector("[data-farm-level-icon]");
      if (levelIcon) levelIcon.innerHTML = ART.levelArt(currentLevel());
    }
    root.querySelector("[data-farm-stock-count]").textContent = String(totalCropCount());
    root.querySelector("[data-farm-harvest-count]").textContent = String(
      farm.totalHarvests || 0,
    );
    const readyCount = readyPlots().length;
    const growingCount = growingPlots().filter((plot) => !plotIsReady(plot)).length;
    const todayHarvest = Number(farm.dailyHarvestCounts?.[todayKey()]) || 0;
    root.querySelector("[data-farm-ready-total]")?.replaceChildren(String(readyCount));
    root.querySelector("[data-farm-growing-total]")?.replaceChildren(String(growingCount));
    const recentMaturity = root.querySelector("[data-farm-recent-maturity]");
    if (recentMaturity) {
      recentMaturity.textContent = farm.lastMaturityAt
        ? formatClockTime(new Date(farm.lastMaturityAt))
        : "--:--";
    }
    root.querySelector("[data-farm-today-harvest]")?.replaceChildren(String(todayHarvest));
    const chargeNode = elements.valueNodes.get("charges");
    chargeNode.title = `每日已获得 ${Number(farm.tideChargeClaims?.[todayKey()]) || 0} / ${TIDE_CHARGE_DAILY_LIMIT}，储存上限 ${TIDE_CHARGE_STORAGE_LIMIT}`;
  }

  function batchUnlocked(kind) {
    const requiredChapter = BATCH_STORY_UNLOCKS[kind];
    return !requiredChapter || farm.storyClaimed.includes(requiredChapter);
  }

  function showBatchLockState(kind) {
    const requiredChapter = BATCH_STORY_UNLOCKS[kind];
    const chapterNumber = requiredChapter?.split("-").at(-1)?.replace(/^0/, "") || "?";
    showToast({
      title: "一键操作尚未解锁",
      message: `完成主线第 ${chapterNumber} 章后开放；单块操作始终可用。`,
      icon: "lock-keyhole",
    });
  }

  function batchPlan(kind) {
    if (kind === "plant") {
      const crop = selectedSeed();
      const emptyPlots = farm.plots.filter((plot) => plot.unlocked && !plot.cropId);
      const availableSeeds = Number(farm.seeds[crop.id]) || 0;
      const plots = emptyPlots.slice(0, availableSeeds);
      const count = plots.length;
      const cost = batchLaborCost("plant", count);
      const missing = [
        availableSeeds < 1 && emptyPlots.length
          ? `1 份${crop.name}种子`
          : "",
        Math.max(0, cost.materials - farm.materials)
          ? `${Math.max(0, cost.materials - farm.materials)} 潮矿`
          : "",
        Math.max(0, cost.tideCharges - farm.tideCharges)
          ? `${Math.max(0, cost.tideCharges - farm.tideCharges)} 潮汛`
          : "",
      ].filter(Boolean);
      return {
        kind,
        crop,
        plots,
        count,
        cost,
        costCopy: count
          ? `${count} 份${crop.name}种子 · ${cost.materials} 潮矿 · ${cost.tideCharges} 潮汛`
          : "需要至少 1 份种子与 1 块空田",
        missingCopy: missing.length ? `缺少 ${missing.join("、")}` : "",
        affordable:
          farm.materials >= cost.materials &&
          farm.tideCharges >= cost.tideCharges &&
          count > 0,
      };
    }

    if (kind === "water") {
      const plots = farm.plots.filter(
        (plot) =>
          plot.unlocked &&
          plotIsGrowing(plot) &&
          !plotIsReady(plot) &&
          !plot.watered,
      );
      const count = plots.length;
      const cost = batchLaborCost("water", count);
      const missingMaterials = Math.max(0, cost.materials - farm.materials);
      const missingTide = Math.max(0, cost.tideCharges - farm.tideCharges);
      return {
        kind,
        plots,
        count,
        cost,
        costCopy: count
          ? `${cost.materials} 潮矿 · ${cost.tideCharges} 潮汛 · 全部缩短 4%`
          : "当前无需浇水",
        missingCopy: [
          missingMaterials ? `${missingMaterials} 潮矿` : "",
          missingTide ? `${missingTide} 潮汛` : "",
        ]
          .filter(Boolean)
          .join("、"),
        affordable:
          count > 0 &&
          farm.materials >= cost.materials &&
          farm.tideCharges >= cost.tideCharges,
      };
    }

    if (kind === "harvest") {
      const plots = readyPlots();
      const count = plots.length;
      const cost = batchLaborCost("harvest", count);
      const nextGrowing = growingPlots()
        .filter((plot) => !plotIsReady(plot))
        .sort((left, right) => plotRemaining(left) - plotRemaining(right))[0];
      const missingCoins = Math.max(0, cost.coins - farm.coins);
      const missingTide = Math.max(0, cost.tideCharges - farm.tideCharges);
      return {
        kind,
        plots,
        count,
        cost,
        costCopy: count
          ? `${cost.coins} 海币 · ${cost.tideCharges} 潮汛 · 共 ${count} 块`
          : nextGrowing
            ? `下一批 ${formatCountdown(plotRemaining(nextGrowing))} 后可收获`
            : "当前没有成熟作物",
        missingCopy: [
          missingCoins ? `${missingCoins} 海币` : "",
          missingTide ? `${missingTide} 潮汛` : "",
        ]
          .filter(Boolean)
          .join("、"),
        affordable:
          count > 0 &&
          farm.coins >= cost.coins &&
          farm.tideCharges >= cost.tideCharges,
      };
    }

    const plot = growingPlots().find((item) => !plotIsReady(item));
    const missingTide = Math.max(0, 1 - (Number(farm.tideCharges) || 0));
    return {
      kind: "charge",
      plot,
      plots: plot ? [plot] : [],
      count: plot ? 1 : 0,
      cost: { tideCharges: 1 },
      costCopy: plot
        ? `1 次潮汛 · ${getCrop(plot.cropId)?.name || "作物"}`
        : "暂无待催生作物",
      missingCopy: missingTide ? `${missingTide} 潮汛` : "",
      affordable: Boolean(plot) && Number(farm.tideCharges) >= 1,
    };
  }

  function renderActionDeck() {
    ["plant", "water", "harvest", "charge"].forEach((kind) => {
      const button = elements.commandButtons.get(kind);
      const costNode = elements.commandCosts.get(kind);
      const stateNode = elements.commandStates.get(kind);
      if (!button || !costNode || !stateNode) return;

      const plan = batchPlan(kind);
      const cooldownKey = FARM_COMMAND_COOLDOWN_KEYS[kind] || kind;
      const remaining = actionCooldownRemaining(cooldownKey);
      const cooling = remaining > 0;
      const hasTarget = plan.count > 0;
      const unlocked = kind === "charge" || batchUnlocked(kind);
      const enabled = unlocked && hasTarget && plan.affordable && !cooling;

      button.disabled = !enabled;
      button.classList.toggle("is-ready", enabled);
      button.classList.toggle("is-cooling", cooling);
      button.classList.toggle(
        "is-unavailable",
        !unlocked || !hasTarget || !plan.affordable,
      );
      costNode.textContent = plan.costCopy;

      if (!unlocked) {
        stateNode.textContent = `第 ${BATCH_STORY_UNLOCKS[kind].split("-").at(-1).replace(/^0/, "")} 章解锁`;
      } else if (cooling) {
        stateNode.textContent = `冷却 ${formatDuration(remaining)}`;
      } else if (!hasTarget) {
        stateNode.textContent = kind === "charge" ? "无作物" : "无目标";
      } else if (!plan.affordable) {
        stateNode.textContent = plan.missingCopy || "资源不足";
      } else {
        stateNode.textContent = "可执行";
      }

      button.title = cooling
        ? `${FARM_ACTION_RULES[cooldownKey].label}还需 ${formatDuration(remaining)}`
        : plan.costCopy;
    });
  }

  function renderSeeds() {
    const selected = selectedSeed();
    elements.seeds.innerHTML = CROPS.map(
      (crop) => `
        <button
          type="button"
          class="farm-seed-card ${crop.id === selected.id ? "is-active" : ""}"
          data-select-seed="${crop.id}"
          style="--crop-color:${crop.color};--crop-accent:${crop.accent}"
        >
          <span class="farm-seed-icon">${art(`crop:${crop.id}`, crop.name)}</span>
          <span class="farm-seed-copy">
            <strong>${crop.name}</strong>
            <small>持有 ${Number(farm.seeds[crop.id]) || 0} · ${formatDuration(crop.growMs)}</small>
          </span>
          <span class="farm-seed-price"><i data-lucide="gem"></i>${crop.seedCost}</span>
        </button>
      `,
    ).join("");
  }

  function renderMaturityList() {
    const plots = farm.plots
      .filter((plot) => plot.cropId)
      .sort((left, right) => {
        const leftReady = plotIsReady(left) ? 0 : 1;
        const rightReady = plotIsReady(right) ? 0 : 1;
        if (leftReady !== rightReady) return leftReady - rightReady;
        return (plotMaturityTime(left) || 0) - (plotMaturityTime(right) || 0);
      });
    const readyCount = plots.filter((plot) => plotIsReady(plot)).length;
    const readyPill = root.querySelector("[data-farm-maturity-ready]");
    if (readyPill) readyPill.textContent = `${readyCount} 成熟`;

    const structureSignature = `${activeFarmMap().id}:${plots
      .map((plot) => `${plot.id}:${plot.cropId}:${plotIsReady(plot) ? 1 : 0}`)
      .join("|")}`;
    if (structureSignature === maturityListSignature) {
      plots.forEach((plot) => {
        const row = elements.maturityList.querySelector(`[data-focus-crop="${plot.id}"]`);
        const copy = row?.querySelector("small");
        if (!copy) return;
        const ready = plotIsReady(plot);
        copy.textContent = ready
          ? `田地 ${plot.id + 1} · 已成熟 · 点击前往`
          : `田地 ${plot.id + 1} · ${formatCountdown(plotRemaining(plot))} · ${formatClockTime(plotMaturityTime(plot))}`;
      });
      return;
    }
    maturityListSignature = structureSignature;

    if (!plots.length) {
      elements.maturityList.innerHTML =
        '<div class="farm-maturity-empty">田地空闲时，成熟时刻会显示在这里。</div>';
      return;
    }

    elements.maturityList.innerHTML = plots
      .map((plot) => {
        const crop = getCrop(plot.cropId);
        const ready = plotIsReady(plot);
        const status = ready
          ? "已成熟 · 点击前往"
          : `${formatCountdown(plotRemaining(plot))} · ${formatClockTime(plotMaturityTime(plot))}`;
        return `
          <button
            type="button"
            class="farm-maturity-row ${ready ? "is-ready" : ""}"
            data-focus-crop="${plot.id}"
            ${ready ? "" : "disabled"}
            style="--crop-color:${crop?.color || "#6b8f72"}"
          >
            <span class="farm-maturity-icon">${crop ? art(`crop:${crop.id}`, crop.name) : ""}</span>
            <span class="farm-maturity-copy">
              <strong>${crop?.name || "作物"}</strong>
              <small>田地 ${plot.id + 1} · ${status}</small>
            </span>
            <i data-lucide="${ready ? "map-pin-check" : "clock-3"}"></i>
          </button>
        `;
      })
      .join("");
  }

  function renderCropBag() {
    const entries = CROPS.filter((crop) => (Number(farm.crops[crop.id]) || 0) > 0);
    const warehouseCount = root.querySelector("[data-farm-warehouse-count]");
    if (warehouseCount) warehouseCount.textContent = String(totalCropCount());
    const warehouseCoins = root.querySelector("[data-farm-warehouse-coins]");
    if (warehouseCoins) warehouseCoins.textContent = String(farm.coins);
    const warehouseCharges = root.querySelector("[data-farm-warehouse-charges]");
    if (warehouseCharges) warehouseCharges.textContent = String(farm.tideCharges);
    if (!entries.length) {
      elements.cropBag.innerHTML =
        '<div class="farm-bag-empty">仓库还是空的。成熟后点击左侧田地，收获后的作物会送到这里。</div>';
      return;
    }
    elements.cropBag.innerHTML = entries
      .map(
        (crop) => `
          <div class="farm-bag-row" style="--crop-color:${crop.color}">
            <span class="farm-bag-icon">${art(`crop:${crop.id}`, crop.name)}</span>
            <div>
              <strong>${crop.name}</strong>
              <small>${Number(farm.crops[crop.id]) || 0} 份 · 优质 ${Number(farm.cropQuality[crop.id]) || 0} · 单价 ${crop.sellPrice} 海币</small>
            </div>
            <div class="farm-bag-actions">
              <button type="button" data-sell-crop="${crop.id}">
                <i data-lucide="badge-dollar-sign"></i>
                <span>卖 1 份</span>
              </button>
              <button type="button" data-sell-crop="${crop.id}" data-sell-all="true">
                <i data-lucide="package-check"></i>
                <span>全部售出</span>
              </button>
            </div>
          </div>
        `,
      )
      .join("");
  }

  function openWarehouse() {
    if (!elements.warehouseOverlay) return;
    renderCropBag();
    elements.warehouseOverlay.classList.add("is-visible");
    elements.warehouseOverlay.setAttribute("aria-hidden", "false");
    refreshIcons();
  }

  function closeWarehouse() {
    if (!elements.warehouseOverlay) return;
    elements.warehouseOverlay.classList.remove("is-visible");
    elements.warehouseOverlay.setAttribute("aria-hidden", "true");
  }

  function renderShop() {
    elements.shop.innerHTML = CROPS.map((crop) => {
      const affordable = farm.materials >= crop.seedCost;
      return `
        <button
          type="button"
          class="farm-shop-card ${affordable ? "" : "is-unaffordable"}"
          data-buy-seed="${crop.id}"
          style="--crop-color:${crop.color};--crop-accent:${crop.accent}"
        >
          <span class="farm-shop-icon">${art(`crop:${crop.id}`, crop.name)}</span>
          <span>
            <strong>${crop.name}</strong>
            <small>回收 ${crop.sellPrice} / 委托 ${crop.commissionPrice} / 种子 ${crop.seedCost} 潮矿</small>
          </span>
          <i data-lucide="shopping-basket"></i>
        </button>
      `;
    }).join("");
  }

  function renderUpgrades() {
    const nextPlot = nextLandPlot();
    const landCost = expansionCost();
    const nextHouse = nextHouseUpgrade();
    const nextMap = nextLockedMap();
    const currentMap = activeFarmMap();
    const mapStatus = nextMap ? mapUnlockStatus(nextMap) : null;
    const mapReady = Boolean(mapStatus?.ready);
    const houseRequirements = nextHouse
      ? HOUSE_LEARNING_REQUIREMENTS[nextHouse.level] || {}
      : {};
    const houseReady =
      Boolean(nextHouse) && learningRequirementsMet(houseRequirements);
    const landText = nextPlot ? `${landCost} 海币` : "已全部开放";
    const houseText = nextHouse
      ? houseReady
        ? `${nextHouse.name} · ${nextHouse.cost} 海币`
        : `等待 ${learningRequirementCopy(houseRequirements)}`
      : "已达最高等级";
    const mapText = nextMap
      ? mapReady
        ? `${nextMap.name} · ${nextMap.gateCost} 海币`
        : `还需 ${mapUnlockRequirementsCopy(mapStatus, { onlyMissing: true })}`
      : "全部海图已开启";
    elements.upgrades.innerHTML = `
      <button type="button" class="farm-upgrade-card" data-upgrade="land" ${
        nextPlot ? "" : "disabled"
      }>
        <span>${art("upgrade:land", "扩建田地")}</span>
        <div>
          <strong>扩建田地</strong>
          <small>${landText}</small>
        </div>
      </button>
      <button type="button" class="farm-upgrade-card ${houseReady ? "is-ready" : "is-locked"}" data-upgrade="house" ${
        nextHouse ? "" : "disabled"
      }>
        <span>${art("upgrade:house", "修缮居所")}</span>
        <div>
          <strong>修缮居所</strong>
          <small>${houseText}</small>
        </div>
      </button>
      <button
        type="button"
        class="farm-upgrade-card ${mapReady ? "is-ready" : "is-locked"}"
        data-upgrade="map"
        title="${nextMap && !mapReady ? `还需 ${mapUnlockRequirementsCopy(mapStatus, { onlyMissing: true })}` : "开启下一张海图"}"
        ${nextMap ? "" : "disabled"}
      >
        <span>${art("upgrade:map", "开启下一张海图")}</span>
        <div>
          <strong>开启下一张海图</strong>
          <small>${mapText}</small>
        </div>
      </button>
      <button type="button" class="farm-upgrade-card is-house-entry" data-farm-action="open-house">
        <span>${art("upgrade:house-entry", "进入鲸梦小屋")}</span>
        <div>
          <strong>进入鲸梦小屋</strong>
          <small>${farm.houseLevel >= 2 ? "装修并升级家具" : "基础家具可用，灯与海潮缸待开放"}</small>
        </div>
      </button>
    `;
  }

  function renderDecorations() {
    elements.decorations.innerHTML = DECORATIONS.map((decoration) => {
      const owned = farm.decorations.includes(decoration.id);
      return `
        <button
          type="button"
          class="farm-decor-chip ${owned ? "is-owned" : ""}"
          data-buy-decor="${decoration.id}"
          ${owned ? "disabled" : ""}
          style="--decor-color:${decoration.color}"
        >
          ${art(`decor:${decoration.id}`, decoration.name)}
          <span>${decoration.name}</span>
          <strong>${owned ? "已点亮" : `${decoration.cost} 海币`}</strong>
        </button>
      `;
    }).join("");
  }

  function renderTreasures() {
    const map = activeFarmMap();
    const discovered = new Set(farm.discoveries[map.id] || []);
    elements.treasures.innerHTML = map.treasures
      .map((treasure) => {
        const found = discovered.has(treasure.id);
        return `
          <button
            type="button"
            class="farm-world-node farm-treasure ${found ? "is-found" : ""}"
            data-treasure-id="${treasure.id}"
            style="--node-x:${treasure.x}px;--node-y:${treasure.y}px"
            aria-label="${found ? `查看已发现的${treasure.name}` : `探索${treasure.name}`}"
          >
            <span>${art(`treasure:${treasure.id}`, treasure.name)}</span>
            <strong>${found ? treasure.name : "未知遗物"}</strong>
          </button>
        `;
      })
      .join("");
    elements.discoveryCount.textContent = `${discovered.size} / ${map.treasures.length} 宝藏`;
  }

  function renderFishingSpots() {
    const map = activeFarmMap();
    const activeSpotId =
      farm.fishing?.mapId === map.id ? farm.fishing.spotId : null;
    const ready = fishingReady();
    const structureSignature = `${map.id}:${activeSpotId || "none"}:${ready ? 1 : 0}`;
    if (structureSignature === fishingSpotsSignature) {
      map.fishSpots.forEach((spot) => {
        const button = elements.fishingSpots.querySelector(`[data-fish-spot="${spot.id}"]`);
        if (!button) return;
        const active = spot.id === activeSpotId;
        const label = active ? (ready ? "咬钩了" : "等待中") : "钓鱼点";
        const copy = button.querySelector("small");
        if (copy) copy.textContent = label;
        button.setAttribute("aria-label", `${spot.name}，${label}`);
      });
      return;
    }
    fishingSpotsSignature = structureSignature;
    elements.fishingSpots.innerHTML = map.fishSpots
      .map((spot) => {
        const active = spot.id === activeSpotId;
        const label = active
          ? ready
            ? "咬钩了"
            : "等待中"
          : "钓鱼点";
        return `
          <button
            type="button"
            class="farm-world-node farm-fishing-spot ${active ? "is-active" : ""} ${active && ready ? "is-ready" : ""}"
            data-fish-spot="${spot.id}"
            style="--node-x:${spot.x}px;--node-y:${spot.y}px"
            aria-label="${spot.name}，${label}"
          >
            <span>${art(`fishspot:${spot.id}`, spot.name)}</span>
            <strong>${spot.name}</strong>
            <small>${label}</small>
          </button>
        `;
      })
      .join("");
  }

  function gatherNodeKey(map, node) {
    return `${map.id}:${node.id}`;
  }

  function gatherNodeRemaining(node, map = activeFarmMap()) {
    const readyAt = Number(farm.gatherCooldowns?.[gatherNodeKey(map, node)]) || 0;
    return Math.max(0, readyAt - Date.now());
  }

  function gatherNodeAt(nodeId) {
    const map = activeFarmMap();
    const node = map.gatherNodes.find((item) => item.id === nodeId);
    if (!node) return;
    if (!pointIsUnlocked(node.x, node.y, map)) {
      notifyAreaLocked(node.name);
      return;
    }
    const remaining = gatherNodeRemaining(node, map);
    if (remaining > 0) {
      showToast({
        title: `${node.name}正在重新生长`,
        message: `还需等待 ${formatDuration(remaining)} 才能再次采集。`,
        icon: "timer",
      });
      return;
    }

    const event = tideEvent();
    const variant = hashText(node.id) % 3;
    const reward = {
      relicMaterial: 1 + (variant === 1 ? 1 : 0),
      xp: 7 + map.order * 3,
    };

    const materialKey = `gather:${node.id}`;
    farm.relicMaterials[materialKey] =
      (Number(farm.relicMaterials[materialKey]) || 0) + reward.relicMaterial;
    farm.xp += reward.xp;
    const key = gatherNodeKey(map, node);
    farm.gatherCounts[key] = (Number(farm.gatherCounts[key]) || 0) + 1;
    farm.gatherCooldowns[key] =
      Date.now() + Math.max(150_000, 225_000 - event.gatherBonus * 15_000);
    moveAvatarTo(node.x, node.y + 50, "harvest");
    persistSoon();
    refresh();
    showToast({
      title: `采集到${node.name}`,
      message: `获得 ${reward.relicMaterial} 份收藏材料与 ${reward.xp} 经验；采集不产出潮矿或潮汛。`,
      tone: "success",
      icon: node.icon,
    });
  }

  function claimLandmark() {
    const map = activeFarmMap();
    const landmark = map.landmark;
    if (!pointIsUnlocked(landmark.x, landmark.y, map)) {
      notifyAreaLocked(landmark.name);
      return;
    }
    if (landmarkClaimedToday(map)) {
      showToast({
        title: `${landmark.name}已经回应过今天`,
        message: "明日潮汐刷新后，可以再次领取这份祝福。",
        icon: "calendar-check",
      });
      return;
    }
    const reward = landmark.reward;
    farm.xp += reward.xp;
    farm.npcFavor.lanyin = (Number(farm.npcFavor.lanyin) || 0) + 1;
    farm.landmarkClaims[map.id] = todayKey();
    moveAvatarTo(landmark.x, landmark.y + 58, "water");
    persistSoon();
    refresh();
    showToast({
      title: `${landmark.name}回应了你`,
      message: `获得 ${reward.xp} 经验与澜音好感 +1；农场祈愿不产出潮矿或潮汛。`,
      tone: "success",
      icon: landmark.icon,
    });
  }

  function renderGatherNodes() {
    const map = activeFarmMap();
    const structureSignature = `${map.id}:${map.gatherNodes
      .map((node) => {
        const count = Number(farm.gatherCounts?.[gatherNodeKey(map, node)]) || 0;
        return `${node.id}:${gatherNodeRemaining(node, map) > 0 ? 1 : 0}:${count}`;
      })
      .join("|")}`;
    if (structureSignature === gatherNodesSignature) {
      map.gatherNodes.forEach((node) => {
        const button = elements.gatherNodes.querySelector(`[data-gather-node="${node.id}"]`);
        const copy = button?.querySelector("small");
        if (!button || !copy) return;
        const remaining = gatherNodeRemaining(node, map);
        const count = Number(farm.gatherCounts?.[gatherNodeKey(map, node)]) || 0;
        copy.textContent =
          remaining > 0 ? formatDuration(remaining) : `可采集 · 已采 ${count}`;
        button.setAttribute(
          "aria-label",
          `${node.name}，${remaining > 0 ? `${formatDuration(remaining)} 后可采集` : "现在可采集"}`,
        );
      });
      return;
    }
    gatherNodesSignature = structureSignature;
    elements.gatherNodes.innerHTML = map.gatherNodes
      .map((node) => {
        const remaining = gatherNodeRemaining(node, map);
        const count = Number(farm.gatherCounts?.[gatherNodeKey(map, node)]) || 0;
        return `
          <button
            type="button"
            class="farm-world-node farm-gather-node ${remaining > 0 ? "is-cooldown" : "is-ready"}"
            data-gather-node="${node.id}"
            style="--node-x:${node.x}px;--node-y:${node.y}px;--gather-color:${map.accent}"
            aria-label="${node.name}，${remaining > 0 ? `${formatDuration(remaining)} 后可采集` : "现在可采集"}"
          >
            <span>${art(`gather:${node.id}`, node.name)}</span>
            <strong>${node.name}</strong>
            <small>${remaining > 0 ? formatDuration(remaining) : `可采集 · 已采 ${count}`}</small>
          </button>
        `;
      })
      .join("");
  }

  function renderLandmark() {
    const map = activeFarmMap();
    const landmark = map.landmark;
    const claimed = landmarkClaimedToday(map);
    const structureSignature = `${map.id}:${landmark.id}:${claimed ? 1 : 0}`;
    if (structureSignature === landmarkSignature) return;
    landmarkSignature = structureSignature;
    elements.landmarks.innerHTML = `
      <button
        type="button"
        class="farm-world-node farm-landmark ${claimed ? "is-claimed" : "is-ready"}"
        data-farm-landmark="${landmark.id}"
        style="--node-x:${landmark.x}px;--node-y:${landmark.y}px;--landmark-color:${map.accent}"
        aria-label="${landmark.name}，${claimed ? "今日已领取" : "今日可领取"}"
      >
        <span>${art(`landmark:${landmark.id}`, landmark.name)}</span>
        <strong>${landmark.name}</strong>
        <small>${claimed ? "今日祝福已领取" : "领取潮汐祝福"}</small>
      </button>
    `;
  }

  function renderTideEvent() {
    const event = tideEvent();
    elements.stage.dataset.tide = event.id;
    elements.tideCard.style.setProperty("--tide-color", event.color);
    if (event.icon !== tideIconSignature) {
      tideIconSignature = event.icon;
      elements.tideIcon.innerHTML = `<i data-lucide="${event.icon}"></i>`;
      refreshIcons();
    }
    elements.tideName.textContent = event.name;
    elements.tideTime.textContent = formatDuration(tideEventRemaining());
    elements.tideCard.title = event.copy;
  }

  function renderStory() {
    if (!elements.story) return;
    const story = currentStory();
    if (!story.chapter) {
      elements.story.innerHTML = `
        <div class="farm-story-portrait">
          <img src="${ART.npcImage}" alt="澜音" />
        </div>
        <div class="farm-story-copy">
          <span class="farm-board-label">MAIN STORY · COMPLETE</span>
          <h3>潮汐簿已经写满</h3>
          <p>澜音把十五段回声装订成册。之后的每一天，仍然可以按自己的节奏继续积累。</p>
        </div>
        <div class="farm-story-progress is-complete">
          <strong>主线完成</strong>
          <span>继续学习才会产生新的潮矿与潮汛，农场不会自行生成学习凭证。</span>
        </div>
      `;
      return;
    }

    const chapter = story.chapter;
    const rewardCopy = [
      `${chapter.reward.xp} 经验`,
      chapter.reward.unlock ? `解锁 ${chapter.reward.unlock}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const requirementCopy = story.state.requirements
      .map(
        (requirement) =>
          `<em class="${requirement.met ? "is-met" : ""}">${requirement.met ? "✓" : "○"} ${requirement.label} ${requirement.value}/${requirement.target}</em>`,
      )
      .join("");
    const progressTitle = story.state.waitingForLearning
      ? "等待学习回响"
      : story.state.activeRequirement?.label || "章节条件";
    elements.story.innerHTML = `
      <div class="farm-story-portrait">
        <img src="${ART.npcImage}" alt="澜音" />
        <span>NPC</span>
      </div>
      <div class="farm-story-copy">
        <span class="farm-board-label">ACT ${chapter.act} · ${chapter.chapter} / ${String(STORY_CHAPTERS.length).padStart(2, "0")}</span>
        <h3>${chapter.title}</h3>
        <p>${chapter.narrative}</p>
        <small>${chapter.speaker} · ${chapter.hint}</small>
      </div>
      <div class="farm-story-progress ${story.state.ready ? "is-ready" : ""} ${story.state.waitingForLearning ? "is-waiting" : ""}">
        <span>${story.state.waitingForLearning ? "农场条件已完成" : "三重门槛"}</span>
        <strong>${progressTitle}</strong>
        <i><b style="width:${story.state.ratio * 100}%"></b></i>
        <div class="farm-story-requirements">${requirementCopy}</div>
        <small>${story.state.value} / ${story.state.target} · 奖励 ${rewardCopy}</small>
      </div>
      <button
        type="button"
        class="primary-button farm-story-action ${story.state.ready ? "is-ready" : ""}"
        ${story.state.ready ? 'data-farm-action="claim-story"' : `data-farm-story-action="${chapter.action}"`}
      >
        <i data-lucide="${story.state.ready ? "package-check" : "route"}"></i>
        <span>${story.state.ready ? "领取主线奖励" : chapter.actionLabel}</span>
      </button>
    `;
  }

  function renderWorldActors() {
    const map = activeFarmMap();
    const level = currentLevel();
    const story = currentStory();
    const home = map.anchors.house;
    const npc = map.anchors.npc;
    const shrine = map.anchors.level;
    const houseAssets = {
      exterior: houseAssetUrl(`cottage-level-${farm.houseLevel}`),
      interior: houseAssetUrl(`room-level-${farm.houseLevel}`),
    };
    const houseDefinition =
      HOUSE_LEVELS.find((item) => item.level === farm.houseLevel) || HOUSE_LEVELS[0];
    const useMapHomeSprite = farm.houseLevel === 1 && Boolean(map.homeSprite);
    const homeImage = useMapHomeSprite ? map.homeSprite : houseAssets.exterior;

    if (elements.worldHome) {
      elements.worldHome.innerHTML = `
        <button
          type="button"
          class="farm-world-home ${useMapHomeSprite ? "is-map-sprite" : ""}"
          data-farm-action="open-house"
          style="--node-x:${home.x}px;--node-y:${home.y}px;--node-shift-y:${-(Number(map.homeSpriteAnchorY) || 0.5) * 100}%;--home-width:${map.homeSpriteWidth || 320}px"
          title="${houseDefinition.name}，点击进入鲸梦小屋"
        >
          <img src="${homeImage}" alt="${houseDefinition.name}" />
          <span>${houseDefinition.name} · Lv.${farm.houseLevel}</span>
        </button>
      `;
    }

    if (elements.npcLayer) {
      const dialogue = story.chapter
        ? story.state.ready
          ? "目标已经完成，来领取这一页的奖励吧。"
          : story.state.waitingForLearning
            ? "等待学习回响：先去完成真实任务或专注。"
            : story.state.activeRequirement?.label || story.chapter.title
        : "今天也按自己的节奏向前一点。";
      elements.npcLayer.innerHTML = `
        <button
          type="button"
          class="farm-npc"
          data-farm-npc
          style="--node-x:${npc.x}px;--node-y:${npc.y}px"
          title="澜音 · 查看当前主线"
        >
          <span class="farm-npc-bubble">${dialogue}</span>
          <span class="farm-npc-portrait"><img src="${ART.npcImage}" alt="澜音" /></span>
          <strong>澜音 · 潮汐簿管理员</strong>
        </button>
      `;
    }

    if (elements.levelShrine) {
      elements.levelShrine.innerHTML = `
        <button
          type="button"
          class="farm-level-shrine"
          data-farm-level-shrine
          style="--node-x:${shrine.x}px;--node-y:${shrine.y}px"
          title="潮栖等级 ${level}，点击查看成长目标"
        >
          ${ART.levelArt(level)}
          <span>潮栖 Lv.${level}</span>
        </button>
      `;
    }

    if (elements.worldDecorations) {
      elements.worldDecorations.innerHTML = DECORATIONS.filter((decoration) =>
        farm.decorations.includes(decoration.id),
      )
        .map((decoration) => {
          const point = map.anchors.decorations[decoration.id];
          if (!point) return "";
          const decorationArt = decoration.sprite
            ? `<img
                class="farm-world-decoration-image"
                src="${decoration.sprite}"
                alt=""
              />`
            : art(`decor:${decoration.id}`, decoration.name);
          return `
            <button
              type="button"
              class="farm-world-decoration ${decoration.sprite ? "is-map-sprite" : ""}"
              data-farm-decoration="${decoration.id}"
              style="--node-x:${point.x}px;--node-y:${point.y}px;--node-shift-y:${-(Number(decoration.spriteAnchorY) || 0.5) * 100}%;--decor-color:${decoration.color};--decor-width:${decoration.spriteWidth || 104}px"
              title="${decoration.name}"
            >
              ${decorationArt}
              <span>${decoration.name}</span>
            </button>
          `;
        })
        .join("");
    }
  }

  function renderWorkshop() {
    elements.recipes.innerHTML = WORKSHOP_RECIPES.map((recipe) => {
      const crafted = recipeIsCrafted(recipe.id);
      const affordable = recipeCanAfford(recipe);
      const learningReady = learningRequirementsMet(recipe.learning);
      const cropCost = Object.entries(recipe.cost.crops || {})
        .map(([id, amount]) => `${getCrop(id)?.name || id}×${amount}`)
        .join("、");
      const fishCost = Object.entries(recipe.cost.fish || {})
        .map(([id, amount]) => `${FISH_LOOKUP.get(id)?.name || id}×${amount}`)
        .join("、");
      const costCopy = [
        `${recipe.cost.materials || 0} 潮矿`,
        `${recipe.cost.coins || 0} 海币`,
        `${recipe.cost.tideCharges || 0} 潮汛`,
        cropCost,
        fishCost,
      ]
        .filter(Boolean)
        .join(" · ");
      return `
        <button
          type="button"
          class="farm-recipe-card ${crafted ? "is-crafted" : ""} ${affordable || crafted ? "" : "is-unaffordable"}"
          data-craft-recipe="${recipe.id}"
          ${crafted || !learningReady ? "disabled" : ""}
          style="--recipe-color:${recipe.color}"
        >
          <span>${art(`recipe:${recipe.id}`, recipe.name)}</span>
          <div>
            <strong>${recipe.name}</strong>
            <small>${
              crafted
                ? recipe.description
                : learningReady
                  ? `${costCopy} · ${recipe.description}`
                  : `等待 ${learningRequirementCopy(recipe.learning)}`
            }</small>
          </div>
          <em>${crafted ? "已完成" : learningReady ? "制作" : "未解锁"}</em>
        </button>
      `;
    }).join("");
  }

  function renderFishCodex() {
    const collected = FISH.filter((fish) => (Number(farm.fish[fish.id]) || 0) > 0);
    elements.fishCount.textContent = `${collected.length} / ${FISH.length}`;
    elements.fishCodex.innerHTML = FISH.map((fish) => {
      const count = Number(farm.fish[fish.id]) || 0;
      const collectible = ["稀有", "传说"].includes(fish.rarity);
      return `
        <button
          type="button"
          class="farm-codex-row ${count > 0 ? "" : "is-locked"}"
          data-sell-fish="${fish.id}"
          ${count > 0 && !collectible && farm.tideCharges > 0 ? "" : "disabled"}
          style="--fish-color:${fish.color}"
        >
          <span>${count > 0 ? art(fish.id, fish.name) : "?"}</span>
          <div>
            <strong>${count > 0 ? fish.name : "尚未发现"}</strong>
            <small>${fish.rarity} · ${
              collectible ? "仅收藏 · 家具材料" : `${fish.sellPrice} 海币 · 消耗 1 潮汛`
            } · 持有 ${count}</small>
          </div>
          <em>${count > 0 ? (collectible ? "典藏" : "出售") : "未收录"}</em>
        </button>
      `;
    }).join("");
  }

  function renderMapNav() {
    const currentMap = activeFarmMap();
    elements.stage.dataset.map = currentMap.id;
    elements.stage.style.setProperty("--map-accent", currentMap.accent);
    elements.world.style.width = `${currentMap.worldWidth}px`;
    elements.world.style.height = `${currentMap.worldHeight}px`;
    elements.backdrop.src = currentMap.backdrop;
    elements.backdrop.alt = `${currentMap.name}农场`;
    elements.minimapImage.src = currentMap.backdrop;
    elements.mapPerk.textContent = currentMap.perk;
    elements.mapNav.innerHTML = FARM_MAPS.map((map) => {
      const unlocked = farm.unlockedMaps.includes(map.id);
      const cleared = mapIsCleared(map.id);
      const progress = mapExplorationProgress(map);
      const unlockStatus = mapUnlockStatus(map);
      const readyToUnlock = !unlocked && unlockStatus.ready;
      const title = unlocked
        ? `进入${map.name}`
        : readyToUnlock
          ? `开启${map.name}`
          : `还需 ${mapUnlockRequirementsCopy(unlockStatus, { onlyMissing: true })}`;
      return `
        <button
          type="button"
          class="${map.id === currentMap.id ? "is-active" : ""} ${unlocked ? "" : "is-locked"} ${readyToUnlock ? "is-ready" : ""} ${cleared ? "is-cleared" : ""}"
          data-farm-map="${map.id}"
          style="--map-color:${map.accent}"
          title="${title}"
        >
          <span>MAP ${String(map.order).padStart(2, "0")}</span>
          <strong>${map.name}</strong>
          <i style="--map-progress:${progress * 100}%"><b></b></i>
          <small>${cleared ? `${Math.round(progress * 100)}% 全图完成` : unlocked ? `${Math.round(progress * 100)}% 已探索` : readyToUnlock ? "条件已达成" : "尚未抵达"}</small>
        </button>
      `;
    }).join("");
    cameraFor(currentMap);
    applyCamera();
  }

  function renderCharacterControls() {
    const current = selectedFarmCharacter();
    const metrics = getMetrics?.() || {};
    const availableCharacters = characters.filter(
      (character) => character.artStatus !== "pending",
    );
    const compactCharacters = availableCharacters.slice(0, 3);
    if (
      compactCharacters.length &&
      !compactCharacters.some((character) => character.id === current.id)
    ) {
      compactCharacters[compactCharacters.length - 1] = current;
    }
    const remainingCharacters = availableCharacters.filter(
      (character) => !compactCharacters.some((item) => item.id === character.id),
    );
    const characterButton = (character) => {
      const unlocked =
        typeof characterIsUnlocked === "function"
          ? characterIsUnlocked(character, metrics)
          : farmCharacterUnlocked(character);
      return `
        <button
          type="button"
          class="${character.id === current.id ? "is-active" : ""} ${unlocked ? "" : "is-locked"}"
          data-farm-character="${character.id}"
          style="--character-color:${character.color}"
          title="${unlocked ? `让${character.name}来到农场` : `${character.name}尚未抵达`}"
        >
          <img src="${characterIdleFrames(character, "cute")[0]}" alt="" loading="lazy" decoding="async" />
          <span>${character.name}</span>
          ${unlocked ? "" : '<i data-lucide="lock-keyhole"></i>'}
        </button>
      `;
    };
    elements.characterDock.classList.toggle("is-expanded", farmCharactersExpanded);
    elements.characterDock.innerHTML = `
      <span class="farm-floating-label">农作伙伴</span>
      <div class="farm-character-list">
        ${compactCharacters.map((character) => characterButton(character)).join("")}
        ${
          remainingCharacters.length
            ? `
              <button
                class="farm-character-toggle"
                type="button"
                data-farm-character-toggle
                aria-expanded="${farmCharactersExpanded}"
                title="${farmCharactersExpanded ? "收起伙伴列表" : `展开其余 ${remainingCharacters.length} 位伙伴`}"
              >
                <i data-lucide="${farmCharactersExpanded ? "chevron-up" : "chevron-down"}"></i>
                <span>${farmCharactersExpanded ? "收起" : `更多 ${remainingCharacters.length}`}</span>
              </button>
            `
            : ""
        }
      </div>
      ${
        farmCharactersExpanded
          ? `<div class="farm-character-more">${remainingCharacters.map((character) => characterButton(character)).join("")}</div>`
          : ""
      }
    `;

    const forms = [
      { id: "cute", name: "幼态", icon: "sparkles" },
      { id: "pretty", name: "鲸歌", icon: "crown" },
      { id: "collection", name: "典藏", icon: "gem" },
    ];
    elements.formDock.innerHTML = forms
      .map((form) => {
        const unlocked = formIsUnlocked(form.id);
        const character = selectedFarmCharacter();
        const metrics = getMetrics?.() || {};
        const marks = Number(metrics.characterMarks?.[character.id]) || 0;
        const threshold = formThresholds[form.id] || formThresholds.cute;
        return `
          <button
            type="button"
            class="${form.id === characterForm() ? "is-active" : ""} ${unlocked ? "" : "is-locked"}"
            data-farm-form="${form.id}"
            title="${
              unlocked
                ? `切换到${character.name}的${form.name}形态`
                : `再收集 ${Math.max(0, threshold - marks)} 枚${character.name}专属印记解锁${form.name}`
            }"
          >
            <i data-lucide="${unlocked ? form.icon : "lock-keyhole"}"></i>
            <span>${form.name}</span>
          </button>
        `;
      })
      .join("");
  }

  function furnitureCost(item, nextLevel) {
    return item.baseCost + (nextLevel - 1) * Math.round(item.baseCost * 0.85);
  }

  function renderHouse() {
    if (!elements.houseRoom) return;
    const character = selectedFarmCharacter();
    const characterImage = characterIdleFrames(character)[0];
    const houseDefinition =
      HOUSE_LEVELS.find((item) => item.level === farm.houseLevel) || HOUSE_LEVELS[0];
    const houseAssets = {
      exterior: houseAssetUrl(`cottage-level-${farm.houseLevel}`),
      interior: houseAssetUrl(`room-level-${farm.houseLevel}`),
    };
    Object.entries(farm.houseDecor || {}).forEach(([id, level]) => {
      elements.houseRoom.dataset[id] = String(clamp(Number(level) || 0, 0, 3));
    });
    elements.houseRoom.dataset.houseLevel = String(farm.houseLevel);
    elements.houseRoom.classList.add("has-photo");
    elements.houseExterior.src = houseAssets.exterior;
    elements.houseExterior.alt = `${houseDefinition.name}外观`;
    elements.houseExterior.onerror = () => {
      const fallback = houseAssetUrl(`cottage-level-${farm.houseLevel}`);
      if (!elements.houseExterior.src.endsWith(fallback.slice(2))) {
        elements.houseExterior.src = fallback;
      }
    };
    elements.houseExteriorCopy.textContent = `${houseDefinition.name} · 居所等级 ${farm.houseLevel}`;
    elements.houseInterior.src = houseAssets.interior;
    elements.houseInterior.alt = `${houseDefinition.name}室内`;
    elements.houseInterior.onerror = () => {
      const fallback = houseAssetUrl(`room-level-${farm.houseLevel}`);
      if (!elements.houseInterior.src.endsWith(fallback.slice(2))) {
        elements.houseInterior.src = fallback;
      }
    };
    elements.houseLevelTrack.innerHTML = HOUSE_LEVELS.map((item) => {
      const active = item.level <= farm.houseLevel;
      const current = item.level === farm.houseLevel;
      const requirements = HOUSE_LEARNING_REQUIREMENTS[item.level] || {};
      const unlocked = active || learningRequirementsMet(requirements);
      return `
        <div class="farm-house-stage ${active ? "is-unlocked" : ""} ${current ? "is-current" : ""} ${unlocked ? "" : "is-locked"}">
          <span>${String(item.level).padStart(2, "0")}</span>
          <strong>${item.name}</strong>
          <small>${active ? "已修缮" : unlocked ? "可继续升级" : `等待 ${learningRequirementCopy(requirements)}`}</small>
        </div>
      `;
    }).join("");
    const decorationTotal = Object.values(farm.houseDecor || {}).reduce(
      (total, level) => total + (Number(level) || 0),
      0,
    );
    elements.houseRoom.style.setProperty(
      "--interior-glow",
      String(0.18 + decorationTotal * 0.025),
    );
    elements.houseAvatar.src = characterImage;
    elements.houseAvatar.alt = `${character.name}${characterForm()}形态`;
    elements.houseAvatar.dataset.focus = houseFocusItem;
    if (elements.houseFurnitureLayer) {
      elements.houseFurnitureLayer.innerHTML = FURNITURE.filter(
        (item) => clamp(Number(farm.houseDecor?.[item.id]) || 0, 0, item.maxLevel) > 0,
      )
        .map((item) => {
          const level = clamp(Number(farm.houseDecor?.[item.id]) || 0, 0, item.maxLevel);
          return `
            <span
              class="farm-room-furniture ${item.id === houseFocusItem ? "is-focused" : ""}"
              data-room-furniture="${item.id}"
              data-level="${level}"
              style="--furniture-level:${level};--furniture-color:${item.color || "#86d7c7"}"
              title="${item.name} Lv.${level}"
            >
              ${art(`furniture:${item.id}`, item.name)}
              <small>Lv.${level}</small>
            </span>
          `;
        })
        .join("");
    }
    elements.houseCoins.textContent = String(farm.coins);
    elements.houseCatalog.innerHTML = FURNITURE.map((item) => {
      const level = clamp(Number(farm.houseDecor?.[item.id]) || 0, 0, item.maxLevel);
      const maxed = level >= item.maxLevel;
      const houseReady = farm.houseLevel >= item.minHouse;
      const nextLevel = Math.min(item.maxLevel, level + 1);
      const cost = maxed ? 0 : furnitureCost(item, nextLevel);
      const affordable = farm.coins >= cost;
      const requirements =
        nextLevel >= 3
          ? HOUSE_LEARNING_REQUIREMENTS[3]
          : nextLevel >= 2
            ? HOUSE_LEARNING_REQUIREMENTS[2]
            : {};
      const learningReady = learningRequirementsMet(requirements);
      const tideReady = nextLevel < 2 || farm.tideCharges >= 1;
      const canUpgrade = houseReady && learningReady && tideReady;
      return `
        <button
          type="button"
          class="farm-furniture-card ${maxed ? "is-maxed" : ""} ${canUpgrade ? "" : "is-locked"}"
          data-furniture-id="${item.id}"
          ${maxed || !canUpgrade ? "disabled" : ""}
        >
          <span class="farm-furniture-icon">${houseReady ? art(`furniture:${item.id}`, item.name) : '<i data-lucide="lock-keyhole"></i>'}</span>
          <span class="farm-furniture-copy">
            <strong>${item.name} · Lv.${level}</strong>
            <small>${
              !houseReady
                ? `修缮至居所等级 ${item.minHouse} 后开放`
                : !learningReady
                  ? `等待 ${learningRequirementCopy(requirements)}`
                  : !tideReady
                    ? "需要 1 次学习潮汛"
                    : item.copy
            }</small>
          </span>
          <span class="farm-furniture-cost ${affordable || maxed ? "" : "is-unaffordable"}">
            ${maxed ? "满级" : `<i data-lucide="circle-dollar-sign"></i>${cost}${nextLevel >= 2 ? " · 1 潮汛" : ""}`}
          </span>
          <span class="farm-level-dots" aria-hidden="true">
            ${Array.from({ length: item.maxLevel }, (_, index) => `<i class="${index < level ? "is-filled" : ""}"></i>`).join("")}
          </span>
        </button>
      `;
    }).join("");
  }

  function renderPlots() {
    const structureSignature = `${activeFarmMap().id}:${farm.plots
      .map(
        (plot) =>
          `${plot.id}:${plot.unlocked ? 1 : 0}:${plot.cropId || "empty"}:${plot.watered ? 1 : 0}:${farm.selectedPlotId === plot.id ? 1 : 0}`,
      )
      .join("|")}`;
    if (structureSignature === plotListSignature) {
      updatePlotTimers();
      return;
    }
    plotListSignature = structureSignature;
    elements.plots.innerHTML = farm.plots
      .map((plot) => {
        const crop = getCrop(plot.cropId);
        const progress = plotProgress(plot);
        const ready = plotIsReady(plot);
        const growing = plotIsGrowing(plot);
        const stateLabel = !plot.unlocked
          ? "待扩建"
          : ready
            ? "已成熟，可收获"
            : growing
              ? plot.watered
                ? `已缩短 ${Math.round((Number(plot.waterReduction) || 0.06) * 100)}% · 预计 ${formatClockTime(plotMaturityTime(plot))} 成熟`
                : `预计 ${formatClockTime(plotMaturityTime(plot))} 成熟 · 剩余 ${formatCountdown(plotRemaining(plot))}`
              : "待播种";
        const remaining = growing && !ready
          ? plot.watered
            ? `已缩短 ${Math.round((Number(plot.waterReduction) || 0.06) * 100)}% · 预计 ${formatClockTime(plotMaturityTime(plot))} 成熟`
            : `预计 ${formatClockTime(plotMaturityTime(plot))} 成熟 · 剩余 ${formatCountdown(plotRemaining(plot))}`
          : ready
            ? "已成熟，可收获"
            : "";
        return `
          <button
            type="button"
            class="farm-plot ${plot.unlocked ? "" : "is-locked"} ${
              ready ? "is-ready" : ""
            } ${plot.watered ? "is-watered" : ""} ${
              farm.selectedPlotId === plot.id ? "is-selected" : ""
            }"
            data-plot-id="${plot.id}"
            style="--plot-x:${plot.x}px;--plot-y:${plot.y}px;--crop-color:${
              crop?.color || "#6b8f72"
            };--plot-progress:${progress * 100}%"
            aria-label="田地 ${plot.id + 1}，${stateLabel}"
          >
            <span class="farm-plot-soil"></span>
            <span class="farm-plot-crop">${
              !plot.unlocked
                ? '<i data-lucide="lock-keyhole"></i>'
                : crop
                  ? art(`crop:${crop.id}`, crop.name)
                  : '<i data-lucide="plus"></i>'
            }</span>
            <span class="farm-plot-progress"><i></i></span>
            <span class="farm-plot-copy">
              <strong>${!plot.unlocked ? "扩建" : crop ? crop.name : "空田"}</strong>
              <small>${remaining || stateLabel}</small>
            </span>
          </button>
        `;
      })
      .join("");
    updatePlotTimers();
  }

  function plotTimingState(plot) {
    const progress = plotProgress(plot);
    const ready = plotIsReady(plot);
    const growing = plotIsGrowing(plot);
    const stateLabel = !plot.unlocked
      ? "待扩建"
      : ready
        ? "已成熟，可收获"
        : growing
          ? plot.watered
            ? `已缩短 ${Math.round((Number(plot.waterReduction) || 0.06) * 100)}% · 预计 ${formatClockTime(plotMaturityTime(plot))} 成熟`
            : `预计 ${formatClockTime(plotMaturityTime(plot))} 成熟 · 剩余 ${formatCountdown(plotRemaining(plot))}`
          : "待播种";
    const remaining = growing && !ready
      ? plot.watered
        ? `已缩短 ${Math.round((Number(plot.waterReduction) || 0.06) * 100)}% · 预计 ${formatClockTime(plotMaturityTime(plot))} 成熟`
        : `预计 ${formatClockTime(plotMaturityTime(plot))} 成熟 · 剩余 ${formatCountdown(plotRemaining(plot))}`
      : ready
        ? "已成熟，可收获"
        : "";
    return { progress, ready, growing, stateLabel, remaining };
  }

  function updatePlotTimers() {
    farm.plots.forEach((plot) => {
      const button = elements.plots.querySelector(`[data-plot-id="${plot.id}"]`);
      if (!button) return;
      const timing = plotTimingState(plot);
      button.style.setProperty("--plot-progress", `${timing.progress * 100}%`);
      button.classList.toggle("is-ready", timing.ready);
      button.classList.toggle("is-watered", Boolean(plot.watered));
      button.classList.toggle("is-selected", farm.selectedPlotId === plot.id);
      button.setAttribute("aria-label", `田地 ${plot.id + 1}，${timing.stateLabel}`);
      const copy = button.querySelector(".farm-plot-copy small");
      const nextCopy = timing.remaining || timing.stateLabel;
      if (copy && copy.textContent !== nextCopy) copy.textContent = nextCopy;
    });
  }

  function renderVisionOverlay() {
    const canvas = elements.visionCanvas;
    if (!canvas) return;
    const map = activeFarmMap();
    if (canvas.width !== map.worldWidth || canvas.height !== map.worldHeight) {
      canvas.width = map.worldWidth;
      canvas.height = map.worldHeight;
    }

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (mapIsCleared(map.id)) return;
    context.fillStyle = "rgba(2, 13, 18, 0.4)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.globalCompositeOperation = "destination-out";
    const revealArea = (x, y, radius) => {
      context.fillStyle = "rgba(0, 0, 0, 1)";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    // 暗区必须与 pointIsUnlocked 使用同一组半径，避免亮区与可行动范围错位。
    revealArea(map.anchors.house.x, map.anchors.house.y, HOUSE_UNLOCK_RADIUS);
    mapPlots(map.id)
      .filter((plot) => plot.unlocked)
      .forEach((plot) => revealArea(plot.x, plot.y, PLOT_UNLOCK_RADIUS));
    context.restore();
  }

  function plotInspectorActionMarkup({ action, label, icon }) {
    return `
      <button
        type="button"
        class="farm-plot-action"
        data-plot-action="${action}"
      >
        <i data-lucide="${icon}"></i>
        <span>
          <strong>${label}</strong>
          <small data-plot-action-detail="${action}"></small>
        </span>
      </button>
    `;
  }

  function renderPlotInspector() {
    const inspector = elements.plotInspector;
    if (!inspector) return;
    const plot = farm.plots.find((item) => item.id === Number(farm.selectedPlotId));
    if (!plotMenuReady || !plot) {
      inspector.hidden = true;
      inspector.innerHTML = "";
      plotInspectorSignature = "";
      elements.stage.classList.remove("has-plot-inspector");
      return;
    }

    const crop = getCrop(plot.cropId);
    const ready = plotIsReady(plot);
    const growing = plotIsGrowing(plot);
    const reduced = Math.round((Number(plot.waterReduction) || 0.06) * 100);
    const maturity = plotMaturityTime(plot);
    const seed = selectedSeed();
    const seedCount = Number(farm.seeds[seed.id]) || 0;
    const timeTitle = !plot.unlocked
      ? "待扩建"
      : ready
        ? "已成熟，可收获"
        : growing
          ? plot.watered
            ? `已缩短 ${reduced}% · 预计 ${formatClockTime(maturity)} 成熟`
            : `预计 ${formatClockTime(maturity)} 成熟`
          : "空田可播种";
    const timeDetail = !plot.unlocked
      ? "扩建后才能照料"
      : ready
        ? `成熟于 ${formatClockTime(maturity)}`
        : growing
          ? `剩余 ${formatCountdown(plotRemaining(plot))}`
          : `已选 ${seed.name} · 持有 ${seedCount} 份`;
    const actions = [
      {
        action: "plant",
        label: "播种",
        icon: "sprout",
        detail: `${seed.name} × 1`,
        enabled: Boolean(plot.unlocked && !plot.cropId && seedCount > 0),
        primary: !plot.cropId,
      },
      {
        action: "water",
        label: "浇水",
        icon: "droplets",
        detail: plot.watered ? "本轮已浇水" : "免费 · 缩短 6%",
        enabled: Boolean(plot.unlocked && growing && !ready && !plot.watered),
        primary: growing && !ready && !plot.watered,
      },
      {
        action: "harvest",
        label: "收获",
        icon: "shopping-basket",
        detail: ready ? `${plotHarvestYield(plot)} 份` : "成熟后可用",
        enabled: Boolean(plot.unlocked && ready),
        primary: ready,
      },
    ];
    const structureSignature = [
      plot.id,
      plot.unlocked ? 1 : 0,
      plot.cropId || "empty",
      plot.watered ? 1 : 0,
      ready ? 1 : 0,
      growing ? 1 : 0,
      seed.id,
      seedCount > 0 ? 1 : 0,
    ].join(":");

    inspector.hidden = false;
    elements.stage.classList.add("has-plot-inspector");
    if (structureSignature !== plotInspectorSignature) {
      plotInspectorSignature = structureSignature;
      inspector.innerHTML = `
        <div class="farm-plot-inspector-head">
          <div>
            <span>FIELD ${String(plot.id + 1).padStart(2, "0")}</span>
            <strong>${crop?.name || (plot.unlocked ? "空田" : "待扩建田块")}</strong>
          </div>
          <button type="button" class="farm-plot-inspector-close" data-plot-menu-close aria-label="关闭田地选项">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="farm-plot-time">
          <i data-lucide="${ready ? "sparkles" : "clock-3"}"></i>
          <span>
            <strong data-plot-inspector-time-title></strong>
            <small data-plot-inspector-time-detail></small>
          </span>
        </div>
        <div class="farm-plot-inspector-actions">
          ${actions.map(plotInspectorActionMarkup).join("")}
        </div>
      `;
    }

    inspector.querySelector("[data-plot-inspector-time-title]").textContent = timeTitle;
    inspector.querySelector("[data-plot-inspector-time-detail]").textContent = timeDetail;
    actions.forEach((action) => {
      const button = inspector.querySelector(`[data-plot-action="${action.action}"]`);
      if (!button) return;
      const cooldown = actionCooldownRemaining(action.action);
      const unavailable = cooldown > 0 || !action.enabled;
      button.disabled = unavailable;
      button.classList.toggle("is-primary", Boolean(action.primary && !unavailable));
      button.querySelector("[data-plot-action-detail]").textContent =
        cooldown > 0 ? `冷却 ${formatDuration(cooldown)}` : action.detail;
    });
  }

  function renderOrder() {
    const orders = ensureDailyOrder();
    const order = orders.find((item) => !item.claimed);
    const claimedCount = orders.filter((item) => item.claimed).length;
    if (!order) {
      elements.orderCopy.textContent = `今日 ${orders.length} 个学习委托已经全部完成，明天会刷新新的委托。`;
      elements.orderButton.disabled = true;
      elements.orderButton.querySelector("span").textContent = "今日已完成";
      elements.orderButton.classList.remove("is-ready");
      return;
    }
    const item = getCrop(order.cropId);
    const count = Number(farm.crops[order.cropId]) || 0;
    const complete = count >= order.amount;
    const income = order.amount * (item?.commissionPrice || 0);
    elements.orderCopy.textContent = `今日委托 ${claimedCount + 1} / ${orders.length}：交付 ${order.amount} 份${item?.name || "物品"}，按委托价获得 ${income} 海币，并消耗 1 潮汛。`;
    elements.orderButton.disabled = !complete || farm.tideCharges < 1;
    elements.orderButton.querySelector("span").textContent =
      farm.tideCharges < 1
        ? "缺少 1 潮汛"
        : complete
          ? "交付委托"
          : `${count} / ${order.amount}`;
    elements.orderButton.classList.toggle("is-ready", complete && farm.tideCharges >= 1);
  }

  function renderCompanionGrowth() {
    const character = selectedFarmCharacter();
    const form = characterForm();
    const formIndex = { cute: 0, pretty: 1, collection: 2 }[form] || 0;
    const formNames = { cute: "幼态", pretty: "鲸歌", collection: "典藏" };
    elements.companionImage.src = characterArt(character, form);
    elements.companionImage.alt = `${character.name}${formNames[form]}形态`;
    elements.companionTitle.textContent = `${character.name} · ${formNames[form]}形态`;
    elements.companionCopy.textContent =
      form === "collection"
        ? "典藏形态保留完整全身立绘，并以缓慢浮动作为待机。"
        : form === "pretty"
          ? "鲸歌形态保留完整全身立绘，并以缓慢浮动作为待机。"
          : "幼态使用由八张关键帧合成的循环动图，播放更流畅且不会闪烁。";
    elements.companionProgress.style.width = `${(formIndex / 2) * 100}%`;
    elements.avatar.querySelector(".farm-avatar-name").textContent = `${character.name} · ${formNames[form]}`;
    elements.stage.dataset.houseLevel = String(farm.houseLevel);
    elements.stage.dataset.character = character.id;
    elements.stage.dataset.form = form;
    elements.stage.classList.toggle(
      "has-lanterns",
      farm.decorations.includes("tide-lanterns") || farm.houseLevel >= 2,
    );
    elements.stage.classList.toggle(
      "has-fountain",
      farm.decorations.includes("shell-fountain"),
    );
    elements.stage.classList.toggle(
      "has-arch",
      farm.decorations.includes("coral-arch") || farm.houseLevel >= 3,
    );
    elements.stage.classList.toggle(
      "has-moon-stage",
      farm.decorations.includes("moon-shell-stage"),
    );
    elements.stage.classList.toggle(
      "has-pearl-tree",
      farm.decorations.includes("pearl-tree"),
    );
    elements.stage.classList.toggle(
      "has-whale-lantern",
      farm.decorations.includes("whale-cloud-lantern"),
    );
  }

  function renderLoop() {
    let completed = 0;
    let total = 0;
    try {
      const metrics = getMetrics?.() || {};
      completed = metrics.completedToday || 0;
      total = metrics.totalToday || 0;
    } catch {
      completed = 0;
      total = 0;
    }

    if (!total) {
      const today = state.days?.[todayKey()];
      total = today?.tasks?.length || 0;
      completed = today?.tasks?.filter((task) => task.status === "done").length || 0;
    }
    root.querySelector("[data-farm-today-progress]").textContent = `${completed} / ${total}`;
    root.querySelector("[data-farm-task-rewards]").textContent = String(
      farm.totalTasksRewarded || 0,
    );
    root.querySelector("[data-farm-ready-count]").textContent = String(readyPlots().length);
    const nextPlot = nextLandPlot();
    const nextHouse = nextHouseUpgrade();
    const nextMap = nextLockedMap();
    root.querySelector("[data-farm-next-upgrade]").textContent = nextPlot
      ? `扩建田地 ${expansionCost()}`
      : nextMap
        ? mapIsCleared(activeFarmMap().id)
          ? `开启${nextMap.name}`
          : `继续扩建${activeFarmMap().name}`
      : nextHouse
        ? `${nextHouse.name} ${nextHouse.cost}`
      : "海图与鲸歌庭完成";
  }

  function pulseStage() {
    elements.stage.classList.remove("is-changing");
    window.requestAnimationFrame(() => {
      elements.stage.classList.add("is-changing");
      window.setTimeout(() => elements.stage.classList.remove("is-changing"), 1100);
    });
  }

  function claimStoryReward() {
    const story = currentStory();
    if (!story.chapter || !story.state.ready) {
      showToast({
        title: "这一页还没有完成",
        message: story.state.waitingForLearning
          ? "农场要求已经完成，但章节仍等待真实学习记录。"
          : story.state.activeRequirement?.label || "潮汐簿正在等待新的记录。",
        icon: "book-open",
      });
      return;
    }
    const reward = story.chapter.reward;
    farm.xp += reward.xp || 0;
    farm.storyClaimed.push(story.chapter.id);
    if (reward.unlock) farm.storyUnlocks.push(reward.unlock);
    const npc = activeFarmMap().anchors.npc;
    moveAvatarTo(npc.x, npc.y + 56, "harvest", () => pulseStage());
    persistSoon();
    refresh();
    showToast({
      title: `主线 ${story.chapter.chapter} 已完成`,
      message: `澜音写下新的批注，获得 ${reward.xp} 经验${
        reward.unlock ? `，并解锁「${reward.unlock}」` : ""
      }。章节不赠送可跳过下一章的资源。`,
      tone: "success",
      icon: "book-heart",
    });
  }

  function focusStoryAction(action) {
    const map = activeFarmMap();
    if (action === "create-task" || action === "focus" || action === "today") {
      onStoryAction?.(action);
      return;
    }
    if (action === "expand") {
      const nextPlot = nextLandPlot();
      if (nextPlot) moveAvatarTo(nextPlot.x, nextPlot.y + 40, "idle", () => pulseStage());
      root.querySelector('[data-upgrade="land"]')?.classList.add("is-highlighted");
      window.setTimeout(
        () => root.querySelector('[data-upgrade="land"]')?.classList.remove("is-highlighted"),
        1800,
      );
      showToast({
        title: "扩建目标已经标出",
        message: nextPlot
          ? `下一块田地需要 ${expansionCost()} 海币。`
          : "当前海图所有田地都已开放。",
        icon: "fence",
      });
      return;
    }
    if (action === "house") {
      moveAvatarTo(map.anchors.house.x, map.anchors.house.y + 58, "idle", () => pulseStage());
      root.querySelector('[data-upgrade="house"]')?.classList.add("is-highlighted");
      window.setTimeout(
        () => root.querySelector('[data-upgrade="house"]')?.classList.remove("is-highlighted"),
        1800,
      );
      showToast({
        title: "澜音指向潮线小屋",
        message:
          farm.houseLevel >= 2
            ? "居所已经修缮，可以继续装修家具。"
            : `蓝瓦望海屋需要 ${nextHouseUpgrade()?.cost || 0} 海币。`,
        icon: "house",
      });
      return;
    }
    if (action === "treasure") {
      const discovered = new Set(farm.discoveries[map.id] || []);
      const treasure =
        map.treasures.find((item) => !discovered.has(item.id)) || map.treasures[0];
      if (treasure) moveAvatarTo(treasure.x, treasure.y + 45, "idle", () => pulseStage());
      showToast({
        title: treasure ? `遗物信号来自${treasure.name}` : "当前海图没有遗物信号",
        message: "点击场景中的遗物节点即可探索。",
        icon: "compass",
      });
      return;
    }
    if (action === "map") {
      root.querySelector('[data-upgrade="map"]')?.classList.add("is-highlighted");
      window.setTimeout(
        () => root.querySelector('[data-upgrade="map"]')?.classList.remove("is-highlighted"),
        1800,
      );
      showToast({
        title: "海图门槛已经标出",
        message: nextLockedMap()
          ? `${nextLockedMap().name}需要 ${mapUnlockRequirementsCopy(nextLockedMap())}。`
          : "全部海图已经开启。",
        icon: "map",
      });
      return;
    }
    if (action === "order") {
      root.querySelector(".farm-order-board")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      showToast({
        title: "今日学习委托",
        message: "每笔委托消耗 1 潮汛，收益高于普通回收价。",
        icon: "scroll-text",
      });
      return;
    }
    if (action === "farm") {
      root.querySelector(".farm-action-deck")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  function focusStoryNpc() {
    const map = activeFarmMap();
    const story = currentStory();
    moveAvatarTo(map.anchors.npc.x, map.anchors.npc.y + 58, "idle", () => pulseStage());
    showToast({
      title: story.chapter ? `主线 ${story.chapter.chapter} · ${story.chapter.title}` : "潮汐簿已经写满",
      message: story.chapter
        ? `${story.chapter.speaker}：${story.chapter.narrative}`
        : "澜音把十五段回声装订成册，之后可以按自己的节奏继续积累。",
      tone: "success",
      icon: "messages-square",
    });
  }

  function focusLevelShrine() {
    const map = activeFarmMap();
    moveAvatarTo(map.anchors.level.x, map.anchors.level.y + 52, "idle", () => pulseStage());
    showToast({
      title: `潮栖 Lv.${currentLevel()}`,
      message:
        currentLevel() >= 9
          ? "潮栖等级已经达到当前上限。"
          : `再获得 ${120 - Math.round(((farm.xp || 0) % 120))} 经验即可进入下一等级。`,
      tone: "success",
      icon: "waves",
    });
  }

  function renderClock() {
    const now = new Date();
    const signature = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
    if (signature === clockMinuteSignature) return;
    clockMinuteSignature = signature;
    elements.clock.textContent = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
    const hour = now.getHours();
    elements.stage.dataset.dayTime =
      hour < 6 ? "night" : hour < 10 ? "dawn" : hour < 16 ? "day" : hour < 19 ? "dusk" : "night";
  }

  function celebrateLevelUp(level) {
    if (pendingLevelCelebration !== null && level <= pendingLevelCelebration) return;
    pendingLevelCelebration = level;
    window.setTimeout(() => {
      const celebrationLevel = pendingLevelCelebration;
      pendingLevelCelebration = null;
      if (!celebrationLevel || celebrationLevel !== currentLevel()) return;
      const shrine = activeFarmMap().anchors.level;
      moveAvatarTo(shrine.x, shrine.y + 52, "harvest", () => pulseStage());
      elements.stage.dataset.level = String(celebrationLevel);
      showToast({
        title: `潮栖等级提升至 Lv.${celebrationLevel}`,
        message: "新的潮光纹样已经刻入农场地标，角色会自动走到成长祭坛旁。",
        tone: "success",
        icon: "sparkles",
      });
    }, 420);
  }

  function refresh() {
    ensureDailyOrder();
    const renderedLevel = currentLevel();
    renderResources();
    renderActionDeck();
    renderMapNav();
    renderCharacterControls();
    renderSeeds();
    renderMaturityList();
    renderCropBag();
    renderShop();
    renderUpgrades();
    renderDecorations();
    renderWorkshop();
    renderFishCodex();
    renderPlots();
    renderVisionOverlay();
    renderTerrainDebug();
    renderPlotInspector();
    renderTreasures();
    renderFishingSpots();
    renderGatherNodes();
    renderLandmark();
    renderOrder();
    renderCompanionGrowth();
    renderHouse();
    renderLoop();
    renderClock();
    renderTideEvent();
    renderStory();
    renderWorldActors();
    setAvatarTerrain(terrainAt(activeFarmMap(), farm.avatar.x, farm.avatar.y));
    positionAvatar();
    updateSprite();
    scheduleCameraUpdate();
    refreshIcons();
    elements.stage.dataset.level = String(renderedLevel);
    elements.stage.style.setProperty("--farm-level", String(renderedLevel));
    if (!hasRenderedOnce) {
      hasRenderedOnce = true;
      lastRenderedLevel = renderedLevel;
    } else if (renderedLevel > lastRenderedLevel) {
      lastRenderedLevel = renderedLevel;
      celebrateLevelUp(renderedLevel);
    }
  }

  function handleAction(action) {
    if (action === "auto-plant") batchPlant();
    if (action === "auto-water") batchWater();
    if (action === "auto-harvest") batchHarvest();
    if (action === "charge") useTideCharge();
    if (action === "sell-all") sellAllCrops();
    if (action === "claim-order") claimOrder();
    if (action === "claim-story") claimStoryReward();
    if (action === "open-house") openHouse();
    if (action === "close-house") closeHouse();
    if (action === "open-warehouse") openWarehouse();
    if (action === "close-warehouse") closeWarehouse();
  }

  root.addEventListener("click", (event) => {
    const plotActionButton = event.target.closest("[data-plot-action]");
    if (plotActionButton && !plotActionButton.disabled) {
      performPlotAction(plotActionButton.dataset.plotAction);
      return;
    }

    const plotMenuClose = event.target.closest("[data-plot-menu-close]");
    if (plotMenuClose) {
      closePlotMenu();
      return;
    }

    const actionButton = event.target.closest("[data-farm-action]");
    if (actionButton && !actionButton.disabled) {
      handleAction(actionButton.dataset.farmAction);
      return;
    }

    const storyActionButton = event.target.closest("[data-farm-story-action]");
    if (storyActionButton) {
      focusStoryAction(storyActionButton.dataset.farmStoryAction);
      return;
    }

    const npcButton = event.target.closest("[data-farm-npc]");
    if (npcButton) {
      focusStoryNpc();
      return;
    }

    const levelButton = event.target.closest("[data-farm-level-shrine]");
    if (levelButton) {
      focusLevelShrine();
      return;
    }

    const decorationNode = event.target.closest("[data-farm-decoration]");
    if (decorationNode) {
      const map = activeFarmMap();
      const point = map.anchors.decorations[decorationNode.dataset.farmDecoration];
      if (point) moveAvatarTo(point.x, point.y + 45, "idle", () => pulseStage());
      return;
    }

    const mapButton = event.target.closest("[data-farm-map]");
    if (mapButton) {
      switchFarmMap(mapButton.dataset.farmMap);
      return;
    }

    const zoomButton = event.target.closest("[data-farm-zoom]");
    if (zoomButton) {
      const camera = cameraFor();
      if (zoomButton.dataset.farmZoom === "reset") {
        centerCameraOn(farm.avatar.x, farm.avatar.y);
        return;
      }
      const direction = zoomButton.dataset.farmZoom === "in" ? 1 : -1;
      camera.scale = clamp(camera.scale + direction * 0.12, 0.55, 1.35);
      clampCamera();
      applyCamera();
      return;
    }

    const treasureButton = event.target.closest("[data-treasure-id]");
    if (treasureButton) {
      discoverTreasure(treasureButton.dataset.treasureId);
      return;
    }

    const gatherButton = event.target.closest("[data-gather-node]");
    if (gatherButton) {
      gatherNodeAt(gatherButton.dataset.gatherNode);
      return;
    }

    const landmarkButton = event.target.closest("[data-farm-landmark]");
    if (landmarkButton) {
      claimLandmark();
      return;
    }

    const fishingButton = event.target.closest("[data-fish-spot]");
    if (fishingButton) {
      castLine(fishingButton.dataset.fishSpot);
      return;
    }

    const recipeButton = event.target.closest("[data-craft-recipe]");
    if (recipeButton && !recipeButton.disabled) {
      craftRecipe(recipeButton.dataset.craftRecipe);
      return;
    }

    const fishButton = event.target.closest("[data-sell-fish]");
    if (fishButton && !fishButton.disabled) {
      sellFish(fishButton.dataset.sellFish, event.shiftKey);
      return;
    }

    const characterToggle = event.target.closest("[data-farm-character-toggle]");
    if (characterToggle) {
      farmCharactersExpanded = !farmCharactersExpanded;
      renderCharacterControls();
      refreshIcons();
      return;
    }

    const characterButton = event.target.closest("[data-farm-character]");
    if (characterButton) {
      selectFarmCharacter(characterButton.dataset.farmCharacter);
      return;
    }

    const formButton = event.target.closest("[data-farm-form]");
    if (formButton) {
      selectFarmForm(formButton.dataset.farmForm);
      return;
    }

    const plotButton = event.target.closest("[data-plot-id]");
    if (plotButton) {
      activatePlot(plotButton.dataset.plotId);
      return;
    }

    const maturityButton = event.target.closest("[data-focus-crop]");
    if (maturityButton) {
      activatePlot(maturityButton.dataset.focusCrop);
      return;
    }

    const seedButton = event.target.closest("[data-select-seed]");
    if (seedButton) {
      farm.selectedSeedId = seedButton.dataset.selectSeed;
      persistSoon();
      refresh();
      return;
    }

    const buyButton = event.target.closest("[data-buy-seed]");
    if (buyButton) {
      buySeed(buyButton.dataset.buySeed);
      return;
    }

    const sellButton = event.target.closest("[data-sell-crop]");
    if (sellButton) {
      sellCrop(
        sellButton.dataset.sellCrop,
        sellButton.dataset.sellAll === "true" || event.shiftKey,
      );
      return;
    }

    const upgradeButton = event.target.closest("[data-upgrade]");
    if (upgradeButton && !upgradeButton.disabled) {
      if (upgradeButton.dataset.upgrade === "land") upgradeLand();
      if (upgradeButton.dataset.upgrade === "house") upgradeHouse();
      if (upgradeButton.dataset.upgrade === "map") unlockNextMap();
      return;
    }

    const decorButton = event.target.closest("[data-buy-decor]");
    if (decorButton && !decorButton.disabled) {
      buyDecoration(decorButton.dataset.buyDecor);
      return;
    }

    const furnitureButton = event.target.closest("[data-furniture-id]");
    if (furnitureButton && !furnitureButton.disabled) {
      upgradeFurniture(furnitureButton.dataset.furnitureId);
    }
  });

  elements.viewport.addEventListener("pointerdown", (event) => {
    if (
      event.button !== 0 ||
      event.target.closest(
        ".farm-map-nav, .farm-map-minimap, .farm-character-dock, .farm-form-dock, .farm-zoom-controls, .farm-stage-clock, button",
      )
    ) {
      return;
    }
    const camera = cameraFor();
    drag.active = true;
    drag.pointerId = event.pointerId;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.cameraX = camera.x;
    drag.cameraY = camera.y;
    drag.moved = false;
    elements.viewport.classList.add("is-dragging");
    elements.viewport.setPointerCapture?.(event.pointerId);
  });

  elements.viewport.addEventListener("pointermove", (event) => {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.hypot(deltaX, deltaY) > 6) drag.moved = true;
    const camera = cameraFor();
    camera.x = drag.cameraX - deltaX;
    camera.y = drag.cameraY - deltaY;
    clampCamera();
    scheduleCameraUpdate();
  });

  function endMapDrag(event) {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    drag.active = false;
    elements.viewport.classList.remove("is-dragging");
    elements.viewport.releasePointerCapture?.(event.pointerId);
    if (drag.moved) {
      elements.viewport.dataset.suppressClick = "true";
      window.setTimeout(() => {
        delete elements.viewport.dataset.suppressClick;
      }, 0);
    }
  }

  elements.viewport.addEventListener("pointerup", endMapDrag);
  elements.viewport.addEventListener("pointercancel", endMapDrag);

  elements.viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const camera = cameraFor();
      const direction = event.deltaY < 0 ? 1 : -1;
      camera.scale = clamp(camera.scale + direction * 0.07, 0.55, 1.35);
      clampCamera();
      applyCamera();
    },
    { passive: false },
  );

  elements.viewport.addEventListener("click", (event) => {
    if (
      elements.viewport.dataset.suppressClick ||
      event.target.closest(
        ".farm-map-nav, .farm-map-minimap, .farm-character-dock, .farm-form-dock, .farm-zoom-controls, .farm-stage-clock, button",
      )
    ) {
      return;
    }
    const rect = elements.viewport.getBoundingClientRect();
    const camera = cameraFor();
    const x = (event.clientX - rect.left + camera.x) / camera.scale;
    const y = (event.clientY - rect.top + camera.y) / camera.scale;
    moveAvatarTo(x, y, "idle");
  });

  elements.minimap?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const rect = elements.minimap.getBoundingClientRect();
    const map = activeFarmMap();
    const x = ((event.clientX - rect.left) / rect.width) * map.worldWidth;
    const y = ((event.clientY - rect.top) / rect.height) * map.worldHeight;
    centerCameraOn(x, y);
  });

  const resizeHandler = () => {
    clampCamera();
    applyCamera();
  };
  window.addEventListener("resize", resizeHandler);

  elements.houseOverlay?.addEventListener("click", (event) => {
    if (event.target === elements.houseOverlay) closeHouse();
  });

  elements.warehouseOverlay?.addEventListener("click", (event) => {
    if (event.target === elements.warehouseOverlay) closeWarehouse();
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (elements.houseOverlay?.classList.contains("is-visible")) {
        event.stopPropagation();
        closeHouse();
        return;
      }
      if (elements.warehouseOverlay?.classList.contains("is-visible")) {
        event.stopPropagation();
        closeWarehouse();
        return;
      }
    }
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(
      event.key.toLowerCase(),
    )) {
      return;
    }
    const key = event.key.toLowerCase();
    event.preventDefault();
    const amount = event.shiftKey ? 84 : 42;
    let x = farm.avatar.x;
    let y = farm.avatar.y;
    if (key === "arrowup" || key === "w") y -= amount;
    if (key === "arrowdown" || key === "s") y += amount;
    if (key === "arrowleft" || key === "a") x -= amount;
    if (key === "arrowright" || key === "d") x += amount;
    moveAvatarTo(x, y, "idle");
  });

  spriteTimer = window.setInterval(() => {
    if (document.hidden || !root.closest(".screen-panel.is-active")) return;
    const character = selectedFarmCharacter();
    if (
      activeAction === "idle" &&
      characterForm() === "cute" &&
      character.idleSprite
    ) {
      return;
    }
    const frameCount = characterIdleFrames(character).length;
    actionFrame = (actionFrame + 1) % Math.max(1, frameCount);
    updateSprite();
  }, 280);

  const tickTimer = window.setInterval(() => {
    if (document.hidden || !root.closest(".screen-panel.is-active")) return;
    renderResources();
    renderActionDeck();
    renderPlots();
    renderMaturityList();
    renderPlotInspector();
    renderFishingSpots();
    renderGatherNodes();
    renderLandmark();
    renderLoop();
    renderClock();
    renderTideEvent();
    if (
      farm.fishing &&
      farm.fishing.mapId === activeFarmMap().id &&
      fishingReady() &&
      !farm.fishing.readyNotified
    ) {
      farm.fishing.readyNotified = true;
      persistSoon();
      showToast({
        title: "水面泛起了一圈银光",
        message: "浮漂动了，再次点击钓鱼点即可收线。",
        tone: "success",
        icon: "fish-symbol",
      });
    }
    readyPlots().forEach((plot) => {
      if (plot.readyNotified) return;
      plot.readyNotified = true;
      farm.lastMaturityAt = Date.now();
      persistSoon();
      showToast({
        title: `${getCrop(plot.cropId)?.name || "作物"}已经成熟`,
        message: `田地 ${plot.id + 1} 可以收获了。`,
        tone: "success",
        icon: "sparkles",
      });
    });
  }, 1000);

  positionAvatar();
  setAction("idle");
  refresh();
  centerCameraOn(farm.avatar.x, farm.avatar.y, activeFarmMap(), false);
  // 地形检查视图：?qa=terrain 拉远到整张地图，便于核对分区。
  if (inspectMode === "terrain") {
    const inspectTarget = activeFarmMap();
    const inspectCamera = cameraFor(inspectTarget);
    const bounds = cameraBounds(inspectTarget, inspectCamera.scale);
    inspectCamera.scale = clamp(
      Math.min(
        bounds.viewportWidth / inspectTarget.worldWidth,
        bounds.viewportHeight / inspectTarget.worldHeight,
      ) * 0.985,
      0.18,
      1,
    );
    centerCameraOn(
      inspectTarget.worldWidth / 2,
      inspectTarget.worldHeight / 2,
      inspectTarget,
      false,
    );
    // 自动走到指定地形，验证形态切换：?qa=terrain&walk=water
    const walkTarget = new URLSearchParams(window.location.search).get("walk");
    const walkZone = walkTarget
      ? inspectTarget.terrainZones.find((zone) => zone.type === walkTarget)
      : null;
    if (walkZone) {
      const probe = terrainZoneProbePoint(inspectTarget, walkZone);
      window.setTimeout(() => {
        moveAvatarTo(probe.x, probe.y, "idle");
        window.setTimeout(() => {
          document.documentElement.dataset.qaTerrainAction = `${avatarTerrainType}:${elements.avatar.dataset.action}`;
        }, 1250);
        window.setTimeout(() => {
          document.documentElement.dataset.qaTerrainResult = [
            walkTarget,
            avatarTerrainType,
            `target=${terrainAt(inspectTarget, probe.x, probe.y)}`,
            `at=${Math.round(farm.avatar.x)},${Math.round(farm.avatar.y)}`,
            `to=${Math.round(probe.x)},${Math.round(probe.y)}`,
          ].join(">");
        }, 2400);
      }, 800);
    }
  }
  if (inspectMode) {
    const inspectPoints = FARM_MAPS.flatMap((map) => [
      ...map.fishSpots.map((point) => ({ ...point, map })),
      ...map.treasures.map((point) => ({ ...point, map })),
      ...map.gatherNodes.map((point) => ({ ...point, map })),
      { ...map.landmark, map },
    ]);
    document.documentElement.dataset.qaLockedPoints = String(
      inspectPoints.filter(
        (point) => !pointIsUnlocked(point.x, point.y, point.map),
      ).length,
    );
    // 地形自检：田地、采集点、装饰、房屋落脚点不应落在水域或峭壁里。
    const terrainProbes = FARM_MAPS.flatMap((map) => [
      ...map.positions.map((point, index) => ({
        map,
        x: point.x,
        y: point.y + 58,
        name: `plot-${index + 1}`,
        mustWalk: true,
      })),
      ...map.fishSpots.map((point) => ({ map, x: point.x, y: point.y, name: point.id })),
      ...map.gatherNodes.map((point) => ({ map, x: point.x, y: point.y + 50, name: point.id })),
      {
        map,
        x: map.anchors.house.x,
        y: map.anchors.house.y + 58,
        name: "house",
        mustWalk: true,
      },
      ...Object.entries(map.anchors.decorations).map(([id, point]) => ({
        map,
        x: point.x,
        y: point.y,
        name: id,
      })),
    ]);
    // 田地和房屋必须能走上去；钓点、采集点、装饰允许位于水面或岩壁。
    const terrainConflicts = terrainProbes.filter(
      (probe) =>
        probe.mustWalk &&
        terrainAt(probe.map, probe.x, probe.y) !== "ground",
    );
    document.documentElement.dataset.qaTerrainConflicts = String(terrainConflicts.length);
    document.documentElement.dataset.qaTerrainConflictList = terrainConflicts
      .map((probe) => `${probe.map.id}:${probe.name}:${terrainAt(probe.map, probe.x, probe.y)}`)
      .join("|");
    document.documentElement.dataset.qaTerrainSouthHits = String(
      terrainProbes.filter(
        (probe) => !probe.mustWalk && terrainAt(probe.map, probe.x, probe.y) !== "ground",
      ).length,
    );
    // 网格采样统计各地形覆盖面积，确认分区确实生效。
    const gridColumns = 48;
    const gridRows = 27;
    document.documentElement.dataset.qaTerrainProbe = FARM_MAPS.map((map) => {
      const tally = { water: 0, cliff: 0, waterfall: 0 };
      for (let column = 0; column < gridColumns; column += 1) {
        for (let row = 0; row < gridRows; row += 1) {
          const type = terrainAt(
            map,
            ((column + 0.5) / gridColumns) * map.worldWidth,
            ((row + 0.5) / gridRows) * map.worldHeight,
          );
          if (tally[type] !== undefined) tally[type] += 1;
        }
      }
      return `${map.id}:zones=${(map.terrainZones || []).length},water=${tally.water},cliff=${tally.cliff},waterfall=${tally.waterfall}`;
    }).join("|");
    // 从房屋出发去田地：不应被水面或瀑布阻断。
    document.documentElement.dataset.qaTerrainRoutes = FARM_MAPS.map((map) => {
      const start = { x: map.anchors.house.x, y: map.anchors.house.y + 58 };
      const last = map.positions[map.positions.length - 1];
      return `${map.id}:${terrainAlongPath(map, start.x, start.y, last.x, last.y + 58)}`;
    }).join("|");
    window.setTimeout(() => {
      showToast({
        title: inspectAll ? "检查模式 · 全解锁" : "检查模式已开启",
        message: inspectAll
          ? "三张海图、全部田地、资源与装饰均已就绪；本次检查不会写入正式存档。"
          : "三张海图和全部田地已解锁，资源和潮汛已补足；装饰仍从零开始购买。",
        tone: "success",
        icon: "scan-search",
      });
    }, 420);
  }

  return {
    render: refresh,
    rewardTask,
    rewardPerfectDay,
    rewardFocusSession,
    rewardStreakMilestone,
    activate() {
      if (!farm.farmVisited) {
        farm.farmVisited = true;
        persistSoon();
      }
      refresh();
    },
    setCharacter() {
      refresh();
    },
    setForm(formId) {
      if (formIsUnlocked(formId)) farm.characterForm = formId;
      refresh();
    },
    destroy() {
      window.clearInterval(spriteTimer);
      window.clearInterval(tickTimer);
      window.clearInterval(avatarIdleTimer);
      window.clearTimeout(saveTimer);
      window.clearTimeout(actionTimer);
      window.cancelAnimationFrame(motionFrame);
      window.cancelAnimationFrame(cameraFrame);
      avatarIdleTimer = null;
      cameraFrame = null;
      window.removeEventListener("resize", resizeHandler);
    },
  };
}
window.TidalFarmGame = { createFarmGame };
})();
