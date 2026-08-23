"use client";

import { useEffect, useState } from "react";
import { buildIndexes } from "@/lib/equip/engine";

/**
 * Loads the equip dataset from public/equip-data/ and builds the lookup indexes.
 *
 * The dataset is ~1.1 MB, so it is fetched at runtime rather than bundled - it
 * would otherwise land in the JS payload of every page.
 */
export function useEquipData() {
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [items, potentials, sets, meta] = await Promise.all([
          fetch("/equip-data/items.json").then((r) => r.json()),
          fetch("/equip-data/potentials.json").then((r) => r.json()),
          fetch("/equip-data/sets.json").then((r) => r.json()),
          fetch("/equip-data/meta.json").then((r) => r.json()),
        ]);

        if (cancelled) return;

        setState({
          status: "ready",
          error: null,
          data: {
            items,
            potentials,
            sets,
            meta,
            ...buildIndexes({ items, potentials, sets }),
          },
        });
      } catch (error) {
        if (!cancelled) setState({ status: "error", data: null, error });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
