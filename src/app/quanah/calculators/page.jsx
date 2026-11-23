import { Suspense } from "react";
import Link from "next/link";
import SectionBrowser, {
  SectionMenu,
} from "../components/SectionBrowser";
import MissionCalculator from "./components/MissionCalculator";
import StarForceCalculator from "./components/StarForceCalculator";

export const metadata = {
  title: "Quanah Calculators | mason's maple matrix",
  description:
    "Quanah calculators: Dimensional Mission score and grade, Mapae Module points and builds, and Star Force costs in Quanah Crystals and Mapae Fragments.",
};

// Same tile menu as /quanah. Each calculator is a section; add new ones here and below.
const SECTIONS = [
  {
    id: "missions",
    title: "Dimensional Missions",
    sub: "Grade & Mapae Modules",
    icon: "/quanah/ui/mapae-grade5.png",
    sprite: true,
  },
  {
    id: "starforce",
    title: "Star Force",
    sub: "Crystals & Fragments",
    icon: "/quanah/items/1182311.png",
  },
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-primary/20 text-primary-bright">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function QuanahCalculatorsPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <article className="max-w-6xl mx-auto">
        <header className="mb-8 pb-6 border-b border-primary/20 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1 className="text-4xl font-bold text-primary-bright">
            Quanah Calculators
          </h1>
          <Link
            href="/quanah"
            className="text-sm text-primary-dim hover:text-primary-bright underline"
          >
            Quanah Info
          </Link>
        </header>

        <Suspense fallback={<SectionMenu sections={SECTIONS} showAll={false} />}>
          <SectionBrowser sections={SECTIONS} showAll={false}>
            <Section id="missions" title="Dimensional Missions">
              <MissionCalculator />
            </Section>
            <Section id="starforce" title="Star Force">
              <StarForceCalculator />
            </Section>
          </SectionBrowser>
        </Suspense>
      </article>
    </main>
  );
}
