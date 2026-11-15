import { Suspense } from "react";
import data from "@/data/quanah.json";
import ClassSkills from "./components/ClassSkills";
import Icon from "./components/Icon";

export const metadata = {
  title: "Quanah Info | mason's maple matrix",
  description:
    "Quanah reference: Mapae Modules, dimension skills with per-class damage, Battlesim programs, the Byte shop, encounters and floor modifiers.",
};

const SECTIONS = [
  ["modules", "Mapae Modules"],
  ["skills", "Dimension Skills"],
  ["acumen", "Inspector Acumen"],
  ["programs", "Battlesim Programs"],
  ["shop", "Byte Shop"],
  ["encounters", "Encounters"],
  ["modifiers", "Floor Modifiers"],
];

const TIERS = [1, 2, 3];

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

const th = "text-left font-semibold px-3 py-2 text-primary-dim text-sm";
const td = "px-3 py-2 align-top";

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
  const { modules, moduleDesc, acumen, programs, shop, encounters, modifiers } =
    data;

  return (
    <main className="min-h-screen px-6 py-10">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8 pb-6 border-b border-primary/20">
          <h1 className="text-4xl font-bold text-primary-bright mb-3">
            Quanah Info
          </h1>
        </header>

        <nav className="mb-10 flex flex-wrap gap-2">
          {SECTIONS.map(([id, title]) => (
            <a
              key={id}
              href={`#${id}`}
              className="px-3 py-1 rounded-full border border-primary/20 text-sm text-primary hover:text-primary-bright hover:border-primary-bright/40 transition-colors"
            >
              {title}
            </a>
          ))}
        </nav>

        <Section id="modules" title="Mapae Modules">
          <p className="italic text-primary/80">{moduleDesc}</p>
          <Table head={["", "Module", "Effect", "Max Lv."]}>
            {modules.map((m) => (
              <tr key={m.id}>
                <td className={`${td} w-12`}>
                  <Icon src={m.icon} alt={m.name} />
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {m.name.replace("Mapae ", "")}
                </td>
                <td className={td}>{m.effect}</td>
                <td className={td}>{m.maxLevel}</td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section id="skills" title="Dimension Skills">
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
            Passive dimension skills. Each stat comes in five grades, and every
            one has 10 levels. The same for all classes.
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
                  <Icon src={a.icon} alt="" />
                </td>
                <td className={td}>{a.label}</td>
                {a.grades.map((g, i) => (
                  <td key={i} className={`${td} whitespace-nowrap`}>
                    {g}
                  </td>
                ))}
                <td className={td}>{a.weight}</td>
              </tr>
            ))}
          </Table>
          <Note>
            Weight is the raw appearance weight from the data. Active skills all
            have a weight of 4, so a higher number here means that passive shows
            up more often.
          </Note>
        </Section>

        <Section id="programs" title="Battlesim Programs">
          <p>
            The 46 programs available in Infinite Dungeon: Battlesim. Values
            written as 3/6/9 are per stack.
          </p>
          <div className="rounded-lg border border-primary/15 bg-background-bright/30 p-4">
            <p className="font-semibold text-primary-bright mb-1">Fusion</p>
            <p>
              Overclocked Fusion is the only fusion in the data: &quot;the
              result of three unstable programs melding into one.&quot; The
              recipe is not stored in the client. The three programs listed
              right before it (Overheated Head, Creaking Limb, Broken Heart) are
              the likely ingredients, but that is a guess.
            </p>
          </div>
          {TIERS.map((tier) => {
            const list = programs.filter((p) => p.tier === tier);
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
                    <li key={p.code} className="flex gap-3 p-3">
                      <Icon src={p.icon} alt={p.name} />
                      <div className="min-w-0">
                        <p className="font-semibold text-primary-bright">
                          {p.name}
                          {p.tooltipName && (
                            <span className="text-primary-dim font-normal text-sm ml-2">
                              ({p.tooltipName})
                            </span>
                          )}
                        </p>
                        <p className="whitespace-pre-line">{p.effect}</p>
                        <p className="text-sm italic text-primary-dim mt-1">
                          {p.flavour}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <Note>
            A name in brackets is what the skill tooltip calls the same program;
            the two tables in the client disagree.
          </Note>
        </Section>

        <Section id="shop" title="Byte Shop">
          <Table head={["", "Item", "Price"]}>
            {shop.map((s) => (
              <tr key={s.itemId}>
                <td className={`${td} w-12`}>
                  <Icon src={s.icon} alt={s.name} />
                </td>
                <td className={td}>
                  <p className="font-semibold text-primary-bright">
                    {s.name}
                    {s.itemName && (
                      <span className="text-primary-dim font-normal text-sm ml-2">
                        ({s.itemName})
                      </span>
                    )}
                  </p>
                  {s.desc && (
                    <p className="text-sm text-primary-dim whitespace-pre-line">
                      {s.desc}
                    </p>
                  )}
                </td>
                <td className={`${td} whitespace-nowrap`}>{s.price} Bytes</td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section id="encounters" title="Encounters">
          <Note>
            The client only has the text and the choices, not the outcomes.
            Which choices belong to which encounter is matched up by order.
          </Note>
          {encounters.map((e) => (
            <div
              key={e.title}
              className="rounded-lg border border-primary/15 p-4"
            >
              <h3 className="font-semibold text-primary-bright mb-2">
                {e.title}
              </h3>
              <p className="whitespace-pre-line text-primary/80 text-sm">
                {e.text}
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
            </div>
          ))}
        </Section>

        <Section id="modifiers" title="Floor Modifiers">
          <Note>
            Only the names are in the client, plus an unexplained flag that
            splits each list in two. The groups below follow that flag.
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
                {[-1, 0].map((flag) => (
                  <div key={flag} className="mb-2 last:mb-0">
                    <p className="text-xs uppercase tracking-wider text-primary-dim">
                      Flag {flag}
                    </p>
                    <p>
                      {list
                        .filter((m) => m.positive === flag)
                        .map((m) => m.name)
                        .join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      </article>
    </main>
  );
}
