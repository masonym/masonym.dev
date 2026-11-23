import { Suspense } from "react";
import Link from "next/link";
import data from "@/data/quanah.json";
import ClassSkills from "./components/ClassSkills";
import GameText from "./components/GameText";
import Icon from "./components/Icon";
import ModifierIcon from "./components/ModifierIcon";
import SectionBrowser, { SectionMenu } from "./components/SectionBrowser";
import Tip from "./components/Tip";
import {
  copiesByLevel,
  dismantleDust,
  enhanceSteps,
} from "@/lib/quanah/jewels";
import {
  ChangedDot,
  ChangesToggle,
  DiffText,
  DiffValue,
  OnlyWithBefore,
} from "./components/Changes";

export const metadata = {
  title: "Quanah Info | mason's maple matrix",
  description:
    "Quanah reference: Mapae Modules, dimensional and Hologram skills with per-class damage, Battlesim programs, the Byte shop, Jewels, encounters, floor modifiers, Battlesim monsters and Training monsters.",
};

// the modifier on the Floor Modifiers tile, shown on its HUD backing
const tileModifier =
  data.modifiers.sub.find((m) => m.name === "Amplify Damage") ??
  data.modifiers.sub[0];
const backingFor = (m) =>
  m.positive === -1 ? data.ui?.positive : data.ui?.negative;

// The menu tiles, in order (the number keys follow it). `icon` is a path under public/; leave
// it out for an empty placeholder. `sprite` marks a large sprite, scaled down smoothly rather
// than scaled up pixelated like the 32px icons. `backing` puts the icon on a modifier backing.
const SECTIONS = [
  {
    id: "modules",
    title: "Mapae Modules",
    icon: "/quanah/skills/80013179.png",
  },
  {
    id: "skills",
    title: "Skills",
    sub: "Dimensional and Hologram",
    icon: "/quanah/skills/80013018.png",
  },
  {
    id: "acumen",
    title: "Inspector Acumen",
    icon: "/quanah/skills/80013035.png",
  },
  {
    id: "programs",
    title: "Battlesim Programs",
    icon: "/quanah/skills/80013286.png",
  },
  { id: "shop", title: "Byte Shop", icon: "/quanah/items/2833794.png" },
  { id: "jewels", title: "Jewels", icon: "/quanah/items/4009631.png" },
  // the portal that leads to an encounter
  {
    id: "encounters",
    title: "Encounters",
    icon: data.ui?.encounterPortal,
    sprite: true,
  },
  {
    id: "modifiers",
    title: "Floor Modifiers",
    icon: tileModifier?.icon,
    backing: tileModifier && backingFor(tileModifier),
  },
  {
    id: "battlesim",
    title: "Battlesim Monsters",
    icon: "/quanah/mobs/9602880.png",
    sprite: true,
  },
  {
    id: "mobs",
    title: "Training Monsters",
    icon: "/quanah/mobs/9602786.png",
    sprite: true,
  },
];

const TIERS = [1, 2, 3];

// Bugs are tagged as level 3 programs in the data, but they never show up in the program
// shop: they only come from Encounters (the blue portal maps), so they get their own group.
const isBug = (p) => p.name.startsWith("Bug:");

