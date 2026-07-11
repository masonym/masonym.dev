import { originUpgradeCost, skillUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost, commonUpgradeCost, jobBranchUpgradeCost } from "@/data/solErda";
import { masteryDesignation } from '@/data/masteryDesignation';
import { formatSkillPath } from '../../utils';

export const getCostTable = (skillType) => {
    switch (skillType) {
        case 'origin':
            return originUpgradeCost;
        case 'skill':
            return skillUpgradeCost;
        case 'mastery':
            return masteryUpgradeCost;
        case 'common':
            return commonUpgradeCost;
        case 'enhancement':
            return enhancementUpgradeCost;
        case 'ascent':
            return skillUpgradeCost;
        case 'jobBranch':
            return jobBranchUpgradeCost;
        default:
            console.error('Unknown skill type');
            return [];
    }
};

export const calculateSkillCost = (skill, costType) => {
    let totalCost = 0;
    const costTable = getCostTable(skill.type);
    const level = skill.level;

    for (let i = 0; i < level; i++) {
        const cost = costTable[i][i + 1][costType];
        totalCost += cost;
    }

    return Math.max(totalCost, 0);
};

// Origin nodes are tagged 'skill' like ascent skills everywhere except pricing,
// where they use their own (cheaper) cost table.
export const getEffectiveSkillType = (skillName, skillType, classDetails) => {
    const isOriginSkill = skillName === formatSkillPath(classDetails.originSkill);
    return isOriginSkill ? 'origin' : (skillType === 'origin' ? 'skill' : skillType);
};

export const getMaxLevel = (skillType) => getCostTable(skillType).length;

// Cost to advance from `fromLevel` to `fromLevel + 1`, or null if already maxed.
export const getNextLevelCost = (skillType, fromLevel) => {
    const costTable = getCostTable(skillType);
    if (fromLevel < 0 || fromLevel >= costTable.length) return null;
    return costTable[fromLevel][fromLevel + 1];
};

// Origin skills are stored under the 'skill' type alongside ascent skills,
// so the actual origin node needs to be re-tagged to price it correctly.
const withOriginType = (skill, isOriginSkill) => ({
    ...skill,
    type: isOriginSkill ? 'origin' : (skill.type === 'origin' ? 'skill' : skill.type)
});

export const calculateCosts = (skillName, { skillLevels, desiredSkillLevels, classDetails }) => {
    let currentSkill = skillLevels[skillName];
    const desiredSkill = desiredSkillLevels[skillName];

    if (!currentSkill) {
        currentSkill = { level: 0, type: desiredSkill.type };
    }

    if (!currentSkill || !desiredSkill) {
        return { current: { solErda: 0, frags: 0 }, remaining: { solErda: 0, frags: 0 }, levels: { current: 0, desired: 0 } };
    }

    const isOriginSkill = skillName === formatSkillPath(classDetails.originSkill);
    const currentSkillWithType = withOriginType(currentSkill, isOriginSkill);
    const desiredSkillWithType = withOriginType(desiredSkill, isOriginSkill);

    const currentSolErdaSpent = calculateSkillCost(currentSkillWithType, 'solErda');
    const currentFragSpent = calculateSkillCost(currentSkillWithType, 'frags');
    const finalSolErdaCost = calculateSkillCost(desiredSkillWithType, 'solErda');
    const finalFragCost = calculateSkillCost(desiredSkillWithType, 'frags');

    const remainingSolErda = Math.max(0, finalSolErdaCost - currentSolErdaSpent);
    const remainingFrags = Math.max(0, finalFragCost - currentFragSpent);

    return {
        current: { solErda: currentSolErdaSpent, frags: currentFragSpent },
        remaining: { solErda: remainingSolErda, frags: remainingFrags },
        levels: { current: currentSkill.level, desired: desiredSkill.level }
    };
};

export const calculateTotal = ({ skillLevels, desiredSkillLevels, classDetails }) => {
    let totalRemainingSolErda = 0;
    let totalRemainingFrags = 0;

    Object.keys(desiredSkillLevels).forEach((skillName) => {
        const costs = calculateCosts(skillName, { skillLevels, desiredSkillLevels, classDetails });
        totalRemainingSolErda += costs.remaining.solErda;
        totalRemainingFrags += costs.remaining.frags;
    });

    return { solErda: totalRemainingSolErda, frags: totalRemainingFrags };
};

export const getOrderedSkills = (classDetails, desiredSkillLevels, selectedClass) => {
    if (!classDetails || !desiredSkillLevels) return [];

    const classMasteryDesignation = masteryDesignation[selectedClass];
    if (!classMasteryDesignation) return [];

    const orderedSkills = [];
    const pushIfDesired = (skill) => {
        if (!skill) return;
        const formattedSkill = formatSkillPath(skill);
        if (desiredSkillLevels[formattedSkill]) {
            orderedSkills.push(formattedSkill);
        }
    };

    // Origin skill
    pushIfDesired(classDetails.originSkill);

    // Ascent skills
    const ascentList = Array.isArray(classDetails.ascentSkills)
        ? classDetails.ascentSkills
        : (classDetails.ascentSkill ? [classDetails.ascentSkill] : []);
    ascentList.forEach(pushIfDesired);

    // Mastery skills, in designation order
    classMasteryDesignation.firstMastery.forEach(pushIfDesired);
    classMasteryDesignation.secondMastery.forEach(pushIfDesired);
    classMasteryDesignation.thirdMastery.forEach(pushIfDesired);
    classMasteryDesignation.fourthMastery.forEach(pushIfDesired);

    // Boost skills
    classDetails.boostSkills.forEach(pushIfDesired);

    // Job Branch skills
    if (classDetails.jobBranchSkills) {
        classDetails.jobBranchSkills.forEach(pushIfDesired);
    }

    // Common skills
    classDetails.commonSkills.forEach(pushIfDesired);

    return orderedSkills;
};

export const calculateProgress = (costs) => {
    const totalFrags = costs.current.frags + costs.remaining.frags;
    return totalFrags > 0 ? (costs.current.frags / totalFrags) * 100 : 0;
};

export const getProgressColor = (progress) => {
    if (progress < 33) return 'bg-progress-red';
    if (progress < 66) return 'bg-progress-orange';
    if (progress < 100) return 'bg-progress-yellow';
    return 'bg-progress-green';
};
