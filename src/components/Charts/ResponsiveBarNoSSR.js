// components/Charts/ResponsiveBarNoSSR.js
import dynamic from "next/dynamic";
export default dynamic(
  () => import("@nivo/bar").then((mod) => mod.ResponsiveBar),
  { ssr: false }
);
