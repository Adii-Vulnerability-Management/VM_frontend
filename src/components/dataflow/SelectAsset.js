// src/components/dataflow/SelectAsset.js
import React from "react";
import { baseurl, initURL } from "@/config/config";
import RemoteSelect from "./RemoteSelect";

const ASSET_ENDPOINT = `${baseurl}/${initURL}/dataflow/assets`; // plural like BPAs

/**
 * Props:
 * - value: selected asset id (string|number|null)
 * - onChange: (id|null) => void
 * - className: tailwind width etc.
 * - type, region, environment: optional quick filters → become query params
 * - limit: optional page size (default 50)
 */
export default function SelectAsset({
  value,
  onChange,
  className,
  type, // e.g. "db" | "bucket" | "queue"
  region, // e.g. "EU" | "US" | "ap-south-1"
  environment, // e.g. "prod" | "stage" | "dev"
  limit = 50,
  disabled = false,
  // NEW: filter by BPA or Vendor when provided
  bpaId,
  vendorId,
}) {
  return (
    <RemoteSelect
      label="Asset"
      placeholder="Search assets…"
      value={value}
      onChange={onChange}
      endpoint={ASSET_ENDPOINT}
      queryParam="search"
      // Any of these being undefined/null/"" will be ignored by RemoteSelect
      extraParams={{
        limit,
        type,
        region,
        environment,
        // NEW: forward optional filters
        bpaId,
        vendorId,
      }}
      toOptions={(a) => ({
        value: a._id ?? a.id,
        // pick a decent label fallback order
        label: a.name ?? a.displayName ?? a.key ?? "(unnamed asset)",
      })}
      className={className}
      disabled={disabled}
      // Nice-to-haves from your upgraded RemoteSelect:
      minChars={2}
      debounceMs={300}
      loadingText="Loading assets…"
      noResultsText="No assets found"
      errorText="Couldn’t load assets"
    />
  );
}

{
  /* <SelectAsset value={assetId} onChange={setAssetId} className="w-96" />; */
}
{
  /* With optional quick filters passed through as query params */
}
{
  /* <SelectAsset value={assetId} onChange={setAssetId} type="db" region="EU" environment="prod" /> */
}
