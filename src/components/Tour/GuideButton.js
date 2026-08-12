import React, { useState } from "react";
// import { CiCircleQuestion } from "react-icons/ci";
import { GiHelp } from "react-icons/gi";

/**
 * GuideButton
 * - Modern, elegant design without glow effects
 * - Smooth hover animations and micro-interactions
 * - Clean, professional appearance
 *
 * Props:
 * - onClick: () => void
 * - children?: React.ReactNode (default: "Help")
 * - className?: string
 * - variant?: "primary" | "secondary" | "outline" (default: "primary")
 * - showIcon?: boolean (default: true)
 * - size?: "sm" | "md" | "lg" (default: "md")
 */
export default function GuideButton({
  onClick,
  children = "Help",
  className = "",
  variant = "primary",
  showIcon = true,
  size = "md",
  autoAnimate = true,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-indigo-600 to-indigo-700 
      hover:from-indigo-500 hover:to-indigo-600
      text-white shadow-lg shadow-indigo-500/30
      hover:shadow-xl hover:shadow-indigo-500/40
      border border-indigo-500/50
    `,
    secondary: `
      bg-gradient-to-br from-slate-700 to-slate-800 
      hover:from-slate-600 hover:to-slate-700
      text-white shadow-lg shadow-slate-500/20
      hover:shadow-xl hover:shadow-slate-500/30
      border border-slate-600/50
    `,
    outline: `
      bg-white/5 backdrop-blur-sm
      hover:bg-white/10
      text-white border-2 border-indigo-400/60
      hover:border-indigo-300
      shadow-lg shadow-black/10
      hover:shadow-xl
    `,
  };

  return (
    <button
      type="button"
      aria-label="Open guide"
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        relative inline-flex items-center justify-center
        rounded-xl font-semibold
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900
        transition-all duration-300 ease-out
        transform hover:-translate-y-0.5 active:translate-y-0
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isPressed ? 'scale-95' : 'hover:scale-105'}
        ${className}
      `}
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className={`shine-effect ${autoAnimate ? 'auto-animate' : ''}`} />
      </div>

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {showIcon && <GiHelp className={`${iconSizes[size]} transition-transform duration-300 group-hover:rotate-12`} />}
        <span className="relative">
          {children}
          {/* Underline effect */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/50 transition-all duration-300 group-hover:w-full" />
        </span>
      </span>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none !important;
          }
          .shine-effect {
            animation: none !important;
          }
        }

        .shine-effect {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.15) 45%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0.15) 55%,
            transparent
          );
          transform: translateX(-100%) translateY(-100%) rotate(30deg);
        }

        button:hover .shine-effect {
          animation: shine 1.5s ease-in-out;
        }

        .shine-effect.auto-animate {
          animation: shine 5s ease-in-out infinite;
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }
      `}</style>
    </button>
  );
}