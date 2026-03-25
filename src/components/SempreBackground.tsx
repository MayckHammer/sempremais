import React from "react";

const SempreSymbolSVG = () => (
  <svg
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    {/* Parte azul (esquerda do S) - curvas orgânicas */}
    <path
      d="
        M 50 70
        C 50 32 72 10 110 10
        L 200 10
        C 240 10 260 30 260 70
        L 260 180
        C 260 230 240 255 200 270
        L 140 295
        C 90 310 65 340 65 380
        L 65 430
        C 65 468 85 490 120 490
        L 240 490
        C 280 490 300 468 300 430
        L 300 395
        L 245 395
        L 245 425
        C 245 435 238 440 228 440
        L 128 440
        C 118 440 112 435 112 425
        L 112 385
        C 112 355 130 340 160 330
        L 240 305
        C 295 288 315 258 315 210
        L 315 70
        C 315 32 295 10 260 10
      "
      fill="#2B6CB8"
      opacity="1"
    />
    {/* Parte cinza (direita do S) - curvas orgânicas */}
    <path
      d="
        M 190 10
        L 340 10
        C 410 10 440 45 440 110
        L 440 200
        C 440 260 415 285 360 300
        L 280 320
        C 230 335 210 360 210 395
        L 210 430
        C 210 468 230 490 265 490
        L 385 490
        C 425 490 445 468 445 430
        L 445 360
        L 395 360
        L 395 425
        C 395 435 388 442 378 442
        L 272 442
        C 262 442 255 435 255 425
        L 255 398
        C 255 365 275 345 310 335
        L 395 312
        C 455 295 485 260 485 195
        L 485 110
        C 485 45 455 10 390 10
        L 190 10
        Z
      "
      fill="#5A6472"
      opacity="0.9"
    />
    {/* Símbolo + no canto superior direito */}
    <rect x="400" y="48" width="50" height="12" rx="6" fill="white" opacity="0.9" />
    <rect x="419" y="29" width="12" height="50" rx="6" fill="white" opacity="0.9" />
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
          right: "-10%",
          width: "85%",
          height: "100%",
          opacity: 0.18,
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
          opacity: 0.12,
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
          height: "20%",
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
