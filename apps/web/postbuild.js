const fs = require('fs/promises');
const { dirname } = require('path');
const uuidv4 = require('uuid').v4; // TODO: git commit sha instead

const appVersion = uuidv4();

const jsonData = {
  version: appVersion,
};

const jsonContent = JSON.stringify(jsonData);

const destination = './public/meta.json';

const filename = destination.match(/[^\\/]+$/)[0];

const writeFile = async (path, contents) => {
  const fullPath = dirname(path);

  try {
    await fs.mkdir(fullPath, { recursive: true });

    await fs.writeFile(path, contents);
    console.log(`${filename} file has been saved with latest version number`);
  } catch (err) {
    console.log(`An error occurred while writing JSON Object to ${filename}`);
    console.log(err);
  }
};

writeFile(destination, jsonContent);
