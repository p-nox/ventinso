import React from "react";

export default function ArrowIcon({ 
    direction = "right", 
    size = 24, 
    color = "black",
    stroke = 2.5
  }) {
  const rotation = {
    up: "rotate(-90 12 12)",
    down: "rotate(90 12 12)",
    left: "rotate(180 12 12)",
    right: "rotate(0 12 12)",
  }[direction];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <g transform={rotation}>
        <path
          d="M8 5l8 7-8 7"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
