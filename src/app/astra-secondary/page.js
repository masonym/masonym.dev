import React from 'react';
import AstraSecondaryPageClient from './AstraSecondaryPageClient';

export const metadata = {
  title: "Astra Secondary Calculator | mason's maple matrix",
  description: "Calculate how long it will take to complete your Astra Secondary missions.",
};


export default function Page() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-primary-bright">Astra Secondary Calculator</h1>
      <h4 className="text-md max-w-3xl mx-auto font-medium mb-6 text-center text-primary-bright/80">
        Track your progress through the three Astra Secondary missions. 
        Plan your Fierce Battle Traces and Erion's Fragments acquisition from bosses and daily quests.
      </h4>
      <AstraSecondaryPageClient />
    </div>
  );
}
