import React from "react";
import Image from "next/image";
import sol_erda_fragment from "../../assets/sol_erda_fragment.png";
import sol_erda from "../../assets/sol_erda.png";

export const CostInline = ({ cost, size = 20 }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
    <span className="flex items-center gap-1 text-sm font-semibold text-primary-bright">
      <Image src={sol_erda} width={size} height={size} alt="Sol Erda" />
      {cost.solErda.toLocaleString()}
    </span>
    <span className="flex items-center gap-1 text-sm font-semibold text-primary-bright">
      <Image src={sol_erda_fragment} width={size} height={size} alt="Sol Erda Fragments" />
      {cost.frags.toLocaleString()}
    </span>
  </div>
);

// Same card the Erda Link calculator uses for its totals.
export const CostSummary = ({ title, cost }) => (
  <div className="rounded-xl border border-primary-dim bg-background p-4">
    <h3 className="mb-3 text-center text-xl font-semibold text-primary-bright">
      {title}
    </h3>
    <div className="flex flex-wrap justify-center gap-3">
      {[
        { label: "Sol Erda", icon: sol_erda, value: cost.solErda },
        { label: "Sol Erda Fragments", icon: sol_erda_fragment, value: cost.frags },
      ].map(({ label, icon, value }) => (
        <div
          key={label}
          className="min-w-[110px] rounded-lg border border-primary-dim bg-primary-dark px-3 py-2 text-center"
        >
          <div className="flex h-8 items-center justify-center">
            <Image src={icon} width={32} height={32} alt={label} />
          </div>
          <div className="text-lg font-semibold text-primary-bright">
            {value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
);
