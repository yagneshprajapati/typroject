const { execSync } = require('child_process');
const keypress = require('keypress');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'config.json');

function readConfig() {
    try {
        const configData = fs.readFileSync(configFilePath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        return {};
    }
}

function writeConfig(config) {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8');
}

async function getRepoPath() {
    const config = readConfig();
    const defaultPath = config.repoPath || '.';
    const selectedPath = readlineSync.question(`Enter the path for the Git repository (default: ${defaultPath}): `, {
        defaultInput: defaultPath,
    });

    // If the user provided a path, use it; otherwise, go one step outside the current directory
    const repoPath = selectedPath || path.join(__dirname, '..');
    
    config.repoPath = repoPath;
    writeConfig(config);
    
    return repoPath;
}
async function checkGitInstallation() {
    try {
        execSync('git --version', { stdio: 'ignore' });
    } catch (error) {
        console.error('Git is not installed. Install Git and try again.');
        process.exit(1);
    }
}

async function checkGitConfig() {
    try {
        execSync('git config --get user.name', { stdio: 'ignore' });
        execSync('git config --get user.email', { stdio: 'ignore' });
    } catch (error) {
        console.error('Git is not configured. Configure Git with your username and email.');
        process.exit(1);
    }
}

async function pullFromRemote(repoPath, isManualPull = false) {
    try {
        execSync(`git -C ${repoPath} pull origin main`, { stdio: 'ignore' });
        if (isManualPull) {
            console.log('Take successful');
        }
    } catch (error) {
        console.error(`Error during pull: ${error.message}`);
    }
}

async function setupAutomaticSync() {
    await checkGitInstallation();
    await checkGitConfig();

    const config = readConfig();
    const repoPath = config.repoPath || (await getRepoPath());

    console.clear();
    console.log('Yagu bhai ka TOOL (TY PROJECT) Y S B V \n');

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>\n');

    console.log('Press Ctrl+C to exit. \n');
    console.log('Press Ctrl+A to Take. \n');
    console.log('Press Ctrl+S to Give. \n');

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>\n');

    keypress(process.stdin);
    process.stdin.on('keypress', async (ch, key) => {
        if (key && key.ctrl && key.name === 'c') {
            console.log('Exiting.');
            process.exit();
        } else if (key && key.ctrl && key.name === 'a') {
            try {
                await pullFromRemote(repoPath, true);
                console.log('');
            } catch (error) {
                console.error(`Error during pull: ${error.message}`);
            }
        } else if (key && key.ctrl && key.name === 's') {
            try {
                const status = execSync(`git -C ${repoPath} status -s`);
                if (status.toString().trim() !== '') {
                    execSync(`git -C ${repoPath} add -A && git -C ${repoPath} commit -m "Auto commit" && git -C ${repoPath} push origin main`, { stdio: 'ignore' });
                    console.log('Give successful ');
                    console.log(' ');
                } else {
                    console.log('No changes to push');
                }
            } catch (error) {
                console.error(`Error during push: ${error.message}`);
            }
        }
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
}



async function main() {
    try {
        await setupAutomaticSync();
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

main();
