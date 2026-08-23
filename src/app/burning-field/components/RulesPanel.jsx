"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import {
  GAME_RULES,
  SITE_ASSUMPTIONS,
  STATUS_KEYS,
  STATUS_META,
} from "./burningUi";

/**
 * The rules the projection is built on, stated as a list rather than buried in
 * a paragraph: what the game does, what this site guesses, and what each status
 * means when you log it.
 */
export default function RulesPanel() {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div className="bg-background-bright border border-primary-dim rounded-lg">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-3 text-sm text-primary hover:text-primary-bright"
      >
        <Chevron className="w-4 h-4 shrink-0" />
        <BookOpen className="w-4 h-4 shrink-0" />
        Burning rules &amp; what this board assumes
      </button>

      {open && (
        <div className="px-4 pb-4 grid gap-5 md:grid-cols-2 text-sm">
          <section>
            <h3 className="text-primary-bright mb-1.5">
              The game&apos;s rules
            </h3>
            <ul className="space-y-1 text-primary-dim list-disc pl-5">
              {GAME_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-primary-bright mb-1.5">
              What this board assumes
            </h3>
            <ul className="space-y-1 text-primary-dim list-disc pl-5">
              {SITE_ASSUMPTIONS.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className="md:col-span-2">
            <h3 className="text-primary-bright mb-1.5">
              What each status means
            </h3>
            <ul className="space-y-1 text-primary-dim">
              {STATUS_KEYS.map((key) => (
                <li key={key}>
                  <span className="text-primary">{STATUS_META[key].label}</span>{" "}
                  - {STATUS_META[key].hint}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
