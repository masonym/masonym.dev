import React from "react";
import { addCost, getCostRows, ZERO_COST } from "./hexaNodes";
import { CostInline } from "./Cost";

const Stat = ({ label, cost, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-primary">{label}</span>
    {cost ? (
      <CostInline cost={cost} />
    ) : (
      <span className="text-sm font-semibold text-primary-bright">{children}</span>
    )}
  </div>
);

// Opens as a full-width row under a group, so the tiles above it keep their size.
const NodeDetails = ({ node, status }) => {
  const rows = getCostRows(node);
  const total = rows.reduce(addCost, ZERO_COST);

  return (
    <div className="mt-3 rounded-lg border border-secondary bg-primary-dark p-4 text-left">
      <h4 className="mb-3 font-semibold text-primary-bright">
        {node.names.join(" / ")}
      </h4>
      <div className="mb-4 flex flex-wrap gap-x-10 gap-y-3">
        <Stat label="Spent" cost={status.spent} />
        <Stat label="Remaining to goal" cost={status.remaining} />
        {status.nextCost ? (
          <Stat
            label={`Next level (${status.current} → ${status.current + 1})`}
            cost={status.nextCost}
          />
        ) : (
          <Stat label="Next level">Max level reached</Stat>
        )}
        <Stat label={`Total (0 → ${node.maxLevel})`} cost={total} />
      </div>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((column) => {
          const perColumn = Math.ceil(rows.length / 3);
          const start = column * perColumn;
          return (
            <table key={column} className="w-full self-start text-xs text-primary">
              <thead>
                <tr>
                  <th className="pb-1 text-left font-medium">Level</th>
                  <th className="pb-1 text-right font-medium">Sol Erda</th>
                  <th className="pb-1 text-right font-medium">Frags</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(start, start + perColumn).map((cost, index) => {
                  const from = start + index;
                  const planned = from >= status.current && from < status.goal;
                  return (
                    <tr
                      key={from}
                      className={`border-t border-background-bright ${planned ? "bg-background-bright text-primary-bright" : from < status.current ? "opacity-50" : ""}`}
                    >
                      <td className="px-1 py-1 text-left">
                        {from} → {from + 1}
                      </td>
                      <td className="px-1 py-1 text-right">{cost.solErda.toLocaleString()}</td>
                      <td className="px-1 py-1 text-right">{cost.frags.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        })}
      </div>
    </div>
  );
};

export default NodeDetails;
