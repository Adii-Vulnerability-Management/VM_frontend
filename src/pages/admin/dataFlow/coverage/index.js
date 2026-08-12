/* pages/admin/dataFlow/coverage/index.js
   Coverage UI (Matrix + Graph) — merged best-of-both:
   - Uses CustomAxios + baseurl/initURL
   - Matrix filters: topics/status
   - Flow filters: methods/crossBorder
   - Responsive GraphView (layered layout)
   - Drill-down drawer for cell details
*/
import React, { useEffect, useMemo, useRef, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import SelectBpa from "@/components/dataflow/SelectBpa";
import SelectFrameworkSet from "@/components/dataflow/SelectFrameworkSet";
import SelectFlowFilters from "@/components/dataflow/SelectFlowFilters";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { useRouter } from "next/router";
import Link from "next/link";

// -------- API bases (tweak if your routes differ) --------
const COVERAGE_BASE = `${baseurl}/${initURL}/dataflow/coverage`;
const FLOWS_BASE = `${baseurl}/${initURL}/dataflow/mapping/flows`; // if you kept /dataflow/flows, change this

const StatusChip = ({ v }) => {
  const map = {
    Covered: "bg-green-600",
    Partial: "bg-yellow-500",
    Gap: "bg-red-600",
    "N/A": "bg-gray-500",
  };
  const label = v || "N/A";
  const color = map[label] || "bg-gray-500";
  return (
    <span className={`px-2 py-1 text-xs text-white rounded ${color}`}>
      {label}
    </span>
  );
};

/** Simple SVG Graph (no external libs).
 * nodes: { id, label }
 * edges: { source, target, label?, crossBorder?, method?, frequency?, evidenceRefs? }
 * Responsive layered layout with curved edges + legend + pan/zoom + drag + minimap + export.
 * Edge labels include numeric mapping like "1→3".
 */
function GraphView({ nodes, edges }) {
  // ---------- sizing ----------
  const [dims, setDims] = useState({ w: 1000, h: 600 });
  const wrapRef = useRef(null);
  useEffect(() => {
    const onResize = () => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setDims({ w: Math.max(600, r.width), h: 600 });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---------- pan & zoom ----------
  const [k, setK] = useState(1); // zoom scale
  const [tx, setTx] = useState(0); // pan x
  const [ty, setTy] = useState(0); // pan y
  const drag = useRef({ panning: false, x: 0, y: 0, tx0: 0, ty0: 0 });

  const onWheel = (e) => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0015);
    const next = Math.min(2.5, Math.max(0.5, k * factor));
    setK(next);
  };
  const onMouseDown = (e) => {
    if (
      e.target.tagName.toLowerCase() === "svg" ||
      e.target.dataset.bg === "1"
    ) {
      drag.current = {
        panning: true,
        x: e.clientX,
        y: e.clientY,
        tx0: tx,
        ty0: ty,
      };
    }
  };
  const onMouseMove = (e) => {
    if (!drag.current.panning) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setTx(drag.current.tx0 + dx);
    setTy(drag.current.ty0 + dy);
  };
  const stopPan = () => (drag.current.panning = false);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "+" || e.key === "=") setK((v) => Math.min(2.5, v * 1.1));
      if (e.key === "-" || e.key === "_") setK((v) => Math.max(0.5, v / 1.1));
      if (e.key === "0") {
        setK(1);
        setTx(0);
        setTy(0);
      }
      if (e.key === "Escape") {
        setHoverNode(null);
        setSelected(new Set());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---------- styling helpers ----------
  const methodStyle = (m = "") => {
    const mm = String(m).toLowerCase();
    if (mm === "sftp") return "6 4"; // dashed
    if (mm === "event") return "2 3"; // dotted
    return ""; // solid
  };
  const isCross = (e) =>
    typeof e.crossBorder === "boolean"
      ? e.crossBorder
      : (e.label || "").toLowerCase().includes("cross-border");

  // ---------- topological numbering ----------
  const topoOrder = useMemo(() => {
    const idSet = new Set(nodes.map((n) => String(n.id)));
    const indeg = new Map(nodes.map((n) => [String(n.id), 0]));
    const adj = new Map(nodes.map((n) => [String(n.id), []]));
    for (const e of edges || []) {
      const s = String(e.source),
        t = String(e.target);
      if (!idSet.has(s) || !idSet.has(t)) continue;
      adj.get(s).push(t);
      indeg.set(t, (indeg.get(t) || 0) + 1);
    }
    const q = [];
    for (const id of idSet) if ((indeg.get(id) || 0) === 0) q.push(id);
    const out = [],
      seen = new Set();
    while (q.length) {
      const id = q.shift();
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      for (const nb of adj.get(id) || []) {
        indeg.set(nb, (indeg.get(nb) || 0) - 1);
        if ((indeg.get(nb) || 0) === 0) q.push(nb);
      }
    }
    for (const n of nodes) if (!seen.has(String(n.id))) out.push(String(n.id));
    return out;
  }, [nodes, edges]);

  // ---------- pinned positions (drag nodes) ----------
  const [pinned, setPinned] = useState({}); // id -> {x,y}
  const nodeDrag = useRef({ id: null, ox: 0, oy: 0 });

  // ---------- layout ----------
  const layout = useMemo(() => {
    if (!nodes?.length) return { positioned: [], edges: [] };

    const id2node = new Map(nodes.map((n) => [String(n.id), n]));
    const degIn = new Map(nodes.map((n) => [String(n.id), 0]));
    const degOut = new Map(nodes.map((n) => [String(n.id), 0]));
    for (const e of edges || []) {
      const s = String(e.source),
        t = String(e.target);
      if (!id2node.has(s) || !id2node.has(t)) continue;
      degOut.set(s, (degOut.get(s) || 0) + 1);
      degIn.set(t, (degIn.get(t) || 0) + 1);
    }
    const sources = nodes.filter(
      (n) =>
        (degOut.get(String(n.id)) || 0) > 0 &&
        (degIn.get(String(n.id)) || 0) === 0,
    );
    const middles = nodes.filter(
      (n) =>
        (degOut.get(String(n.id)) || 0) > 0 &&
        (degIn.get(String(n.id)) || 0) > 0,
    );
    const sinks = nodes.filter(
      (n) =>
        (degOut.get(String(n.id)) || 0) === 0 &&
        (degIn.get(String(n.id)) || 0) > 0,
    );
    const singles = nodes.filter(
      (n) =>
        (degOut.get(String(n.id)) || 0) === 0 &&
        (degIn.get(String(n.id)) || 0) === 0,
    );

    const idxOf = new Map(topoOrder.map((id, i) => [id, i]));
    const byTopo = (a, b) =>
      (idxOf.get(String(a.id)) || 0) - (idxOf.get(String(b.id)) || 0);
    sources.sort(byTopo);
    middles.sort(byTopo);
    sinks.sort(byTopo);
    singles.sort(byTopo);

    const { w, h } = dims;
    const margin = 72;
    const layerW =
      (w - margin * 2) /
      Math.max(
        1,
        [sources, middles, sinks, ...(singles.length ? [singles] : [])].length,
      );
    const pos = [];
    const layers = [sources, middles, sinks];
    if (singles.length) layers.push(singles);

    layers.forEach((layer, i) => {
      const cx = margin + i * layerW + layerW / 2;
      const step = Math.min(
        140,
        (h - margin * 2) / Math.max(1, layer.length || 1),
      );
      const start =
        margin + (h - margin * 2 - step * Math.max(0, layer.length - 1)) / 2;
      layer.forEach((n, j) => {
        const id = String(n.id);
        const pin = pinned[id];
        pos.push({
          ...n,
          x: pin?.x ?? cx,
          y: pin?.y ?? start + j * step,
          layer: i,
        });
      });
    });

    const posMap = new Map(pos.map((p) => [String(p.id), p]));
    const grouped = new Map(); // key "s|t" -> array of edges
    const validEdges = (edges || []).filter(
      (e) => posMap.has(String(e.source)) && posMap.has(String(e.target)),
    );

    for (const e of validEdges) {
      const key = `${String(e.source)}|${String(e.target)}`;
      if (!grouped.has(key)) grouped.set(key, []); // <-- create the array
      grouped.get(key).push(e); // <-- now safe to push
    }

    const e2 = [];
    for (const [_, arr] of grouped.entries()) {
      arr.forEach((e, i) => {
        const p1 = posMap.get(String(e.source));
        const p2 = posMap.get(String(e.target));
        e2.push({
          ...e,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          multiIndex: i,
          multiCount: arr.length,
        });
      });
    }

    return { positioned: pos, edges: e2 };
  }, [nodes, edges, dims, topoOrder, pinned]);

  // number on-screen (stable)
  const nodeNum = useMemo(
    () => new Map(layout.positioned.map((p, i) => [String(p.id), i + 1])),
    [layout.positioned],
  );

  // ---------- highlight state ----------
  const [hoverNode, setHoverNode] = useState(null);
  const [selected, setSelected] = useState(new Set()); // node ids
  const isSelected = (id) => selected.has(String(id));
  const toggleSelect = (id) => {
    const s = new Set(selected);
    const key = String(id);
    s.has(key) ? s.delete(key) : s.add(key);
    setSelected(s);
  };

  // ---------- geometry ----------
  const quadPath = (x1, y1, x2, y2, bias = 0) => {
    const mx = (x1 + x2) / 2,
      my = (y1 + y2) / 2;
    const dx = x2 - x1,
      dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len,
      ny = dx / len;
    const curvature = 28 + Math.abs(bias) * 10;
    const cx = mx + nx * (curvature * (bias === 0 ? 1 : Math.sign(bias)));
    const cy = my + ny * (curvature * (bias === 0 ? 1 : Math.sign(bias)));
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };
  const pathMid = (x1, y1, x2, y2, t = 0.6) => ({
    x: x1 * (1 - t) + x2 * t,
    y: y1 * (1 - t) + y2 * t,
  });
  const selfLoopPath = (x, y) => {
    const ox = 22,
      oy = -22;
    return `M ${x} ${y} C ${x + ox} ${y + oy}, ${x + ox} ${y + oy - 8}, ${x} ${y - 36}
            C ${x - ox} ${y + oy - 8}, ${x - ox} ${y + oy}, ${x} ${y}`;
  };

  // ---------- edge/node derived UI ----------
  const edgeUI = useMemo(() => {
    return (layout.edges || []).map((e) => {
      const sN = nodeNum.get(String(e.source)) ?? "?";
      const tN = nodeNum.get(String(e.target)) ?? "?";
      const method = (
        e.method ||
        (e.label || "").replace(/cross-border/gi, "").trim() ||
        ""
      ).toLowerCase();
      const label = `${sN}→${tN}${method ? ` · ${method}` : ""}${e.frequency ? ` · ${e.frequency}` : ""}${isCross(e) ? " · cross-border" : ""}`;
      const same = String(e.source) === String(e.target);
      const bias = e.multiCount > 1 ? e.multiIndex - (e.multiCount - 1) / 2 : 0;
      const d = same
        ? selfLoopPath(e.x1, e.y1)
        : quadPath(e.x1, e.y1, e.x2, e.y2, bias);
      const lp = same
        ? { x: e.x1 + 4, y: e.y1 - 44 }
        : (() => {
            const p = pathMid(e.x1, e.y1, e.x2, e.y2, 0.6);
            return { x: p.x, y: p.y - (6 + Math.abs(bias) * 3) };
          })();
      return { e, sN, tN, method, label, d, lp };
    });
  }, [layout.edges, nodeNum]);

  // edge/node highlighting (hover or selection)
  const shouldDimEdge = (e) => {
    if (!hoverNode && selected.size === 0) return false;
    const s = String(e.source),
      t = String(e.target);
    const hitsHover =
      hoverNode && (String(hoverNode) === s || String(hoverNode) === t);
    const hitsSel = selected.size && (selected.has(s) || selected.has(t));
    return !(hitsHover || hitsSel);
  };
  const shouldDimNode = (id) => {
    if (!hoverNode && selected.size === 0) return false;
    const sid = String(id);
    if (hoverNode && sid === String(hoverNode)) return false;
    if (selected.size && selected.has(sid)) return false;
    // if any incident edge is visible, undim
    const inc = edgeUI.some(
      ({ e }) => String(e.source) === sid || String(e.target) === sid,
    );
    return !inc;
  };

  // ---------- lists for legend ----------
  const nodeLegend = useMemo(() => {
    return layout.positioned
      .map((p) => ({
        num: nodeNum.get(String(p.id)) ?? "?",
        label: p.label || p.id,
        id: String(p.id),
      }))
      .sort((a, b) => a.num - b.num);
  }, [layout.positioned, nodeNum]);

  const edgeList = useMemo(() => {
    const list = edgeUI.map(({ sN, tN, method, e }) => {
      const parts = [`${sN}→${tN}`];
      if (method) parts.push(method);
      if (e.frequency) parts.push(String(e.frequency).toLowerCase());
      if (isCross(e)) parts.push("cross-border");
      return {
        key: `${sN}-${tN}-${method}-${isCross(e)}-${e.frequency || ""}`,
        text: parts.join(" · "),
      };
    });
    return list.sort((a, b) => a.text.localeCompare(b.text));
  }, [edgeUI]);

  // ---------- minimap ----------
  const mini = { w: 180, h: 110, pad: 8 };
  const miniView = {
    x: -tx / k,
    y: -ty / k,
    w: dims.w / k,
    h: dims.h / k,
  };
  const onMinimapClick = (evt) => {
    const box = evt.currentTarget.getBoundingClientRect();
    const mx = evt.clientX - box.left,
      my = evt.clientY - box.top;
    const scaleX = dims.w / (mini.w - mini.pad * 2);
    const scaleY = dims.h / (mini.h - mini.pad * 2);
    const gx = (mx - mini.pad) * scaleX,
      gy = (my - mini.pad) * scaleY;
    // center viewport on click
    setTx(-(gx - dims.w / 2) * k);
    setTy(-(gy - dims.h / 2) * k);
  };

  // ---------- export ----------
  const exportSVG = () => {
    const svg = wrapRef.current.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.svg";
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportPNG = async () => {
    const svg = wrapRef.current.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 =
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = dims.w;
      canvas.height = dims.h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "graph.png";
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = svg64;
  };

  // ---------- toolbar actions ----------
  const fitView = () => {
    setK(1);
    setTx(0);
    setTy(0);
  };
  const resetLayout = () => setPinned({});

  return (
    <div ref={wrapRef} className="w-full border rounded">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 text-xs border-b bg-gray-50">
        <button
          className="px-2 py-1 border rounded"
          onClick={() => setK((v) => Math.min(2.5, v * 1.1))}
        >
          Zoom +
        </button>
        <button
          className="px-2 py-1 border rounded"
          onClick={() => setK((v) => Math.max(0.5, v / 1.1))}
        >
          Zoom −
        </button>
        <button className="px-2 py-1 border rounded" onClick={fitView}>
          Fit
        </button>
        <span className="mx-2 text-gray-500">|</span>
        <button className="px-2 py-1 border rounded" onClick={resetLayout}>
          Reset layout
        </button>
        <span className="mx-2 text-gray-500">|</span>
        <button className="px-2 py-1 border rounded" onClick={exportSVG}>
          Export SVG
        </button>
        <button className="px-2 py-1 border rounded" onClick={exportPNG}>
          Export PNG
        </button>
        <span className="ml-auto text-gray-500">
          drag background to pan • drag node to pin • hover to highlight
        </span>
      </div>

      <svg
        width="100%"
        height={dims.h}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
      >
        {/* background (for panning) */}
        <rect
          data-bg="1"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="transparent"
        />

        {/* arrowheads */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#888" />
          </marker>
          <marker
            id="arrow-cross"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#e11d48" />
          </marker>
        </defs>

        {/* pan/zoom group */}
        <g transform={`translate(${tx},${ty}) scale(${k})`}>
          {/* edges */}
          {edgeUI.map(({ e, label, d, lp }, idx) => {
            const stroke = isCross(e) ? "#e11d48" : "#888";
            const dash = methodStyle(e.method || (e.label || "").split(" ")[0]);
            const marker = isCross(e) ? "url(#arrow-cross)" : "url(#arrow)";
            const dim = shouldDimEdge(e);
            return (
              <g key={idx} opacity={dim ? 0.25 : 1}>
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.6"
                  markerEnd={marker}
                  strokeDasharray={dash}
                >
                  <title>
                    {label}
                    {"\n"}source: {String(e.source)}
                    {"\n"}target: {String(e.target)}
                  </title>
                </path>
                <text
                  x={lp.x}
                  y={lp.y}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#555"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* nodes */}
          {layout.positioned.map((n, idx) => {
            const num = nodeNum.get(String(n.id)) ?? idx + 1;
            const dim = shouldDimNode(n.id);
            const onDown = (ev) => {
              ev.stopPropagation();
              nodeDrag.current = { id: String(n.id), ox: n.x, oy: n.y };
              // convert mouse to graph coords
              const mx = (ev.clientX - tx) / k,
                my = (ev.clientY - ty) / k;
              nodeDrag.current.mx = mx;
              nodeDrag.current.my = my;
              const move = (e) => {
                const gx = (e.clientX - tx) / k,
                  gy = (e.clientY - ty) / k;
                const dx = gx - nodeDrag.current.mx,
                  dy = gy - nodeDrag.current.my;
                const id = nodeDrag.current.id;
                setPinned((p) => ({
                  ...p,
                  [id]: {
                    x: nodeDrag.current.ox + dx,
                    y: nodeDrag.current.oy + dy,
                  },
                }));
              };
              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            };
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                opacity={dim ? 0.35 : 1}
                onMouseEnter={() => setHoverNode(String(n.id))}
                onMouseLeave={() => setHoverNode(null)}
                onMouseDown={onDown}
                onDoubleClick={() => toggleSelect(n.id)}
                style={{ cursor: "grab" }}
              >
                <circle r="18" fill={isSelected(n.id) ? "#0f766e" : "#111"} />
                <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#fff">
                  {num}
                </text>
                <text
                  x="0"
                  y="32"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#111"
                >
                  {n.label || n.id}
                </text>
                <title>{String(n.id)}</title>
              </g>
            );
          })}

          {/* legend */}
          <g transform="translate(12,16)">
            <rect
              width="250"
              height="58"
              rx="6"
              ry="6"
              fill="#f8fafc"
              stroke="#e5e7eb"
            />
            <g transform="translate(10,14)">
              <line
                x1="0"
                y1="0"
                x2="24"
                y2="0"
                stroke="#888"
                strokeWidth="1.6"
                markerEnd="url(#arrow)"
              />
              <text x="32" y="4" fontSize="10" fill="#374151">
                domestic (solid=api, dashed=sftp, dotted=event)
              </text>
            </g>
            <g transform="translate(10,34)">
              <line
                x1="0"
                y1="0"
                x2="24"
                y2="0"
                stroke="#e11d48"
                strokeWidth="1.6"
                markerEnd="url(#arrow-cross)"
              />
              <text x="32" y="4" fontSize="10" fill="#374151">
                cross-border
              </text>
            </g>
          </g>

          {/* minimap (bottom-right, in graph space) */}
          <g
            transform={`translate(${dims.w - mini.w - 12},${dims.h - mini.h - 12})`}
          >
            <rect
              width={mini.w}
              height={mini.h}
              rx="6"
              ry="6"
              fill="#ffffff"
              stroke="#e5e7eb"
            />
            <g
              transform={`translate(${mini.pad},${mini.pad})`}
              onClick={onMinimapClick}
              style={{ cursor: "pointer" }}
            >
              {/* background */}
              <rect
                width={mini.w - mini.pad * 2}
                height={mini.h - mini.pad * 2}
                fill="#f8fafc"
                stroke="#e5e7eb"
              />
              {/* nodes in minimap */}
              {layout.positioned.map((n) => {
                const sx = (n.x / dims.w) * (mini.w - mini.pad * 2);
                const sy = (n.y / dims.h) * (mini.h - mini.pad * 2);
                return (
                  <circle key={`m-${n.id}`} cx={sx} cy={sy} r={2} fill="#111" />
                );
              })}
              {/* viewport box */}
              <rect
                x={(miniView.x / dims.w) * (mini.w - mini.pad * 2)}
                y={(miniView.y / dims.h) * (mini.h - mini.pad * 2)}
                width={(miniView.w / dims.w) * (mini.w - mini.pad * 2)}
                height={(miniView.h / dims.h) * (mini.h - mini.pad * 2)}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1"
              />
            </g>
          </g>
        </g>
      </svg>

      {/* Node legend */}
      <div className="px-3 pt-2 pb-1 text-xs text-gray-700 border-t">
        <div className="font-medium mb-1">Nodes</div>
        {nodeLegend.length ? (
          <ul className="list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {nodeLegend.map((n) => (
              <li key={n.id}>
                <span className="font-semibold">{n.num}:</span> {n.label}{" "}
                <span className="text-gray-500">— {n.id}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No nodes</div>
        )}
      </div>

      {/* Edge list */}
      <div className="px-3 pt-2 pb-3 text-xs text-gray-700">
        <div className="font-medium mb-1">Edges</div>
        {edgeList.length ? (
          <ul className="list-disc pl-5 space-y-1">
            {edgeList.map((e) => (
              <li key={e.key}>{e.text}</li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No edges</div>
        )}
      </div>
    </div>
  );
}

export default function CoveragePage() {
  const router = useRouter();

  const [tab, setTab] = useState("matrix");
  const [bpaId, setBpaId] = useState("");
  const [frameworkSet, setFrameworkSet] = useState(
    "GDPR+DPDPA+CCPA+PCI_DSS+HIPAA",
  );

  // Filters
  const [topicFilterCSV, setTopicFilterCSV] = useState(""); // e.g. "security,hipaa_phi"
  const [statusFilterCSV, setStatusFilterCSV] = useState(""); // e.g. "Covered,Gap"
  const [methodFilterCSV, setMethodFilterCSV] = useState(""); // e.g. "api,sftp"
  const [crossBorder, setCrossBorder] = useState(""); // '', 'true', 'false'

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // coverage payload
  const [flows, setFlows] = useState([]); // edges for graph

  // Drawer (cell drill-down)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCtx, setDrawerCtx] = useState(null); // { saId, assetId, topic, status, citations: [...] }

  const [tourOpen, setTourOpen] = useState(false);

  // All topics present in payload (for columns)
  const allTopics = useMemo(() => {
    if (!data?.rows?.length) return [];
    const set = new Set();
    for (const r of data.rows)
      Object.keys(r.topicStatuses || {}).forEach((k) => set.add(k));
    return Array.from(set);
  }, [data]);

  // Topic filter → visible columns
  const visibleTopics = useMemo(() => {
    const list = topicFilterCSV
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!list.length) return allTopics; // no filter = show all
    const set = new Set(list);
    return allTopics.filter((t) => set.has(t));
  }, [allTopics, topicFilterCSV]);

  // Status filter → row subset (keep rows that have any selected status in any *visible* topic)
  const filteredRows = useMemo(() => {
    if (!data?.rows?.length) return [];
    const statuses = statusFilterCSV
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!statuses.length) return data.rows; // no status filter

    const allowed = new Set(statuses);
    return data.rows.filter((r) => {
      const ts = r.topicStatuses || {};
      for (const t of visibleTopics) {
        const v = ts[t] || "N/A";
        if (allowed.has(v)) return true;
      }
      return false;
    });
  }, [data, visibleTopics, statusFilterCSV]);

  const onCellClick = (row, topic) => {
    const status = row.topicStatuses?.[topic] || "N/A";
    const citations = data?.rows?.length ? row.citations?.[topic] || [] : [];
    setDrawerCtx({
      saId: row.saId,
      assetId: row.assetId,
      topic,
      status,
      citations,
    });
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    if (!bpaId) return;
    setError("");
    setLoading(true);
    try {
      // Coverage payload
      const cov = await CustomAxios.get(
        `${COVERAGE_BASE}/bpa/${encodeURIComponent(
          bpaId,
        )}?frameworkSet=${encodeURIComponent(frameworkSet)}`,
      );
      setData(cov.data);

      // Flows (server supports method + crossBorder + bpaId)
      const q = new URLSearchParams();
      if (methodFilterCSV) q.set("method", methodFilterCSV);
      if (crossBorder) q.set("crossBorder", crossBorder);
      q.set("bpaId", bpaId);

      const resFlows = await CustomAxios.get(`${FLOWS_BASE}?${q.toString()}`);
      setFlows(resFlows.data || []);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load coverage",
      );
    } finally {
      setLoading(false);
    }
  };

  // Graph data
  const nodes = useMemo(() => {
    if (!filteredRows.length) return [];
    const uniq = new Map();
    for (const r of filteredRows) {
      uniq.set(r.saId, { id: r.saId, label: `SA ${r.saId.slice(-4)}` });
    }
    return Array.from(uniq.values());
  }, [filteredRows]);

  const edges = useMemo(() => {
    if (!flows?.length) return [];
    // Keep only edges that touch visible SAs (defensive)
    const visibleSa = new Set(filteredRows.map((r) => String(r.saId)));
    return flows
      .filter(
        (f) =>
          visibleSa.has(String(f.sourceSaId)) ||
          visibleSa.has(String(f.targetSaId)),
      )
      .map((f) => ({
        source: String(f.sourceSaId),
        target: String(f.targetSaId),
        label: (f.crossBorder ? "cross-border " : "") + (f.method || ""),
      }));
  }, [flows, filteredRows]);

  const steps = [
    {
      target: '[data-tour="coverage-header"]',
      title: "Coverage Overview",
      content:
        "Use this page to review coverage and data-flow setup for a selected BPA. First choose the BPA, framework set, and filters. Then click Load to open the results.",
      placement: "bottom",
    },
    {
      target: '[data-tour="coverage-bpa"]',
      title: "Select BPA",
      content:
        "Choose the Business Process Activity you want to inspect. This is required because all coverage and flow results are loaded for the selected BPA.",
      placement: "bottom",
    },
    {
      target: '[data-tour="coverage-framework"]',
      title: "Select Framework Set",
      content:
        "Choose the framework set used to evaluate coverage, such as GDPR, DPDPA, CCPA, PCI DSS, or HIPAA. This controls which compliance topics are checked.",
      placement: "bottom",
    },
    {
      target: '[data-tour="coverage-topic"]',
      title: "Topic Filter",
      content:
        "Optionally enter topic names as comma-separated values, such as security or hipaa_phi. This controls which topic columns will be shown in the matrix.",
      placement: "top",
    },
    {
      target: '[data-tour="coverage-status"]',
      title: "Status Filter",
      content:
        "Optionally filter by coverage status such as Covered, Partial, or Gap. This keeps only the rows that match the selected statuses.",
      placement: "top",
    },
    {
      target: '[data-tour="coverage-method"]',
      title: "Flow Method Filter",
      content:
        "Optionally filter graph flows by method, such as api or sftp. Use comma-separated values if you want more than one method.",
      placement: "top",
    },
    {
      target: '[data-tour="coverage-cross-border"]',
      title: "Cross-Border Filter",
      content:
        "Choose whether to show all flows, only cross-border flows, or only non-cross-border flows.",
      placement: "top",
    },
    {
      target: '[data-tour="coverage-load"]',
      title: "Load Results",
      content:
        "After selecting the BPA, framework, and any filters, click Load to fetch the coverage matrix and graph data.",
      placement: "top",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="coverage-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Coverage (Matrix + Graph)
              </h1>
              <p className="mt-2 text-white text-sm">
                View coverage matrix and data flow graph for a Business Process
                Automation (BPA).
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              >
                Help
              </GuideButton>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        {/* <div
          className="border border-[#2B245C] rounded-2xl bg-white flex flex-wrap gap-3 items-end p-6 mt-5 mb-7 shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="coverage-controls"
        > */}

        {/* <div>
          <label className="block text-sm font-medium">BPA ID</label>
          <input className="border rounded p-2 w-80" placeholder="64e9b2..." value={bpaId} onChange={e=>setBpaId(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Framework Set</label>
          <input className="border rounded p-2 w-[28rem]" value={frameworkSet} onChange={e=>setFrameworkSet(e.target.value)} />
        </div> */}

        {/* <div data-tour="coverage-bpa">
            <SelectBpa value={bpaId} onChange={setBpaId} className="w-80" />
          </div>

          <div data-tour="coverage-framework">
            <SelectFrameworkSet
              value={frameworkSet}
              onChange={setFrameworkSet}
            />
          </div> */}

        {/* Matrix Filters */}
        {/* <div>
              <label className="block text-sm font-medium">Topics (CSV)</label>
              <input
                className="border rounded p-2 w-64"
                placeholder="security,hipaa_phi"
                value={topicFilterCSV}
                onChange={(e) => setTopicFilterCSV(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status (CSV)</label>
              <input
                className="border rounded p-2 w-52"
                placeholder="Covered,Gap"
                value={statusFilterCSV}
                onChange={(e) => setStatusFilterCSV(e.target.value)}
              />
            </div> */}

        {/* Flow Filters */}
        {/* <div>
          <label className="block text-sm font-medium">Flow Methods (CSV)</label>
          <input className="border rounded p-2 w-48" placeholder="api,sftp" value={methodFilterCSV} onChange={e=>setMethodFilterCSV(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Cross-Border</label>
          <select className="border rounded p-2 w-32" value={crossBorder} onChange={e=>setCrossBorder(e.target.value)}>
            <option value="">(any)</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div> */}

        {/* <SelectFlowFilters
              methodCSV={methodFilterCSV}
              setMethodCSV={setMethodFilterCSV}
              crossBorder={crossBorder}
              setCrossBorder={setCrossBorder}
            />

          <button
            data-tour="coverage-load"
            className="px-4 py-2 border border-[#2B245C] text-[#2B245C] rounded-lg hover:bg-indigo-50"
            onClick={fetchAll}
          >
            Load
          </button>
        </div> */}

        {/* Controls */}
        <div
          className="mt-5 mb-7 rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="coverage-controls"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div data-tour="coverage-bpa" className="xl:col-span-2">
              <div className="w-full [&>*]:w-full">
                <SelectBpa value={bpaId} onChange={setBpaId} />
              </div>
            </div>

            <div data-tour="coverage-framework" className="xl:col-span-2">
              <div className="w-full [&>*]:w-full">
                <SelectFrameworkSet
                  value={frameworkSet}
                  onChange={setFrameworkSet}
                />
              </div>
            </div>

            <div data-tour="coverage-topic">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Topics
              </label>
              <input
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                placeholder="security,hipaa_phi"
                value={topicFilterCSV}
                onChange={(e) => setTopicFilterCSV(e.target.value)}
              />
            </div>

            <div data-tour="coverage-status">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <input
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                placeholder="Covered,Gap"
                value={statusFilterCSV}
                onChange={(e) => setStatusFilterCSV(e.target.value)}
              />
            </div>

            <div data-tour="coverage-method">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Flow Method
              </label>
              <input
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                placeholder="api,sftp"
                value={methodFilterCSV}
                onChange={(e) => setMethodFilterCSV(e.target.value)}
              />
            </div>

            <div data-tour="coverage-cross-border">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Cross-Border
              </label>
              <select
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm bg-white"
                value={crossBorder}
                onChange={(e) => setCrossBorder(e.target.value)}
              >
                <option value="">(any)</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>

            <div className="xl:col-span-6 flex justify-end">
              <button
                data-tour="coverage-load"
                className="h-10 rounded-md bg-[#2B245C] px-6 text-sm font-medium text-white"
                onClick={fetchAll}
                disabled={!bpaId || loading}
              >
                {loading ? "Loading..." : "Load"}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {loading && <p className="text-sm">Loading…</p>}

        {!loading && data && (
          <div className="space-y-5">
            <div className="border rounded p-3 bg-gray-50 text-sm">
              <span className="font-semibold">BPA:</span> {data?.bpa?.name}{" "}
              <span className="text-gray-500">({data?.bpa?.role})</span>
            </div>

            <div className="flex gap-2">
              <button
                className={`px-3 py-2 border rounded-lg ${
                  tab === "matrix" ? "bg-[#2B245C] text-white" : ""
                }`}
                onClick={() => setTab("matrix")}
              >
                Matrix
              </button>
              <button
                className={`px-3 py-2 border rounded-lg ${
                  tab === "graph" ? "bg-[#2B245C] text-white" : ""
                }`}
                onClick={() => setTab("graph")}
              >
                Graph
              </button>
            </div>

            {tab === "matrix" ? (
              <div className="overflow-x-auto border border-gray-800 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-2 font-medium text-left">
                        System Activity
                      </th>
                      {visibleTopics.map((t) => (
                        <th key={t} className="px-4 py-2 font-medium text-left">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows?.length ? (
                      filteredRows.map((r) => (
                        <tr key={r.saId} className="border-t">
                          <td className="px-4 py-5">
                            <div className="text-xs text-gray-500">
                              SA: {r.saId}
                            </div>
                            <div className="text-xs text-gray-500">
                              Asset: {r.assetId}
                            </div>
                          </td>
                          {visibleTopics.map((t) => (
                            <td key={t} className="px-4 py-5">
                              <button
                                className="hover:opacity-90"
                                onClick={() => onCellClick(r, t)}
                                title="Click for details"
                              >
                                <StatusChip
                                  v={(r.topicStatuses || {})[t] || "N/A"}
                                />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3" colSpan={1 + visibleTopics.length}>
                          No rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Nodes are SAs; edges are Flows. Edge label shows method +
                  cross-border.
                </div>
                <GraphView nodes={nodes} edges={edges} />
              </div>
            )}

            {/* Citations (from first row) */}
            <div className="border rounded p-3">
              <h2 className="font-semibold mb-2">Citations (from first row)</h2>
              {data.rows?.[0]?.citations ? (
                <ul className="list-disc pl-6 text-sm">
                  {Object.entries(data.rows[0].citations).map(
                    ([topic, cites]) => (
                      <li key={topic} className="mb-1">
                        <span className="font-medium">{topic}:</span>{" "}
                        {Array.isArray(cites) && cites.length
                          ? cites
                              .map(
                                (c) =>
                                  `${c.framework} ${c.version} ${c.citation}`,
                              )
                              .join(" | ")
                          : "-"}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No citations loaded.</p>
              )}
            </div>
          </div>
        )}

        {/* Drawer */}
        {drawerOpen && drawerCtx && (
          <div className="fixed inset-0 bg-black/30 flex">
            <div className="ml-auto w-full max-w-md bg-white h-full p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Details</div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <b>SA</b>: {drawerCtx.saId}
                </div>
                <div>
                  <b>Asset</b>: {drawerCtx.assetId}
                </div>
                <div>
                  <b>Topic</b>: {drawerCtx.topic}
                </div>
                <div>
                  <b>Status</b>: <StatusChip v={drawerCtx.status} />
                </div>

                <div>
                  <div className="font-medium mt-2 mb-1">Citations</div>
                  {(drawerCtx.citations || []).length === 0 && (
                    <div className="text-gray-500">None</div>
                  )}
                  <ul className="list-disc pl-5 space-y-1">
                    {(drawerCtx.citations || []).map((c, idx) => (
                      <li key={idx}>
                        <span className="text-gray-800">{c.framework}</span>{" "}
                        <span className="text-gray-500">({c.version})</span> —{" "}
                        <code>{c.citation}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 space-x-2">
                  {/* Quick links — adjust routes if needed */}
                  <Link
                    className="inline-block bg-gray-100 border px-3 py-1 rounded"
                    href={`/admin/dataFlow/mapping/system-activities/${drawerCtx.saId}`}
                  >
                    Open SA
                  </Link>

                  <Link
                    className="inline-block bg-gray-100 border px-3 py-1 rounded"
                    href={{
                      pathname: "/admin/dataFlow/mapping/flows",
                      query: { sourceSaId: drawerCtx.saId },
                    }}
                  >
                    Flows from SA
                  </Link>

                  <Link
                    className="inline-block bg-gray-100 border px-3 py-1 rounded"
                    href={{
                      pathname: "/admin/dataFlow/mapping/flows",
                      query: { targetSaId: drawerCtx.saId },
                    }}
                  >
                    Flows to SA
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
