import React from "react";
import Footer from "@/components/Footer";
import Section from "./components/Section";
import { navigationItems } from "@/data/navigationItems.js";
import NavigationList from "@/components/Navigation/NavigationList";

export default function Home() {
  return (
    <div className="w-screen h-screen text-center">
      <div className="flex flex-col items-center">
        {navigationItems.map((section, index) => (
          <Section key={index} title={section.title}>
            <NavigationList
              items={section.items}
              alignItemsProp="center"
              flexDirectionProp="row"
              showImages={true}
              rowGapProp={32}
            />
          </Section>
        ))}
      </div>
    </div>
  );
}