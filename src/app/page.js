import React from "react";
import Section from "./components/Section";
import { navigationItems } from "@/data/navigationItems.js";
import NavigationList from "@/components/Navigation/NavigationList";

export default function Home() {
  return (
    <div className="text-center">
      <div className="flex flex-col items-center">
        {navigationItems.map((section, index) => (
          <Section key={index} title={section.title}>
            <NavigationList
              items={section.items}
              layout="column"
            />
          </Section>
        ))}
      </div>
    </div>
  );
}