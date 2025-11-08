export type PixelColor = string | null;
export type SpriteFrame = PixelColor[][];

export interface SpriteAnimation {
  frames: SpriteFrame[];
  frameDuration: number;
}

export interface CharacterSpriteSheet {
  idle: SpriteAnimation;
  run: SpriteAnimation;
  jump: SpriteAnimation;
  fall: SpriteAnimation;
  attack: SpriteAnimation;
  special: SpriteAnimation;
  hit: SpriteAnimation;
  ko: SpriteAnimation;
}

export interface EffectSpriteSheet {
  name: string;
  animation: SpriteAnimation;
}
