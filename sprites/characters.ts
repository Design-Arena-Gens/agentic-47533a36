import type { CharacterSpriteSheet, SpriteAnimation, SpriteFrame } from "./types";

const FRAME_WIDTH = 24;
const FRAME_HEIGHT = 24;

const createFrame = (): SpriteFrame =>
  Array.from({ length: FRAME_HEIGHT }, () => Array<null | string>(FRAME_WIDTH).fill(null));

const cloneFrame = (frame: SpriteFrame): SpriteFrame => frame.map((row) => [...row]);

const fillRect = (
  frame: SpriteFrame,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  for (let row = y; row < y + height; row += 1) {
    if (row < 0 || row >= FRAME_HEIGHT) continue;
    for (let col = x; col < x + width; col += 1) {
      if (col < 0 || col >= FRAME_WIDTH) continue;
      frame[row][col] = color;
    }
  }
};

const drawPixel = (frame: SpriteFrame, x: number, y: number, color: string) => {
  if (x < 0 || x >= FRAME_WIDTH) return;
  if (y < 0 || y >= FRAME_HEIGHT) return;
  frame[y][x] = color;
};

const addOutline = (frame: SpriteFrame, outlineColor: string): SpriteFrame => {
  const outlined = frame.map((row) => [...row]);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1]
  ];
  for (let y = 0; y < FRAME_HEIGHT; y += 1) {
    for (let x = 0; x < FRAME_WIDTH; x += 1) {
      if (!frame[y][x]) continue;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= FRAME_WIDTH || ny < 0 || ny >= FRAME_HEIGHT) continue;
        if (!frame[ny][nx]) {
          outlined[ny][nx] = outlined[ny][nx] ?? outlineColor;
        }
      }
    }
  }
  return outlined;
};

const withOutline = (frame: SpriteFrame, outlineColor: string) => addOutline(frame, outlineColor);

interface PoseConfig {
  armLeft: "down" | "forward" | "up" | "back";
  armRight: "down" | "forward" | "up" | "back";
  legLeft: "neutral" | "forward" | "back" | "air";
  legRight: "neutral" | "forward" | "back" | "air";
  torsoLean?: "forward" | "back" | "neutral";
  chakraBurst?: boolean;
  specialAura?: boolean;
  weapon?: "kunai" | "chidori" | null;
  headTilt?: number;
}

const narutoColors = {
  outline: "#141214",
  hair: "#f7c948",
  skin: "#f9d0aa",
  jacketOrange: "#f47920",
  jacketBlack: "#1e1e2f",
  blue: "#3250a4",
  metal: "#d0d7e4",
  eye: "#1a1a1a",
  chakra: "#66e0ff"
};

const sasukeColors = {
  outline: "#1a1a28",
  hair: "#181836",
  skin: "#f2cdb3",
  shirt: "#9aa8ff",
  rope: "#9b6ad9",
  pants: "#3c4d92",
  eye: "#1a1a1a",
  chidori: "#9fe1ff",
  metal: "#d0d7e4"
};

const baseHead = (
  frame: SpriteFrame,
  colors: { hair: string; skin: string; metal: string; eye: string; outline: string },
  offsetY = 0,
  headbandColor?: string
) => {
  fillRect(frame, 8, 2 + offsetY, 8, 2, colors.hair);
  fillRect(frame, 7, 3 + offsetY, 10, 3, colors.hair);
  fillRect(frame, 8, 5 + offsetY, 8, 1, headbandColor ?? colors.hair);
  fillRect(frame, 9, 6 + offsetY, 6, 5, colors.skin);
  drawPixel(frame, 10, 8 + offsetY, colors.eye);
  drawPixel(frame, 13, 8 + offsetY, colors.eye);
  drawPixel(frame, 11, 11 + offsetY, colors.eye);
};

