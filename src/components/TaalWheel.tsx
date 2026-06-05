import React, { useMemo, useState } from "react";
import {
  Music2,
  Mic2,
  Radio,
  Network,
  BookOpen,
  Ticket,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";

const SIZE = 720;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 320;
const INNER_RADIUS = 180;

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function createSegmentPath(
  startAngle: number,
  endAngle: number,
  outerRadius: number,
  innerRadius: number
) {
  const startOuter = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);
  const endOuter   = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
  const startInner = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
  const endInner   = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return `
    M ${startOuter.x} ${startOuter.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}
    L ${startInner.x} ${startInner.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}
    Z
  `;
}

const ROUTES: Record<string, string> = {
  music:       '/music',
  radio:       '/radio',
  podcast:     '/podcast',
  concert:     '/concerts',
  mesh:        '/mesh',
  storytelling: '/stories',
};

export default function TaalWheel() {
  const navigate = useNavigate();
  const { isPlaying, resume, pause, next, prev } = usePlayer();

  const [active, setActive] = useState("music");
  const [showControls, setShowControls] = useState(false);

  const segments = useMemo(
    () => [
      { id: "music",        label: "Music",   color: "#3B82F6", icon: Music2  },
      { id: "radio",        label: "FM Radio", color: "#06B6D4", icon: Radio   },
      { id: "podcast",      label: "Podcast", color: "#8B5CF6", icon: Mic2    },
      { id: "concert",      label: "Concert", color: "#F59E0B", icon: Ticket  },
      { id: "mesh",         label: "Mesh",    color: "#10B981", icon: Network  },
      { id: "storytelling", label: "Stories", color: "#EC4899", icon: BookOpen },
    ],
    []
  );

  const handleSegmentClick = (id: string) => {
    setActive(id);
    navigate(ROUTES[id] ?? '/');
  };

  return (
    <div className="relative w-[720px] h-[720px]">
      {/* WHEEL SVG */}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%"   stopColor="#10B981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* SEGMENTS */}
        {segments.map((segment, index) => {
          const startAngle = index * 60;
          const endAngle   = startAngle + 60;
          const path       = createSegmentPath(startAngle, endAngle, OUTER_RADIUS, INNER_RADIUS);
          const midAngle   = startAngle + 30;
          const iconPos    = polarToCartesian(CENTER, CENTER, 255, midAngle);
          const Icon       = segment.icon;
          const isActive   = active === segment.id;

          return (
            <g
              key={segment.id}
              onClick={() => handleSegmentClick(segment.id)}
              className="cursor-pointer"
            >
              <path
                d={path}
                fill={isActive ? `${segment.color}22` : "rgba(255,255,255,0.03)"}
                stroke={isActive ? segment.color : "rgba(255,255,255,0.05)"}
                strokeWidth={isActive ? 2.5 : 1}
                filter={isActive ? "url(#glow)" : ""}
                style={{ transition: "all 0.35s ease" }}
              />
              <foreignObject x={iconPos.x - 35} y={iconPos.y - 35} width={70} height={70}>
                <div className="w-full h-full flex items-center justify-center">
                  <Icon size={34} color={isActive ? "white" : "#D1D5DB"} />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* INNER ORBITAL RING */}
        <circle
          cx={CENTER} cy={CENTER} r={145}
          fill="none"
          stroke="rgba(16,185,129,0.35)"
          strokeWidth="2"
        />

        {/* CENTER GLOW */}
        <circle cx={CENTER} cy={CENTER} r={125} fill="url(#centerGlow)" />
      </svg>

      {/* CENTER DISC WRAPPER */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px]">
        {/* SPINNING DISC */}
        <div
          className={`
            relative w-full h-full rounded-full
            bg-[#081120]
            border border-emerald-400/20
            shadow-[0_0_80px_rgba(16,185,129,0.35)]
            flex items-center justify-center
            overflow-visible
            ${isPlaying ? "animate-spin-slow" : ""}
          `}
          style={{ animationDuration: "10s" }}
        >
          {/* VINYL TEXTURE */}
          <div className="absolute inset-4  rounded-full border border-white/5" />
          <div className="absolute inset-10 rounded-full border border-white/5" />
          <div className="absolute inset-16 rounded-full border border-white/5" />
          <div className="absolute inset-20 rounded-full border border-white/5" />

          {/* CENTER LABEL */}
          <button
            onClick={() => setShowControls(!showControls)}
            onMouseEnter={() => setShowControls(true)}
            className="relative z-20 text-white text-6xl font-black tracking-[0.2em] select-none"
          >
            C9
          </button>

          {/* AUDIO CONTROLS */}
          <div
            className={`
              absolute inset-0
              transition-all duration-300
              ${showControls ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
            `}
          >
            {/* PLAY / PAUSE */}
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className="
                absolute left-1/2 -translate-x-1/2 -top-8
                w-16 h-16 rounded-full
                bg-[#111827]
                border border-emerald-400/40
                flex items-center justify-center
                text-white
                shadow-[0_0_20px_rgba(16,185,129,0.35)]
                backdrop-blur-xl
              "
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* PREVIOUS */}
            <button
              onClick={prev}
              className="
                absolute top-1/2 -translate-y-1/2 -left-8
                w-16 h-16 rounded-full
                bg-[#111827]
                border border-blue-400/40
                flex items-center justify-center
                text-white
                shadow-[0_0_20px_rgba(59,130,246,0.35)]
                backdrop-blur-xl
              "
            >
              <SkipBack size={22} />
            </button>

            {/* NEXT */}
            <button
              onClick={next}
              className="
                absolute top-1/2 -translate-y-1/2 -right-8
                w-16 h-16 rounded-full
                bg-[#111827]
                border border-purple-400/40
                flex items-center justify-center
                text-white
                shadow-[0_0_20px_rgba(139,92,246,0.35)]
                backdrop-blur-xl
              "
            >
              <SkipForward size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* KEYFRAME */}
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow linear infinite;
          transform-origin: center center;
        }
      `}</style>
    </div>
  );
}
