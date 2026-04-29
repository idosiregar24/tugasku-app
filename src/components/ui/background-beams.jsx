"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }) => {
  const beamsRef = useRef(null);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="beams-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 40V.5H40"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeOpacity="0.1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#beams-pattern)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
};
