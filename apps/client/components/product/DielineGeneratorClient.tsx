"use client";

import dynamic from "next/dynamic";
import DielineLoadingOverlay from "./DielineLoadingOverlay";

/**
 * The editor, in the browser only. It is driven by the Redux store, which holds
 * nothing until its first effect runs, so a server render showed an empty panel
 * and disagreed with the client on Radix's generated ids. The page's crawlable
 * content is `DielineDetails`, rendered by the layout, so nothing is lost.
 */
const DielineGeneratorClient = dynamic(() => import("./DielineGenerator"), {
  ssr: false,
  loading: () => (
    <div className="relative h-full">
      <DielineLoadingOverlay />
    </div>
  ),
});

export default DielineGeneratorClient;
