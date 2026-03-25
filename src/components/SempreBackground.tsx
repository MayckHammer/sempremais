import React from "react";

const SempreSymbolSVG = () => (
  <svg
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <path
      d="
        M 60 80
        Q 60 30 110 30
        L 220 30
        Q 270 30 270 80
        L 270 200
        Q 270 240 230 250
        L 130 280
        Q 60 300 60 360
        L 60 420
        Q 60 470 110 470
        L 250 470
        Q 300 470 300 420
        L 300 390
        L 240 390
        L 240 415
        Q 240 420 232 420
        L 118 420
        Q 110 420 110 413
        L 110 365
        Q 110 340 145 330
        L 250 300
        Q 320 280 320 220
        L 320 80
        Q 320 30 270 30
      "
      fill="#2B6CB8"
      opacity="1"
    />
    <path
      d="
        M 180 30
        L 340 30
        Q 440 30 440 130
        L 440 200
        Q 440 270 370 280
        L 270 300
        Q 200 315 200 375
        L 200 420
        Q 200 470 250 470
        L 390 470
        Q 440 470 440 420
        L 440 350
        L 390 350
        L 390 415
        Q 390 425 382 425
        L 258 425
        Q 250 425 250 418
        L 250 378
        Q 250 342 310 330
        L 400 308
        Q 490 285 490 200
        L 490 130
        Q 490 30 390 30
        L 180 30
        Z
      "
      fill="#5A6472"
      opacity="0.9"
    />
  </svg>
);

interface SempreBackgroundProps {
  children: React.ReactNode;
}

export default function SempreBackground({ children }: SempreBackgroundProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: "linear-gradient(160deg, #1a4f8a 0%, #2B6CB8 45%, #4a7fba 70%, #8fa8c0 100%)",
      }}
    >
      {/* Símbolo S gigante — camada de fundo */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-20%",
          width: "85%",
          height: "100%",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
          transform: "rotate(-10deg) scale(1.2)",
        }}
      >
        <SempreSymbolSVG />
      </div>

      {/* Segunda camada — símbolo menor para profundidade */}
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-15%",
          width: "60%",
          height: "80%",
          opacity: 0.07,
          pointerEvents: "none",
          zIndex: 0,
          transform: "rotate(15deg)",
        }}
      >
        <SempreSymbolSVG />
      </div>

      {/* Gradiente de fade branco na parte inferior */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "35%",
          background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Conteúdo */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
