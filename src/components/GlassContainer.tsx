import LiquidGlass from 'liquid-glass-react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  cornerRadius?: number;
  padding?: string;
  overLight?: boolean;
  mode?: 'standard' | 'polar' | 'prominent' | 'shader';
}

export function GlassContainer({
  children,
  className,
  style,
  displacementScale = 64,
  blurAmount = 0.1,
  saturation = 130,
  aberrationIntensity = 2,
  elasticity = 0.35,
  cornerRadius = 20,
  padding = '0px',
  overLight = false,
  mode = 'standard',
}: GlassContainerProps) {
  return (
    <LiquidGlass
      displacementScale={displacementScale}
      blurAmount={blurAmount}
      saturation={saturation}
      aberrationIntensity={aberrationIntensity}
      elasticity={elasticity}
      cornerRadius={cornerRadius}
      padding={padding}
      overLight={overLight}
      mode={mode}
      className={className}
      style={style}
    >
      {children}
    </LiquidGlass>
  );
}
