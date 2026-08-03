const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

function getGitHash() {
  return new Promise((resolve, reject) => {
    exec('git rev-parse HEAD', (error, stdout, stderr) => {
      if (error) {
        reject(`Ошибка при получении git hash: ${stderr}`);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function writeGitHashToEnv() {
  try {
    const gitHash = await getGitHash();
    const envFilePath = path.join(__dirname, '.env');

    let envContent = await fs.readFile(envFilePath, 'utf-8');

    const gitHashRegex = /^GIT_HASH=.*/m;
    if (gitHashRegex.test(envContent)) {
      envContent = envContent.replace(gitHashRegex, `GIT_HASH=${gitHash}`);
    } else {
      envContent += `\nGIT_HASH=${gitHash}\n`;
    }

    await fs.writeFile(envFilePath, envContent);
    console.log(`GIT HASH = ${gitHash}`);
    // eslint-disable-next-line handle-errors/log-error-in-trycatch
  } catch (error) {
    console.error(error);
  }
}

writeGitHashToEnv();
