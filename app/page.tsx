"use client";

import { useEffect, useRef, useState } from "react";
import { createInitialGameState, renderGame, updateGameState } from "@/lib/gameEngine";
import type { GameState } from "@/lib/gameTypes";

interface FighterHud {
  id: "naruto" | "sasuke";
  name: string;
  color: string;
  health: number;
  maxHealth: number;
  chakra: number;
  combo: number;
  state: string;
}

interface UiSnapshot {
  fighters: FighterHud[];
  winner: "naruto" | "sasuke" | null;
}

const buildSnapshot = (state: GameState): UiSnapshot => {
  const fighters = state.fighters.map((fighter) => ({
    id: fighter.id,
    name: fighter.definition.name,
    color: fighter.definition.color,
    health: fighter.health,
    maxHealth: fighter.definition.maxHealth,
    chakra: fighter.chakra,
    combo: fighter.combo,
    state: fighter.state
  }));
  return {
    fighters,
    winner: state.winner
  };
};

const BINDINGS = {
  naruto: {
    left: ["a"],
    right: ["d"],
    down: ["s"],
    jump: ["w", " "],
    attack: ["f"],
    special: ["g"]
  },
  sasuke: {
    left: ["ArrowLeft"],
    right: ["ArrowRight"],
    down: ["ArrowDown"],
    jump: ["ArrowUp", "/"],
    attack: ["l", "L"],
    special: [";"]
  }
};