const drawNarutoPose = (config: PoseConfig): SpriteFrame => {
  const frame = createFrame();
  const lean = config.torsoLean === "forward" ? 1 : config.torsoLean === "back" ? -1 : 0;
  const headOffset = config.headTilt ?? 0;
  baseHead(frame, narutoColors, headOffset, narutoColors.metal);
  fillRect(frame, 9 + lean, 11 + headOffset, 6, 5, narutoColors.jacketBlack);
  fillRect(frame, 9 + lean, 16 + headOffset, 6, 6, narutoColors.jacketOrange);
  // Belt
  fillRect(frame, 9 + lean, 16 + headOffset, 6, 1, narutoColors.blue);

  const placeArm = (side: "left" | "right", position: PoseConfig["armLeft"]) => {
    const isLeft = side === "left";
    const xBase = isLeft ? 7 : 15;
    const dir = isLeft ? -1 : 1;
    if (position === "down") {
      fillRect(frame, xBase, 12 + headOffset, 2, 6, narutoColors.jacketOrange);
    } else if (position === "forward") {
      fillRect(frame, xBase + dir * -1, 12 + headOffset, 3, 3, narutoColors.jacketOrange);
      fillRect(frame, xBase + dir * -2, 14 + headOffset, 3, 2, narutoColors.jacketOrange);
    } else if (position === "up") {
      fillRect(frame, xBase, 10 + headOffset, 2, 5, narutoColors.jacketOrange);
      fillRect(frame, xBase + dir * -1, 9 + headOffset, 2, 2, narutoColors.jacketOrange);
    } else if (position === "back") {
      fillRect(frame, xBase + dir, 12 + headOffset, 2, 4, narutoColors.jacketOrange);
    }
  };

  placeArm("left", config.armLeft);
  placeArm("right", config.armRight);

  const placeLeg = (side: "left" | "right", position: PoseConfig["legLeft"]) => {
    const isLeft = side === "left";
    const xBase = isLeft ? 10 : 14;
    if (position === "neutral") {
      fillRect(frame, xBase, 19 + headOffset, 2, 5, narutoColors.blue);
      fillRect(frame, xBase, 24 + headOffset - 1, 2, 1, narutoColors.metal);
    } else if (position === "forward") {
      fillRect(frame, xBase - (isLeft ? 1 : 0), 20 + headOffset, 3, 4, narutoColors.blue);
      fillRect(frame, xBase - (isLeft ? 1 : 0), 24 + headOffset - 1, 3, 1, narutoColors.metal);
    } else if (position === "back") {
      fillRect(frame, xBase + (isLeft ? 1 : 0), 19 + headOffset, 2, 5, narutoColors.blue);
      fillRect(frame, xBase + (isLeft ? 1 : 0), 24 + headOffset - 1, 2, 1, narutoColors.metal);
    } else if (position === "air") {
      fillRect(frame, xBase - 1, 18 + headOffset, 3, 3, narutoColors.blue);
      fillRect(frame, xBase, 21 + headOffset, 3, 2, narutoColors.blue);
      fillRect(frame, xBase, 23 + headOffset, 3, 1, narutoColors.metal);
    }
  };

  placeLeg("left", config.legLeft);
  placeLeg("right", config.legRight);

  if (config.chakraBurst) {
    for (let i = 0; i < 8; i += 1) {
      drawPixel(frame, 6 + i * 2, 10 + headOffset + ((i % 2) ? 1 : 0), narutoColors.chakra);
    }
  }

  if (config.specialAura) {
    for (let radius = 0; radius < 3; radius += 1) {
      const color = radius === 0 ? "rgba(102,224,255,0.45)" : radius === 1 ? "rgba(102,224,255,0.3)" : "rgba(102,224,255,0.15)";
      for (let a = 0; a < 360; a += 20) {
        const rad = (a * Math.PI) / 180;
        const x = Math.round(11 + Math.cos(rad) * (6 + radius));
        const y = Math.round(17 + headOffset + Math.sin(rad) * (6 + radius));
        drawPixel(frame, x, y, color);
      }
    }
  }

  return withOutline(frame, narutoColors.outline);
};

