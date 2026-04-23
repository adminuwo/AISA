const { execSync } = require('child_process');

function runGit(command) {
    try {
        console.log(`Running: git ${command}`);
        const output = execSync(`git ${command}`, { encoding: 'utf8' });
        console.log(output);
        return output;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(error.stdout);
        console.error(error.stderr);
        return null;
    }
}

// 1. Stash changes
runGit('stash');

// 2. Pull changes
runGit('pull origin main');

// 3. Pop stash
runGit('stash pop');
