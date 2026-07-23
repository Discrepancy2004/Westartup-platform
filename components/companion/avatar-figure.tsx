"use client";

import type { CompanionGender } from "@/lib/companion/personas";
import type { CompanionKit } from "@/lib/companion/personas";
import { cn } from "@/lib/utils";

type Expression = "idle" | "speak" | "celebrate";
type Pose = "circle" | "stand";

const SKIN = "#f3d5c0";
const HAIR = "#4a3428";
const HAIR_HI = "#6b4e3d";
const BLUSH = "#f0a8a0";
const EYE = "#3d2918";

export function AvatarFigure({
  gender,
  kit,
  expression = "idle",
  pose = "circle",
  className,
  size,
}: {
  gender: CompanionGender;
  kit: CompanionKit;
  expression?: Expression;
  pose?: Pose;
  className?: string;
  size?: number;
}) {
  if (pose === "stand") {
    return (
      <StandFigure
        gender={gender}
        kit={kit}
        expression={expression}
        className={className}
        size={size ?? 88}
      />
    );
  }

  return (
    <CircleFigure
      gender={gender}
      kit={kit}
      expression={expression}
      className={className}
      size={size ?? 76}
    />
  );
}

function CircleFigure({
  gender,
  kit,
  expression,
  className,
  size,
}: {
  gender: CompanionGender;
  kit: CompanionKit;
  expression: Expression;
  className?: string;
  size: number;
}) {
  if (gender === "girl") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={cn("drop-shadow-sm", className)}
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="color-mix(in srgb, var(--accent) 18%, #f4f4f5)"
        />
        {/* shoulders / teal top */}
        <path
          d="M22 92c6-18 14-24 28-24s22 6 28 24"
          fill="var(--accent)"
        />
        <path
          d="M42 70c3 8 13 8 16 0"
          fill="none"
          stroke="color-mix(in srgb, var(--accent) 70%, #0f766e)"
          strokeWidth="1.5"
        />
        <CostumeLayers prop={kit.prop} compact />
        <GirlPortrait expression={expression} cx={50} cy={44} scale={1} />
      </svg>
    );
  }

  const mouth =
    expression === "celebrate"
      ? "M42 58c4 6 12 6 16 0"
      : expression === "speak"
        ? "M46 56c2 4 8 4 10 0"
        : "M44 58c3 3 9 3 12 0";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("drop-shadow-sm", className)}
      aria-hidden
    >
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="color-mix(in srgb, var(--accent) 22%, #0f172a)"
      />
      <ellipse cx="50" cy="82" rx="24" ry="18" fill="var(--accent)" />
      <CostumeLayers prop={kit.prop} compact />
      <circle cx="50" cy="42" r="22" fill={SKIN} stroke="#1a1a1a" strokeWidth="2" />
      <path
        d="M30 26c6-8 26-10 34 0 2 6 0 12-4 14-6-4-14-6-22-4-4 1-8 4-10 8-4-4-2-12 2-18z"
        fill="#1a1a1a"
      />
      <rect
        x="34"
        y="40"
        width="12"
        height="10"
        rx="2"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.2"
      />
      <rect
        x="54"
        y="40"
        width="12"
        height="10"
        rx="2"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.2"
      />
      <line x1="46" y1="45" x2="54" y2="45" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="40" cy="45" r="2.2" fill="#1a1a1a" />
      <circle cx="60" cy="45" r="2.2" fill="#1a1a1a" />
      <path
        d={mouth}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Soft flat girl face matching the reference — ponytail (no long side hair).
 * cx/cy = head center.
 */
