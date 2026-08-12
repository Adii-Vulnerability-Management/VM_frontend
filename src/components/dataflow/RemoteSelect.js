// src/components/dataflow/RemoteSelect.js
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { X } from "lucide-react";

export default function RemoteSelect({
  label = "Select",
  placeholder = "Search...",
  value,
  onChange,
  endpoint, // e.g. `${baseurl}/${initURL}/dataflow/mapping/bpa`
  toOptions = (item) => ({ value: item._id, label: item.name }),
  queryParam = "search",
  extraParams = {},
  allowClear = true,
  className = "w-80",
  // UI
  disabled = false,
  loadingText = "Loading…",
  noResultsText = "No results",
  errorText = "Couldn’t load options",
  // Behavior
  debounceMs = 300,
  minChars = 0, // set to 2/3 if your backend is sensitive
  fetchOnMount = true,

  // ✅ NEW: client-side filtering mode (useful when backend doesn't support search param)
  clientSideFilter = false,
  clientFilterFn = (opt, term) =>
    (opt?.label || "").toLowerCase().includes((term || "").toLowerCase()),
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [opts, setOpts] = useState([]);

  const controller = useRef(null);
  const mountedRef = useRef(true);

  // UI state
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Unique ids for a11y
  const uid = useId();
  const inputId = `remote-select-input-${uid}`;
  const listboxId = `remote-select-listbox-${uid}`;
  const labelId = `remote-select-label-${uid}`;

  // Simple in-memory cache by search term
  const cacheRef = useRef(new Map());

  // Normalize values so "1" equals 1 if needed
  const norm = (v) => (v == null ? v : String(v));

  // ✅ Keep latest props in refs so parent re-renders don't recreate fetchOptions
  const toOptionsRef = useRef(toOptions);
  const extraParamsRef = useRef(extraParams);
  const queryParamRef = useRef(queryParam);

  useEffect(() => {
    toOptionsRef.current = toOptions;
  }, [toOptions]);

  useEffect(() => {
    extraParamsRef.current = extraParams;
  }, [extraParams]);

  useEffect(() => {
    queryParamRef.current = queryParam;
  }, [queryParam]);

  // stable-ish key for cache invalidation when extraParams changes
  const extraParamsKey = useMemo(() => {
    try {
      return JSON.stringify(extraParams || {});
    } catch {
      return String(extraParams);
    }
  }, [extraParams]);

  const fetchOptions = useCallback(
    async (term = "") => {
      if (!endpoint) return;

      // ✅ If clientSideFilter is on, always fetch the FULL list once (term = "")
      const effectiveTerm = clientSideFilter ? "" : term;

      // cached?
      if (cacheRef.current.has(effectiveTerm)) {
        const cached = cacheRef.current.get(effectiveTerm);
        setOpts(cached);
        setError(false);
        return;
      }

      // abort previous
      if (controller.current) controller.current.abort();
      const localController = new AbortController();
      controller.current = localController;

      // params
      const params = new URLSearchParams();
      const qp = queryParamRef.current;
      if (effectiveTerm) params.set(qp, effectiveTerm);

      for (const [k, v] of Object.entries(extraParamsRef.current || {})) {
        if (v != null && v !== "") params.set(k, String(v));
      }

      setLoading(true);
      setError(false);

      try {
        const res = await CustomAxios.get(`${endpoint}?${params.toString()}`, {
          signal: localController.signal,
        });
        // ignore stale
        if (controller.current !== localController || !mountedRef.current)
          return;

        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data?.data) // ✅ NEW: supports countriesnow { data: [...] }
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [];

        const mapped = items.map((it) => toOptionsRef.current(it));
        cacheRef.current.set(effectiveTerm, mapped);
        setOpts(mapped);
      } catch (err) {
        // ignore cancellations
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        if (!mountedRef.current) return;
        setError(true);
        setOpts([]); // show error panel instead of "No results"
      } finally {
        if (controller.current === localController && mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [endpoint, clientSideFilter],
  );

  // ✅ Single effect: refetch when endpoint/params change (and clear cache)
  // (avoids double fetch on mount)
  useEffect(() => {
    cacheRef.current.clear();
    if (fetchOnMount) fetchOptions("");
  }, [endpoint, queryParam, extraParamsKey, fetchOnMount, fetchOptions]);

  // debounced search (remote only)
  useEffect(() => {
    if (clientSideFilter) return;
    const handler = setTimeout(() => {
      if (search.length >= minChars || search.length === 0) {
        fetchOptions(search);
      }
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [search, minChars, debounceMs, fetchOptions, clientSideFilter]);

  // mount/unmount guard
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controller.current?.abort();
    };
  }, []);

  // ✅ NEW: filtered options when clientSideFilter is enabled
  const displayOpts = useMemo(() => {
    if (!clientSideFilter) return opts;
    if (!search) return opts;
    return opts.filter((o) => clientFilterFn(o, search));
  }, [opts, search, clientSideFilter, clientFilterFn]);

  // selected option (type-safe compare)
  const selected = useMemo(
    () => opts.find((o) => norm(o.value) === norm(value)) || null,
    [opts, value],
  );

  // outside click & escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const scrollIntoView = (index) => {
    const list = listRef.current;
    const row = list?.querySelector?.(`[data-opt-index="${index}"]`);
    row?.scrollIntoView?.({ block: "nearest" });
  };

  const onKeyDown = (e) => {
    if (disabled) return;

    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      // ✅ FIX: ArrowDown opens at first; ArrowUp opens at last
      if (e.key === "ArrowUp") {
        setActiveIndex(displayOpts.length ? displayOpts.length - 1 : -1);
      } else {
        setActiveIndex(displayOpts.length ? 0 : -1);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = Math.min((i < 0 ? -1 : i) + 1, displayOpts.length - 1);
        queueMicrotask(() => scrollIntoView(next));
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = Math.max((i < 0 ? 0 : i) - 1, 0);
        queueMicrotask(() => scrollIntoView(next));
        return next;
      });
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && displayOpts[activeIndex]) {
        e.preventDefault();
        onChange?.(displayOpts[activeIndex].value);
        setOpen(false);
        inputRef.current?.blur();
      }
    }
  };

  // keep activeIndex sane when options change (only if open)
  useEffect(() => {
    if (!open) return;
    if (displayOpts.length === 0) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((i) => (i < 0 ? 0 : Math.min(i, displayOpts.length - 1)));
  }, [displayOpts, open]);

  return (
    <div ref={rootRef} className={`relative flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          id={labelId}
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id={inputId}
            ref={inputRef}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-9 text-sm placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={placeholder}
            value={selected ? selected.label : search}
            onChange={(e) => {
              if (selected) {
                onChange?.(null);
              }
              setSearch(e.target.value);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            role="combobox"
            aria-labelledby={label ? labelId : undefined}
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeIndex >= 0
                ? `${listboxId}-opt-${activeIndex}`
                : undefined
            }
            aria-busy={loading || undefined}
          />
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className={`h-4 w-4 text-gray-400 transition ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>

        {allowClear &&
          value !== null &&
          value !== undefined &&
          value !== "" && (
            <button
              className="rounded-lg border border-gray-200 bg-white p-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onChange?.(null)}
              disabled={disabled}
              type="button"
            >
              <X className=" text-red-500" />
            </button>
          )}
      </div>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg"
          role="listbox"
          id={listboxId}
          aria-busy={loading || undefined}
        >
          <div ref={listRef} className="max-h-56 overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                {loadingText}
              </div>
            ) : error ? (
              <div className="p-2 text-sm text-red-600">{errorText}</div>
            ) : displayOpts.length ? (
              displayOpts.map((o, i) => {
                const isSelected = norm(o.value) === norm(value);
                const isActive = i === activeIndex;
                return (
                  <button
                    key={norm(o.value)}
                    data-opt-index={i}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      "block w-full px-3 py-2 text-left text-sm transition",
                      isActive
                        ? "bg-indigo-50"
                        : isSelected
                          ? "bg-gray-50"
                          : "bg-white",
                      "hover:bg-gray-100 focus:outline-none",
                    ].join(" ")}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => e.preventDefault()} // keep input focus
                    onClick={() => {
                      onChange?.(o.value);
                      setOpen(false);
                      inputRef.current?.blur();
                    }}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{o.label}</span>
                      {isSelected && (
                        <span className="ml-3 text-xs text-gray-500">
                          selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-2 text-sm text-gray-500">{noResultsText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// // src/components/dataflow/RemoteSelect.js
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import CustomAxios from "@/globalcomponents/CustomAxios";

// export default function RemoteSelect({
//   label = "Select",
//   placeholder = "Search...",
//   value,
//   onChange,
//   endpoint,              // e.g. `${baseurl}/${initURL}/dataflow/mapping/bpa`
//   toOptions = (item) => ({ value: item._id, label: item.name }),
//   queryParam = "search", // backend search query key
//   extraParams = {},      // { tenantScoped?: true } etc.
//   allowClear = true,
//   className = "w-80",
// }) {
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [opts, setOpts] = useState([]);

//   const controller = useRef(null);

//   const fetchOptions = async (term = "") => {
//     if (!endpoint) return;
//     if (controller.current) controller.current.abort();
//     controller.current = new AbortController();

//     const params = new URLSearchParams();
//     if (term) params.set(queryParam, term);
//     Object.entries(extraParams || {}).forEach(([k, v]) => {
//       if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
//     });

//     setLoading(true);
//     try {
//       const res = await CustomAxios.get(`${endpoint}?${params.toString()}`, {
//         signal: controller.current.signal,
//       });
//       const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
//       setOpts(items.map(toOptions));
//     } catch (_) {
//       // swallow error in UI; could toast
//       setOpts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOptions("");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [endpoint]);

//   useEffect(() => {
//     const t = setTimeout(() => fetchOptions(search), 250);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [search]);

//   const selected = useMemo(() => opts.find(o => o.value === value) || null, [opts, value]);

//   return (
//     <div className={`flex flex-col gap-1 ${className}`}>
//       {label && <label className="text-sm font-medium">{label}</label>}
//       <div className="flex items-center gap-2">
//         <input
//           className="border rounded p-2 flex-1"
//           placeholder={placeholder}
//           value={selected ? selected.label : search}
//           onChange={(e) => {
//             if (selected) {
//               // typing should clear selection and start searching
//               onChange?.(null);
//               setSearch(e.target.value);
//             } else {
//               setSearch(e.target.value);
//             }
//           }}
//           onFocus={() => selected && onChange?.(null)}
//         />
//         {allowClear && value && (
//           <button className="text-sm border px-2 py-1 rounded" onClick={() => onChange?.(null)}>Clear</button>
//         )}
//       </div>
//       <div className="border rounded bg-white max-h-56 overflow-auto">
//         {loading ? (
//           <div className="p-2 text-sm text-gray-500">Loading…</div>
//         ) : opts.length ? (
//           opts.map(o => (
//             <button
//               key={o.value}
//               className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${o.value===value ? "bg-gray-50" : ""}`}
//               onClick={() => onChange?.(o.value)}
//             >
//               {o.label}
//             </button>
//           ))
//         ) : (
//           <div className="p-2 text-sm text-gray-500">No results</div>
//         )}
//       </div>
//     </div>
//   );
// }
