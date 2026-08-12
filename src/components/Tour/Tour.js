import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const DEFAULT_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
];

const DEFAULT_UI = {
  back: "Back",
  next: "Next",
  finish: "Finish",
  of: "of",
  closeTour: "Close tour",
  translating: "Translating...",
};

const MULTI_LANG_FONT_STACK = [
  '"Noto Sans"',
  '"Noto Sans Devanagari"',
  '"Noto Sans Bengali"',
  '"Noto Sans Gujarati"',
  '"Noto Sans Tamil"',
  '"Noto Sans Telugu"',
  "system-ui",
  "sans-serif",
].join(", ");

function decodeHtmlEntities(text) {
  if (typeof document === "undefined") return text;
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}

function sanitizeTranslatedText(text, fallback = "") {
  if (typeof text !== "string") return fallback;

  let cleaned = decodeHtmlEntities(text)
    .replace(/\u200B/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/\s+/g, " ")
    .trim();

  cleaned = cleaned
    .replace(/^(translation:|translated text:)\s*/i, "")
    .replace(/\s*(translated by google|via google translate)\s*$/i, "")
    .replace(/\[\[\[\d+\]\]\]/g, "")
    .replace(/TOUR_SPLIT/gi, "")
    .trim();

  cleaned = cleaned.replace(/^[\s"'`]+|[\s"'`]+$/g, "").trim();

  if (!cleaned) return fallback;

  const isShortLabel = fallback && fallback.length <= 20;
  if (isShortLabel && cleaned.length > Math.max(fallback.length * 5, 40)) {
    return fallback;
  }

  return cleaned;
}

function buildTranslationPayload(steps, ui) {
  return [
    ...steps.map((s) => (typeof s?.title === "string" ? s.title : "")),
    ...steps.map((s) => (typeof s?.content === "string" ? s.content : "")),
    ui.back,
    ui.next,
    ui.finish,
    ui.of,
    ui.closeTour,
    ui.translating,
  ];
}

function buildMarkedText(payload) {
  return payload
    .map((text, index) => `[[[${index}]]] ${text || ""}`)
    .join("\n");
}

function parseMarkedTranslation(translatedText, originalPayload) {
  if (typeof translatedText !== "string") return originalPayload;

  const normalized = decodeHtmlEntities(translatedText)
    .replace(/\u200B/g, "")
    .replace(/\uFFFD/g, "")
    .trim();

  const markerRegex = /\[\[\[(\d+)\]\]\]/g;
  const matches = [...normalized.matchAll(markerRegex)];

  if (!matches.length) {
    console.warn("Tour translation: no markers found, using original payload");
    return originalPayload;
  }

  const result = new Array(originalPayload.length).fill("");

  for (let idx = 0; idx < matches.length; idx += 1) {
    const current = matches[idx];
    const next = matches[idx + 1];

    const itemIndex = Number(current[1]);
    if (
      Number.isNaN(itemIndex) ||
      itemIndex < 0 ||
      itemIndex >= originalPayload.length
    ) {
      continue;
    }

    const start = current.index + current[0].length;
    const end = next ? next.index : normalized.length;
    const rawValue = normalized.slice(start, end).trim();

    result[itemIndex] = sanitizeTranslatedText(
      rawValue,
      originalPayload[itemIndex] || "",
    );
  }

  return result.map((value, index) => value || originalPayload[index] || "");
}

async function translateCombined(texts, target, source) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const markedText = buildMarkedText(texts);

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", source);
  url.searchParams.set("tl", target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", markedText);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Translation request failed: ${res.status}`);
  }

  const json = await res.json();
  const translated = (json?.[0] || []).map((seg) => seg?.[0] || "").join("");

  return parseMarkedTranslation(translated, texts);
}

export default function Tour({
  steps = [],
  open,
  onClose,
  autoAdvance = false,
  stepInterval = 1500,
  translation = {},
}) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const [entered, setEntered] = useState(false);
  const [tipSize, setTipSize] = useState({ w: 340, h: 160 });
  const [activeLanguage, setActiveLanguage] = useState(
    translation.defaultLanguage || translation.sourceLanguage || "en",
  );
  const [localizedSteps, setLocalizedSteps] = useState(steps || []);
  const [localizedUi, setLocalizedUi] = useState(DEFAULT_UI);
  const [isTranslating, setIsTranslating] = useState(false);

  const tipRef = useRef(null);
  const autoTimerRef = useRef(null);
  const translationCacheRef = useRef({});
  const translateRequestRef = useRef(0);
  const beforeRanRef = useRef({ i: -1 });

  const translationConfig = useMemo(
    () => ({
      enabled: translation.enabled !== false,
      sourceLanguage: translation.sourceLanguage || "en",
      languages:
        Array.isArray(translation.languages) && translation.languages.length
          ? translation.languages
          : DEFAULT_LANGUAGES,
    }),
    [translation.enabled, translation.sourceLanguage, translation.languages],
  );

  useEffect(() => {
    setLocalizedSteps(steps || []);
  }, [steps]);

  useEffect(() => {
    const source = translationConfig.sourceLanguage || "en";
    const target = activeLanguage || translation.defaultLanguage || source;

    const applySourceContent = () => {
      setLocalizedSteps(steps);
      setLocalizedUi(DEFAULT_UI);
    };

    if (!translationConfig.enabled || !target || target === source) {
      applySourceContent();
      return;
    }

    const payload = buildTranslationPayload(steps, DEFAULT_UI);
    const cacheKey = JSON.stringify({ source, target, payload });

    if (translationCacheRef.current[cacheKey]) {
      const cached = translationCacheRef.current[cacheKey];
      setLocalizedSteps(cached.steps);
      setLocalizedUi(cached.ui);
      return;
    }

    const reqId = ++translateRequestRef.current;
    let cancelled = false;

    const run = async () => {
      try {
        setIsTranslating(true);

        const translated = await translateCombined(payload, target, source);

        if (cancelled || reqId !== translateRequestRef.current) return;

        const stepCount = steps.length;
        const translatedTitles = translated.slice(0, stepCount);
        const translatedContents = translated.slice(stepCount, stepCount * 2);
        const uiStart = stepCount * 2;

        const nextSteps = steps.map((step, idx) => ({
          ...step,
          title: sanitizeTranslatedText(
            translatedTitles[idx],
            typeof step?.title === "string" ? step.title : "",
          ),
          content: sanitizeTranslatedText(
            translatedContents[idx],
            typeof step?.content === "string" ? step.content : "",
          ),
        }));

        const nextUi = {
          back: sanitizeTranslatedText(translated[uiStart], DEFAULT_UI.back),
          next: sanitizeTranslatedText(
            translated[uiStart + 1],
            DEFAULT_UI.next,
          ),
          finish: sanitizeTranslatedText(
            translated[uiStart + 2],
            DEFAULT_UI.finish,
          ),
          of: sanitizeTranslatedText(translated[uiStart + 3], DEFAULT_UI.of),
          closeTour: sanitizeTranslatedText(
            translated[uiStart + 4],
            DEFAULT_UI.closeTour,
          ),
          translating: sanitizeTranslatedText(
            translated[uiStart + 5],
            DEFAULT_UI.translating,
          ),
        };

        const result = { steps: nextSteps, ui: nextUi };
        translationCacheRef.current[cacheKey] = result;

        setLocalizedSteps(nextSteps);
        setLocalizedUi(nextUi);
      } catch (err) {
        console.error("Tour translation failed:", err);
        if (!cancelled && reqId === translateRequestRef.current) {
          applySourceContent();
        }
      } finally {
        if (!cancelled && reqId === translateRequestRef.current) {
          setIsTranslating(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [activeLanguage, steps, translation.defaultLanguage, translationConfig]);

  useEffect(() => {
    if (open) {
      setI(0);
      setEntered(true);
      beforeRanRef.current = { i: -1 };
    } else {
      setEntered(false);
    }
  }, [open]);

  // auto-advance
  useEffect(() => {
    if (!open || !autoAdvance) return;
    clearTimeout(autoTimerRef.current);
    if (!rect) return;
    autoTimerRef.current = setTimeout(() => {
      setI((idx) => {
        if (idx < steps.length - 1) return idx + 1;
        onClose?.();
        return idx;
      });
    }, stepInterval);
    return () => clearTimeout(autoTimerRef.current);
  }, [open, autoAdvance, stepInterval, rect, steps.length, onClose]);

  // scroll target into view + capture rect

  // useIsomorphicLayoutEffect(() => {
  //   if (!open) return;
  //   const el = document.querySelector(steps[i]?.target);
  //   if (!el) {
  //     setRect(null);
  //     return;
  //   }
  //   el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  //   requestAnimationFrame(() => {
  //     requestAnimationFrame(() => {
  //       setTimeout(() => setRect(el.getBoundingClientRect()), 50);
  //     });
  //   });
  // }, [open, i, steps]);

  /////////////////////

  // Modified above because some components need to be auto opened to view its functionality/uses during help tour
  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    let cancelled = false;

    const run = async () => {
      const step = steps[i];
      if (!step) return;

      // ✅ run step.beforeStep once per step index
      if (beforeRanRef.current.i !== i) {
        beforeRanRef.current.i = i;
        if (typeof step.beforeStep === "function") {
          try {
            await step.beforeStep();
            // wait for DOM to update after beforeStep
            await new Promise((r) => requestAnimationFrame(r));
            await new Promise((r) => setTimeout(r, 50));
          } catch (e) {
            console.error("Tour beforeStep error:", e);
          }
        }
      }

      if (cancelled) return;

      const el = document.querySelector(step.target);
      if (!el) {
        setRect(null);
        return;
      }

      el.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "smooth",
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (!cancelled) setRect(el.getBoundingClientRect());
          }, 50);
        });
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [open, i, steps]);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const r = tipRef.current?.getBoundingClientRect();
      if (r) setTipSize({ w: r.width, h: r.height });
    });
  }, [open, i, steps, localizedSteps, localizedUi, isTranslating]);

  // keep rect fresh on resize/scroll
  useEffect(() => {
    if (!open) return;
    const onR = () => {
      const el = document.querySelector(steps[i]?.target);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    window.addEventListener("resize", onR);
    window.addEventListener("scroll", onR, true);
    return () => {
      window.removeEventListener("resize", onR);
      window.removeEventListener("scroll", onR, true);
    };
  }, [open, i, steps]);

  if (!open) return null;

  const rawStep = steps[i] || {};
  const step = localizedSteps[i] || rawStep;
  const gap = rawStep.gap ?? 20;
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const margin = 16;

  const handleBackgroundClick = () => {
    if (i < steps.length - 1) setI(i + 1);
    else onClose?.();
  };

  // ---- collision-aware placement -------------------------------------------
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function computeCandidate(side) {
    if (!rect) return null;

    let left = 0;
    let top = 0;

    if (side === "bottom") {
      top = rect.bottom + gap;
      left = clamp(rect.left, margin, vw - tipSize.w - margin);
    } else if (side === "top") {
      top = rect.top - tipSize.h - gap;
      left = clamp(rect.left, margin, vw - tipSize.w - margin);
    } else if (side === "right") {
      left = rect.right + gap;
      top = clamp(rect.top, margin, vh - tipSize.h - margin);
    } else {
      // left
      left = rect.left - tipSize.w - gap;
      top = clamp(rect.top, margin, vh - tipSize.h - margin);
    }

    // clamp to viewport
    left = clamp(left, margin, vw - tipSize.w - margin);
    top = clamp(top, margin, vh - tipSize.h - margin);

    // compute overlap with highlighted rect
    const tipBox = {
      left,
      top,
      right: left + tipSize.w,
      bottom: top + tipSize.h,
    };
    const overlapX = Math.max(
      0,
      Math.min(tipBox.right, rect.right) - Math.max(tipBox.left, rect.left),
    );
    const overlapY = Math.max(
      0,
      Math.min(tipBox.bottom, rect.bottom) - Math.max(tipBox.top, rect.top),
    );
    const overlapArea = overlapX * overlapY;

    // free space score (larger is better)
    const freeSpace =
      side === "bottom"
        ? vh - rect.bottom
        : side === "top"
          ? rect.top
          : side === "right"
            ? vw - rect.right
            : rect.left;

    return { side, left, top, overlapArea, freeSpace };
  }

  function chooseBestPlacement(preferred) {
    const order =
      preferred && preferred !== "auto"
        ? [preferred, "bottom", "top", "right", "left"]
        : ["bottom", "top", "right", "left"];

    const candidates = order.map(computeCandidate).filter(Boolean);

    // perfect fit first (no overlap)
    const perfect = candidates.find((c) => c.overlapArea === 0);
    if (perfect) return perfect;

    // otherwise, minimal overlap, then max free space
    candidates.sort((a, b) => {
      if (a.overlapArea !== b.overlapArea) return a.overlapArea - b.overlapArea;
      return b.freeSpace - a.freeSpace;
    });

    // nudge away from rect to remove any tiny intersection
    const best = candidates[0];
    if (best?.overlapArea > 0 && rect) {
      let { left, top } = best;
      if (best.side === "bottom") top = rect.bottom + gap;
      if (best.side === "top") top = rect.top - tipSize.h - gap;
      if (best.side === "right") left = rect.right + gap;
      if (best.side === "left") left = rect.left - tipSize.w - gap;
      best.left = clamp(left, margin, vw - tipSize.w - margin);
      best.top = clamp(top, margin, vh - tipSize.h - margin);
      best.overlapArea = 0;
    }
    return best;
  }

  const best = chooseBestPlacement(rawStep.placement);
  const side = best?.side || "bottom";
  const tipStyle = best
    ? {
        position: "fixed",
        left: best.left,
        top: best.top,
        maxWidth: 340,
        zIndex: 10001,
      }
    : {
        position: "fixed",
        maxWidth: 340,
        zIndex: 10001,
      };

  const sideEnter =
    side === "bottom" || side === "top"
      ? "animate-slide-up"
      : side === "right"
        ? "animate-slide-left"
        : "animate-slide-right";
  // --------------------------------------------------------------------------

  // const portalRoot = typeof window !== "undefined" ? document.body : null;

  const content = (
    <>
      {/* Backdrop with cutout */}
      <div
        onClick={handleBackgroundClick}
        className={`fixed inset-0 z-[10000] cursor-pointer transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      >
        {rect && (
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <defs>
              <mask id="highlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - 10}
                  y={rect.top - 10}
                  width={rect.width + 20}
                  height={rect.height + 20}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0,0,0,.6)"
              mask="url(#highlight-mask)"
            />
          </svg>
        )}
      </div>

      {/* Highlight border */}
      {rect && (
        <div
          style={{
            position: "fixed",
            left: rect.left - 10,
            top: rect.top - 10,
            width: rect.width + 20,
            height: rect.height + 20,
            zIndex: 10002,
            pointerEvents: "none",
          }}
          className={`rounded-xl transition-all duration-300 ${
            entered ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="absolute inset-0 rounded-xl ring-[3px] ring-white shadow-[0_0_0_6px_rgba(99,102,241,0.2)]" />
        </div>
      )}

      {/* Tooltip */}
      <div
        style={tipStyle}
        ref={tipRef}
        onClick={(e) => e.stopPropagation()}
        className={`transition-all duration-300 ${
          entered ? `opacity-100 scale-100 ${sideEnter}` : "opacity-0 scale-95"
        }`}
      >
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3
              className="text-lg font-semibold leading-tight text-gray-900"
              style={{ fontFamily: MULTI_LANG_FONT_STACK }}
            >
              {step.title || `Step ${i + 1}`}
            </h3>

            <div className="flex items-center gap-2">
              {translationConfig.enabled &&
                Array.isArray(translationConfig.languages) &&
                translationConfig.languages.length > 1 && (
                  <select
                    value={activeLanguage}
                    onChange={(e) => setActiveLanguage(e.target.value)}
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                    aria-label="Select language"
                    style={{ fontFamily: MULTI_LANG_FONT_STACK }}
                  >
                    {translationConfig.languages.map((lang) => {
                      const code = typeof lang === "string" ? lang : lang.code;
                      const label =
                        typeof lang === "string"
                          ? lang
                          : lang.nativeLabel || lang.label || lang.code;

                      if (!code) return null;

                      return (
                        <option
                          key={code}
                          value={code}
                          lang={code}
                          style={{ fontFamily: MULTI_LANG_FONT_STACK }}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}

              <button
                onClick={onClose}
                aria-label={localizedUi.closeTour}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 4L4 12M4 4l8 8" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="mb-4 text-sm leading-relaxed text-gray-600"
            style={{ fontFamily: MULTI_LANG_FONT_STACK }}
          >
            {step.content}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium text-gray-500"
                style={{ fontFamily: MULTI_LANG_FONT_STACK }}
              >
                {i + 1} {localizedUi.of} {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === i
                        ? "w-6 bg-indigo-600"
                        : idx < i
                          ? "w-1.5 bg-indigo-400"
                          : "w-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setI((x) => Math.max(x - 1, 0))}
                disabled={i === 0}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  i === 0
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 opacity-40"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                }`}
                style={{ fontFamily: MULTI_LANG_FONT_STACK }}
              >
                {localizedUi.back}
              </button>
              {i < steps.length - 1 ? (
                <button
                  onClick={() => setI((x) => x + 1)}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-95"
                  style={{ fontFamily: MULTI_LANG_FONT_STACK }}
                >
                  {localizedUi.next} →
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 active:scale-95"
                  style={{ fontFamily: MULTI_LANG_FONT_STACK }}
                >
                  {localizedUi.finish} ✓
                </button>
              )}
            </div>
          </div>

          {isTranslating && (
            <div
              className="mt-2 text-[11px] text-gray-500"
              style={{ fontFamily: MULTI_LANG_FONT_STACK }}
            >
              {localizedUi.translating}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
        @keyframes pulse-glow-delayed {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.04);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-pulse-glow-delayed {
          animation: pulse-glow-delayed 2s ease-in-out infinite 0.3s;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-glow,
          .animate-pulse-glow-delayed {
            animation: none;
          }
        }
      `}</style>
    </>
  );

  const portalRoot = typeof window !== "undefined" ? document.body : null;
  return portalRoot ? createPortal(content, portalRoot) : content;
}