const drawSasukePose = (config: PoseConfig): SpriteFrame => {
  const frame = createFrame();
  const lean = config.torsoLean === "forward" ? 1 : config.torsoLean === "back" ? -1 : 0;
  const headOffset = config.headTilt ?? 0;
  baseHead(frame, sasukeColors, headOffset);
  fillRect(frame, 8 + lean, 11 + headOffset, 8, 5, sasukeColors.shirt);
  fillRect(frame, 8 + lean, 16 + headOffset, 8, 5, sasukeColors.rope);
  fillRect(frame, 7 + lean, 21 + headOffset, 10, 3, sasukeColors.pants);

  const placeArm = (side: "left" | "right", position: PoseConfig["armLeft"]) => {
    const isLeft = side === "left";
    const xBase = isLeft ? 7 : 17;
    const dir = isLeft ? -1 : 1;
    if (position === "down") {
      fillRect(frame, xBase + (isLeft ? -1 : 0), 12 + headOffset, 3, 6, sasukeColors.shirt);
    } else if (position === "forward") {
      fillRect(frame, xBase + dir * -2, 12 + headOffset, 4, 3, sasukeColors.shirt);
      fillRect(frame, xBase + dir * -2, 14 + headOffset, 3, 2, sasukeColors.shirt);
    } else if (position === "up") {
      fillRect(frame, xBase + dir * -1, 10 + headOffset, 3, 5, sasukeColors.shirt);
    } else if (position === "back") {
      fillRect(frame, xBase + dir, 12 + headOffset, 2, 4, sasukeColors.shirt);
    }
  };

  placeArm("left", config.armLeft);
  placeArm("right", config.armRight);

  const placeLeg = (side: "left" | "right", position: PoseConfig["legLeft"]) => {
    const isLeft = side === "left";
    const xBase = isLeft ? 9 : 15;
    if (position === "neutral") {
      fillRect(frame, xBase, 20 + headOffset, 3, 4, sasukeColors.pants);
      fillRect(frame, xBase, 24 + headOffset - 1, 3, 1, sasukeColors.hair);
    } else if (position === "forward") {
      fillRect(frame, xBase - (isLeft ? 1 : 0), 20 + headOffset, 3, 4, sasukeColors.pants);
      fillRect(frame, xBase - (isLeft ? 1 : 0), 24 + headOffset - 1, 3, 1, sasukeColors.hair);
    } else if (position === "back") {
      fillRect(frame, xBase + (isLeft ? 1 : 0), 19 + headOffset, 3, 5, sasukeColors.pants);
      fillRect(frame, xBase + (isLeft ? 1 : 0), 24 + headOffset - 1, 3, 1, sasukeColors.hair);
    } else if (position === "air") {
      fillRect(frame, xBase - 1, 18 + headOffset, 4, 3, sasukeColors.pants);
      fillRect(frame, xBase, 21 + headOffset, 3, 2, sasukeColors.pants);
      fillRect(frame, xBase, 23 + headOffset, 3, 1, sasukeColors.hair);
    }
  };

  placeLeg("left", config.legLeft);
  placeLeg("right", config.legRight);

  if (config.weapon === "chidori") {
    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 4 + (i % 5);
      const x = Math.round(17 + Math.cos(angle) * radius);
      const y = Math.round(16 + Math.sin(angle) * radius);
      drawPixel(frame, x, y, `rgba(159,225,255,${0.3 + (i % 3) * 0.2})`);
    }
    fillRect(frame, 16, 14 + headOffset, 3, 3, sasukeColors.chidori);
  }

  if (config.specialAura) {
    for (let radius = 0; radius < 3; radius += 1) {
      const color = radius === 0 ? "rgba(155,106,217,0.45)" : radius === 1 ? "rgba(155,106,217,0.3)" : "rgba(155,106,217,0.15)";
      for (let a = 0; a < 360; a += 24) {
        const rad = (a * Math.PI) / 180;
        const x = Math.round(11 + Math.cos(rad) * (6 + radius));
        const y = Math.round(17 + headOffset + Math.sin(rad) * (6 + radius));
        drawPixel(frame, x, y, color);
      }
    }
  }

  return withOutline(frame, sasukeColors.outline);
};

const buildAnimation = (frames: SpriteFrame[], frameDuration: number): SpriteAnimation => ({
  frames,
  frameDuration
});

