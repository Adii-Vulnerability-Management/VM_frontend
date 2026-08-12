// components/Charts/ResponsivePieNoSSR.js
import dynamic from "next/dynamic";
export default dynamic(
  () => import("@nivo/pie").then((mod) => mod.ResponsivePie),
  { ssr: false }
);
