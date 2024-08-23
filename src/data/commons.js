// update classes with commons

const fs = require('fs');

// The file path to your classes.js file
const filePath = './classes.js';

// The common skill you want to add to each object
const commonSkill = "Sol Janus";

// Read the `classes.js` file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // A safer way to extract the classes object
    let classes;
    try {
        // Use `eval` to execute the content and capture the classes object
        eval(data.replace(/export\s+const\s+classes\s+=\s+/, 'classes = '));
    } catch (e) {
        console.error('Error evaluating the classes object:', e);
        return;
    }

    // Add the commonSkills array to each class
    Object.keys(classes).forEach(className => {
        classes[className]["commonSkills"] = [commonSkill];
    });

    // Convert the modified object back to a string
    const modifiedData = `export const classes = ${JSON.stringify(classes, null, 4)};`;

    // Write the modified data back to the file
    fs.writeFile(filePath, modifiedData, 'utf8', err => {
        if (err) {
            console.error('Error writing to the file:', err);
            return;
        }
        console.log('File successfully updated!');
    });
});