const isMovementKey = (key: string) =>
  ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s"].includes(key);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  const stateRef = useRef<GameState | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [ui, setUi] = useState<UiSnapshot | null>(null);
  const lastUiUpdate = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctxRef.current = ctx;
    const state = createInitialGameState();
    stateRef.current = state;
    setUi(buildSnapshot(state));

    const resetMatch = () => {
      const fresh = createInitialGameState();
      stateRef.current = fresh;
      lastUiUpdate.current = 0;
      setUi(buildSnapshot(fresh));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const lowered = key.length === 1 ? key.toLowerCase() : key;
      if (isMovementKey(key)) {
        event.preventDefault();
      }
      const currentState = stateRef.current;
      if (!currentState) return;
      if (currentState.winner) {
        const restartKeys = [
          ...BINDINGS.naruto.attack,
          ...BINDINGS.naruto.special,
          ...BINDINGS.sasuke.attack,
          ...BINDINGS.sasuke.special
        ].map((k) => k.toString());
        if (restartKeys.includes(lowered) || restartKeys.includes(key)) {
          resetMatch();
        }
      }
      const [naruto, sasuke] = currentState.fighters;
      if (BINDINGS.naruto.left.includes(lowered)) naruto.inputs.left = true;
      if (BINDINGS.naruto.right.includes(lowered)) naruto.inputs.right = true;
      if (BINDINGS.naruto.down.includes(lowered)) naruto.inputs.down = true;
      if (BINDINGS.naruto.jump.includes(lowered)) {
        if (!naruto.inputs.jump) naruto.inputs.jumpPressed = true;
        naruto.inputs.jump = true;
      }
      if (BINDINGS.naruto.attack.includes(lowered)) {
        if (!naruto.inputs.attack) naruto.inputs.attackPressed = true;
        naruto.inputs.attack = true;
      }
      if (BINDINGS.naruto.special.includes(lowered)) {
        if (!naruto.inputs.special) naruto.inputs.specialPressed = true;
        naruto.inputs.special = true;
      }

      if (BINDINGS.sasuke.left.includes(key)) {
        sasuke.inputs.left = true;
      }
      if (BINDINGS.sasuke.right.includes(key)) {
        sasuke.inputs.right = true;
      }
      if (BINDINGS.sasuke.down.includes(key)) {
        sasuke.inputs.down = true;
      }
      if (BINDINGS.sasuke.jump.includes(key)) {
        if (!sasuke.inputs.jump) sasuke.inputs.jumpPressed = true;
        sasuke.inputs.jump = true;
      }
      if (BINDINGS.sasuke.attack.includes(key)) {
        if (!sasuke.inputs.attack) sasuke.inputs.attackPressed = true;
        sasuke.inputs.attack = true;
      }
      if (BINDINGS.sasuke.special.includes(key)) {
        if (!sasuke.inputs.special) sasuke.inputs.specialPressed = true;
        sasuke.inputs.special = true;
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      const lowered = key.length === 1 ? key.toLowerCase() : key;
      const currentState = stateRef.current;
      if (!currentState) return;
      const [naruto, sasuke] = currentState.fighters;
      if (BINDINGS.naruto.left.includes(lowered)) naruto.inputs.left = false;
      if (BINDINGS.naruto.right.includes(lowered)) naruto.inputs.right = false;
      if (BINDINGS.naruto.down.includes(lowered)) naruto.inputs.down = false;
      if (BINDINGS.naruto.jump.includes(lowered)) naruto.inputs.jump = false;
      if (BINDINGS.naruto.attack.includes(lowered)) naruto.inputs.attack = false;
      if (BINDINGS.naruto.special.includes(lowered)) naruto.inputs.special = false;

      if (BINDINGS.sasuke.left.includes(key)) sasuke.inputs.left = false;
      if (BINDINGS.sasuke.right.includes(key)) sasuke.inputs.right = false;
      if (BINDINGS.sasuke.down.includes(key)) sasuke.inputs.down = false;
      if (BINDINGS.sasuke.jump.includes(key)) sasuke.inputs.jump = false;
      if (BINDINGS.sasuke.attack.includes(key)) sasuke.inputs.attack = false;
      if (BINDINGS.sasuke.special.includes(key)) sasuke.inputs.special = false;
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });

    const loop = (time: number) => {
      const currentState = stateRef.current;
      const context = ctxRef.current;
      if (!currentState || !context) return;
      updateGameState(currentState, time);
      renderGame(context, currentState);
      if (time - lastUiUpdate.current > 120) {
        setUi(buildSnapshot(currentState));
        lastUiUpdate.current = time;
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <main>
      <h1>Naruto vs Sasuke: Chakra Clash</h1>
      <p style={{ color: "rgba(255,255,255,0.65)", textAlign: "center", maxWidth: "720px" }}>
        Управляй Наруто и Саске, выпускай Расенган и Чидори, поддерживай чакру и доведи соперника до нокаута.
      </p>
      <div className="game-container">
        <canvas ref={canvasRef} width={960} height={540} />
      </div>
      {ui && (
        <div className="info-panel">
          {ui.fighters.map((fighter) => {
            const healthPct = clamp((fighter.health / fighter.maxHealth) * 100, 0, 100);
            const chakraPct = clamp((fighter.chakra / 100) * 100, 0, 100);
            const badgeClass = fighter.id === "naruto" ? "badge naruto" : "badge sasuke";
            return (
              <div className="card" key={fighter.id}>
                <div className={badgeClass}>{fighter.name}</div>
                <div className="hp-bar">
                  <div
                    className="hp-bar-inner"
                    style={{
                      width: `${healthPct}%`,
                      background: `linear-gradient(90deg, ${fighter.color}, rgba(255,255,255,0.85))`
                    }}
                  />
                </div>
                <div className="hp-bar" style={{ height: "8px", marginTop: "6px" }}>
                  <div
                    className="hp-bar-inner"
                    style={{
                      width: `${chakraPct}%`,
                      background: fighter.id === "naruto" ? "rgba(102,224,255,0.65)" : "rgba(155,106,217,0.65)"
                    }}
                  />
                </div>
                <div className="status-grid">
                  <span className="status-label">Health</span>
                  <span className="status-value">{Math.round(fighter.health)}</span>
                  <span className="status-label">Chakra</span>
                  <span className="status-value">{Math.round(fighter.chakra)}</span>
                  <span className="status-label">Combo</span>
                  <span className="status-value">x{fighter.combo}</span>
                  <span className="status-label">State</span>
                  <span className="status-value">{fighter.state.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
          <div className="card">
            <h2>Управление Наруто</h2>
            <div className="controls-grid">
              <div><span>Движение</span><span>WASD</span></div>
              <div><span>Атака</span><span>F</span></div>
              <div><span>Расенган</span><span>G</span></div>
              <div><span>Прыжок</span><span>W / Space</span></div>
            </div>
          </div>
          <div className="card">
            <h2>Управление Саске</h2>
            <div className="controls-grid">
              <div><span>Движение</span><span>Стрелки</span></div>
              <div><span>Атака</span><span>L</span></div>
              <div><span>Чидори</span><span>;</span></div>
              <div><span>Прыжок</span><span>Arrow Up / Slash</span></div>
            </div>
          </div>
        </div>
      )}
      {ui?.winner && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            fontWeight: 600
          }}
        >
          Победитель: {ui.winner === "naruto" ? "Наруто" : "Саске"}! Нажми любую атаку, чтобы снова сразиться.
        </div>
      )}
      <footer>Проект создан на Next.js для мгновенного деплоя на Vercel.</footer>
    </main>
  );
}
