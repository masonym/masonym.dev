import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { masteryDesignation } from '@/data/masteryDesignation';
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost } from "@/data/solErda";
import { classSkillGrowth } from '@/data/classSkillGrowth';
import { boostGrowth } from '@/data/boostGrowth';
import { formatSkillPath } from '../../utils';

const Optimizer = ({ selectedClass, classDetails, skillLevels }) => {
  const [skills, setSkills] = useState([]);
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
    if (selectedClass && classDetails) {
      const masteryData = masteryDesignation[selectedClass];

      const newSkills = [
        { type: 'Origin', skill: classDetails.originSkill, type: 'origin', level: skillLevels[formatSkillPath(classDetails.originSkill)]?.level || 1 },
        ...masteryData.firstMastery.map(skill => ({ type: 'Mastery', skill, type: 'mastery', level: skillLevels[formatSkillPath(skill)]?.level || 0 })),
        ...masteryData.secondMastery.map(skill => ({ type: 'Mastery', skill, type: 'mastery', level: skillLevels[formatSkillPath(skill)]?.level || 0 })),
        ...classDetails.boostSkills.map(skill => ({ type: 'Boost', skill, type: 'enhancement', level: skillLevels[formatSkillPath(skill)]?.level || 0 })),
      ];
      setSkills(newSkills);
      console.log("setting new skills", skills)
      console.log("new skills", newSkills)

      // Initialize damage distribution
      setDamageDistribution(prevDistribution => {
        const newDistribution = { ...prevDistribution };
        newSkills.forEach(skill => {
          if (!(skill.skill in newDistribution)) {
            newDistribution[skill.skill] = 0;
          }
        });
        return newDistribution;
      });
    }
  }, [selectedClass, classDetails, skillLevels]);

  const getCost = (skillType, level) => {
    const costTable = {
      'origin': originUpgradeCost,
      'mastery': masteryUpgradeCost,
      'enhancement': enhancementUpgradeCost,
    }[skillType] || [];

    return costTable[level - 1]?.[level]?.frags || 0;
  };

  useEffect(() => {
    const stateToSave = {
      solErdaFragments,
      damagePercent,
      iedPercent,
      bossDefense,
      damageDistribution
    };
    localStorage.setItem('optimizerState', JSON.stringify(stateToSave));
  }, [solErdaFragments, damagePercent, iedPercent, bossDefense, damageDistribution]);

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

  useEffect(() => {
    const upgrades = upgradeSkills();
    setUpgradeData(upgrades);
  }, [solErdaFragments, damagePercent, iedPercent, bossDefense, damageDistribution]);

  const handleDamageDistributionChange = (skill, value) => {
    setDamageDistribution(prev => ({
      ...prev,
      [skill]: Number(value)
    }));
  };

  return (
    <div classtype="p-4">
      <h2 classtype="text-2xl font-bold mb-4">Hexa Skill Optimizer</h2>

      <div classtype="mb-4">
        <label classtype="block mb-2">Sol Erda Fragments:</label>
        <input
          type="number"
          value={solErdaFragments}
          onChange={(e) => setSolErdaFragments(Number(e.target.value))}
          classtype="border p-2 rounded"
        />
      </div>

      <div classtype="mb-4">
        <label classtype="block mb-2">Damage %:</label>
        <input
          type="number"
          value={damagePercent}
          onChange={(e) => setDamagePercent(Number(e.target.value))}
          classtype="border p-2 rounded"
        />
      </div>

      <div classtype="mb-4">
        <label classtype="block mb-2">IED %:</label>
        <input
          type="number"
          value={iedPercent}
          onChange={(e) => setIedPercent(Number(e.target.value))}
          classtype="border p-2 rounded"
        />
      </div>

      <div classtype="mb-4">
        <label classtype="block mb-2">Boss Defense:</label>
        <input
          type="number"
          value={bossDefense}
          onChange={(e) => setBossDefense(Number(e.target.value))}
          classtype="border p-2 rounded"
        />
      </div>

      <h3 classtype="text-xl font-bold mt-6 mb-2">Damage Distribution</h3>
      <div classtype="grid grid-cols-2 gap-4 mb-6">
        {skills.map((skill, index) => (
          <div key={index} classtype="border p-2 rounded">
            <h3 classtype="font-bold">{skill.skill}</h3>
            <div>Type: {skill.type}</div>
            <div>Level: {skill.level}</div>
            <label classtype="block mt-2">Damage Contribution %:</label>
            <input
              type="number"
              value={damageDistribution[skill.skill]}
              onChange={(e) => handleDamageDistributionChange(skill.skill, e.target.value)}
              classtype="border p-1 mt-1 w-full"
            />
          </div>
        ))}
      </div>

      <h3 classtype="text-xl font-bold mt-4 mb-2">Upgrade Path</h3>
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