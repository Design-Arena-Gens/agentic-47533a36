import type { PixelColor, SpriteFrame } from "./types";

export type PaletteMap = Record<string, PixelColor>;

export const frameFromStrings = (rows: string[], palette: PaletteMap): SpriteFrame => {
  return rows.map((row) =>
    Array.from(row).map((symbol) => {
      return palette[symbol] ?? null;
    })
  );
};

export const scaleFrame = (frame: SpriteFrame, scale: number): SpriteFrame => {
  if (scale === 1) {
    return frame;
  }
  const scaled: SpriteFrame = [];
  for (const row of frame) {
    const scaledRow: PixelColor[] = [];
    for (const pixel of row) {
      for (let i = 0; i < scale; i += 1) {
        scaledRow.push(pixel);
      }
    }
    for (let j = 0; j < scale; j += 1) {
      scaled.push([...scaledRow]);
    }
  }
  return scaled;
};

export const mirrorFrame = (frame: SpriteFrame): SpriteFrame => {
  return frame.map((row) => [...row].reverse());
};
