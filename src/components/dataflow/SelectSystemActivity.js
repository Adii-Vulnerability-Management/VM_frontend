import React from "react";
import { baseurl, initURL } from "@/config/config";
import RemoteSelect from "./RemoteSelect";

// hits your controller: GET /dataflow/system-activities
const SA_ENDPOINT = `${baseurl}/${initURL}/dataflow/system-activities`;

export default function SelectSystemActivity({
  label = "System Activity",
  placeholder = "Search system activities…",
  value,
  onChange,
  className,
  // optional filters (forwarded as query params)
  bpaId,
  assetId,
  roleAtActivity, // e.g. "controller" | "processor" | "inherited"
  limit = 50,
}) {
  return (
    <RemoteSelect
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      endpoint={SA_ENDPOINT}
      toOptions={(sa) => {
        const id = sa._id || sa.id;
        const parts= [];
        if (sa.roleAtActivity) parts.push(sa.roleAtActivity);
        if (sa.assetId) parts.push(`asset:${sa.assetId}`);
        const meta = parts.length ? ` · ${parts.join(" / ")}` : "";
        return {
          value: id,
          label: `${sa.name || sa._id || "(unnamed)"}${meta}`,
        };
      }}
      queryParam="search"
      extraParams={{
        limit,
        ...(bpaId ? { bpaId } : {}),
        ...(assetId ? { assetId } : {}),
        ...(roleAtActivity ? { roleAtActivity } : {}),
      }}
      className={className}
    />
  );
}

{/* <SelectSystemActivity value={saId} onChange={setSaId} className="w-96" />; */}
{
  /* with optional filter by BPA */
}
{
  /* <SelectSystemActivity value={saId} onChange={setSaId} bpaId="64f..." /> */
}
