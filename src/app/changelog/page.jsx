import { Suspense } from "react";
import ChangelogClient from "./ChangelogClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 max-w-4xl mx-auto">Loading…</div>}>
      <ChangelogClient />
    </Suspense>
  );
}
