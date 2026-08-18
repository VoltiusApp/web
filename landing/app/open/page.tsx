import type { Metadata } from "next";
import OpenBridge from "./OpenBridge";

export const metadata: Metadata = {
  title: "Opening Voltius",
  robots: { index: false, follow: false },
};

export default function OpenPage() {
  return <OpenBridge />;
}
