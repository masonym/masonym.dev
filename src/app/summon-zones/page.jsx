import { Suspense } from "react";
import SummonZonesClient from "./components/SummonZonesClient";

export const metadata = {
  title: "Summon Zones | mason's maple matrix",
  description:
    "See where placed summons stop attacking in each MapleStory map: the hidden field split grid, its transition lines, and where to put your summon so it stays active.",
};

export default function SummonZonesPage() {
  return (
    <Suspense fallback={null}>
      <SummonZonesClient />
    </Suspense>
  );
}
