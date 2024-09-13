import React, { useState, useEffect } from 'react';
import { masteryDesignation } from '@/data/masteryDesignation';
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost } from "@/data/solErda";
import { classSkillGrowth } from '@/data/classSkillGrowth';
import { boostGrowth } from '@/data/boostGrowth';
import { formatSkillPath } from '../../utils';

const Optimizer = ({ selectedClass, classDetails, skillLevels }) => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [damagePercent, setDamagePercent] = useState(0);
  const [iedPercent, setIedPercent] = useState(0);
  const [bossDefense, setBossDefense] = useState(300);
  const [upgradePath, setUpgradePath] = useState([]);
  const [damageDistribution, setDamageDistribution] = useState({});

  useEffect(() => {
    const savedState = localStorage.getItem('optimizerState');
    if (savedState) {
      const {
        damagePercent: savedDamage,
        iedPercent: savedIed,
        bossDefense: savedDefense,
        damageDistribution: savedDistribution
      } = JSON.parse(savedState);

      setDamagePercent(savedDamage);
      setIedPercent(savedIed);
      setBossDefense(savedDefense);
      setDamageDistribution(savedDistribution);
    }
  }, []);

  useEffect(() => {
    if (selectedClass && classDetails && skillLevels) {
      const newSkills = [
        { type: 'Origin', skill: classDetails.originSkill, level: skillLevels[formatSkillPath(classDetails.originSkill)]?.level || 1 },
        ...classDetails.masterySkills.map(skill => ({ type: 'Mastery', skill, level: skillLevels[formatSkillPath(skill)]?.level || 0 })),
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

  const getCost = (skillType, level) => {
    const costTable = {
      'Origin': originUpgradeCost,
      'Mastery': masteryUpgradeCost,
      'Boost': enhancementUpgradeCost,
    }[skillType] || [];
    return costTable[level]?.[level + 1]?.frags || 0;
  };

  const getGrowth = (skill, level) => {
    if (!classSkillGrowth[selectedClass]) {
      console.error(`No growth data for class: ${selectedClass}`);
      return 0;
    }

    if (skill.type === 'Origin') {
      const originData = classSkillGrowth[selectedClass].originSkill;
      if (originData && originData.name === skill.skill) {
        return originData.level1 + (level - 1) * originData.growthPerLevel;
      }
    } else if (skill.type === 'Mastery') {
      const masteryData = classSkillGrowth[selectedClass].masterySkills;
      if (Array.isArray(masteryData)) {
        const skillData = masteryData.find(s => s.name === skill.skill);
        if (skillData) {
          return skillData.level1 + (level - 1) * skillData.growthPerLevel;
        }
      }
    } else if (skill.type === 'Boost') {
      return parseFloat(boostGrowth[level]?.[level] || '0');
    }

    console.warn(`No growth data found for skill: ${skill.skill}`);
    return 0;
  };

  const calculateEfficiency = (skill, currentLevel) => {
    const cost = getCost(skill.type, currentLevel);
    const currentGrowth = getGrowth(skill, currentLevel);
    const nextGrowth = getGrowth(skill, currentLevel + 1);
    const growthIncrease = nextGrowth / currentGrowth - 1; // Relative increase

    let extraBoost = 0;
    if (skill.type === 'Origin' && [10, 20, 30].includes(currentLevel + 1)) {
      extraBoost = 0.1; // 10% extra boost at levels 10, 20, 30
    }

    const skillContribution = damageDistribution[skill.skill] / 100;

    // Calculate the effective damage increase
    const damageIncrease = (growthIncrease + extraBoost) * skillContribution;

    // Factor in IED and boss defense
    const currentDamageMultiplier = 1 - (bossDefense / 100) * (1 - iedPercent / 100);
    const effectiveDamageIncrease = damageIncrease * currentDamageMultiplier;

    // Calculate efficiency
    const efficiency = cost > 0 ? effectiveDamageIncrease / cost : 0;

    console.log("skill: ", skill)
    console.log("Current Growth: ", currentGrowth)
    console.log("Next Growth: ", nextGrowth)
    console.log("Damage increase: ", damageIncrease)
    console.log("Cost: ", cost)
    console.log("Current damage multiplier: ", currentDamageMultiplier)
    console.log("Effective damage increase: ", effectiveDamageIncrease)

    return efficiency;
  };

  const findOptimalUpgrade = (currentSkills) => {
    let bestSkill = null;
    let bestEfficiency = 0;

    currentSkills.forEach(skill => {
      if (skill.level < 30) {
        const efficiency = calculateEfficiency(skill, skill.level);
        console.log("eff: ", efficiency)
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestSkill = skill;
        }
      }
    });
    console.log("is there a best skill?", bestSkill)
    return bestSkill;
  };

  const generateUpgradePath = () => {
    const path = [];
    let currentSkills = [...skills];
    let totalCost = 0;

    while (true) {
      const skillToUpgrade = findOptimalUpgrade(currentSkills);
      if (!skillToUpgrade) break;

      const cost = getCost(skillToUpgrade.type, skillToUpgrade.level);
      totalCost += cost;

      const skillIndex = currentSkills.findIndex(s => s.skill === skillToUpgrade.skill);
      currentSkills[skillIndex] = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };
      path.push({
        skill: skillToUpgrade.skill,
        newLevel: currentSkills[skillIndex].level,
        cost,
        totalCost
      });

      // Stop if all skills are at level 30
      if (currentSkills.every(skill => skill.level === 30)) break;
    }

    setUpgradePath(path);
  };

  const handleDamageDistributionChange = (skill, value) => {
    setDamageDistribution(prev => ({
      ...prev,
      [skill]: Number(value)
    }));
  };

  const handleGenerateUpgradePath = () => {
    generateUpgradePath();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-xl font-bold mt-6 mb-2">Enter your current stats</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="mb-4 relative">
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

      <h3 className="text-xl font-bold mt-6 mb-2">Enter your rotation's skill damage distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {skills.map((skill, index) => (
          <div key={index} className="border p-2 rounded">
            <h3 className="font-bold">{skill.skill}</h3>
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

      <button
        onClick={handleGenerateUpgradePath}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Generate Upgrade Path
      </button>

      {upgradePath.length > 0 && (
        <div className="mt-6 w-full">
          <h3 className="text-xl font-bold mb-2">Recommended Upgrade Path</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary-dim">
                  <th className="border p-2">Step</th>
                  <th className="border p-2">Skill</th>
                  <th className="border p-2">New Level</th>
                  <th className="border p-2">Cost</th>
                  <th className="border p-2">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {upgradePath.map((upgrade, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-primary-dark' : 'bg-primary-dim'}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{upgrade.skill}</td>
                    <td className="border p-2">{upgrade.newLevel}</td>
                    <td className="border p-2">{upgrade.cost}</td>
                    <td className="border p-2">{upgrade.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Optimizer;