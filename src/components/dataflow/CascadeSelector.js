import React, { useEffect, useMemo, useState } from "react";
import SelectBpa from "./SelectBpa";
import SelectAsset from "./SelectAsset";
import SelectSystemActivity from "./SelectSystemActivity";

/**
 * CascadeSelector
 * - Chains: BPA -> Asset -> System Activity
 * - Resets downstream selections when upstream changes
 *
 * Props:
 *  - value?: { bpaId: string|null, assetId: string|null, saId: string|null }
 *  - onChange?: (val) => void
 *  - className?: string
 *  - layout?: "horizontal" | "vertical"   (default "horizontal")
 *  - labels?: { bpa?: string, asset?: string, sa?: string }
 *  - disabled?: boolean
 *  - size?: "sm" | "md" (adjusts widths)
 *
 * Notes:
 *  - If `value` is provided, the component becomes controlled.
 *  - If `value` is omitted, it keeps internal state, and still calls onChange.
 *  - Asset/SA selectors receive bpaId/assetId as extraParams via their wrappers.
 */

export default function CascadeSelector({
  value,
  onChange,
  className = "",
  layout = "horizontal",
  labels = { bpa: "BPA", asset: "Asset", sa: "System Activity" },
  disabled = false,
  size = "md",
}) {
  const isControlled = value !== undefined;

  // internal state for uncontrolled mode
  const [bpaIdU, setBpaIdU] = useState(null);
  const [assetIdU, setAssetIdU] = useState(null);
  const [saIdU, setSaIdU] = useState(null);

  const bpaId = isControlled ? value?.bpaId ?? null : bpaIdU;
  const assetId = isControlled ? value?.assetId ?? null : assetIdU;
  const saId = isControlled ? value?.saId ?? null : saIdU;

  const gap = "gap-4";
  const dir =
    layout === "vertical" ? "flex-col" : "flex-row flex-wrap items-end";
  const w = size === "sm" ? "w-64" : "w-80";

  // emit consolidated change
  const emit = (next) => {
    onChange?.(next);
  };

  const setBpa = (id) => {
    if (isControlled) {
      emit({ bpaId: id, assetId: null, saId: null });
    } else {
      setBpaIdU(id);
      setAssetIdU(null);
      setSaIdU(null);
      emit({ bpaId: id, assetId: null, saId: null });
    }
  };

  const setAsset = (id) => {
    if (isControlled) {
      emit({ bpaId, assetId: id, saId: null });
    } else {
      setAssetIdU(id);
      setSaIdU(null);
      emit({ bpaId, assetId: id, saId: null });
    }
  };

  const setSa = (id) => {
    if (isControlled) {
      emit({ bpaId, assetId, saId: id });
    } else {
      setSaIdU(id);
      emit({ bpaId, assetId, saId: id });
    }
  };

  // derive disabled states
  const assetDisabled = disabled || !bpaId;
  const saDisabled = disabled || !bpaId || !assetId;

  // Simple helper to gray-out when disabled
  const wrapCls = (cond) => (cond ? "opacity-60 pointer-events-none" : "");

  // If the parent passes a new controlled value, keep local state in sync (no-op for uncontrolled)
  useEffect(() => {
    if (isControlled) return;
    // nothing required here; internal state is the source of truth in uncontrolled mode
  }, [isControlled]);

  return (
    <div className={`flex ${dir} ${gap} ${className}`}>
      {/* BPA */}
      <div className={`${w} ${wrapCls(disabled)}`}>
        <SelectBpa value={bpaId} onChange={setBpa} className={w} />
      </div>

      {/* Asset (filtered by BPA if your backend supports it) */}
      <div className={`${w} ${wrapCls(assetDisabled)}`}>
        <SelectAsset
          value={assetId}
          onChange={setAsset}
          className={w}
          // if your /dataflow/assets list supports filtering by bpaId via query param,
          // the SelectAsset wrapper can forward it via extraParams; we pass it here:
          bpaId={bpaId}
        />
      </div>

      {/* System Activity (filtered by BPA/Asset) */}
      <div className={`${w} ${wrapCls(saDisabled)}`}>
        <SelectSystemActivity
          value={saId}
          onChange={setSa}
          className={w}
          bpaId={bpaId}
          assetId={assetId}
        />
      </div>
    </div>
  );
}


// import CascadeSelector from "@/components/dataflow/CascadeSelector";

// export default function ExampleUncontrolled() {
//   return (
//     <div className="p-6 space-y-4">
//       <h2 className="text-lg font-semibold">Pick scope</h2>
//       <CascadeSelector
//         onChange={(v) => console.log("changed:", v)} // { bpaId, assetId, saId }
//       />
//     </div>
//   );
// }


// import { useState } from "react";
// import CascadeSelector from "@/components/dataflow/CascadeSelector";

// export default function ExampleControlled() {
//   const [scope, setScope] = useState({ bpaId: null, assetId: null, saId: null });

//   return (
//     <div className="p-6 space-y-4">
//       <h2 className="text-lg font-semibold">Pick scope (controlled)</h2>
//       <CascadeSelector value={scope} onChange={setScope} layout="vertical" size="sm" />
//       <pre className="text-xs bg-slate-50 border p-2 rounded">{JSON.stringify(scope, null, 2)}</pre>
//     </div>
//   );
// }
