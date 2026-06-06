export const metadata = {
  title: "Erel Bugs (PTS v.269)",
  description:
    "A breakdown of bugs identified with Erel as of PTS v.269, with supporting evidence from the skill data.",
};

function Section({ id, number, title, children }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-primary/20">
        <span className="text-primary-dim mr-2">{number}.</span>
        {title}
      </h2>
      <div className="space-y-4 text-primary/90 leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ id, number, title, children }) {
  return (
    <div id={id} className="mt-6 scroll-mt-20">
      <h3 className="text-lg font-semibold mb-3 text-primary-bright">
        <span className="text-primary-dim mr-2">{number}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Code({ children }) {
  return (
    <pre className="bg-background-dim border border-primary/15 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
      <code className="font-mono text-primary/90 whitespace-pre">{children}</code>
    </pre>
  );
}

function Callout({ children }) {
  return (
    <blockquote className="border-l-4 border-primary-dim/60 bg-background-bright/40 px-4 py-3 italic text-primary/85 rounded-r">
      {children}
    </blockquote>
  );
}

function InlineCode({ children }) {
  return (
    <code className="bg-background-dim border border-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary-bright">
      {children}
    </code>
  );
}

export default function ErelBugsPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <article className="max-w-4xl mx-auto">
        <header className="mb-10 pb-6 border-b border-primary/20">
          <p className="text-sm uppercase tracking-widest text-primary-dim mb-2">
            Informal Bug Report
          </p>
          <h1 className="text-4xl font-bold text-primary-bright mb-3">
            Erel Bugs - PTS v.269
          </h1>
          <p className="text-primary/80">
            A comprehensive breakdown of the bugs I'm currently aware of with Erel as of
            PTS v.269, with supporting evidence pulled from the skill data. XML dumps used for demonstration purposes.
          </p>
        </header>

        <nav className="mb-10 p-4 rounded-lg bg-background-bright/30 border border-primary/15">
          <p className="text-sm uppercase tracking-wider text-primary-dim mb-2">
            Contents
          </p>
          <ol className="list-decimal list-inside space-y-1 text-primary/90">
            <li>
              <a href="#boost-nodes" className="hover:text-primary-bright hover:underline">
                Boost Node Failures
              </a>
            </li>
            <li>
              <a href="#shining-sentinel" className="hover:text-primary-bright hover:underline">
                Shining Sentinel Not Upgraded on SHINE Mastery
              </a>
            </li>
            <li>
              <a href="#sentinel-captain" className="hover:text-primary-bright hover:underline">
                Sentinel Captain - Wrong Hit Counts and Damage Formula
              </a>
            </li>
            <li>
              <a href="#sentinel-rise" className="hover:text-primary-bright hover:underline">
                Sentinel Rise Underperforming
              </a>
            </li>
            <li>
              <a href="#ascent" className="hover:text-primary-bright hover:underline">
                Ascent (Radiant Spear) - Wrong Tooltip
              </a>
            </li>
          </ol>
        </nav>

        <Section id="boost-nodes" number="1" title="Boost Node Failures">
          <p>
            5th job Enhancement Nodes that grant +120% Final Damage are not
            registering the upgraded SHINE versions of their target skills in
            the <InlineCode>psdSkill</InlineCode> (passive skill data) property.
          </p>

          <SubSection
            id="boost-lugh"
            number="1.1"
            title="SHINE Spear of Lugh and Stellar Strike Not Boosted"
          >
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Boost Node:</strong> Spear of Lugh Boost - Skill ID{" "}
                <InlineCode>400004390</InlineCode>
              </li>
              <li>
                <strong>Effect:</strong> +120% Final Damage to Spear of Lugh
              </li>
              <li>
                <strong>Bug:</strong> Does <strong>NOT</strong> apply to SHINE
                Spear of Lugh, nor to the activation skill Stellar Strike.
              </li>
            </ul>
            <p>
              <strong>Proof</strong> - <InlineCode>psdSkill</InlineCode> only
              lists the pre-SHINE chain:
            </p>
            <Code>{`<dir name="psdSkill">
  <dir name="181001000" /> <!-- Spear of Lugh (1st job) -->
  <dir name="181101003" /> <!-- Enhanced Spear of Lugh I -->
  <dir name="181111002" /> <!-- Enhanced Spear of Lugh II -->
  <dir name="181121000" /> <!-- Enhanced Spear of Lugh III -->
</dir>`}</Code>
            <Callout>
              No entry exists for SHINE Spear of Lugh or Stellar Strike.
            </Callout>
          </SubSection>

          <SubSection
            id="boost-fury"
            number="1.2"
            title="SHINE Fury of Roan Not Boosted"
          >
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Effect:</strong> +120% Final Damage to Fury of Roan
              </li>
              <li>
                <strong>Bug:</strong> Does <strong>NOT</strong> apply to SHINE
                Fury of Roan.
              </li>
            </ul>
            <p>
              <strong>Proof:</strong>
            </p>
            <Code>{`<dir name="psdSkill">
  <dir name="181101000" /> <!-- Fury of Roan -->
  <dir name="181101001" /> <!-- Second Fury of Roan; carries values for [Shining Sentinel].
                                Has 0 animation (used when chained with Lugh). -->
  <dir name="181121004" /> <!-- Enhanced Fury of Roan I -->
  <dir name="181121005" /> <!-- Enhanced Fury of Roan I duplicate; 0 animation chain variant. -->
</dir>`}</Code>
            <Callout>No entry for SHINE Fury of Roan.</Callout>
          </SubSection>

          <SubSection
            id="boost-sting"
            number="1.3"
            title="SHINE Sting of Roan Not Boosted"
          >
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Effect:</strong> +120% Final Damage to Sting of Roan
              </li>
              <li>
                <strong>Bug:</strong> Does <strong>NOT</strong> apply to SHINE
                Sting of Roan.
              </li>
            </ul>
            <p>
              <strong>Proof:</strong>
            </p>
            <Code>{`<dir name="psdSkill">
  <dir name="181121001" /> <!-- Sting of Roan; 0 animation chain variant. -->
  <dir name="181121002" /> <!-- Sting of Roan. -->
</dir>`}</Code>
            <Callout>No entry for SHINE Sting of Roan.</Callout>
          </SubSection>
        </Section>

        <Section
          id="shining-sentinel"
          number="2"
          title="Shining Sentinel Not Upgraded on SHINE Mastery"
        >
          <p>
            When the player unlocks SHINE Fury of Roan and SHINE Sting of Roan,
            the <em>Shining Sentinel</em> sub-skills they trigger should be
            upgraded to a stronger version. They are not.
          </p>

          <p>
            <strong>Intended values (level 30):</strong>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border border-primary/20 rounded">
              <thead className="bg-background-bright/50">
                <tr>
                  <th className="px-4 py-2 border-b border-primary/20">Skill</th>
                  <th className="px-4 py-2 border-b border-primary/20">Hits</th>
                  <th className="px-4 py-2 border-b border-primary/20">Damage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b border-primary/10">
                    SHINE Fury of Roan - Shining Sentinel
                  </td>
                  <td className="px-4 py-2 border-b border-primary/10">6</td>
                  <td className="px-4 py-2 border-b border-primary/10">200%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Fury of Roan - Shining Sentinel</td>
                  <td className="px-4 py-2">4</td>
                  <td className="px-4 py-2">150%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Reality:</strong> only one skill exists for each, and it
            never changes.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <InlineCode>181101002</InlineCode> - Shining Sentinel (Fury of
              Roan)
            </li>
            <li>
              <InlineCode>181121003</InlineCode> - Shining Sentinel (Sting of
              Roan)
            </li>
          </ul>

          <SubSection
            id="extraskillinfo"
            number=""
            title="Evidence - extraSkillInfo Comparison"
          >
            <p>
              <strong>Fury of Roan (pre-SHINE):</strong>
            </p>
            <Code>{`<dir name="181101000"> <!-- Fury of Roan -->
  <dir name="extraSkillInfo"> <!-- Skills cast when this is used -->
    <dir name="0">
      <int32 name="skill" value="181101002" /> <!-- Shining Sentinel (Fury of Roan) -->
      <int32 name="delay" value="0" />
    </dir>
    <dir name="1">
      <int32 name="skill" value="400011171" /> <!-- Sentinel Captain: Fury of Roan -->
      <int32 name="delay" value="0" />
    </dir>
  </dir>
</dir>`}</Code>
            <p>
              <strong>SHINE Fury of Roan:</strong>
            </p>
            <Code>{`<dir name="181141002"> <!-- SHINE Fury of Roan -->
  <dir name="extraSkillInfo">
    <dir name="0">
      <int32 name="skill" value="181101002" /> <!-- Shining Sentinel (Fury of Roan) - SAME ID as above -->
      <int32 name="delay" value="0" />
    </dir>
    <dir name="1">
      <int32 name="skill" value="400011174" /> <!-- Sentinel Captain: SHINE Fury of Roan -->
      <int32 name="delay" value="0" />
    </dir>
  </dir>
</dir>`}</Code>
            <Callout>
              Only the <strong>Sentinel Captain</strong> (summoned via Eternal
              Guardian) is upgraded. Shining Sentinel reuses the same ID and is
              therefore never improved.
            </Callout>
          </SubSection>

          <SubSection
            id="sentinel-skill-def"
            number=""
            title="Evidence - Shining Sentinel Skill Definition"
          >
            <Code>{`<dir name="181101002">
  <dir name="common">
    <int32 name="maxLevel" value="20" />
    <string name="damage" value="50+5*x" />        <!-- (50 + 5*20) = 150%; no path to 200% -->
    <string name="mobCount" value="3" />
    <string name="attackCount" value="4" />        <!-- Hardcoded 4 hits; no path to 6 -->
    <vector name="lt" value="-617, -490" />
    <vector name="rb" value="721, 170" />
    <string name="time" value="10" />
    <string name="attackDelay" value="2900" />
    <string name="s" value="80" />
  </dir>
</dir>`}</Code>
            <Callout>
              No variable exists to increase damage to 200% or attack count to 6.
            </Callout>
            <Callout>
              The same bug exists for <strong>Sting of Roan</strong>; proof is
              identical and omitted.
            </Callout>
          </SubSection>
        </Section>

        <Section
          id="sentinel-captain"
          number="3"
          title="Sentinel Captain - Wrong Hit Counts and Damage Formula"
        >
          <p>
            The Eternal Guardian tooltip states that{" "}
            <em>Captain&apos;s Fury of Roan</em> and{" "}
            <em>Captain&apos;s Sting of Roan</em> should each hit{" "}
            <strong>8 enemies, 13 times</strong>, for <strong>556%</strong> at
            level 30 (formula <InlineCode>256 + 10*x</InlineCode>).
          </p>
          <p>
            The actual data is wrong for both - and they&apos;re wrong in{" "}
            <strong>different ways</strong>, suggesting their values got crossed.
          </p>

          <SubSection
            id="captain-sting"
            number="3.1"
            title="Sentinel Captain: Sting of Roan (400011172)"
          >
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Wrong:</strong> mob count (6 instead of 8) and damage
                formula
              </li>
              <li>
                <strong>Right:</strong> attack count (13)
              </li>
            </ul>
            <Code>{`<dir name="400011172"> <!-- Sentinel Captain: Sting of Roan -->
  <dir name="common">
    <int32 name="maxLevel" value="30" />
    <string name="cooltime" value="10" />
    <string name="damage" value="256+6*x" />   <!-- 436% at lvl 30; tooltip expects 256+10*x = 556% -->
    <string name="attackCount" value="13" />   <!-- Correct -->
    <string name="mobCount" value="6" />       <!-- Incorrect; should be 8 -->
    <vector name="lt" value="-652, -467" />
    <vector name="rb" value="445, 84" />
    <string name="x" value="600" />
    <string name="ignoreMobpdpR" value="100" />
    <string name="u" value="-60" />
  </dir>
</dir>`}</Code>
          </SubSection>

          <SubSection
            id="captain-fury"
            number="3.2"
            title="Sentinel Captain: Fury of Roan (400011171)"
          >
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Wrong:</strong> attack count (6 instead of 13) and
                damage formula
              </li>
              <li>
                <strong>Right:</strong> mob count (8)
              </li>
            </ul>
            <Code>{`<dir name="400011171"> <!-- Sentinel Captain: Fury of Roan -->
  <dir name="common">
    <int32 name="maxLevel" value="30" />
    <string name="cooltime" value="10" />
    <string name="damage" value="256+6*x" />   <!-- 436% at lvl 30; tooltip expects 256+10*x = 556% -->
    <string name="attackCount" value="6" />    <!-- Incorrect; should be 13 -->
    <string name="mobCount" value="8" />       <!-- Correct -->
    <vector name="lt" value="-652, -467" />
    <vector name="rb" value="445, 84" />
    <string name="x" value="780" />
    <string name="ignoreMobpdpR" value="100" />
    <string name="u" value="-60" />
  </dir>
</dir>`}</Code>
            <Callout>
              It looks like attack count and mob count got swapped between the
              two skills, and both share an incorrect damage scaling coefficient.
            </Callout>
            <Callout>
              It is important to note that these only apply to the NON-SHINE versions of Sentinel Captain. SHINE Sentinel Captain has the correct numbers.
            </Callout>
            <Callout>
              Another thing to note about Sentinel Captain is that while this might not be a bug per-se, when he copies the attacks for Fury of Roan and Sting of Roan, they are not boosted by the 5th job boosts for Fury/Sting of Roan. In Comparison, the 6th job &ldquo;Destruction of Roan Boost&rdquo; DOES boost Sentinel Captain's Destruction of Roan copy. Additionally, the 6th job &ldquo;Eternal Guardian Boost&rdquo; applies boosts to Sentinel Captain's Fury and Sting of Roan (both SHINE and non-SHINE). I'm not comfortable labelling this is a bug, but it's worth noting for balance reasons.
            </Callout>
          </SubSection>
        </Section>

        <Section
          id="sentinel-rise"
          number="4"
          title="Sentinel Rise Underperforming"
        >
          <p>
            Sentinel Rise is dealing <strong>less damage than expected</strong>,
            even though the values in the files appear correct. There is likely
            a hidden interaction at play.
          </p>
          <p>
            <strong>Test conditions:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Level 16 Erda Shower → 690% per hit.</li>
            <li>
              Shining Sentinels expected: 690% (150 base + 160%p + 180%p +
              200%p).
            </li>
            <li>
              As expected, Erda Shower and Shining Sentinel deal roughly equal
              damage.
            </li>
          </ul>
          <p>
            <strong>The problem:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Sentinel Rise should deal{" "}
              <strong>8 summons × 12 hits × 940%</strong> per hit.
            </li>
            <li>
              In the reference test below, Erda Link &ldquo;Sentinel Rise Boost&rdquo; was activated, which adds{" "}
              <strong>+11% Final Damage</strong>, so each hit should land at{" "}
              <InlineCode>940% × 1.11</InlineCode>.
            </li>
            <li>
              Maximum per-hit damage on Sentinel Rise should therefore far
              exceed Shining Sentinel - but it lands lower.
            </li>
          </ul>
          <p>
            <strong>Reference image:</strong>{" "}
            <a
              href="https://i.imgur.com/6TeeZh4.png"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              BA screenshot
            </a>
          </p>
          <Callout>
            <strong>Status:</strong> root cause unknown. Numbers look right in
            the files; in-game damage is lower than the formula predicts.
          </Callout>
        </Section>

        <Section id="ascent" number="5" title="Ascent (Radiant Spear) - Wrong Tooltip">
          <SubSection
            id="ascent-2part"
            number="5.1"
            title="Radiant Spear is Actually a 2-Part Skill"
          >
            <p>Two Ascent skills exist in the files:</p>

            <p>
              <strong>
                <InlineCode>181141502</InlineCode> - Visible Ascent
              </strong>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-primary/20 rounded">
                <thead className="bg-background-bright/50">
                  <tr>
                    <th className="px-4 py-2 border-b border-primary/20">
                      Property
                    </th>
                    <th className="px-4 py-2 border-b border-primary/20">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b border-primary/10">
                      Damage formula
                    </td>
                    <td className="px-4 py-2 border-b border-primary/10">
                      <InlineCode>607 + 125 * level</InlineCode> →{" "}
                      <strong>4357%</strong> at level 30
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b border-primary/10">
                      Attack count
                    </td>
                    <td className="px-4 py-2 border-b border-primary/10">12</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b border-primary/10">
                      Activation count
                    </td>
                    <td className="px-4 py-2 border-b border-primary/10">26</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 align-top">Description</td>
                    <td className="px-4 py-2 font-mono text-xs leading-relaxed">
                      MP Cost: #mpCon, Invincible during casting
                      <br />
                      Throws a spear imbued with the penetrating power of light,
                      dealing #damage% damage to up to #mobCount enemies
                      #attackCount times, #dummyStr times
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong>
                <InlineCode>181141503</InlineCode> - Hidden Ascent
              </strong>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-primary/20 rounded">
                <thead className="bg-background-bright/50">
                  <tr>
                    <th className="px-4 py-2 border-b border-primary/20">
                      Property
                    </th>
                    <th className="px-4 py-2 border-b border-primary/20">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b border-primary/10">
                      Damage formula
                    </td>
                    <td className="px-4 py-2 border-b border-primary/10">
                      <InlineCode>1000 + 210 * level</InlineCode> →{" "}
                      <strong>7300%</strong> at level 30
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b border-primary/10">
                      Attack count
                    </td>
                    <td className="px-4 py-2 border-b border-primary/10">15</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b border-primary/10">
                      Activation count
                    </td>
                    <td className="px-4 py-2 border-b border-primary/10">
                      Not listed
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 align-top">Description</td>
                    <td className="px-4 py-2 font-mono text-xs leading-relaxed">
                      MP Cost: #mpCon, Invincible during casting
                      <br />
                      Throws a spear imbued with the penetrating power of light,
                      dealing #damage% damage to up to #mobCount enemies
                      #attackCount times, #dummyStr times
                      <br />
                      Afterwards, waves of light attack enemies #dummyStr4
                      times, dealing #dummyStr2% damage #dummyStr3 times
                      <br />
                      Ignore Defense: +#dummyStr5%, Boss Damage: +#dummyStr6%,
                      Critical Rate: #cr%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Callout>
              None of the <InlineCode>dummyStr</InlineCode> variables are
              defined, but the in-game cast produces <strong>357 hits</strong>,
              implying an activation count of <strong>3</strong> for the hidden
              part.
            </Callout>

            <p>
              <strong>Conclusion:</strong> Radiant Spear is a 2-part skill where
              the tooltip describes only the first part:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Part 1:</strong>{" "}
                <InlineCode>4357% × 12 hits × 26 activations</InlineCode>
              </li>
              <li>
                <strong>Part 2 (hidden):</strong>{" "}
                <InlineCode>7300% × 15 hits × 3 activations</InlineCode>
              </li>
            </ul>
          </SubSection>

          <SubSection
            id="ascent-innate"
            number="5.2"
            title="Innate Stat Bonuses Not Shown In-Game"
          >
            <p>
              Although the hidden second-ascent description mentions them, the{" "}
              <strong>in-game tooltip omits</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>+60% Ignore Defense</strong>
              </li>
              <li>
                <strong>+40% Boss Damage</strong>
              </li>
              <li>
                <strong>+100% Critical Rate</strong>
              </li>
            </ul>
            <p>
              These are baked into the Ascent skill but never communicated to
              the player.
            </p>
          </SubSection>
        </Section>

        <footer className="mt-12 pt-6 border-t border-primary/20 text-sm text-primary-dim">
          <p>Bug data extracted from PTS v.269 skill files. XML dumps used for demonstration purposes. Many thanks to all of the dedicated gamers in the Erel discord for taking a keen eye into all of this! If I missed anything, or if you have any questions, feel free to ping me in there! <InlineCode>@masonym</InlineCode> </p>
        </footer>
      </article>
    </main>
  );
}
