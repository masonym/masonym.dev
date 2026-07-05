export const formatSkillPath = (skillName) => {

    if (!skillName) return null;

    skillName = skillName.replace(/:/g, '');

    skillName = skillName.replace('\'', "")

    let words = skillName.split(' ');

    // Filter out the word "Boost"
    words = words.filter(word => word.toLowerCase() !== 'boost');

    // Join the remaining words with underscores
    return words.join('_');
}

export const formatSkillName = (skillPath) => {
    let words = skillPath.split('_')

    return words.join(' ');
}

export const formatSkillToUnderscores = (skillName) => {
    return skillName.replace(/ /g, '_');
}

export const formatMasterySkills = (skills) => {
    if (Array.isArray(skills)) {
        return skills.join('\n');
    }
    return skills || '';
};

export const getFirstSkill = (skills) => {
    if (Array.isArray(skills)) {
        return skills[0];
    }
    return skills;
};

export function formatClassName(className) {
    // Replace spaces with underscores in the class name
    const formattedClassName = className.replace(/ /g, '_');

    return formattedClassName;
}

// Skills shared by every class (Sol Janus/Sol Hecate) live under /common.
// Everything else has a per-class icon under /classImages/<class>/Skill_<name>.png.
export function getSkillImagePath(classKey, skillName, isCommon) {
    if (isCommon) {
        return getCommonSkillImagePath(skillName);
    }
    return `/classImages/${formatClassName(classKey)}/Skill_${skillName}.png`;
}

// Job branch skills (3rd Common Core) have per-class art, but not every class
// has custom art yet. This is the shared fallback used when the per-class
// icon 404s.
export function getCommonSkillImagePath(skillName) {
    return `/common/${skillName}.png`;
}
