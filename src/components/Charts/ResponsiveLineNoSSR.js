// components/Charts/ResponsiveLineNoSSR.js
import dynamic from "next/dynamic";

export default dynamic(
  () => import("@nivo/line").then((mod) => mod.ResponsiveLine),
  { ssr: false },
);
