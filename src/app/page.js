import React from "react";
import styles from "./page.module.css";
import Footer from "@/components/Footer";
import Section from "./components/Section";
import { navigationItems } from "@/data/navigationItems.js";
import NavigationList from "@/components/Navigation/NavigationList";

export default function Home() {
  return (
    <div className={styles.App}>
      <div style={{ display: "flex", flexDirection: 'column', alignItems: 'center' }}>
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