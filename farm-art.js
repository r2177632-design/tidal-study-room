(() => {
  const escaped = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  function hash(value) {
    return [...String(value)].reduce(
      (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
      2166136261,
    );
  }

  function svg(id, label, body, viewBox = "0 0 100 100") {
    const gradientId = `farm-art-${hash(id)}`;
    return `
      <svg class="farm-asset-svg" viewBox="${viewBox}" role="img" aria-label="${escaped(label)}">
        <title>${escaped(label)}</title>
        <defs>
          <linearGradient id="${gradientId}" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="rgba(255,255,255,.34)" />
            <stop offset="1" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <g class="farm-asset-body">${body}</g>
        <path d="M14 82c17 12 54 13 72-2" fill="none" stroke="rgba(207,247,233,.18)" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }

  function kelp() {
    return svg(
      "crop:tide-kelp",
      "潮纹藻",
      `
        <path d="M49 84c-4-20-2-39 7-65 5 18 5 40-2 65Z" fill="#48b77f"/>
        <path d="M50 80c-11-12-20-24-24-39 13 5 24 17 30 32Z" fill="#75dca2"/>
        <path d="M55 68c8-12 16-21 26-27-2 13-9 26-20 36Z" fill="#2d9f72"/>
        <path d="M50 75c-2-20 0-39 6-57" fill="none" stroke="#d9f7c6" stroke-width="2" stroke-linecap="round"/>
        <circle cx="28" cy="73" r="4" fill="#f3cf77"/>
      `,
    );
  }

  function bellFlower() {
    return svg(
      "crop:sea-bell",
      "海铃花",
      `
        <path d="M50 82c1-23 1-42 0-61" fill="none" stroke="#557c72" stroke-width="5" stroke-linecap="round"/>
        <path d="M50 57c-13-1-23-8-28-21 15 1 25 7 31 18Z" fill="#7fc99a"/>
        <path d="M51 65c11-4 18-13 21-26-13 4-21 12-24 23Z" fill="#a6dda8"/>
        <path d="M33 29c0-11 8-18 18-18s17 8 17 18c0 14-11 27-18 32-8-6-17-19-17-32Z" fill="#799dff"/>
        <path d="M38 30c4-8 19-9 24 0-1 12-8 21-12 24-5-5-10-13-12-24Z" fill="#c8d5ff"/>
        <circle cx="51" cy="31" r="4" fill="#f3cf77"/>
      `,
    );
  }

  function berries() {
    return svg(
      "crop:moon-berry",
      "月潮莓",
      `
        <path d="M52 50c-1-18-8-29-22-36" fill="none" stroke="#355d61" stroke-width="6" stroke-linecap="round"/>
        <path d="M50 47c14-12 26-17 37-15-10 10-23 17-37 20Z" fill="#7bc298"/>
        <path d="M36 49c-13-10-23-14-32-11 8 10 19 16 32 18Z" fill="#93d2a6"/>
        <circle cx="35" cy="61" r="16" fill="#8066ce"/>
        <circle cx="58" cy="59" r="15" fill="#9c83ea"/>
        <circle cx="48" cy="75" r="15" fill="#7257ba"/>
        <circle cx="31" cy="56" r="4" fill="#eadfff"/>
        <circle cx="55" cy="54" r="3" fill="#eadfff"/>
      `,
    );
  }

  function coralFruit() {
    return svg(
      "crop:coral-fruit",
      "珊瑚果",
      `
        <path d="M50 86V45" fill="none" stroke="#477869" stroke-width="6" stroke-linecap="round"/>
        <path d="M51 60c-12-6-21-16-26-29M52 68c13-6 22-17 26-31M50 49c-7-12-9-23-6-34" fill="none" stroke="#55977d" stroke-width="5" stroke-linecap="round"/>
        <circle cx="25" cy="31" r="10" fill="#ef7f5d"/>
        <circle cx="78" cy="37" r="10" fill="#f39a66"/>
        <circle cx="44" cy="15" r="10" fill="#f5b065"/>
        <circle cx="54" cy="35" r="13" fill="#ef684f"/>
        <circle cx="62" cy="53" r="10" fill="#f39561"/>
        <circle cx="22" cy="29" r="3" fill="#ffe1ae"/>
        <circle cx="55" cy="32" r="4" fill="#ffd4a5"/>
      `,
    );
  }

  function plantStem(color = "#5eb383", accent = "#d6f2b7") {
    return `
      <path d="M50 88c2-24 1-47-3-70" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
      <path d="M49 64c-13-4-21-12-26-23 14 1 24 8 29 20Z" fill="${color}"/>
      <path d="M51 53c10-5 17-14 21-25-12 2-20 10-24 22Z" fill="${accent}"/>
    `;
  }

  function fish({ body, belly, fin, tail, spots = false, crest = false }) {
    return svg(
      `fish:${body}:${tail}:${fin}`,
      "海物",
      `
        <path d="M28 52c13-25 45-31 65-13-9 27-42 36-65 13Z" fill="${body}"/>
        <path d="M39 63c14 11 36 8 51-11-17 10-34 13-51 11Z" fill="${belly}"/>
        <path d="M79 51c10-13 17-18 19-17-1 7-4 15-10 24-2-4-5-7-9-7Z" fill="${tail}"/>
        <path d="M47 37c4-12 10-17 18-17-2 8-7 15-15 21Z" fill="${fin}"/>
        <path d="M42 64c-2 11 2 17 12 19-3-8-3-15 0-20Z" fill="${fin}"/>
        <circle cx="50" cy="47" r="3.4" fill="#071f29"/>
        <circle cx="51" cy="46" r="1.1" fill="#f6ffff"/>
        ${spots ? '<circle cx="65" cy="45" r="4" fill="rgba(255,255,255,.55)"/><circle cx="73" cy="54" r="3" fill="rgba(255,255,255,.45)"/>' : ""}
        ${crest ? '<path d="M55 28l5-10 3 10 9-5-6 10" fill="none" stroke="#f5d37c" stroke-width="3" stroke-linejoin="round"/>' : ""}
      `,
    );
  }

  function shellBed() {
    return svg(
      "gather:shell-cove",
      "浅湾贝床",
      `
        <ellipse cx="50" cy="72" rx="34" ry="12" fill="#7fb9b1"/>
        <path d="M24 69c0-24 12-40 27-40s27 16 27 40c-8-9-18-14-27-14s-19 5-27 14Z" fill="#f4dfc2"/>
        <path d="M52 32v34M39 38l10 27M65 38L58 65" fill="none" stroke="#d5ad80" stroke-width="2"/>
        <circle cx="25" cy="72" r="6" fill="#76d7d0"/>
        <circle cx="78" cy="69" r="8" fill="#aeece2"/>
      `,
    );
  }

  function crystal(color = "#81d9ea", accent = "#e8fbff") {
    return svg(
      `crystal:${color}`,
      "潮晶",
      `
        <path d="M33 81 40 34l12-15 7 18-3 44Z" fill="${color}"/>
        <path d="m40 34 12 3 7-18-12 5Z" fill="${accent}"/>
        <path d="m52 37-2 42 18-37-3-13Z" fill="${accent}" opacity=".72"/>
        <path d="m28 83 29-8 18 8-18 7Z" fill="rgba(226,255,251,.45)"/>
      `,
    );
  }

  function scroll() {
    return svg(
      "treasure:whale-score",
      "鲸歌残谱",
      `
        <path d="M24 33c12-8 25-8 38 0v44c-13-8-26-8-38 0Z" fill="#e8d3a9"/>
        <path d="M62 33c7-5 13-5 18 0v44c-6-5-12-5-18 0Z" fill="#f6e8c8"/>
        <path d="M32 43h22M32 51h19M68 44h7M68 52h7" stroke="#8e6c49" stroke-width="2" stroke-linecap="round"/>
        <path d="M42 67c4-8 12-8 16 0 4-8 11-6 13 1" fill="none" stroke="#5ca7a7" stroke-width="2.5" stroke-linecap="round"/>
      `,
    );
  }

  function treasureIcon(kind, color = "#f3cf77") {
    const bodies = {
      sundial: `
        <ellipse cx="50" cy="68" rx="30" ry="12" fill="#977d58"/>
        <path d="M31 61h38v10c-12 8-26 8-38 0Z" fill="#c39a64"/>
        <path d="m50 60-18-21 18 8 18-8Z" fill="#d8dbd0"/>
        <path d="M50 47v14" stroke="#2b4c51" stroke-width="3"/>
      `,
      crate: `
        <path d="M24 35h52v46H24Z" fill="#8d6c47"/>
        <path d="M29 40h42v36H29Z" fill="#c49a64"/>
        <path d="m31 42 38 32M69 42 31 74" stroke="#6d5136" stroke-width="5"/>
        <path d="M45 29h10v10H45Z" fill="#77d7ba"/>
      `,
      key: `
        <circle cx="35" cy="37" r="16" fill="none" stroke="${color}" stroke-width="8"/>
        <path d="m46 49 29 29M62 66l8-8M70 74l8-8" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
      `,
      compass: `
        <circle cx="50" cy="52" r="31" fill="#173f50" stroke="${color}" stroke-width="5"/>
        <circle cx="50" cy="52" r="23" fill="#d9f6ed"/>
        <path d="m57 36-4 16-16 8 8-17Z" fill="#ef7d68"/>
        <circle cx="50" cy="52" r="4" fill="#1f5361"/>
        <path d="M50 15v8M50 81v8M13 52h8M79 52h8" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      `,
      crown: `
        <path d="m20 63 6-37 18 18 6-29 9 29 18-18 4 37Z" fill="${color}"/>
        <path d="M24 67h52l-5 12H29Z" fill="#b98f47"/>
        <circle cx="49" cy="33" r="5" fill="#79d8d1"/>
      `,
      chart: `
        <path d="M24 25h52v57H24Z" fill="#e9d6aa"/>
        <path d="M31 36h25M31 46h36M31 56h29" stroke="#64868a" stroke-width="2"/>
        <path d="m32 76 12-18 10 7 20-26" fill="none" stroke="#d96f57" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="76" cy="37" r="5" fill="#efc965"/>
      `,
      idol: `
        <path d="M34 78c0-22 6-39 16-51 10 12 16 29 16 51Z" fill="#f09a89"/>
        <path d="M41 78V44M59 78V44M50 78V36" stroke="#ffe0cf" stroke-width="4" stroke-linecap="round"/>
        <path d="M31 78h38" stroke="#7e5e53" stroke-width="6" stroke-linecap="round"/>
      `,
      pearl: `
        <path d="M50 79C28 68 22 48 35 32c9-10 24-10 33 0 12 16 6 36-18 47Z" fill="#74d9d3"/>
        <circle cx="50" cy="52" r="16" fill="#fff4c9"/>
        <circle cx="45" cy="46" r="5" fill="#ffffff"/>
      `,
    };
    return svg(
      `treasure-kind:${kind}`,
      "遗物",
      bodies[kind] || bodies.crate,
    );
  }

  function coral(color = "#ef8b8e", accent = "#ffd1c8") {
    return svg(
      `coral:${color}`,
      "珊瑚",
      `
        <path d="M49 86V45M50 57 29 34M50 57l21-29M29 38l-9-13M71 38l10-14M50 47l-15-22M50 47l16-22" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="20" cy="25" r="7" fill="${accent}"/>
        <circle cx="81" cy="24" r="7" fill="${accent}"/>
        <circle cx="35" cy="25" r="6" fill="${accent}"/>
        <circle cx="66" cy="25" r="6" fill="${accent}"/>
        <path d="M31 87h38" stroke="#f4cf9b" stroke-width="8" stroke-linecap="round"/>
      `,
    );
  }

  function lily() {
    return svg(
      "gather:night-lily",
      "夜光潮莲",
      `
        <ellipse cx="50" cy="74" rx="31" ry="12" fill="#5ca8a8"/>
        <path d="M50 75 39 55c12 3 18 9 21 18M50 75l11-20c-10 4-16 10-19 19M50 75V48" fill="#d9f0ff"/>
        <circle cx="50" cy="51" r="8" fill="#f7d27e"/>
        <circle cx="47" cy="49" r="2.4" fill="#fff8cf"/>
      `,
    );
  }

  function herb(color = "#76d2a1") {
    return svg(
      `herb:${color}`,
      "药草",
      `
        ${plantStem(color, "#d8f2af")}
        <circle cx="31" cy="34" r="8" fill="#f4cf76"/>
        <circle cx="68" cy="28" r="8" fill="#f5a576"/>
        <circle cx="50" cy="20" r="8" fill="#b78ee8"/>
      `,
    );
  }

  function driftwood() {
    return svg(
      "gather:tide-driftwood",
      "潮痕漂流木",
      `
        <path d="M22 43c23-9 47-9 61 2 5 4 7 9 4 14-4 8-20 13-42 11-17-1-29-7-30-15-1-5 2-9 7-12Z" fill="#8c6a4c"/>
        <path d="M28 49c13 8 29 12 48 8M39 40c-2-11-5-18-10-24M61 39c6-10 12-16 20-21" fill="none" stroke="#71553e" stroke-width="5" stroke-linecap="round"/>
        <path d="M27 53c14 4 28 5 45 1" stroke="#e0c69c" stroke-width="3" stroke-linecap="round"/>
      `,
    );
  }

  function lantern(kind, color = "#f3cf77") {
    const shape =
      kind === "fountain"
        ? `
          <ellipse cx="50" cy="75" rx="30" ry="9" fill="#74c8c6"/>
          <path d="M50 24c-13 16-18 28-13 38 4 8 19 8 25 0 7-11 0-23-12-38Z" fill="#a9ecf1"/>
          <path d="M50 31c-6 12-8 20-4 27 4 5 10 4 12-2 2-8-1-16-8-25Z" fill="#f4ffff"/>
        `
        : kind === "arch"
          ? `
            <path d="M23 84V48c0-22 12-35 27-35s27 13 27 35v36" fill="none" stroke="#f08b8e" stroke-width="10" stroke-linecap="round"/>
            <circle cx="23" cy="50" r="7" fill="#ffd0c8"/><circle cx="77" cy="50" r="7" fill="#ffd0c8"/>
          `
          : kind === "moon-stage"
            ? `
              <ellipse cx="50" cy="72" rx="35" ry="12" fill="#315a72"/>
              <path d="M25 68c0-22 11-38 25-38s25 16 25 38c-7-9-15-13-25-13s-18 4-25 13Z" fill="${color}"/>
              <path d="M34 62c6 5 26 5 32 0" fill="none" stroke="#86dfe0" stroke-width="3"/>
            `
            : kind === "tree"
              ? `
                <path d="M47 87V34" stroke="#8f6b4b" stroke-width="8" stroke-linecap="round"/>
                <circle cx="38" cy="33" r="12" fill="${color}"/><circle cx="59" cy="28" r="14" fill="#8be1cc"/>
                <circle cx="65" cy="45" r="11" fill="#f5e3a1"/><circle cx="43" cy="48" r="10" fill="#73d4c5"/>
              `
              : kind === "whale"
                ? `
                  <path d="M19 62c10-18 36-31 58-23 10 4 9 14 2 20-11 10-35 15-53 8-6-2-9-2-7-5Z" fill="#8ddbd2"/>
                  <path d="M72 41c8-12 11-19 9-20-7 2-13 8-17 14Z" fill="#f1d18b"/>
                  <circle cx="33" cy="53" r="3" fill="#173e48"/>
                `
                : `
                  <path d="M18 47c35-10 65-10 69 0 2 6-20 14-38 14S16 54 18 47Z" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="4 12" stroke-linecap="round"/>
                  <circle cx="27" cy="52" r="5" fill="${color}"/><circle cx="51" cy="50" r="5" fill="${color}"/><circle cx="76" cy="53" r="5" fill="${color}"/>
                `;
    return svg(`decor:${kind}`, "农场装饰", shape);
  }

  function furniture(kind) {
    const shapes = {
      wallpaper: `
        <rect x="20" y="20" width="60" height="60" rx="8" fill="#86bdb2"/>
        <path d="M20 38c18 10 40 10 60 0M20 56c18 10 40 10 60 0M35 20c0 20 0 40 2 60M63 20c0 20 0 40-2 60" fill="none" stroke="#d9f1e7" stroke-width="3"/>
      `,
      floor: `
        <path d="M18 75 50 51l32 24Z" fill="#c49a6a"/>
        <path d="m27 75 23-17 23 17M35 71l15-11 15 11" fill="none" stroke="#f0d4a6" stroke-width="2"/>
      `,
      bed: `
        <path d="M20 69h60v9H20Z" fill="#38586b"/><path d="M25 45h50v26H25Z" fill="#f6eee0"/>
        <path d="M31 38h38v10H31Z" fill="#8ea9e8"/><path d="M24 75v9M76 75v9" stroke="#2b3d4d" stroke-width="5"/>
      `,
      desk: `
        <path d="M24 34h52v12H24Z" fill="#a8774d"/><path d="M31 46h6v38h-6ZM64 46h6v38h-6Z" fill="#6d503b"/>
        <path d="M37 26h22v8H37Z" fill="#dff2ea"/><path d="M45 18h18v9H45Z" fill="#5b87ad"/>
      `,
      lamp: `
        <path d="M50 18v18" stroke="#9c8a6b" stroke-width="3"/><path d="M30 38h40l-7 23H37Z" fill="#f2cd79"/>
        <path d="M50 61v13M37 79h26" stroke="#9c8a6b" stroke-width="5" stroke-linecap="round"/>
      `,
      aquarium: `
        <path d="M23 28h54v49H23Z" fill="rgba(119,222,228,.34)" stroke="#d8ffff" stroke-width="4"/>
        <path d="M27 73c10-14 18-15 25-3 8-15 14-14 21-2" fill="#9de8d0"/>
        <path d="M42 49c8-8 20-8 25 0-7 8-17 8-25 0Z" fill="#f0b66d"/><circle cx="61" cy="48" r="2" fill="#173f48"/>
      `,
    };
    return svg(`furniture:${kind}`, "小屋家具", shapes[kind] || shapes.desk);
  }

  function upgrade(kind) {
    const shapes = {
      land: `
        <path d="M18 63 50 43l32 20-32 20Z" fill="#47765a"/>
        <path d="M24 63 50 79l26-16M31 57l38 0M37 52l28 0" fill="none" stroke="#a8d78c" stroke-width="3"/>
        <path d="M28 38v25M72 38v25" stroke="#d8b56d" stroke-width="5" stroke-linecap="round"/>
        <path d="M32 38h36" stroke="#efd38d" stroke-width="7" stroke-linecap="round"/>
      `,
      house: `
        <path d="M21 49 50 23l29 26v35H21Z" fill="#82bed1"/><path d="M18 51 50 21l32 30" fill="none" stroke="#f1e2ba" stroke-width="7" stroke-linejoin="round"/>
        <path d="M43 84V60h15v24Z" fill="#714f3d"/><circle cx="70" cy="53" r="4" fill="#f3cd75"/>
      `,
      map: `
        <path d="M18 31 41 22l18 9 23-9v47l-23 9-18-9-23 9Z" fill="#d9caa0"/>
        <path d="M41 22v47M59 31v47" stroke="#8c8063" stroke-width="3"/>
        <path d="m34 55 10-13 8 8 14-18" fill="none" stroke="#e16e59" stroke-width="4" stroke-linecap="round"/>
      `,
      door: `
        <path d="M27 83V34c0-15 10-24 23-24s23 9 23 24v49" fill="#8a6b4b"/>
        <path d="M35 83V36c0-10 6-17 15-17s15 7 15 17v47" fill="#d1aa70"/>
        <circle cx="59" cy="56" r="3.5" fill="#f2ce76"/>
      `,
    };
    return svg(`upgrade:${kind}`, "扩建项目", shapes[kind] || shapes.land);
  }

  function recipe(kind) {
    const colors = {
      compass: "#79d9bf",
      sparkles: "#f3a989",
      net: "#9fc6ff",
      greenhouse: "#b7e36f",
    };
    const color = colors[kind] || "#79d9bf";
    return svg(
      `recipe:${kind}`,
      "工坊制品",
      `
        <circle cx="50" cy="51" r="30" fill="rgba(7,33,39,.44)" stroke="${color}" stroke-width="4"/>
        <path d="M50 22v12M50 68v12M21 51h12M67 51h12M30 31l9 9M61 62l9 9M70 31l-9 9M39 62l-9 9" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
        <circle cx="50" cy="51" r="10" fill="${color}"/>
      `,
    );
  }

  function fishSpot(kind) {
    return svg(
      `fishspot:${kind}`,
      "钓鱼点",
      `
        <path d="M17 55c12-12 25-12 37 0 12-12 22-12 31 0-9 12-22 12-31 0-12 12-25 12-37 0Z" fill="#72cbdc"/>
        <path d="M29 32v30M71 32v30" stroke="#d9f5ee" stroke-width="4" stroke-linecap="round"/>
        <path d="M29 34h18M53 34h18" stroke="#d9f5ee" stroke-width="3" stroke-linecap="round"/>
        <circle cx="52" cy="76" r="8" fill="#f3cf77"/>
      `,
    );
  }

  function landmark(kind) {
    if (kind === "lighthouse-prayer") {
      return svg(
        `landmark:${kind}`,
        "灯塔祈愿",
        `
          <path d="M38 82 43 29h14l5 53Z" fill="#f2e6cf"/>
          <path d="M40 58h20M42 44h16" stroke="#d46d63" stroke-width="7"/>
          <path d="M38 28h24l-4-12H42Z" fill="#486782"/><path d="m50 8 24 8-24 8Z" fill="#f6d982"/>
        `,
      );
    }
    if (kind === "moon-ring-blessing") {
      return svg(
        `landmark:${kind}`,
        "月环赐福",
        `
          <circle cx="50" cy="49" r="28" fill="none" stroke="#a7c8ff" stroke-width="10"/>
          <path d="M50 21v56M22 49h56" stroke="#dceaff" stroke-width="3" opacity=".72"/>
          <circle cx="50" cy="49" r="10" fill="#fff5c9"/>
        `,
      );
    }
    return svg(
      `landmark:${kind}`,
      "珠宫赐福",
      `
        <path d="M22 77c0-23 12-39 28-39s28 16 28 39Z" fill="#f4e1c2"/>
        <path d="M50 38c-8-10-7-20 0-28 8 8 8 18 0 28Z" fill="#f4cf8a"/>
        <path d="M34 77V57c0-9 7-16 16-16s16 7 16 16v20" fill="#78cfc9"/>
        <path d="M19 78h62" stroke="#d6aa6d" stroke-width="8" stroke-linecap="round"/>
      `,
    );
  }

  const assets = {
    "crop:tide-kelp": kelp,
    "crop:sea-bell": bellFlower,
    "crop:moon-berry": berries,
    "crop:coral-fruit": coralFruit,
    "gather:shell-cove": shellBed,
    "gather:wind-herb": () => herb("#76d2a1"),
    "gather:reed-dew": () => herb("#78c7bb"),
    "gather:tide-driftwood": driftwood,
    "gather:moon-salt": () => crystal("#a8d9ff", "#f3ffff"),
    "gather:star-coral": () => coral("#e78bb1", "#ffd3e6"),
    "gather:night-lily": lily,
    "gather:lunar-pearl": () => crystal("#eef1d1", "#ffffff"),
    "gather:prism-fern": () => herb("#72d8cc"),
    "gather:sun-coral": () => coral("#f2a060", "#ffe3ad"),
    "gather:pearl-dust": () => crystal("#f0dfa8", "#fff9da"),
    "gather:abyss-shell": shellBed,
    "treasure:brass-sundial": () => treasureIcon("sundial"),
    "treasure:seed-cache": () => treasureIcon("crate"),
    "treasure:lighthouse-key": () => treasureIcon("key", "#e8c66f"),
    "treasure:moon-compass": () => treasureIcon("compass", "#9dc8ff"),
    "treasure:pearl-crown": () => treasureIcon("crown", "#f3d68d"),
    "treasure:astral-chart": () => treasureIcon("chart"),
    "treasure:coral-idol": () => treasureIcon("idol"),
    "treasure:pearl-heart": () => treasureIcon("pearl"),
    "treasure:whale-score": scroll,
    "fish:silver-minnow": () => fish({ body: "#b9e3ef", belly: "#f5ffff", fin: "#8fc9df", tail: "#77bdd6" }),
    "fish:moon-koi": () => fish({ body: "#799cff", belly: "#eaf1ff", fin: "#b7cbff", tail: "#687ee5", spots: true }),
    "fish:coral-seahorse": () => fish({ body: "#f1a27f", belly: "#ffe0c8", fin: "#f6c35f", tail: "#e67569", crest: true }),
    "fish:star-jelly": () => fish({ body: "#b8a5ff", belly: "#f0eaff", fin: "#d9cfff", tail: "#9b80eb", spots: true }),
    "fish:pearl-dragonet": () => fish({ body: "#f2d58b", belly: "#fff5cf", fin: "#84d8d0", tail: "#e49267", crest: true }),
    "fish:mist-cod": () => fish({ body: "#d6f1ee", belly: "#ffffff", fin: "#9bcdd2", tail: "#83b7c4" }),
    "fish:sunset-ray": () => fish({ body: "#ee9a75", belly: "#ffddbe", fin: "#f4c87c", tail: "#d96c5c", spots: true }),
    "fish:crown-seadragon": () => fish({ body: "#8be1cc", belly: "#e9fff9", fin: "#6dc6d6", tail: "#4ba99e", crest: true }),
    "decor:tide-lanterns": () => lantern("lanterns"),
    "decor:shell-fountain": () => lantern("fountain", "#76d8e8"),
    "decor:coral-arch": () => lantern("arch"),
    "decor:moon-shell-stage": () => lantern("moon-stage", "#f4d18d"),
    "decor:pearl-tree": () => lantern("tree", "#f4d18d"),
    "decor:whale-cloud-lantern": () => lantern("whale"),
    "furniture:wallpaper": () => furniture("wallpaper"),
    "furniture:floor": () => furniture("floor"),
    "furniture:bed": () => furniture("bed"),
    "furniture:desk": () => furniture("desk"),
    "furniture:lamp": () => furniture("lamp"),
    "furniture:aquarium": () => furniture("aquarium"),
    "upgrade:land": () => upgrade("land"),
    "upgrade:house": () => upgrade("house"),
    "upgrade:map": () => upgrade("map"),
    "upgrade:house-entry": () => upgrade("door"),
    "recipe:tide-compass": () => recipe("compass"),
    "recipe:coral-charm": () => recipe("sparkles"),
    "recipe:moon-net": () => recipe("net"),
    "recipe:whale-greenhouse": () => recipe("greenhouse"),
    "fishspot:reed-stream": () => fishSpot("reed"),
    "fishspot:sunset-cove": () => fishSpot("cove"),
    "fishspot:mist-estuary": () => fishSpot("estuary"),
    "fishspot:moon-pier": () => fishSpot("pier"),
    "fishspot:star-lagoon": () => fishSpot("lagoon"),
    "fishspot:cloud-reef": () => fishSpot("reef"),
    "fishspot:pearl-spring": () => fishSpot("spring"),
    "fishspot:abyss-garden": () => fishSpot("garden"),
    "fishspot:sunken-orchard": () => fishSpot("orchard"),
  };

  function itemArt(id, label = "") {
    const key = String(id || "");
    const builder = assets[key];
    if (builder) return builder();
    if (key.startsWith("fish:")) return fish({ body: "#98d8d2", belly: "#ecffff", fin: "#75c9bc", tail: "#5ba8aa" });
    if (key.startsWith("crop:")) return herb();
    if (key.startsWith("gather:")) return crystal();
    if (key.startsWith("treasure:")) return treasureIcon("crate");
    if (key.startsWith("decor:")) return lantern("lanterns");
    if (key.startsWith("furniture:")) return furniture("desk");
    if (key.startsWith("upgrade:")) return upgrade("land");
    if (key.startsWith("recipe:")) return recipe("compass");
    if (key.startsWith("fishspot:")) return fishSpot("spot");
    if (key.startsWith("landmark:")) return landmark(key.slice(9));
    return svg("asset:unknown", label || "物品", '<circle cx="50" cy="50" r="24" fill="#77c7bb"/><path d="M50 30v40M30 50h40" stroke="#e8fff8" stroke-width="5"/>');
  }

  function levelArt(level = 1) {
    const value = Math.max(1, Math.min(9, Number(level) || 1));
    const bars = Array.from({ length: value }, (_, index) => {
      const x = 13 + index * 9.3;
      const height = 12 + index * 3.2;
      return `<rect x="${x}" y="${83 - height}" width="6" height="${height}" rx="3" fill="${index < 5 ? "#78d8c4" : "#efcb73"}"/>`;
    }).join("");
    return svg(
      `level:${value}`,
      `潮栖等级 ${value}`,
      `
        <circle cx="50" cy="45" r="28" fill="rgba(105,214,199,.16)" stroke="#8be1cc" stroke-width="3"/>
        <path d="M19 49c10 12 21 18 31 18s21-6 31-18c-6 18-17 28-31 28S25 67 19 49Z" fill="#78d8c4"/>
        <circle cx="50" cy="45" r="${10 + value}" fill="none" stroke="#f1d078" stroke-width="3" opacity=".78"/>
        ${bars}
      `,
    );
  }

  window.TidalFarmArt = {
    itemArt,
    levelArt,
    npcImage: "./assets/farm/npc/lanyin-portrait-v1.png?v=20261003b",
  };
})();
