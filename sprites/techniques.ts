import type { EffectSpriteSheet, SpriteAnimation, SpriteFrame } from "./types";

const WIDTH = 32;
const HEIGHT = 32;

const createFrame = (): SpriteFrame =>
  Array.from({ length: HEIGHT }, () => Array<null | string>(WIDTH).fill(null));

const cloneFrame = (frame: SpriteFrame): SpriteFrame => frame.map((row) => [...row]);

const drawCircle = (
  frame: SpriteFrame,
  cx: number,
  cy: number,
  radius: number,
  color: string
) => {
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      if (x * x + y * y <= radius * radius) {
        const px = cx + x;
        const py = cy + y;
        if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
          frame[py][px] = color;
        }
      }
    }
  }
};

const addGlow = (
  frame: SpriteFrame,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  intensity: number
) => {
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      const distSq = x * x + y * y;
      if (distSq <= radius * radius) {
        const px = cx + x;
        const py = cy + y;
        if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
          const alpha = Math.max(0, 1 - distSq / (radius * radius));
          frame[py][px] = `rgba(${color},${(alpha * intensity).toFixed(2)})`;
        }
      }
    }
  }
};

const buildAnimation = (frames: SpriteFrame[], frameDuration: number): SpriteAnimation => ({
  frames,
  frameDuration
});

const rasenganFrames = (): SpriteFrame[] => {
  const palette = {
    inner: "51, 196, 255",
    mid: "94, 214, 255",
    outer: "162, 240, 255"
  };
  const frames: SpriteFrame[] = [];
  for (let i = 0; i < 6; i += 1) {
    const frame = createFrame();
    const radius = 6 + (i % 2);
    addGlow(frame, 16, 16, radius + 4, palette.outer, 0.45);
    addGlow(frame, 16, 16, radius + 2, palette.mid, 0.6);
    drawCircle(frame, 16, 16, radius, `rgba(${palette.inner},0.95)`);
    drawCircle(frame, 16, 16, Math.max(2, radius - 2), `rgba(${palette.mid},0.75)`);
    frames.push(frame);
  }
  return frames;
};

const chidoriFrames = (): SpriteFrame[] => {
  const frames: SpriteFrame[] = [];
  for (let i = 0; i < 6; i += 1) {
    const frame = createFrame();
    addGlow(frame, 16, 16, 12, "159,225,255", 0.4);
    const spikes = 12;
    for (let s = 0; s < spikes; s += 1) {
      const angle = (Math.PI * 2 * s) / spikes + (i * Math.PI) / 8;
      const length = 10 + ((s + i) % 3);
      for (let d = 0; d < length; d += 1) {
        const x = Math.round(16 + Math.cos(angle) * d);
        const y = Math.round(16 + Math.sin(angle) * d);
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
          frame[y][x] = `rgba(159,225,255,${0.9 - d * 0.07})`;
        }
      }
    }
    frames.push(frame);
  }
  return frames;
};

const impactFrames = (): SpriteFrame[] => {
  const frames: SpriteFrame[] = [];
  for (let i = 0; i < 4; i += 1) {
    const frame = createFrame();
    const radius = 4 + i * 2;
    addGlow(frame, 16, 16, radius + 1, "255,180,122", 0.5);
    drawCircle(frame, 16, 16, radius, `rgba(255,180,122,${0.7 - i * 0.1})`);
    frames.push(frame);
  }
  return frames;
};

export const rasengan: EffectSpriteSheet = {
  name: "rasengan",
  animation: buildAnimation(rasenganFrames(), 60)
};

export const chidori: EffectSpriteSheet = {
  name: "chidori",
  animation: buildAnimation(chidoriFrames(), 60)
};

export const impactSpark: EffectSpriteSheet = {
  name: "impact",
  animation: buildAnimation(impactFrames(), 50)
};
