"use client";
import { useState, useRef } from 'react';
import { skins } from './data';
import Mob from './Mob';
import DamageSkinSelector from './DamageSkinSelector';
import DamageConfigControls from './DamageConfigControls';
import DamageLine from './DamageLine';

export default function DamageSkins() {
  const [selectedSkin, setSelectedSkin] = useState(skins[0]);
  const [minDamage, setMinDamage] = useState(10000);
  const [maxDamage, setMaxDamage] = useState(1000000000);
  const [linesCount, setLinesCount] = useState(1);
  const [critRate, setCritRate] = useState(60);
  const [damageLines, setDamageLines] = useState([]);
  const idRef = useRef(0);

  const simulateDamage = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  function handleClick() {
    const newLines = Array.from({ length: linesCount }).map(() => {
      const dmg = simulateDamage(minDamage, maxDamage);
      const crit = Math.random() < (critRate / 100);
      const x = (Math.random() - 0.5) * 60;
      const id = idRef.current++;
      return { id, damage: dmg, isCrit: crit, x };
    });
    setDamageLines(prev => [...prev, ...newLines]);
    newLines.forEach(line => {
      setTimeout(() => {
        setDamageLines(prev => prev.filter(l => l.id !== line.id));
      }, 1000);
    });
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <DamageSkinSelector skins={skins} selectedSkin={selectedSkin} onSelect={setSelectedSkin} />
      <DamageConfigControls
        minDamage={minDamage}
        maxDamage={maxDamage}
        linesCount={linesCount}
        critRate={critRate}
        onChange={({ min, max, lines, crit }) => {
          setMinDamage(min);
          setMaxDamage(max);
          setLinesCount(lines);
          setCritRate(crit);
        }}
      />
      <Mob onClick={handleClick} />
      {damageLines.map(line => (
        <DamageLine key={line.id} {...line} skinPath={selectedSkin.path} />
      ))}
      <style jsx global>{`
        @keyframes moveUpFade {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