function ProgramRow({ p }) {
  return (
    <li className="relative flex gap-3 p-3 pl-5">
      <ChangedDot entry={p} at="row" />
      <Icon src={p.icon} alt={p.name} />
      <div className="min-w-0">
        <p className="font-semibold text-primary-bright">
          <DiffText before={p.before?.name} after={p.name} />
          {p.tooltipName && (
            <span className="text-primary-dim font-normal text-sm ml-2">
              ({p.tooltipName})
            </span>
          )}
        </p>
        <p className="whitespace-pre-line">
          <DiffText before={p.before?.effect} after={p.effect} />
        </p>
        {p.note && (
          <p className="text-sm text-primary-dim mt-1">
            Not in the tooltip:{" "}
            <span className="text-primary">
              {/* a note that didn't exist before diffs against "" so it shows as added */}
              <DiffText
                before={
                  p.before && "note" in p.before
                    ? (p.before.note ?? "")
                    : undefined
                }
                after={p.note}
              />
            </span>
          </p>
        )}
        <p className="text-sm italic text-primary-dim mt-1">
          <DiffText before={p.before?.flavour} after={p.flavour} />
        </p>
      </div>
    </li>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-primary/20 text-primary-bright">
        {title}
      </h2>
      <div className="space-y-4 text-primary/90 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Note({ children }) {
  return <p className="text-sm text-primary-dim">{children}</p>;
}

// A floor modifier with its HUD tooltip as a hover card. Pure CSS, so it stays a server
// component; the item is focusable so the card also opens on tap and keyboard focus.
function ModifierItem({ modifier: m }) {
  const descId = `modifier-${m.icon?.match(/fieldEffect-(\w+)\.png/)?.[1] ?? m.name}`;
  return (
    <li
      className="group relative flex items-center gap-2 rounded-md outline-none focus-visible:ring-1 focus-visible:ring-primary-dim"
      tabIndex={m.desc ? 0 : undefined}
      aria-describedby={m.desc ? descId : undefined}
    >
      <ModifierIcon icon={m.icon} backing={backingFor(m)} />
      <span
        className={
          m.desc
            ? "underline decoration-dotted decoration-primary-dim underline-offset-4"
            : undefined
        }
      >
        {m.name}
      </span>
      {m.desc && (
        <div
          id={descId}
          role="tooltip"
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 transition-opacity absolute left-0 top-full mt-1 z-20 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-primary-dim bg-background-bright p-3 text-sm shadow-lg pointer-events-none"
        >
          <p className="font-semibold text-primary-bright">{m.name}</p>
          <div className="mt-1 text-primary">
            <GameText text={m.desc} />
          </div>
        </div>
      )}
    </li>
  );
}

// first cells get a wider left pad: the gutter for the changed dot
const th =
  "text-left font-semibold px-3 first:pl-5 py-2 text-primary-dim text-sm";
const td = "relative px-3 first:pl-5 py-2 align-top";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// What the latest data update changed, with the toggle for old values.
function ChangesBanner({ changes }) {
  const when = changes.date ? formatDate(changes.date) : null;
  return (
    <div className="mb-10 rounded-lg border border-secondary/40 bg-background-bright/30 p-4 space-y-3">
      <p className="font-semibold text-primary-bright">
        {changes.source === "hotfix"
          ? `Updated with the ${when} maintenance`
          : "Updated with new client data"}
      </p>
      <p className="text-sm">
        Entries that changed have a <ChangedDot /> next to their name, and the
        sections they are in show how many. Old values are struck through next
        to the new ones.
      </p>
      <ChangesToggle />
    </div>
  );
}

// "Simulated Xerxes" -> "Xerxes"; the one boss just called "Simulated Monster" goes by its sprite
const simName = (m) =>
  m.name === "Simulated Monster"
    ? (m.looksLike ?? m.name)
    : m.name.replace(/^Simulated /, "");

function MobName({ m, sub }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon src={m.icon} alt="" />
      <span>
        {simName(m)}
        {sub && <span className="block text-xs text-primary-dim">{sub}</span>}
      </span>
    </span>
  );
}

function DamageCells({ m }) {
  return (
    <>
      <td className={`${td} whitespace-nowrap`}>
        <DiffValue entry={m} field="maxHP" kind="compact" />
      </td>
      <td className={`${td} whitespace-nowrap`}>
        <DiffValue entry={m} field="touchDamR" kind="percent" />
      </td>
      <td className={`${td} whitespace-nowrap`}>
        <DiffValue entry={m} field="attackDamR" kind="percent" />
      </td>
    </>
  );
}

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-primary/15">
      <table className="w-full text-sm">
        <thead className="bg-background-bright/40">
          <tr>
            {head.map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">{children}</tbody>
      </table>
    </div>
  );
}

