import CustomAxios from "@/config/CustomAxios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { initURL } from "../../../../BaseUrl";
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "${initURL}";

const clean = (s = "") => String(s ?? "").trim();
const lower = (s = "") => clean(s).toLowerCase();

// Prefer first/last; fall back to user_name; else email
const nameOf = (u = {}) => {
  const first = u.first_name ?? u.firstname ?? u.firstName ?? "";
  const last = u.last_name ?? u.lastname ?? u.lastName ?? "";
  const fullFromParts = `${clean(first)} ${clean(last)}`.trim();
  const uname = clean(u.user_name ?? u.username ?? "");
  const email = clean(u.email ?? "");
  return fullFromParts || uname || email;
};

// Id fallback chain
const idOf = (u = {}) => u._id ?? u.id ?? u.email ?? null;

// Simple phone validation (10–15 digits after stripping non-digits)
const normalizePhone = (raw) => {
  const digits = String(raw ?? "").replace(/\D+/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
};

const useDebounced = (value, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

// Extract array from various API shapes
const listFromAny = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  // Sometimes people send an object with numeric keys 0..N
  const vals = Object.values(payload ?? {});
  if (vals.length && vals.every((v) => typeof v === "object")) return vals;
  return [];
};

// Optional: remove exact duplicate ids
const dedupeById = (arr) => {
  const seen = new Set();
  return arr.filter((u) => {
    const key = String(idOf(u) ?? "") || JSON.stringify(u);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Async searchable user selector
 * props:
 *  - value: selected userId
 *  - onChange: (userId, fullUserObj) => void
 *  - label?: string
 *  - placeholder?: string
 *  - required?: boolean
 *  - role?: string   // optional filter by role on API
 *  - limit?: number  // optional result cap per request
 *  - apiBase?: string // e.g. "/api" or your absolute backend base
 */
export default function AsyncUserSearchSelect({
  value,
  onChange,
  label = "Head (Employee)",
  placeholder = "Search name, email, ID…",
  required = false,
  role,
  limit = 20,
  apiBase = "",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const boxRef = useRef(null);

  // fetch on debounced query / role / limit
  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);

      try {
        const res = await CustomAxios.get(`/${initURL}/apiv1/users/db`, {
          params: {
            page: 1,
            limit: 1000,
          },
        });

        const payload = res?.data ?? res;
        const raw = listFromAny(payload);
        const list = dedupeById(raw);

        if (!alive) return;

        setItems(list);

        // ✅ FIX — handle clear
        if (!value) {
          setSelected(null);
        } else {
          const found = list.find((u) => String(idOf(u)) === String(value));
          setSelected(found || null);
        }
      } catch (e) {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filteredItems = useMemo(() => {
    const query = lower(q);
    if (!query) return items;

    return items.filter((u) => {
      const fullName = lower(nameOf(u));
      const email = lower(u.email);
      const employeeId = lower(u.employeeId);
      const phone = lower(normalizePhone(u.contact_number) || "");
      const userName = lower(u.user_name);

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        employeeId.includes(query) ||
        phone.includes(query) ||
        userName.includes(query)
      );
    });
  }, [items, q]);

  const renderSecondaryLine = (u = {}) => {
    const email = clean(u.email);
    const eid = clean(u.employeeId);
    const phone = normalizePhone(u.contact_number);
    const role = Array.isArray(u.roles)
      ? u.roles.filter(Boolean).join(", ")
      : "";
    const bits = [
      email,
      eid && `• ${eid}`,
      phone && `• ${phone}`,
      role && `• ${role}`,
    ].filter(Boolean);
    return bits.join(" ");
  };

  return (
    <div className="relative" ref={boxRef}>
      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {/* display box */}
      <div
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm flex items-center justify-between cursor-pointer hover:border-gray-400"
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="truncate text-gray-800">
          {selected ? (
            <>
              <span className="font-medium">{nameOf(selected)}</span>{" "}
              <span className="text-gray-500 text-sm">
                {renderSecondaryLine(selected)}
              </span>
            </>
          ) : (
            <span className="text-gray-400">Select employee</span>
          )}
        </div>
        <span className="ml-2 text-gray-400">▾</span>
      </div>

      {/* panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="w-full border rounded px-2 py-2 focus:ring-2 focus:ring-[#2B245C] outline-none"
            />
          </div>

          <ul className="max-h-72 overflow-auto" role="listbox">
            {loading ? (
              <li className="px-3 py-2 text-sm text-gray-500">Searching…</li>
            ) : filteredItems.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            ) : (
              filteredItems.map((u) => {
                const id = idOf(u);
                const isSel =
                  value != null && id != null && String(value) === String(id);
                const title = [
                  nameOf(u),
                  clean(u.email),
                  clean(u.employeeId),
                  normalizePhone(u.contact_number),
                  Array.isArray(u.roles)
                    ? u.roles.filter(Boolean).join(", ")
                    : "",
                ]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <li
                    key={String(id ?? Math.random())}
                    className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${isSel ? "bg-gray-50" : ""}`}
                    onClick={() => {
                      setSelected(u);
                      setOpen(false);
                      onChange?.(id, u);
                    }}
                    title={title}
                    role="option"
                    aria-selected={Boolean(isSel)}
                  >
                    <div className="font-medium truncate">{nameOf(u)}</div>
                    <div className="text-gray-500 truncate">
                      {renderSecondaryLine(u)}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
