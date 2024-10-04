import React, { useState, useEffect } from 'react';
import { masteryDesignation } from '@/data/masteryDesignation';
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost } from "@/data/solErda";
import { classSkillGrowth } from '@/data/classSkillGrowth';
import { boostGrowth } from '@/data/boostGrowth';
import { formatSkillName, formatSkillPath } from '../../utils';
import SkillIcon from './SkillIcon';



const Optimizer = ({ selectedClass, classDetails, skillLevels }) => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [damagePercent, setDamagePercent] = useState(0);
  const [iedPercent, setIedPercent] = useState(0);
  const [bossDefense, setBossDefense] = useState(300);
  const [upgradePath, setUpgradePath] = useState([]);
  const [damageDistribution, setDamageDistribution] = useState({});
  const [masterySkills, setMasterySkills] = useState({});

  useEffect(() => {
    const loadFromLocalStorage = () => {
      const savedState = localStorage.getItem(`optimizerState_${selectedClass}`);
      if (savedState) {
        const {
          damagePercent: savedDamage,
          iedPercent: savedIed,
          bossDefense: savedDefense,
          damageDistribution: savedDistribution,
          upgradePath: savedUpgradePath
        } = JSON.parse(savedState);

        setDamagePercent(savedDamage || 0);
        setIedPercent(savedIed || 0);
        setBossDefense(savedDefense || 300);
        setUpgradePath(savedUpgradePath || []);

        // Only set damageDistribution if it's not empty
        if (savedDistribution && Object.keys(savedDistribution).length > 0) {
          setDamageDistribution(savedDistribution);
        } else {
          // Reset damageDistribution if it's empty in localStorage
          setDamageDistribution({});
        }
      } else {
        // Reset all state if no saved data for this class
        setDamagePercent(0);
        setIedPercent(0);
        setBossDefense(300);
        setUpgradePath([]);
        setDamageDistribution({});
      }
    };

    loadFromLocalStorage();
    setIsLoading(true);
  }, [selectedClass]);

  // Effect for saving data to local storage
  const saveToLocalStorage = (key, value) => {
    const currentState = JSON.parse(localStorage.getItem(`optimizerState_${selectedClass}`) || '{}');
    const newState = { ...currentState, [key]: value };
    localStorage.setItem(`optimizerState_${selectedClass}`, JSON.stringify(newState));
  };

  const setDamagePercentWithStorage = (value) => {
    setDamagePercent(value);
    saveToLocalStorage('damagePercent', value);
  };

  const setIedPercentWithStorage = (value) => {
    setIedPercent(value);
    saveToLocalStorage('iedPercent', value);
  };

  const setBossDefenseWithStorage = (value) => {
    setBossDefense(value);
    saveToLocalStorage('bossDefense', value);
  };

  const handleDamageDistributionChange = (skill, value) => {
    const newDistribution = {
      ...damageDistribution,
      [skill]: Number(value)
    };
    setDamageDistribution(newDistribution);
    saveToLocalStorage('damageDistribution', newDistribution);
  };


  useEffect(() => {
    if (selectedClass && classDetails && skillLevels) {
      const classDesignation = masteryDesignation[selectedClass];

      // Initialize mastery levels
      const firstMasteryLevel = Math.max(
        ...classDesignation.firstMastery.map(skill => skillLevels[formatSkillPath(skill)]?.level || 0)
      );
      const secondMasteryLevel = Math.max(
        ...classDesignation.secondMastery.map(skill => skillLevels[formatSkillPath(skill)]?.level || 0)
      );

      const newSkills = [
        {
          type: 'Origin',
          skill: classDetails.originSkill,
          level: skillLevels[formatSkillPath(classDetails.originSkill)]?.level || 1
        },
        ...classDetails.masterySkills.map(skill => ({
          type: 'Mastery',
          skill,
          level: classDesignation.firstMastery.includes(skill) ? firstMasteryLevel : secondMasteryLevel,
          category: classDesignation.firstMastery.includes(skill) ? 'firstMastery' : 'secondMastery'
        })),
        ...classDetails.boostSkills.map(skill => ({
          type: 'Boost',
          skill,
          level: skillLevels[formatSkillPath(skill)]?.level || 0
        })),
      ];
      setSkills(newSkills);

      // Initialize or update damage distribution
      setDamageDistribution(prevDistribution => {
        const newDistribution = newSkills.reduce((acc, skill) => {
          acc[skill.skill] = prevDistribution[skill.skill] || 0;
          return acc;
        }, {});
        
        // Save the new distribution to localStorage
        saveToLocalStorage('damageDistribution', newDistribution);
        
        return newDistribution;
      });

      setIsLoading(false);
    }
  }, [selectedClass, classDetails, skillLevels]);

  useEffect(() => {
    if (selectedClass && masteryDesignation[selectedClass]) {
      setMasterySkills({
        firstMastery: masteryDesignation[selectedClass].firstMastery,
        secondMastery: masteryDesignation[selectedClass].secondMastery
      });
    }
  }, [selectedClass]);

  const getCost = (skillType, level) => {
    const costTable = {
      'Origin': originUpgradeCost,
      'Mastery': masteryUpgradeCost,
      'Boost': enhancementUpgradeCost,
    }[skillType] || [];
    return costTable[level]?.[level + 1]?.frags || 0;
  };

  const getAuxiliaryBoost = (skillData, level) => {
    if (skillData?.auxiliaryBoost) {
      const { threshold, increase } = skillData.auxiliaryBoost;
      const baseMultiplier = 1 + Math.floor((level - 1) / threshold) * increase;
      return baseMultiplier;
    }
    return 1; // Default: no auxiliary boost
  };

  const getSkillDamage = (skill, level, currentSkills) => {
    const classData = classSkillGrowth[selectedClass];
    let skillData;

    let globalFinalDamageMultiplier = 1;

    // Calculate global effects from boost skills
    currentSkills.forEach(currentSkill => {
      if (currentSkill.type === 'Boost') {
        const boostSkillData = classData.boostSkills.find(s => s.name === currentSkill.skill);
        if (boostSkillData.globalEffect && boostSkillData.globalEffect.type === 'finalDamage') {
          globalFinalDamageMultiplier *= (1 + boostSkillData.globalEffect.value + 
            (currentSkill.level - 1) * boostSkillData.globalEffect.growthPerLevel);
        }
      }
    });

    // console.log(globalFinalDamageMultiplier)

    if (skill.type === 'Origin') {
      skillData = classData.originSkill;
      let baseDamage = skillData.components.reduce((total, component) => {
        const levelDamage = component.damage + (level - 1) * component.growthPerLevel;
        return total + levelDamage * component.attacks * (component.triggers || 1);
      }, 0);

      const { totalIED, bossDamageBoost } = getOriginSkillBoosts(level, iedPercent);

      const totalDamageMultiplier = 1 + (damagePercent + bossDamageBoost) / 100;

      return baseDamage * totalDamageMultiplier * globalFinalDamageMultiplier * (1 - (bossDefense / 100) * (1 - totalIED / 100));

    } else if (skill.type === 'Mastery') {
      skillData = classData.masterySkills.find(s => s.name === skill.skill);
      if (level === 0) return skillData.level0;
      let baseDamage = skillData.level1 + (level - 1) * skillData.growthPerLevel;

      // Apply additional effects from other skills
      currentSkills.forEach(otherSkill => {
        if (otherSkill.type === 'Mastery') {
          const otherSkillData = classData.masterySkills.find(s => s.name === otherSkill.skill);
          if (otherSkillData.additionalEffects) {
            otherSkillData.additionalEffects.forEach(effect => {
              if (effect.targetSkill === skill.skill) {
                if (effect.effectType === 'flatDamageIncrease') {
                  baseDamage += effect.baseValue + (otherSkill.level - 1) * effect.growthPerLevel;
                }
                // Add other effect types as needed
              }
            });
          }
        }
      });

      const { iedBoost, bossDamageBoost } = getProgressiveBoosts(skillData, level);
      let totalIED = calculateIED(iedPercent / 100, iedBoost / 100);
      if (skillData.staticIED) {
        totalIED = calculateIED(totalIED, skillData.staticIED / 100);
      }
      totalIED *= 100;

      let totalBossDamage = damagePercent + bossDamageBoost;
      if (skillData.staticBossDamage) {
        totalBossDamage += skillData.staticBossDamage;
      }

      const totalDamageMultiplier = 1 + totalBossDamage / 100;
      return baseDamage * totalDamageMultiplier * globalFinalDamageMultiplier * (1 - (bossDefense / 100) * (1 - totalIED / 100));

    } else if (skill.type === 'Boost') {
      skillData = classData.boostSkills.find(s => s.name === skill.skill);
      const baseBoost = 1 + (parseFloat(boostGrowth[level]?.[level] || '0') / 100);
      const auxiliaryBoost = getAuxiliaryBoost(skillData, level);
      const { iedBoost, bossDamageBoost } = getProgressiveBoosts(skillData, level);
      const totalIED = calculateIED(iedPercent / 100, iedBoost / 100) * 100;
      let totalDamageMultiplier = 1 + (damagePercent + bossDamageBoost) / 100;
  
      // Calculate global effects
      let globalFinalDamageMultiplier = 1;
      currentSkills.forEach(currentSkill => {
        if (currentSkill.type === 'Boost') {
          const boostSkillData = classData.boostSkills.find(s => s.name === currentSkill.skill);
          if (boostSkillData.globalEffect && boostSkillData.globalEffect.type === 'finalDamage') {
            globalFinalDamageMultiplier *= (1 + boostSkillData.globalEffect.value + 
              (currentSkill.level - 1) * boostSkillData.globalEffect.growthPerLevel);
          }
        }
      });
  
      // Include the skill's own global effect if it has one
      if (skillData.globalEffect && skillData.globalEffect.type === 'finalDamage') {
        globalFinalDamageMultiplier *= (1 + skillData.globalEffect.value + 
          (level - 1) * skillData.globalEffect.growthPerLevel);
      }
  
      return baseBoost * auxiliaryBoost * totalDamageMultiplier * globalFinalDamageMultiplier * 
        (1 - (bossDefense / 100) * (1 - totalIED / 100));
    }
  
    return 0;
  };

  const calculateIED = (currentIED, newIED) => {
    return currentIED + (newIED * (1 - currentIED));
  };

  const getOriginSkillBoosts = (level, baseIED) => {
    let totalIED = baseIED / 100;
    let bossDamageBoost = 0;

    if (level >= 30) {
      totalIED = calculateIED(totalIED, 0.3);
      totalIED = calculateIED(totalIED, 0.2);
      bossDamageBoost += 50; // 20% + 30%
    } else if (level >= 20) {
      totalIED = calculateIED(totalIED, 0.2);
      bossDamageBoost += 20;
    } else if (level >= 10) {
      totalIED = calculateIED(totalIED, 0.2);
    }

    return { totalIED: totalIED * 100, bossDamageBoost };
  };

  const getGrowth = (skill, level) => {
    const currentDamage = getSkillDamage(skill, level);
    const nextDamage = getSkillDamage(skill, level + 1);
    return nextDamage / currentDamage;
  };

  const getProgressiveBoosts = (skill, level) => {
    const iedBoost = (skill?.iedGrowthPerLevel || 0) * level;
    const bossDamageBoost = (skill?.bossDamageGrowthPerLevel || 0) * level;
    return { iedBoost, bossDamageBoost };
  };

  const calculateMultiStepEfficiency = (skill, currentLevel, steps, currentSkills) => {
    let totalCost = 0;
    let totalGrowth = 1;
    let globalEffectIncrease = 0;
  
    const updatedSkills = [...currentSkills];
    const skillIndex = updatedSkills.findIndex(s => s.skill === skill.skill);
    const classData = classSkillGrowth[selectedClass];
  
    // Get the boost skill data
    const boostSkillData = skill.type === 'Boost' ? classData.boostSkills.find(s => s.name === skill.skill) : null;
    
    // Calculate the initial global effect value
    let initialGlobalEffect = 0;
    if (boostSkillData?.globalEffect && boostSkillData.globalEffect.type === 'finalDamage') {
      initialGlobalEffect = boostSkillData.globalEffect.value;
    }
  
    for (let i = 0; i < steps; i++) {
      const level = currentLevel + i;
      if (level >= 30) break;
  
      totalCost += getCost(skill.type, level);
  
      // Update the skill level for damage calculation
      updatedSkills[skillIndex] = { ...updatedSkills[skillIndex], level: level + 1 };
  
      const currentDamage = getSkillDamage(skill, level, currentSkills);
      const nextDamage = getSkillDamage(skill, level + 1, updatedSkills);
      totalGrowth *= nextDamage / currentDamage;
  
      // Calculate global effect increase
      if (boostSkillData?.globalEffect && boostSkillData.globalEffect.type === 'finalDamage') {
        globalEffectIncrease += boostSkillData.globalEffect.growthPerLevel;
      }
    }
  
    const growthIncrease = totalGrowth - 1;
    const skillContribution = damageDistribution[skill.skill] / 100;
    
    // Combine skill-specific damage increase with global effect
    let damageIncrease;
    if (currentLevel === 0) {
      // For the first level, include the initial global effect value
      damageIncrease = (growthIncrease * skillContribution) + initialGlobalEffect + globalEffectIncrease;
    } else {
      // For subsequent levels, only include the growth
      damageIncrease = (growthIncrease * skillContribution) + globalEffectIncrease;
    }
  
    return totalCost > 0 ? damageIncrease / totalCost : 0;
  };

  const calculateEfficiency = (skill, currentLevel, currentSkills) => {
    const singleStepEfficiency = calculateMultiStepEfficiency(skill, currentLevel, 1, currentSkills);

    let maxEfficiency = singleStepEfficiency;
    let optimalSteps = 1;

    // Look ahead up to 10 steps
    for (let steps = 2; steps <= 10; steps++) {
      if (currentLevel + steps > 30) break;

      const multiStepEfficiency = calculateMultiStepEfficiency(skill, currentLevel, steps, currentSkills);
      if (multiStepEfficiency > maxEfficiency) {
        maxEfficiency = multiStepEfficiency;
        optimalSteps = steps;
      }
    }

    // Special consideration for boost skills and origin skills near breakpoints
    if ((skill.type === 'Boost' || skill.type === 'Origin') && [9, 19, 29].includes(currentLevel)) {
      const breakpointEfficiency = calculateMultiStepEfficiency(skill, currentLevel, 31 - currentLevel, currentSkills);
      if (breakpointEfficiency > maxEfficiency) {
        maxEfficiency = breakpointEfficiency;
        optimalSteps = 31 - currentLevel;
      }
    }

    return { efficiency: maxEfficiency, steps: optimalSteps };
  };

  const calculateDamageIncrease = (skill, startLevel, endLevel, currentSkills) => {
    const startDamage = getSkillDamage(skill, startLevel, currentSkills);
    const endDamage = getSkillDamage(skill, endLevel, currentSkills);
    return (endDamage / startDamage) - 1;
  };

  const findOptimalUpgrade = (currentSkills) => {
    let bestSkill = null;
    let bestEfficiency = 0;
    let bestSteps = 1;

    currentSkills.forEach(skill => {
      if (skill.level < 30) {
        const { efficiency, steps } = calculateEfficiency(skill, skill.level, currentSkills);
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestSkill = skill;
          bestSteps = steps;
        }
      }
    });

    return { skill: bestSkill, steps: bestSteps };
  };

  const generateUpgradePath = () => {
    const path = [];
    let currentSkills = [...skills];
    let totalCost = 0;
    let cumulativeDamageIncrease = 1;

    while (true) {
      const { skill: skillToUpgrade, steps } = findOptimalUpgrade(currentSkills);
      if (!skillToUpgrade) break;

      let upgradeCost = 0;
      const startLevel = skillToUpgrade.level;
      const endLevel = Math.min(startLevel + steps, 30);

      for (let level = startLevel; level < endLevel; level++) {
        upgradeCost += getCost(skillToUpgrade.type, level);
      }
      totalCost += upgradeCost;

      const damageIncrease = calculateDamageIncrease(skillToUpgrade, startLevel, endLevel, currentSkills);
      const damageContribution = damageDistribution[skillToUpgrade.skill] || 0;
      const weightedDamageIncrease = damageIncrease * (damageContribution / 100);

      cumulativeDamageIncrease *= (1 + weightedDamageIncrease);

      const efficiency = weightedDamageIncrease / (upgradeCost / 100);

      // Update skills
      currentSkills = currentSkills.map(skill => {
        if (skillToUpgrade.type === 'Mastery' && skill.category === skillToUpgrade.category) {
          return { ...skill, level: endLevel };
        } else if (skill.skill === skillToUpgrade.skill) {
          return { ...skill, level: endLevel };
        }
        return skill;
      });

      // Add to path, consolidating upgrades
      if (path.length > 0 && path[path.length - 1].skill === skillToUpgrade.skill) {
        const lastUpgrade = path[path.length - 1];
        lastUpgrade.newLevel = endLevel;
        lastUpgrade.cost += upgradeCost;
        lastUpgrade.totalCost = totalCost;
        lastUpgrade.cumulativeDamageIncrease = cumulativeDamageIncrease;
        lastUpgrade.efficiency = efficiency;
      } else {
        path.push({
          skill: skillToUpgrade.skill,
          type: skillToUpgrade.type,
          category: skillToUpgrade.category,
          startLevel: startLevel,
          newLevel: endLevel,
          cost: upgradeCost,
          totalCost,
          cumulativeDamageIncrease,
          efficiency,
          damageIncrease: weightedDamageIncrease
        });
      }

      // Stop if all skills are at level 30
      if (currentSkills.every(skill => skill.level === 30)) break;
    }

    setUpgradePath(path);
    saveToLocalStorage('upgradePath', path);
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
              onChange={(e) => setDamagePercentWithStorage(Number(e.target.value))}
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
              onChange={(e) => setIedPercentWithStorage(Number(e.target.value))}
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
              onChange={(e) => setBossDefenseWithStorage(Number(e.target.value))}
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
          <div className="grid grid-cols-16">
            {upgradePath.map((upgrade, index) => (
              <SkillIcon
                key={index}
                skill={{
                  skill: upgrade.skill,
                  type: upgrade.type,
                  category: upgrade.category
                }}
                level={`${upgrade.startLevel} → ${upgrade.newLevel}`}
                classKey={selectedClass}
                masterySkills={masterySkills}
                upgrade={upgrade}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Optimizer;