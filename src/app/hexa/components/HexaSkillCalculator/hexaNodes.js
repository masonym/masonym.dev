import {
    originUpgradeCost,
    skillUpgradeCost,
    masteryUpgradeCost,
    enhancementUpgradeCost,
    commonUpgradeCost,
    jobBranchUpgradeCost,
} from '@/data/solErda';
import { masteryDesignation } from '@/data/masteryDesignation';
import { formatSkillPath } from '../../utils';

const COST_TABLES = {
    origin: originUpgradeCost,
    skill: skillUpgradeCost,
    mastery: masteryUpgradeCost,
    enhancement: enhancementUpgradeCost,
    common: commonUpgradeCost,
    jobBranch: jobBranchUpgradeCost,
};

// Origin nodes are granted for free at level 1, and have their own (cheaper)
// cost table.
const makeNode = (type, skills) => {
    const names = Array.isArray(skills) ? skills : [skills];
    return {
        // Also the localStorage key and the icon file name. A mastery node
        // covers several skills but is keyed by its first one.
        key: formatSkillPath(names[0]),
        names,
        type,
        minLevel: type === 'origin' ? 1 : 0,
        maxLevel: COST_TABLES[type].length,
    };
};

const makeNodes = (type, skillSets = []) =>
    (skillSets || [])
        .filter((skills) => skills && skills.length > 0)
        .map((skills) => makeNode(type, skills));

// Every hexa node a class has, in display order.
export const getNodeGroups = (classKey, classDetails) => {
    const mastery = masteryDesignation[classKey] || {};
    return [
        {
            id: 'skill',
            label: 'Skill Nodes',
            color: 'var(--originItem)',
            nodes: [
                ...makeNodes('origin', [classDetails.originSkill]),
                ...makeNodes('skill', [classDetails.ascentSkill]),
            ],
        },
        {
            id: 'mastery',
            label: 'Mastery Nodes',
            color: 'var(--masteryItem)',
            nodes: makeNodes('mastery', [
                mastery.firstMastery,
                mastery.secondMastery,
                mastery.thirdMastery,
                mastery.fourthMastery,
            ]),
        },
        {
            id: 'boost',
            label: 'Boost Nodes',
            color: 'var(--boostItem)',
            nodes: makeNodes('enhancement', classDetails.boostSkills),
        },
        {
            id: 'common',
            label: 'Common Nodes',
            color: 'var(--janusItem)',
            nodes: [
                ...makeNodes('common', classDetails.commonSkills),
                ...makeNodes('jobBranch', classDetails.jobBranchSkills),
            ],
        },
    ].filter((group) => group.nodes.length > 0);
};

export const clampLevel = (value, maxLevel, minLevel = 0) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return minLevel;
    return Math.max(minLevel, Math.min(maxLevel, parsed));
};

export const addCost = (a, b) => ({
    solErda: a.solErda + b.solErda,
    frags: a.frags + b.frags,
});

export const ZERO_COST = { solErda: 0, frags: 0 };

// One entry per level: rows[i] is the cost to go from level i to i + 1.
export const getCostRows = (node) =>
    COST_TABLES[node.type].map((entry, index) => entry[index + 1]);

export const getCostBetween = (node, fromLevel, toLevel) =>
    getCostRows(node)
        .slice(fromLevel, Math.max(fromLevel, toLevel))
        .reduce(addCost, ZERO_COST);

// Everything a tile shows for one node. A goal at or below the current level
// costs nothing; no goal at all is `goal: 0`.
export const getNodeStatus = (node, currentLevel, goalLevel) => {
    const spent = getCostBetween(node, 0, currentLevel);
    const remaining = getCostBetween(node, currentLevel, goalLevel);
    const totalFrags = spent.frags + remaining.frags;
    return {
        current: currentLevel,
        goal: goalLevel,
        spent,
        remaining,
        maxed: currentLevel >= node.maxLevel,
        reached: goalLevel > 0 && currentLevel >= goalLevel,
        progress: totalFrags > 0 ? (spent.frags / totalFrags) * 100 : 0,
        nextCost: getCostRows(node)[currentLevel] || null,
    };
};

export const getProgressColor = (progress) => {
    if (progress < 33) return 'bg-progress-red';
    if (progress < 66) return 'bg-progress-orange';
    if (progress < 100) return 'bg-progress-yellow';
    return 'bg-progress-green';
};
