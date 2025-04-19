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
