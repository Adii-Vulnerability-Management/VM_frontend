import React, { useCallback, useMemo } from "react";
import RemoteSelect from "./RemoteSelect";

const REGION_ENDPOINT = "/api/countries/codes";

export default function SelectRegion({
  value,
  onChange,
  className,
  label = "Region",
}) {
  // const toOptions = useCallback((c) => ({ value: c.code, label: c.name }), []);
  // const extraParams = useMemo(() => ({}), []);

  return (
    <RemoteSelect
      label={label}
      placeholder="Search regions…"
      value={value}
      onChange={onChange}
      endpoint={REGION_ENDPOINT}
      queryParam="search"
      extraParams={{}}
      toOptions={(c) => ({ value: c.code, label: c.name })}
      className={className}
      fetchOnMount={true}
      minChars={0}
      clientSideFilter={true}
    />
  );
}