const createNarutoSheet = (): CharacterSpriteSheet => {
  const idle = [
    drawNarutoPose({ armLeft: "down", armRight: "down", legLeft: "neutral", legRight: "neutral" }),
    drawNarutoPose({ armLeft: "forward", armRight: "back", legLeft: "forward", legRight: "back", headTilt: 1 })
  ];

  const run = [
    drawNarutoPose({ armLeft: "forward", armRight: "back", legLeft: "forward", legRight: "back", torsoLean: "forward" }),
    drawNarutoPose({ armLeft: "back", armRight: "forward", legLeft: "back", legRight: "forward", torsoLean: "forward" }),
    drawNarutoPose({ armLeft: "forward", armRight: "back", legLeft: "air", legRight: "forward", torsoLean: "forward" }),
    drawNarutoPose({ armLeft: "back", armRight: "forward", legLeft: "forward", legRight: "air", torsoLean: "forward" })
  ];

  const jump = [
    drawNarutoPose({ armLeft: "forward", armRight: "forward", legLeft: "air", legRight: "air", torsoLean: "forward" })
  ];

  const fall = [
    drawNarutoPose({ armLeft: "forward", armRight: "forward", legLeft: "air", legRight: "air", torsoLean: "back" })
  ];

  const attack = [
    drawNarutoPose({ armLeft: "forward", armRight: "forward", legLeft: "forward", legRight: "back", torsoLean: "forward", chakraBurst: true }),
    drawNarutoPose({ armLeft: "forward", armRight: "forward", legLeft: "forward", legRight: "back", torsoLean: "forward", chakraBurst: true, specialAura: true })
  ];

  const special = [
    drawNarutoPose({ armLeft: "forward", armRight: "forward", legLeft: "neutral", legRight: "neutral", torsoLean: "forward", chakraBurst: true, specialAura: true }),
    drawNarutoPose({ armLeft: "up", armRight: "forward", legLeft: "neutral", legRight: "neutral", torsoLean: "forward", chakraBurst: true, specialAura: true })
  ];

  const hit = [
    drawNarutoPose({ armLeft: "up", armRight: "back", legLeft: "back", legRight: "forward", torsoLean: "back", headTilt: -1 })
  ];

  const ko = [
    drawNarutoPose({ armLeft: "forward", armRight: "forward", legLeft: "neutral", legRight: "neutral", torsoLean: "back", headTilt: -2 })
  ];

  return {
    idle: buildAnimation(idle, 250),
    run: buildAnimation(run, 90),
    jump: buildAnimation(jump, 120),
    fall: buildAnimation(fall, 120),
    attack: buildAnimation(attack, 80),
    special: buildAnimation(special, 120),
    hit: buildAnimation(hit, 120),
    ko: buildAnimation(ko, 160)
  };
};

const createSasukeSheet = (): CharacterSpriteSheet => {
  const idle = [
    drawSasukePose({ armLeft: "down", armRight: "down", legLeft: "neutral", legRight: "neutral" }),
    drawSasukePose({ armLeft: "forward", armRight: "back", legLeft: "forward", legRight: "back", headTilt: 1 })
  ];

  const run = [
    drawSasukePose({ armLeft: "forward", armRight: "back", legLeft: "forward", legRight: "back", torsoLean: "forward" }),
    drawSasukePose({ armLeft: "back", armRight: "forward", legLeft: "back", legRight: "forward", torsoLean: "forward" }),
    drawSasukePose({ armLeft: "forward", armRight: "back", legLeft: "forward", legRight: "air", torsoLean: "forward" }),
    drawSasukePose({ armLeft: "back", armRight: "forward", legLeft: "air", legRight: "forward", torsoLean: "forward" })
  ];

  const jump = [
    drawSasukePose({ armLeft: "forward", armRight: "forward", legLeft: "air", legRight: "air", torsoLean: "forward" })
  ];

  const fall = [
    drawSasukePose({ armLeft: "forward", armRight: "forward", legLeft: "air", legRight: "air", torsoLean: "back" })
  ];

  const attack = [
    drawSasukePose({ armLeft: "forward", armRight: "forward", legLeft: "forward", legRight: "back", torsoLean: "forward", weapon: "kunai" }),
    drawSasukePose({ armLeft: "forward", armRight: "forward", legLeft: "forward", legRight: "back", torsoLean: "forward", weapon: "kunai" })
  ];

  const special = [
    drawSasukePose({ armLeft: "forward", armRight: "forward", legLeft: "neutral", legRight: "neutral", torsoLean: "forward", weapon: "chidori", specialAura: true }),
    drawSasukePose({ armLeft: "forward", armRight: "forward", legLeft: "neutral", legRight: "neutral", torsoLean: "forward", weapon: "chidori", specialAura: true, headTilt: 1 })
  ];

  const hit = [
    drawSasukePose({ armLeft: "up", armRight: "back", legLeft: "back", legRight: "forward", torsoLean: "back", headTilt: -1 })
  ];

  const ko = [
    drawSasukePose({ armLeft: "forward", armRight: "forward", legLeft: "neutral", legRight: "neutral", torsoLean: "back", headTilt: -2 })
  ];

  return {
    idle: buildAnimation(idle, 250),
    run: buildAnimation(run, 90),
    jump: buildAnimation(jump, 120),
    fall: buildAnimation(fall, 120),
    attack: buildAnimation(attack, 90),
    special: buildAnimation(special, 110),
    hit: buildAnimation(hit, 120),
    ko: buildAnimation(ko, 160)
  };
};

export const narutoSprites = createNarutoSheet();
export const sasukeSprites = createSasukeSheet();

export const SPRITE_DIMENSIONS = {
  width: FRAME_WIDTH,
  height: FRAME_HEIGHT
};