export default function QuanahPage() {
  const {
    modules,
    moduleDesc,
    acumen,
    programs,
    shop,
    encounters,
    modifiers,
    mobs,
    battlesim,
    changes,
  } = data;

  const hasChanges = changes && Object.keys(changes.counts).length > 0;
  const intro = hasChanges ? <ChangesBanner changes={changes} /> : null;
  const sections = SECTIONS.filter(
    (s) =>
      (s.id !== "battlesim" || battlesim) && (s.id !== "jewels" || data.jewels),
  ).map((s) => ({ ...s, changed: changes?.counts[s.id] ?? 0 }));

  return (
    <main className="min-h-screen px-6 py-10">
      <article className="max-w-6xl mx-auto">
        <header className="mb-8 pb-6 border-b border-primary/20 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1 className="text-4xl font-bold text-primary-bright">
            Quanah Info
          </h1>
          <Link
            href="/quanah/calculators"
            className="text-sm text-primary-dim hover:text-primary-bright underline"
          >
            Quanah Calculators
          </Link>
        </header>

        <Suspense fallback={<SectionMenu sections={sections} intro={intro} />}>
          <SectionBrowser
            sections={sections}
            intro={intro}
            // the banner has its own toggle, so this only shows inside a section
            toggle={hasChanges && <ChangesToggle floating />}
          >
            <Section id="modules" title="Mapae Modules">
              <p className="italic text-primary/80">{moduleDesc}</p>
              <Table head={["", "Module", "Effect", "Max Lv."]}>
                {modules.map((m) => (
                  <tr key={m.id}>
                    <td className={`${td} w-12`}>
                      <ChangedDot entry={m} />
                      <Icon src={m.icon} alt={m.name} />
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      {m.name.replace("Mapae ", "")}
                    </td>
                    <td className={td}>
                      <DiffText before={m.before?.effect} after={m.effect} />
                    </td>
                    <td className={td}>
                      <DiffValue entry={m} field="maxLevel" />
                    </td>
                  </tr>
                ))}
              </Table>
            </Section>

            <Section id="skills" title="Skills">
              <p>Damage on these skills is different for every class.</p>
              <Suspense fallback={<Note>Loading skills...</Note>}>
                <ClassSkills
                  jobs={data.jobs}
                  dimensionSkills={data.dimensionSkills}
                  hologram={data.hologram}
                />
              </Suspense>
            </Section>

            <Section id="acumen" title="Inspector Acumen">
              <p>
                Passive dimensional skills. Each stat comes in five grades, and
                every one has 10 levels. The same for all classes.
              </p>
              <Table
                head={[
                  "",
                  "Effect",
                  "Grade 1",
                  "Grade 2",
                  "Grade 3",
                  "Grade 4",
                  "Grade 5",
                  "Weight",
                ]}
              >
                {acumen.map((a) => (
                  <tr key={a.label}>
                    <td className={`${td} w-12`}>
                      <ChangedDot entry={a} />
                      <Icon src={a.icon} alt="" />
                    </td>
                    <td className={td}>{a.label}</td>
                    {a.grades.map((g, i) => (
                      <td key={i} className={`${td} whitespace-nowrap`}>
                        <DiffValue
                          entry={{
                            g,
                            before:
                              a.before?.grades && a.before.grades[i] !== g
                                ? { g: a.before.grades[i] }
                                : undefined,
                          }}
                          field="g"
                        />
                      </td>
                    ))}
                    <td className={td}>
                      <DiffValue entry={a} field="weight" />
                    </td>
                  </tr>
                ))}
              </Table>
              <Note>
                Weight is the raw appearance weight from the data. Active skills
                all have a weight of 4, so a higher number here means that
                passive shows up more often.
              </Note>
            </Section>

            <Section id="programs" title="Battlesim Programs">
              <p>
                The 46 programs (including 5 Bugs) available in Infinite
                Dungeon: Battlesim. Values written as 3/6/9 are per level.
              </p>
              <div className="rounded-lg border border-primary/15 bg-background-bright/30 p-4">
                <p className="font-semibold text-primary-bright mb-1">Fusion</p>
                <p>
                  Overclocked Fusion is the only fusion: &quot;the result of
                  three unstable programs melding into one.&quot; It is made
                  from Overheated Head, Creaking Limb and Broken Heart.
                </p>
              </div>
              {TIERS.map((tier) => {
                const list = programs.filter(
                  (p) => p.tier === tier && !isBug(p),
                );
                return (
                  <div key={tier}>
                    <h3 className="text-lg font-semibold text-primary-bright mt-6 mb-2">
                      Level {tier}
                      <span className="text-primary-dim font-normal text-sm ml-2">
                        {list[0].price} Bytes
                      </span>
                    </h3>
                    <ul className="divide-y divide-primary/10 rounded-lg border border-primary/15">
                      {list.map((p) => (
                        <ProgramRow key={p.code} p={p} />
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div>
                <h3 className="text-lg font-semibold text-primary-bright mt-6 mb-2">
                  Bugs
                  <span className="text-primary-dim font-normal text-sm ml-2">
                    Encounters only
                  </span>
                </h3>
                <p className="mb-2">
                  Bugs are not sold in the program shop. You can only pick them
                  up from Encounters (the blue portal maps).
                </p>
                <ul className="divide-y divide-primary/10 rounded-lg border border-primary/15">
                  {programs.filter(isBug).map((p) => (
                    <ProgramRow key={p.code} p={p} />
                  ))}
                </ul>
              </div>
              <Note>
                A name in brackets is what the skill tooltip calls the same
                program.
              </Note>
            </Section>

            <Section id="shop" title="Byte Shop">
              <Table head={["", "Item", "Price"]}>
                {shop.map((s) => (
                  <tr key={s.itemId}>
                    <td className={`${td} w-12`}>
                      <ChangedDot entry={s} />
                      <Icon src={s.icon} alt={s.name} />
                    </td>
                    <td className={td}>
                      <p className="font-semibold text-primary-bright">
                        <DiffText before={s.before?.name} after={s.name} />
                        {s.itemName && (
                          <span className="text-primary-dim font-normal text-sm ml-2">
                            ({s.itemName})
                          </span>
                        )}
                      </p>
                      {s.desc && (
                        <p className="text-sm text-primary-dim whitespace-pre-line">
                          <DiffText before={s.before?.desc} after={s.desc} />
                        </p>
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <DiffValue entry={s} field="price" /> Bytes
                    </td>
                  </tr>
                ))}
              </Table>
            </Section>

            {data.jewels && <JewelsSection jewels={data.jewels} />}

            <Section id="encounters" title="Encounters">
              <Note>
                The client only has the text and the choices, not the outcomes.
                Which choices belong to which encounter is matched up by order.
              </Note>
              {encounters.map((e) => (
                <div
                  key={e.title}
                  className="relative rounded-lg border border-primary/15 p-4 pl-5"
                >
                  <ChangedDot entry={e} at="card" />
                  <h3 className="font-semibold text-primary-bright mb-2">
                    {e.title}
                  </h3>
                  <p className="whitespace-pre-line text-primary/80 text-sm">
                    <DiffText before={e.before?.text} after={e.text} />
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {e.choices.map((c) => (
                      <li
                        key={c}
                        className="px-3 py-1 rounded border border-primary/20 bg-background-bright/30 text-sm"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                  {e.before?.choices && (
                    <OnlyWithBefore>
                      <p className="mt-2 text-sm text-primary-dim">
                        Previously:{" "}
                        <del className="text-progress-red">
                          {e.before.choices.join(", ")}
                        </del>
                      </p>
                    </OnlyWithBefore>
                  )}
                </div>
              ))}
            </Section>

            <Section id="modifiers" title="Floor Modifiers">
              <Note>
                Hover or tap a modifier for what it does, from its tooltip on
                the Battlesim HUD.
              </Note>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ["Main", modifiers.main],
                  ["Sub", modifiers.sub],
                ].map(([label, list]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-primary/15 p-4"
                  >
                    <h3 className="font-semibold text-primary-bright mb-2">
                      {label}
                    </h3>
                    {[
                      [-1, "Positive"],
                      [0, "Negative"],
                    ].map(([flag, name]) => (
                      <div key={flag} className="mb-3 last:mb-0">
                        <p className="text-xs uppercase tracking-wider text-primary-dim mb-1">
                          {name}
                        </p>
                        <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2">
                          {list
                            .filter((m) => m.positive === flag)
                            .map((m) => (
                              <ModifierItem key={m.name} modifier={m} />
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Section>

            {battlesim && <BattlesimSection battlesim={battlesim} />}

            <Section id="mobs" title="Proving Grounds Training Monsters">
              <Table
                head={[
                  "Monster",
                  "Level",
                  "Max HP",
                  "EXP",
                  "Inspector EXP",
                  "Touch dmg",
                  "Attack dmg",
                ]}
              >
                {mobs.map((m) => (
                  <tr key={m.id}>
                    <td className={`${td} whitespace-nowrap`}>
                      <ChangedDot entry={m} />
                      <span className="inline-flex items-center gap-2">
                        <Icon src={m.icon} alt="" />
                        {m.name.replace("Training ", "")}
                      </span>
                    </td>
                    <td className={td}>
                      <DiffValue entry={m} field="level" />
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <DiffValue entry={m} field="maxHP" kind="compact" />
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <DiffValue entry={m} field="exp" kind="number" />
                    </td>
                    <td className={td}>
                      <DiffValue entry={m} field="quanahExp" />
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <DiffValue entry={m} field="touchDamR" kind="percent" />
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <DiffValue entry={m} field="attackDamR" kind="percent" />
                    </td>
                  </tr>
                ))}
              </Table>
              <Note>
                Touch and attack damage are fixed damage, as a percentage of
                your Max HP. A dash means the monster has none and hits for
                normal damage.
              </Note>
            </Section>
          </SectionBrowser>
        </Suspense>
      </article>
    </main>
  );
}

function BattlesimSection({ battlesim }) {
  const { regions, bosses, pool, other, placeholder } = battlesim;
  const bossById = Object.fromEntries(bosses.map((b) => [b.id, b]));
  const floorOf = Object.fromEntries(
    regions.flatMap((r) =>
      r.floors.flatMap((f) =>
        f.bosses.map((id) => [id, `${r.region} ${f.floors[0]}`]),
      ),
    ),
  );
  // "Floors 1–4, 6–9": the random floors, with runs of consecutive numbers as ranges
  const randomFloors = (r) =>
    r.floors
      .filter((f) => f.random)
      .flatMap((f) => f.floors)
      .sort((a, b) => a - b)
      .reduce((runs, n) => {
        const last = runs.at(-1);
        if (last && last[1] === n - 1) last[1] = n;
        else runs.push([n, n]);
        return runs;
      }, [])
      .map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`))
      .join(", ");
  return (
    <Section id="battlesim" title="Battlesim Monsters">
      <p>
        The Battlesim&apos;s monsters are level 260 copies of existing monsters,
        using their sprites. On normal floors the client only places a
        placeholder
        {placeholder &&
          ` (a level ${placeholder.level}, ${placeholder.maxHP} HP Simulated Monster that looks like a ${placeholder.looksLike})`}
        {", "}which gets replaced by a monster from the pool below. Which one
        you get isn&apos;t in the client. Boss floors place their boss directly.
        Each sector is 10 floors: monsters on 1–4 and 6–9, a miniboss on 5 and
        the boss on 10.
      </p>

      <h3 className="text-lg font-semibold text-primary-bright mt-6">Floors</h3>
      <Table head={["Region", "Random monsters", "Boss floors"]}>
        {regions.map((r) => (
          <tr key={r.region}>
            <td className={`${td} whitespace-nowrap`}>{r.region}</td>
            <td className={`${td} whitespace-nowrap`}>
              Floors {randomFloors(r)}
            </td>
            <td className={td}>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {r.floors
                  .filter((f) => !f.random)
                  .map((f) => (
                    <span
                      key={f.map}
                      className="inline-flex items-center gap-2"
                    >
                      <span className="text-primary-dim">{f.floors[0]}:</span>
                      {/* one per name: extra copies of a boss share its name */}
                      {f.bosses
                        .map((id) => bossById[id])
                        .filter(
                          (b, i, list) =>
                            list.findIndex((x) => simName(x) === simName(b)) ===
                            i,
                        )
                        .map((b) => (
                          <MobName key={b.id} m={b} />
                        ))}
                    </span>
                  ))}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <h3 className="text-lg font-semibold text-primary-bright mt-6">Bosses</h3>
      <Table head={["Boss", "Floor", "Max HP", "Touch dmg", "Attack dmg"]}>
        {bosses.map((b) => (
          <tr key={b.id}>
            <td className={`${td} whitespace-nowrap`}>
              <ChangedDot entry={b} />
              <MobName m={b} sub={b.id} />
            </td>
            <td className={`${td} whitespace-nowrap`}>{floorOf[b.id]}</td>
            <DamageCells m={b} />
          </tr>
        ))}
      </Table>
      <Note>
        Some boss floors place extra copies of a boss under another ID, and some
        of those have no sprite, attack or fixed damage of their own.
      </Note>

      <h3 className="text-lg font-semibold text-primary-bright mt-6">
        Monster pool
      </h3>
      <p>
        {pool.length} different monsters, ordered by the level of the monster
        they're based off of in the real world. Monsters that only differ in
        speed or EXP are shown once; the last column counts them. All HP values
        are placeholders.
      </p>
      <details className="rounded-lg border border-primary/15">
        <summary className="cursor-pointer px-4 py-2 text-primary hover:text-primary-bright">
          Show all {pool.length}
        </summary>
        <div className="p-2">
          <Table
            head={["Looks like", "Max HP", "Touch dmg", "Attack dmg", "Copies"]}
          >
            {pool.map((g) => (
              <tr key={g.key}>
                <td className={td}>
                  <ChangedDot entry={g} />
                  <span className="inline-flex items-center gap-2">
                    <Icon src={g.icon} alt="" />
                    <span>
                      {g.looksLike ?? "Its own sprite"}
                      {g.looksLikeLevel != null && (
                        <span className="text-primary-dim text-xs ml-2">
                          Lv. {g.looksLikeLevel}
                        </span>
                      )}
                      {g.bombOnDeath && (
                        <span className="block text-xs text-primary-dim">
                          Leaves a bomb when it dies
                        </span>
                      )}
                    </span>
                  </span>
                </td>
                <DamageCells m={g} />
                <td className={td} title={g.ids.join(", ")}>
                  {g.ids.length}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </details>

      <h3 className="text-lg font-semibold text-primary-bright mt-6">Other</h3>
      <p>
        Simulated monsters that don't get placed on floor load. They are spawned
        by floor modifiers, bosses or the monsters above.
      </p>
      <Table
        head={[
          "Monster",
          "Level",
          "Max HP",
          "Touch dmg",
          "Attack dmg",
          "Notes",
        ]}
      >
        {other.map((m) => (
          <tr key={m.id}>
            <td className={`${td} whitespace-nowrap`}>
              <ChangedDot entry={m} />
              <span className="inline-flex items-center gap-2">
                <Icon src={m.icon} alt="" />
                <span>
                  {m.name}
                  <span className="block text-xs text-primary-dim">{m.id}</span>
                </span>
              </span>
            </td>
            <td className={td}>
              <DiffValue entry={m} field="level" />
            </td>
            <DamageCells m={m} />
            <td className={`${td} text-sm`}>{m.notes.join(", ")}</td>
          </tr>
        ))}
      </Table>
      <Note>
        Touch and attack damage are fixed damage, as a percentage of your Max
        HP. A dash means none. Attack damage lists each attack.
      </Note>
    </Section>
  );
}

const fmt = (n) => n.toLocaleString("en-US");
// "[Hologram] Warrior Attack Skill Level" -> "Warrior"; the other lines name their skill
const classOf = (l) => l.label.match(/(\w+) Attack Skill/)?.[1];

function JewelsSection({ jewels: j }) {
  const stats = j.lines.filter((l) => l.kind === "stat");
  const skills = j.lines.filter((l) => l.kind === "skill");
  const levels = stats[0]?.values.map((_, i) => i + 1) ?? [];
  const prismatic = j.jewels.find((x) => x.type === "multi");
  const color = enhanceSteps(j.enhance.color);
  const multi = enhanceSteps(j.enhance.multi);
  return (
    <Section id="jewels" title="Jewels">
      <p>
        Each dropped equip has 1 to 3 jewel slots, at most one of them
        Prismatic. Each jewel rolls 2 lines from its pool, and the values grow
        with its level.
      </p>

      <div className="overflow-x-auto rounded-lg border border-primary/15">
        <table className="w-full text-sm">
          <thead className="bg-background-bright/40">
            <tr>
              <th className={th}>Line</th>
              {j.jewels.map((x) => (
                <th key={x.id} className={`${th} text-center`}>
                  <span title={x.name} className="inline-flex">
                    <Icon src={x.icon} alt={x.name} />
                  </span>
                </th>
              ))}
              {levels.map((l) => (
                <th key={l} className={th}>
                  Lv. {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {stats.map((l) => (
              <tr key={l.code}>
                <td className={`${td} whitespace-nowrap`}>
                  <ChangedDot entry={l} />
                  {l.label}
                </td>
                {j.jewels.map((x) => (
                  <td key={x.id} className={`${td} text-center`}>
                    {x.lines.includes(l.code) ? (
                      <span className="text-primary-bright" aria-label="Yes">
                        ✓
                      </span>
                    ) : (
                      <span className="text-primary-dim/50" aria-label="No">
                        –
                      </span>
                    )}
                  </td>
                ))}
                {l.values.map((v, i) => (
                  <td key={i} className={`${td} whitespace-nowrap`}>
                    +{fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold text-primary-bright mt-6 flex items-center gap-2">
        <Icon src={prismatic?.icon} alt="" />
        Prismatic skill lines
        <Tip>
          Skills can reach Lv. 3 from equipment. Going past that needs a
          Prismatic Jewel, and a Prismatic Jewel will only add to the skill
          level if it is already Lv. 3.
        </Tip>
      </h3>
      <p>
        Prismatic can also roll a skill level line: +
        {skills[0]?.values.join(" / +")} levels at jewel Lv.{" "}
        {levels.join(" / ")}.
      </p>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {skills.map((l) => (
          <li
            key={l.code}
            className="relative flex items-center gap-2 rounded-lg border border-primary/15 p-2 pl-5"
          >
            <ChangedDot entry={l} at="row" />
            <Icon src={l.icon} alt="" />
            <span>
              {l.skillName ?? l.label}
              {classOf(l) && (
                <span className="block text-xs text-primary-dim">
                  {classOf(l)} attack skill
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div>
          <h3 className="text-lg font-semibold text-primary-bright mb-2">
            Enhancing
            <Tip>
              Requires copies of the same jewel. The total counts from Lv. 1.
            </Tip>
          </h3>
          <Table head={["Level", "Colour jewel", "Prismatic"]}>
            {color.map((c, i) => (
              <tr key={c.level}>
                <td className={td}>
                  Lv. {c.level - 1} → {c.level}
                </td>
                {[c, multi[i]].map((s, k) => (
                  <td key={k} className={`${td} whitespace-nowrap`}>
                    {s ? (
                      <>
                        {s.copies}
                        <span className="text-primary-dim ml-2">
                          ({s.total} total)
                        </span>
                      </>
                    ) : (
                      "–"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-primary-bright mb-2">
            Dust
            <Tip>
              When dismantling equips with jewels socketed, it gives dust for
              every copy in it, plus {fmt(j.dismantle.equipBonus[1])}. You can
              hold up to {fmt(j.dismantle.powderMax)} dust.
            </Tip>
          </h3>
          <Table head={["Dismantle", "Colour jewel", "Prismatic"]}>
            {[
              [
                "Loose jewel (Lv. 1)",
                (type) => dismantleDust(j.dismantle, type),
              ],
              ...copiesByLevel(j.enhance.color).map(({ level }, i) => [
                `On equipment, Lv. ${level}`,
                (type) => {
                  const copies = copiesByLevel(j.enhance[type])[i]?.copies;
                  return copies == null
                    ? null
                    : dismantleDust(j.dismantle, type, copies, true);
                },
              ]),
            ].map(([label, dust]) => (
              <tr key={label}>
                <td className={`${td} whitespace-nowrap`}>{label}</td>
                {["color", "multi"].map((type) => (
                  <td key={type} className={td}>
                    {dust(type) == null ? "–" : fmt(dust(type))}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className={td}>Exchange cost</td>
              <td className={td}>{fmt(j.exchange.color)}</td>
              <td className={td}>{fmt(j.exchange.multi)}</td>
            </tr>
          </Table>
        </div>
      </div>
    </Section>
  );
}
