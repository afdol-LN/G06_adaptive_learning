import React from "react";
import AppLogo from "./AppLogo";

interface BrandMarkProps {
  name?: string;
}

export default function BrandMark({
  name = "Adaptive Exercise Recommendation based on User Profiles",
}: BrandMarkProps) {
  return (
    <div className="brand">
      <div className="brand-mark">
        <div className="brand-icon"><AppLogo /></div>
        <span className="brand-name">{name}</span>
      </div>
    </div>
  );
}