function GirlPortrait({
  expression,
  cx,
  cy,
  scale = 1,
}: {
  expression: Expression;
  cx: number;
  cy: number;
  scale?: number;
  /** @deprecated ignored — ponytail style */
  long?: boolean;
}) {
  const smile =
    expression === "celebrate"
      ? `M${cx - 5} ${cy + 10}c3 5 7 5 10 0`
      : expression === "speak"
        ? `M${cx - 3} ${cy + 9}c2 3.5 6 3.5 8 0`
        : `M${cx - 4} ${cy + 10}c2.5 2.5 6.5 2.5 9 0`;

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`}>
      {/* ponytail behind head */}
      <path
        d={`M${cx + 10} ${cy - 14}
           C${cx + 22} ${cy - 18}, ${cx + 28} ${cy - 8}, ${cx + 26} ${cy + 6}
           C${cx + 25} ${cy + 18}, ${cx + 20} ${cy + 28}, ${cx + 16} ${cy + 32}
           C${cx + 14} ${cy + 24}, ${cx + 12} ${cy + 10}, ${cx + 10} ${cy - 4}
           Z`}
        fill={HAIR}
      />
      <ellipse cx={cx + 18} cy={cy + 30} rx="7" ry="9" fill={HAIR} />
      <ellipse
        cx={cx + 17}
        cy={cy + 26}
        rx="3"
        ry="4"
        fill={HAIR_HI}
        opacity="0.4"
      />
      {/* hair tie */}
      <ellipse
        cx={cx + 14}
        cy={cy - 10}
        rx="3.5"
        ry="2.5"
        fill="var(--accent)"
        stroke={HAIR}
        strokeWidth="0.8"
      />

      {/* face */}
      <circle cx={cx} cy={cy} r="20" fill={SKIN} />
      {/* ears */}
      <ellipse cx={cx - 19} cy={cy + 2} rx="3.5" ry="4.5" fill={SKIN} />
      <ellipse cx={cx + 19} cy={cy + 2} rx="3.5" ry="4.5" fill={SKIN} />

      {/* crown / volume */}
      <path
        d={`M${cx - 18} ${cy - 6}
           C${cx - 20} ${cy - 22}, ${cx - 8} ${cy - 28}, ${cx} ${cy - 26}
           C${cx + 10} ${cy - 28}, ${cx + 18} ${cy - 20}, ${cx + 16} ${cy - 6}
           C${cx + 8} ${cy - 14}, ${cx - 8} ${cy - 14}, ${cx - 18} ${cy - 6}Z`}
        fill={HAIR}
      />
      {/* side-swept bangs */}
      <path
        d={`M${cx - 16} ${cy - 10}
           C${cx - 6} ${cy - 2}, ${cx + 4} ${cy - 4}, ${cx + 14} ${cy - 12}
           C${cx + 8} ${cy - 18}, ${cx - 4} ${cy - 18}, ${cx - 16} ${cy - 10}Z`}
        fill={HAIR}
      />
      <path
        d={`M${cx - 4} ${cy - 14} C${cx + 2} ${cy - 8}, ${cx + 10} ${cy - 10}, ${cx + 14} ${cy - 14}`}
        fill="none"
        stroke={HAIR_HI}
        strokeWidth="1.5"
        opacity="0.45"
      />

      {/* brows */}
      <path
        d={`M${cx - 11} ${cy - 5}c2-1.5 5-1.5 7 0`}
        fill="none"
        stroke={HAIR}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d={`M${cx + 4} ${cy - 5}c2-1.5 5-1.5 7 0`}
        fill="none"
        stroke={HAIR}
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* eyes */}
      <circle cx={cx - 7} cy={cy + 1} r="3.4" fill={EYE} />
      <circle cx={cx + 7} cy={cy + 1} r="3.4" fill={EYE} />
      <circle cx={cx - 6} cy={cy} r="1.1" fill="#fff" />
      <circle cx={cx + 8} cy={cy} r="1.1" fill="#fff" />

      {/* blush */}
      <circle cx={cx - 12} cy={cy + 8} r="3.2" fill={BLUSH} opacity="0.55" />
      <circle cx={cx + 12} cy={cy + 8} r="3.2" fill={BLUSH} opacity="0.55" />

      {/* nose */}
      <path
        d={`M${cx} ${cy + 4}c1 1.5 1.5 2.5 0 3`}
        fill="none"
        stroke="#d4a08a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* smile */}
      <path
        d={smile}
        fill="none"
        stroke="#c47878"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

function StandFigure({
  gender,
  kit,
  expression,
  className,
  size,
}: {
  gender: CompanionGender;
  kit: CompanionKit;
  expression: Expression;
  className?: string;
  size: number;
}) {
  if (gender === "girl") {
    return (
      <svg
        width={size}
        height={Math.round(size * 1.15)}
        viewBox="0 0 100 115"
        className={cn("drop-shadow-md", className)}
        aria-hidden
      >
        <ellipse
          cx="50"
          cy="108"
          rx="28"
          ry="5"
          fill="color-mix(in srgb, var(--accent) 22%, transparent)"
        />
        <rect x="39" y="90" width="8" height="14" rx="3" fill="#4a5568" />
        <rect x="53" y="90" width="8" height="14" rx="3" fill="#4a5568" />
        <ellipse cx="43" cy="104" rx="6" ry="3" fill="#f8fafc" />
        <ellipse cx="57" cy="104" rx="6" ry="3" fill="#f8fafc" />
        {/* teal V-neck dress/top */}
        <path
          d="M34 58c2 24 8 32 16 34 8-2 14-10 16-34-5-3-10-5-16-5s-11 2-16 5z"
          fill="var(--accent)"
        />
        <path
          d="M44 58c2 7 10 7 12 0"
          fill="none"
          stroke="color-mix(in srgb, var(--accent) 65%, #0f766e)"
          strokeWidth="1.5"
        />
        <path
          d="M34 62c-5 7-5 14-2 20"
          fill="none"
          stroke={SKIN}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M66 62c5 7 5 14 2 20"
          fill="none"
          stroke={SKIN}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <CostumeLayers prop={kit.prop} />
        <GirlPortrait expression={expression} cx={50} cy={36} scale={1} />
      </svg>
    );
  }

  const mouth =
    expression === "celebrate"
      ? "M42 46c4 5 12 5 16 0"
      : expression === "speak"
        ? "M46 45c2 3.5 8 3.5 10 0"
        : "M44 46c3 2.5 9 2.5 12 0";

  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 100 115"
      className={cn("drop-shadow-md", className)}
      aria-hidden
    >
      <ellipse
        cx="50"
        cy="108"
        rx="28"
        ry="5"
        fill="color-mix(in srgb, var(--accent) 22%, transparent)"
      />
      <rect x="38" y="88" width="9" height="16" rx="3" fill="#1e293b" />
      <rect x="53" y="88" width="9" height="16" rx="3" fill="#1e293b" />
      <ellipse
        cx="42"
        cy="104"
        rx="7"
        ry="3.5"
        fill="#f8fafc"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      <ellipse
        cx="58"
        cy="104"
        rx="7"
        ry="3.5"
        fill="#f8fafc"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      <path
        d="M32 58c2 22 8 30 18 32 10-2 16-10 18-32-6-4-12-6-18-6s-12 2-18 6z"
        fill="var(--accent)"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      <path
        d="M32 62c-6 8-6 16-2 22"
        fill="none"
        stroke={SKIN}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M68 62c6 8 6 16 2 22"
        fill="none"
        stroke={SKIN}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <CostumeLayers prop={kit.prop} />
      <circle cx="50" cy="34" r="20" fill={SKIN} stroke="#1a1a1a" strokeWidth="2" />
      <path
        d="M30 16c6-7 26-9 34 0 2 5 0 10-4 12-6-3-14-5-22-3-4 1-8 3-10 7-4-3-2-10 2-16z"
        fill="#1a1a1a"
      />
      <rect
        x="35"
        y="32"
        width="11"
        height="9"
        rx="2"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      <rect
        x="54"
        y="32"
        width="11"
        height="9"
        rx="2"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      <line x1="46" y1="36" x2="54" y2="36" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="40.5" cy="36.5" r="2" fill="#1a1a1a" />
      <circle cx="59.5" cy="36.5" r="2" fill="#1a1a1a" />
      <path
        d={mouth}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CostumeLayers({
  prop,
  compact = false,
}: {
  prop: CompanionKit["prop"];
  compact?: boolean;
}) {
  if (compact) {
    if (prop === "ball") {
      return (
        <circle
          cx="74"
          cy="78"
          r="6"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="1.5"
        />
      );
    }
    if (prop === "racket") {
      return (
        <g>
          <rect x="72" y="52" width="2.5" height="20" rx="1" fill="#1a1a1a" />
          <ellipse
            cx="78"
            cy="46"
            rx="7"
            ry="10"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.8"
          />
        </g>
      );
    }
    return null;
  }

  switch (prop) {
    case "racket":
      return (
        <g>
          <rect x="70" y="48" width="3.5" height="30" rx="1" fill="#1a1a1a" />
          <ellipse
            cx="78"
            cy="42"
            rx="9"
            ry="13"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.4"
          />
        </g>
      );
    case "ball":
      return (
        <circle
          cx="74"
          cy="78"
          r="8"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      );
    case "sketch":
      return (
        <rect
          x="66"
          y="62"
          width="16"
          height="20"
          rx="2"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      );
    case "blazer":
      return (
        <path
          d="M38 62l12 14 12-14"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    case "coat":
      return (
        <path
          d="M34 58h32v28c-6 4-10 5-16 5s-10-1-16-5V58z"
          fill="#f8fafc"
          stroke="#1a1a1a"
          strokeWidth="1.8"
          opacity="0.92"
        />
      );
    case "chef":
      return (
        <ellipse
          cx="50"
          cy="14"
          rx="13"
          ry="7"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      );
    case "book":
      return (
        <rect
          x="68"
          y="64"
          width="14"
          height="18"
          rx="1"
          fill="#fef3c7"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      );
    case "laptop":
      return (
        <rect
          x="64"
          y="72"
          width="22"
          height="12"
          rx="1"
          fill="#e2e8f0"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      );
    case "bag":
      return (
        <rect
          x="68"
          y="66"
          width="14"
          height="16"
          rx="2"
          fill="#fef3c7"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      );
    case "explorer":
      return (
        <circle
          cx="74"
          cy="72"
          r="7"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2.4"
        />
      );
    default:
      return null;
  }
}
