"use client";

import { SwitchMode } from "./switch-mode";

export function SwitchModeDemo() {
  return (
    <div className="flex items-center justify-center p-6 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
      <SwitchMode
        width={100}
        height={50}
        darkColor="#0B140E"
        lightColor="#F4F7F5"
        knobDarkColor="#16281E"
        knobLightColor="#FFFFFF"
        borderDarkColor="#244231"
        borderLightColor="#D5E3DB"
      />
    </div>
  );
}

export default SwitchModeDemo;
