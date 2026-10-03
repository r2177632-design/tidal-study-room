(() => {
  const designs = {
    "deep-current": {
      pet: "潮鲸",
      glyph: `
        <path class="mark-fill" d="M12 34c4-10 18-15 30-10 9 4 12 10 9 15-4 8-19 12-31 7-5-2-8-7-8-12Z"/>
        <path d="M42 29c3-5 8-8 12-7-2 4-2 8 1 12-5 1-9-1-13-5Z"/>
        <path d="M17 36c4 6 12 9 21 7"/>
        <circle class="mark-fill" cx="21" cy="33" r="1.8"/>
      `,
    },
    "frost-scale": {
      pet: "霜龙",
      glyph: `
        <path class="mark-fill" d="M21 18 15 9l17 10c8 1 14 6 16 13l-11 5c-8 9-19 8-24 1l7-11Z"/>
        <path d="M38 31c7 4 11 10 11 17-7-3-13-3-19 1"/>
        <path d="M27 31c4 4 8 5 13 3"/>
        <circle class="mark-fill" cx="27" cy="28" r="1.8"/>
      `,
    },
    "scarlet-page": {
      pet: "书狐",
      glyph: `
        <path class="mark-fill" d="m18 18-2-9 10 6c5-2 11-1 15 3l-2 18-14 8-12-10Z"/>
        <path d="m16 22 10 5 9-6M31 34v10"/>
        <path d="m31 42-9 7m9-7 10 7"/>
        <circle class="mark-fill" cx="25" cy="28" r="1.6"/>
      `,
    },
    kimi: {
      pet: "月兔",
      glyph: `
        <path class="mark-fill" d="M24 29c-6-9-6-17-2-21 5 3 8 10 8 19Z"/>
        <path class="mark-fill" d="M35 29c1-10 5-17 10-19 3 6 0 14-4 21Z"/>
        <path class="mark-fill" d="M20 35c2-8 8-12 15-10 8 2 12 11 9 19-3 7-12 11-19 7-6-3-7-10-5-16Z"/>
        <path d="M25 37c4 2 8 2 12 0"/>
        <circle class="mark-fill" cx="27" cy="35" r="1.5"/>
        <circle class="mark-fill" cx="38" cy="35" r="1.5"/>
      `,
    },
    qwen: {
      pet: "星鸮",
      glyph: `
        <path class="mark-fill" d="M14 20 20 9l8 8h10l8-8 5 12c5 9 2 23-8 28-7 4-17 4-24 0-10-6-12-19-5-29Z"/>
        <path d="m23 30 6-5 6 5-6 6Zm12 0 6-5 7 5-7 6Z"/>
        <path d="M28 43c5 2 10 2 15 0"/>
      `,
    },
    glm: {
      pet: "衡龟",
      glyph: `
        <path class="mark-fill" d="M17 33c2-10 12-16 23-12 9 3 13 12 10 20-4 10-23 12-32 3-3-3-3-7-1-11Z"/>
        <path d="M24 27v14m10-17v20m-14-9h26M31 22l8 11-9 12-8-12 9-11Z"/>
        <circle class="mark-fill" cx="17" cy="34" r="2"/>
      `,
    },
    gemini: {
      pet: "双鲤",
      glyph: `
        <path class="mark-fill" d="M8 38c8-9 18-10 25-4l-7 6c9 0 16 4 21 10-9 1-16-1-21-6-6 6-12 6-18 2Z"/>
        <path class="mark-fill" d="M56 27c-8-9-18-10-25-4l7 6c-9 0-16 4-21 10 9 1 16-1 21-6 6 6 12 6 18 2Z"/>
        <circle class="mark-fill" cx="18" cy="33" r="1.6"/>
        <circle class="mark-fill" cx="46" cy="37" r="1.6"/>
      `,
    },
    perplexity: {
      pet: "镜獭",
      glyph: `
        <path class="mark-fill" d="M17 33c0-9 8-15 17-13 11 2 17 12 14 22-4 12-20 14-28 6-2-3-3-8-3-15Z"/>
        <path d="M15 26 8 20m8 10-9 2m13-15 1-8"/>
        <circle cx="35" cy="35" r="9"/>
        <path d="m41 42 8 8M31 35h8M35 31v8"/>
        <circle class="mark-fill" cx="26" cy="31" r="1.6"/>
      `,
    },
    mistral: {
      pet: "风狐",
      glyph: `
        <path class="mark-fill" d="m20 22-2-11 11 7c7-2 14 1 18 7 3 5 2 11-2 15-10 9-26 5-29-4-1-5 0-10 4-14Z"/>
        <path d="M12 43c8 4 15 4 23 0 6-3 10-2 15 2M16 50c8 3 15 2 22-2"/>
        <path d="m20 27 6-3 5 4-6 4Z"/>
        <circle class="mark-fill" cx="24" cy="35" r="1.6"/>
      `,
    },
    grok: {
      pet: "审鸦",
      glyph: `
        <path class="mark-fill" d="M13 29c5-12 16-18 28-14 7 2 11 7 13 13l-11 3-7 15-13-2-7-9Z"/>
        <path d="m35 25 14-5-10 12 5 15-12-12"/>
        <circle class="mark-fill" cx="27" cy="28" r="1.8"/>
        <path d="m18 29 8 2"/>
      `,
    },
    meta: {
      pet: "脉络章鱼",
      glyph: `
        <path class="mark-fill" d="M17 27c1-10 9-16 19-14 10 2 15 11 12 20-2 7-10 11-18 9-8-1-14-7-13-15Z"/>
        <path d="M21 35c-5 4-7 9-6 15m12-13c-4 6-4 11-1 16m9-16c0 7 2 12 7 16m4-17c5 3 8 8 8 14"/>
        <circle class="mark-fill" cx="27" cy="25" r="1.6"/>
        <circle class="mark-fill" cx="37" cy="25" r="1.6"/>
      `,
    },
    doubao: {
      pet: "暖犬",
      glyph: `
        <path class="mark-fill" d="M17 22c1-6 5-10 10-10l3 8c4-2 8-2 12 0l4-8c5 2 8 8 7 15-1 10-8 17-18 17S16 37 17 22Z"/>
        <path d="M23 37c6 4 13 4 19 0M26 43c4 2 8 2 12 0"/>
        <circle class="mark-fill" cx="26" cy="28" r="1.8"/>
        <circle class="mark-fill" cx="39" cy="28" r="1.8"/>
        <path class="mark-fill" d="m48 12 8 5-8 5-8-5Z"/>
      `,
    },
    ernie: {
      pet: "文鲤",
      glyph: `
        <path class="mark-fill" d="M13 36c9-11 23-15 36-8 4 2 7 5 9 9-9 9-22 13-35 8-6-2-9-5-10-9Z"/>
        <path d="M22 37c7-3 14-3 22-1M28 35c1-5 3-9 7-12m-3 12c3 3 4 7 3 11"/>
        <path d="M16 43c-2 4-5 7-9 8 1-5 0-9-2-13"/>
        <circle class="mark-fill" cx="19" cy="33" r="1.8"/>
      `,
    },
    github: {
      pet: "分支猫",
      glyph: `
        <path class="mark-fill" d="m18 22-2-10 12 8c6-2 12-1 16 3 5 6 4 16-3 21-8 5-19 2-23-6-2-5-2-11 0-16Z"/>
        <path d="M42 43c7 3 8 8 4 12M18 43c-6 5-9 5-12 2"/>
        <path d="M21 31h20M28 31v-8h7m-4 0v8"/>
        <circle class="mark-fill" cx="26" cy="38" r="1.6"/>
        <circle class="mark-fill" cx="38" cy="38" r="1.6"/>
      `,
    },
    gitlab: {
      pet: "织狐",
      glyph: `
        <path class="mark-fill" d="m19 21-1-11 11 8c7-2 14 1 18 7 7 11-1 24-14 24-9 0-16-6-18-15Z"/>
        <path d="m21 25 11 7 12-9M32 32l-9 17m9-17 11 17M19 31h26"/>
        <circle class="mark-fill" cx="25" cy="28" r="1.6"/>
      `,
    },
    gitee: {
      pet: "仓熊",
      glyph: `
        <path class="mark-fill" d="M16 27c0-9 8-15 18-14 10 1 16 8 15 17l-2 14c-1 6-7 10-14 9H25c-8 0-13-7-12-15Z"/>
        <path d="M20 28c3-5 8-7 13-4 5-3 10-1 13 4M22 42h22"/>
        <path class="mark-fill" d="m20 20-9-5 13-2Zm27 0 9-5-13-2Z"/>
        <circle class="mark-fill" cx="27" cy="31" r="1.7"/>
        <circle class="mark-fill" cx="39" cy="31" r="1.7"/>
      `,
    },
    hunyuan: {
      pet: "环水母",
      glyph: `
        <path class="mark-fill" d="M14 31c0-11 9-19 20-19 12 0 20 9 19 20-1 5-5 8-11 8H24c-6 0-10-3-10-9Z"/>
        <path d="M22 39c-1 7-4 11-9 14m17-14c0 6 0 11-4 15m12-15c1 7 4 11 9 14"/>
        <circle cx="34" cy="29" r="9"/>
        <path d="m31 23 7 6-7 7-6-7Z"/>
        <circle class="mark-fill" cx="22" cy="29" r="1.6"/>
      `,
    },
    rwkv: {
      pet: "记忆龟",
      glyph: `
        <path class="mark-fill" d="M14 36c1-10 10-17 22-15 12 2 18 12 14 21-5 11-27 12-35 3-2-2-3-5-1-9Z"/>
        <path d="M22 27c2 8 2 15 0 22m14-24c3 9 3 17 0 24M18 35h31M31 21l10 14-11 14-10-14Z"/>
        <path d="M48 25c7 4 8 11 2 16"/>
        <circle class="mark-fill" cx="15" cy="35" r="1.8"/>
      `,
    },
    hailuo: {
      pet: "螺音蟹",
      glyph: `
        <path class="mark-fill" d="M36 18c9-2 17 4 18 13 1 7-2 12-8 15-7 3-15-1-18-8-3-8 0-17 8-20Z"/>
        <path d="M38 23c5 1 8 5 8 10 0 5-4 8-9 8m7-18c5 4 7 9 5 14"/>
        <path d="M26 29c-7-7-13-8-18-3 7 0 10 3 10 9m8 1c-4 8-8 13-16 12 5-2 7-6 7-12"/>
        <circle class="mark-fill" cx="23" cy="39" r="1.6"/>
        <circle class="mark-fill" cx="13" cy="34" r="1.8"/>
      `,
    },
    opencode: {
      pet: "终端猫",
      glyph: `
        <path class="mark-fill" d="m17 22-2-10 12 8c7-1 14 1 17 7 4 7 1 17-6 21-9 5-20 1-23-8-2-6-1-13 2-18Z"/>
        <path d="m21 29 7 5-7 5m10 0h12M45 42c6 3 8 8 5 12"/>
        <path d="m13 23-6 4 6 4"/>
        <circle class="mark-fill" cx="25" cy="23" r="1.5"/>
        <circle class="mark-fill" cx="37" cy="23" r="1.5"/>
      `,
    },
  };

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function get(character) {
    return designs[character?.id] || designs["deep-current"];
  }

  function petName(character) {
    return get(character).pet;
  }

  function markup(character, size = "md", extraClass = "") {
    if (!character) return "";
    const design = get(character);
    const label = `${character.name}专属印记，${design.pet}`;
    const color = /^#[0-9a-f]{3,8}$/i.test(character.color || "")
      ? character.color
      : "#7de6e3";
    return `
      <span
        class="character-mark is-${size} ${extraClass}"
        style="--mark-color:${escapeAttribute(color)}"
        role="img"
        aria-label="${escapeAttribute(label)}"
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle class="mark-frame" cx="32" cy="32" r="27"/>
          <path class="mark-ticks" d="M32 3v6M32 55v6M3 32h6M55 32h6M11 11l4 4m34 34 4 4m0-42-4 4M15 49l-4 4"/>
          <g class="mark-pet">${design.glyph}</g>
          <circle class="mark-core" cx="32" cy="32" r="2.2"/>
        </svg>
      </span>
    `;
  }

  window.TidalCharacterMarks = {
    designs,
    get,
    petName,
    markup,
  };
})();
