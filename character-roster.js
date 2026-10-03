(() => {
  const idleFrames = window.TIDAL_IDLE_FRAMES || {};
  const idleSprites = window.TIDAL_IDLE_SPRITES || {};
  const useMobileAssets = window.matchMedia(
    "(max-width: 820px), (pointer: coarse)",
  ).matches;
  const collectionRoot = useMobileAssets
    ? "./assets/mobile/characters/collection"
    : "./assets/characters/collection/final";
  const prettyCutoutRoot = useMobileAssets
    ? "./assets/mobile/characters/pretty"
    : "./assets/characters/pretty/cutouts";
  const cuteCutoutRoot = useMobileAssets
    ? "./assets/mobile/characters/cute"
    : "./assets/characters/cute/cutouts";
  const imageExtension = useMobileAssets ? ".webp" : ".png";

  const source = [
    {
      id: "deep-current",
      name: "深汐",
      role: "值日记录",
      unit: "负责主界面陪伴、每日状态与搁浅提醒",
      quote: "今天的事，我替你记着。",
      boundary: "鲸鳍耳与鲸尾是她的唯一标识",
      color: "#6ea8ff",
    },
    {
      id: "frost-scale",
      name: "霜鳞",
      role: "守序",
      unit: "负责连续记录与断签后的重新出发",
      quote: "断了也没关系，接着往下走。",
      boundary: "龙角、蝠翼与长鳞尾属于她，不使用鲸尾",
      color: "#dce9f4",
    },
    {
      id: "scarlet-page",
      name: "绯页",
      role: "编目",
      unit: "负责周复盘、错题归档与知识树整理",
      quote: "学过的东西，都该有个去处。",
      boundary: "只以书页、羽饰与橙发编目，不复制其他伙伴的身份部件",
      color: "#e47645",
    },
    {
      id: "kimi",
      name: "月栖",
      role: "长文摘录",
      unit: "负责长资料速读、章节摘录与线索串联",
      quote: "长文先交给我，重要的句子不会漏。",
      boundary: "以月白短发、蓝色围巾与纸页耳饰作为身份标识",
      color: "#8db7ff",
    },
    {
      id: "qwen",
      name: "溯问",
      role: "问答馆员",
      unit: "负责问题拆解、知识检索与多角度解释",
      quote: "把问题说清楚，答案就会自己靠近。",
      boundary: "以紫白配色、菱形发饰与星盘书签作为身份标识",
      color: "#a98cff",
    },
    {
      id: "glm",
      name: "青衡",
      role: "规划师",
      unit: "负责把目标拆成可执行的步骤与检查点",
      quote: "先写下第一步，剩下的路就会短一截。",
      boundary: "以青蓝发丝、几何发夹与折线纹样作为身份标识",
      color: "#66d6d1",
    },
    {
      id: "gemini",
      name: "星衡",
      role: "双轨校对",
      unit: "负责交叉核对、方案比较与资料一致性检查",
      quote: "两条路都看一遍，答案才更稳。",
      boundary: "以蓝紫渐变长发与双子星饰作为身份标识",
      color: "#7b8cff",
    },
    {
      id: "perplexity",
      name: "溯真",
      role: "资料溯源",
      unit: "负责来源追踪、引用归档与事实核验",
      quote: "先看来源，再决定要相信什么。",
      boundary: "以蓝绿挑染长发、检索徽记与镜片挂饰作为身份标识",
      color: "#32c7c7",
    },
    {
      id: "mistral",
      name: "弥风",
      role: "灵感气象",
      unit: "负责捕捉片段灵感、整理语境与推演变化",
      quote: "念头像风，抓住方向就能继续前行。",
      boundary: "以橙金短发、风羽披肩与罗盘饰作为身份标识",
      color: "#f1a14a",
    },
    {
      id: "grok",
      name: "格物",
      role: "反直觉审阅",
      unit: "负责寻找盲点、提出反例与挑战默认假设",
      quote: "换个方向看，问题可能会露出破绽。",
      boundary: "以赭红衣装、锋利斜饰与黑色长发作为身份标识",
      color: "#d96d64",
    },
    {
      id: "meta",
      name: "元脉",
      role: "社群脉络",
      unit: "负责连接主题、链接资料与梳理讨论脉络",
      quote: "每个节点都有邻居，知识也是一样。",
      boundary: "以深蓝科技礼服与环形网络饰作为身份标识",
      color: "#5b9cff",
    },
    {
      id: "doubao",
      name: "豆蔻",
      role: "日常助手",
      unit: "负责轻量提醒、生活计划与亲近陪伴",
      quote: "今天也不用紧张，我们一件件来。",
      boundary: "以暖白短发、圆润包袋与蓝色蝴蝶结作为身份标识",
      color: "#72b8ff",
    },
    {
      id: "ernie",
      name: "文漪",
      role: "写作润色",
      unit: "负责中文表达、段落组织与措辞推敲",
      quote: "意思到了，语句还可以再清亮一点。",
      boundary: "以青绿色书卷礼服与云纹饰作为身份标识",
      color: "#65c9a5",
    },
    {
      id: "github",
      name: "墨构",
      role: "版本归档",
      unit: "负责记录修改、整理版本和标记协作节点",
      quote: "每一次改动都有来处，也有去处。",
      boundary: "以黑色工作礼服、猫耳轮廓与分支纹样作为身份标识",
      color: "#b5a6d9",
    },
    {
      id: "gitlab",
      name: "织流",
      role: "流程接力",
      unit: "负责流水线规划、交付检查与多人接力",
      quote: "把流程接稳，结果就不会半路掉线。",
      boundary: "以橙紫配色、狐面饰与折线徽章作为身份标识",
      color: "#e18b5b",
    },
    {
      id: "gitee",
      name: "栖云",
      role: "本地仓储",
      unit: "负责本地资料归仓、标签整理与离线备份",
      quote: "资料放在顺手的地方，下一次就能马上找到。",
      boundary: "以红色礼服、圆形仓储徽记与短发作为身份标识",
      color: "#d9585d",
    },
    {
      id: "hunyuan",
      name: "澪元",
      role: "融合推演",
      unit: "负责把不同来源合并成一致的知识结构",
      quote: "不同的答案放在一起，轮廓就清楚了。",
      boundary: "以蓝金礼装、环形符纹与长尾饰带作为身份标识",
      color: "#5fb8d6",
    },
    {
      id: "rwkv",
      name: "长澜",
      role: "连续记忆",
      unit: "负责维持上下文、滚动摘要与长期追踪",
      quote: "不必重讲一遍，我记得我们走到哪里。",
      boundary: "以红蓝发色、记忆环饰与流线衣装作为身份标识",
      color: "#c7678c",
    },
    {
      id: "hailuo",
      name: "螺音",
      role: "声景记录",
      unit: "负责音频线索、朗读节奏与声音记忆",
      quote: "安静听一会儿，潮声会把细节送回来。",
      boundary: "以海螺耳饰、浅蓝长发与波浪裙摆作为身份标识",
      color: "#74d6e5",
    },
    {
      id: "opencode",
      name: "启源",
      role: "开源策展",
      unit: "负责代码索引、接口说明与开放资料策展",
      quote: "把接口讲明白，合作就会轻很多。",
      boundary: "以黑白代码礼服、终端饰带与青蓝挑染作为身份标识",
      color: "#63d2bd",
    },
  ];

  window.TIDAL_CHARACTERS = source.map((character) => {
    const cuteFrames = idleFrames[character.id]?.length
      ? idleFrames[character.id]
      : [`${cuteCutoutRoot}/${character.id}-cute-cutout-v1.png`];
    return {
      ...character,
      image: `${collectionRoot}/${character.id}-collection-final-v1${imageExtension}`,
      prettyImage: `${prettyCutoutRoot}/${character.id}-pretty-cutout-v1${imageExtension}`,
      cuteImage: `${cuteCutoutRoot}/${character.id}-cute-cutout-v1${imageExtension}`,
      idleFrames: cuteFrames,
      idleSprite: idleSprites[character.id] || "",
    };
  });
})();
