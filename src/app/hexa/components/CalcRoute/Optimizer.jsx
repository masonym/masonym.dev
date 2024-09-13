import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { masteryDesignation } from '@/data/masteryDesignation';
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost } from "@/data/solErda";
import { classSkillGrowth } from '@/data/classSkillGrowth';
import { boostGrowth } from '@/data/boostGrowth';
import { formatSkillPath } from '../../utils';

const Optimizer = ({ selectedClass, classDetails, skillLevels }) => {
  const [skills, setSkills] = useState([]);
  const skillsRef = useRef(skills);
  const [isLoading, setIsLoading] = useState(true);
  const [solErdaFragments, setSolErdaFragments] = useState(1000);
  const [damagePercent, setDamagePercent] = useState(0);
  const [iedPercent, setIedPercent] = useState(0);
  const [bossDefense, setBossDefense] = useState(300);
  const [upgradeData, setUpgradeData] = useState([]);
  const [damageDistribution, setDamageDistribution] = useState({});

  useEffect(() => {
    const savedState = localStorage.getItem('optimizerState');
    if (savedState) {
      const {
        solErdaFragments: savedFragments,
        damagePercent: savedDamage,
        iedPercent: savedIed,
        bossDefense: savedDefense,
        damageDistribution: savedDistribution
      } = JSON.parse(savedState);

      setSolErdaFragments(savedFragments);
      setDamagePercent(savedDamage);
      setIedPercent(savedIed);
      setBossDefense(savedDefense);
      setDamageDistribution(savedDistribution);
    }
  }, []);

  useEffect(() => {
    if (selectedClass && classDetails && skillLevels) {
      const masteryData = masteryDesignation[selectedClass];

      const newSkills = [
        { type: 'Origin', skill: classDetails.originSkill, level: skillLevels[formatSkillPath(classDetails.originSkill)]?.level || 1 },
        ...classDetails.masterySkills.map(skill => ({ type: 'Mastery', skill, level: skillLevels[formatSkillPath(skill)]?.level || 0 })),
        // ...masteryData.secondMastery.map(skill => ({ type: 'Mastery', skill, level: skillLevels[formatSkillPath(skill)]?.level || 0 })),
        ...classDetails.boostSkills.map(skill => ({ type: 'Boost', skill, level: skillLevels[formatSkillPath(skill)]?.level || 0 })),
      ];
      setSkills(newSkills);

      const newDistribution = newSkills.reduce((acc, skill) => {
        acc[skill.skill] = damageDistribution[skill.skill] || 0;
        return acc;
      }, {});
      setDamageDistribution(newDistribution);

      setIsLoading(false);
    }
  }, [selectedClass, classDetails, skillLevels]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getCost = (skillType, level) => {
    const costTable = {
      'origin': originUpgradeCost,
      'mastery': masteryUpgradeCost,
      'enhancement': enhancementUpgradeCost,
    }[skillType] || [];

    return costTable[level - 1]?.[level]?.frags || 0;
  };

  const getGrowth = (skill, level) => {
    if (!classSkillGrowth[selectedClass]) {
      console.error(`No growth data for class: ${selectedClass}`);
      return 0;
    }

    if (skill.type === 'origin') {
      const originData = classSkillGrowth[selectedClass].originSkill;
      if (originData && originData.name === skill.skill) {
        return originData.level1 + (level - 1) * originData.growthPerLevel;
      }
    } else if (skill.type === 'mastery') {
      const masteryData = classSkillGrowth[selectedClass].masterySkills;
      if (Array.isArray(masteryData)) {
        const skillData = masteryData.find(s => s.name === skill.skill);
        if (skillData) {
          return skillData.level1 + (level - 1) * skillData.growthPerLevel;
        }
      }
    } else if (skill.type === 'enhancement') {
      return parseFloat(boostGrowth[level - 1]?.[level] || '0');
    }

    console.warn(`No growth data found for skill: ${skill.skill}`);
    return 0;
  };

  const calculateEfficiency = (skill, currentLevel) => {
    const cost = getCost(skill.type, currentLevel);
    const currentGrowth = getGrowth(skill, currentLevel);
    const nextGrowth = getGrowth(skill, currentLevel + 1);
    const growthIncrease = nextGrowth - currentGrowth;

    // Account for extra boosts at certain levels (placeholder logic)
    let extraBoost = 0;
    if (skill.type === 'origin' && [10, 20, 30].includes(currentLevel + 1)) {
      extraBoost = 0.1; // 10% extra boost at levels 10, 20, 30
    }

    const skillContribution = damageDistribution[skill.skill] / 100;
    const totalGrowth = (growthIncrease + extraBoost) * skillContribution;

    // Factor in IED and boss defense
    const currentDamage = (1 - bossDefense / 100 * (1 - iedPercent / 100)) * (1 + damagePercent / 100);
    const newDamage = (1 - bossDefense / 100 * (1 - (iedPercent + growthIncrease) / 100)) * (1 + (damagePercent + growthIncrease) / 100);
    const damageFactor = newDamage / currentDamage - 1;

    return cost > 0 ? (totalGrowth * damageFactor) / cost : 0;
  };

  const findOptimalUpgrade = () => {
    let bestSkill = null;
    let bestEfficiency = 0;

    skills.forEach(skill => {
      if (skill.level < 30) {
        const efficiency = calculateEfficiency(skill, skill.level);
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestSkill = skill;
        }
      }
    });

    return bestSkill;
  };

  const upgradeSkills = () => {
    let remainingFragments = solErdaFragments;
    const upgrades = [];
    const updatedSkills = [...skills];

    while (remainingFragments > 0) {
      const skillToUpgrade = findOptimalUpgrade();
      if (!skillToUpgrade) break;

      const cost = getCost(skillToUpgrade.type, skillToUpgrade.level);
      if (cost > remainingFragments) break;

      remainingFragments -= cost;
      const skillIndex = updatedSkills.findIndex(s => s.skill === skillToUpgrade.skill);
      updatedSkills[skillIndex] = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };
      upgrades.push({ ...updatedSkills[skillIndex], fragmentsLeft: remainingFragments });
    }

    setSkills(updatedSkills);
    return upgrades;
  };


  const handleDamageDistributionChange = (skill, value) => {
    setDamageDistribution(prev => ({
      ...prev,
      [skill]: Number(value)
    }));
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-xl font-bold mt-6 mb-2">Enter in the following values</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="mb-4 relative ">
          <label className="block mb-2">Damage + Boss Damage</label>
          <div className="relative">
            <input
              type="number"
              value={damagePercent}
              onChange={(e) => setDamagePercent(Number(e.target.value))}
              className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        <div className="mb-4 relative">
          <label className="block mb-2">IED</label>
          <div className="relative">
            <input
              type="number"
              value={iedPercent}
              onChange={(e) => setIedPercent(Number(e.target.value))}
              className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        <div className="mb-4 relative">
          <label className="block mb-2">Boss Defense</label>
          <div className="relative">
            <input
              type="number"
              value={bossDefense}
              onChange={(e) => setBossDefense(Number(e.target.value))}
              className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
      </div>
      <h3 className="text-xl font-bold mt-6 mb-2">Enter in your rotation's skill damage distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {skills.map((skill, index) => (
          <div key={index} className="border p-2 rounded">
            <h3 className="font-bold">{skill.skill}</h3>
            {/* <div>Current Level: {skill.level}</div> */}
            <label className="block mt-2">Damage Contribution</label>
            <div className="relative">

              <input
                type="number"
                value={damageDistribution[skill.skill]}
                onChange={(e) => handleDamageDistributionChange(skill.skill, e.target.value)}
                className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold mt-4 mb-2">Upgrade Path</h3>
      <LineChart width={600} height={300} data={upgradeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="level" />
        <YAxis />
        <Tooltip />
        <Legend />
        {skills.map((skill, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey="level"
            name={skill.skill}
            stroke={`hsl(${index * 30}, 70%, 50%)`}
          />
        ))}
      </LineChart>
    </div>
  );
};

export default Optimizer;