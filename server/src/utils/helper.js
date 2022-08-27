const fs = require("fs").promises;
const path = require("path");

export function wait(millis) {
  return new Promise((res) => setTimeout(res, millis));
}

export async function readConfigFile() {
  try {
    const configPath = path.join(__dirname, '../resources/config.json');
    const configData = await fs.readFile(configPath);
    return JSON.parse(configData);
  } catch (e) {
    throw new Error(e.toString());
  }
}

export async function writeConfigFile(configJSONData) {
  try {
    const configPath = path.join(__dirname, '../resources/config.json');
    await fs.writeFile(configPath, JSON.stringify(configJSONData));
  } catch (e) {
    throw new Error(e.toString());
  }
}

export async function getLocalRepository(location) {
  try {
    const config = await readConfigFile();
    const matchedRepo = config.repos.find((repo) =>
      location.startsWith(repo.url)
    );
    if (!matchedRepo) {
      throw Error();
    }
    return matchedRepo;
  } catch {
    throw new Error(`URL not Found`);
  }
}

export function renderPauseMessage(currentCommitSHA, e) {
  return `
  <strong> Automatic Cherry-pick ${currentCommitSHA} Failed: You can still cherry-pick this commit manually. 
  Press Continue after manual cherry pick or Stop to End</strong><br> 
  Copy and paste this in your local repository:<br>  
  <div class="card">
    <div class="card-body">
      <button type="button" class="copy-button"><img src="../clipboard.svg"></img></button>
      <b id="gitCopyMessage"> git cherry-pick -m 1 ${currentCommitSHA}</b>
    </div>
  </div>
  <div class="cherrypick-error-desc">${e.toString()}</div>`;
}

export function getLogFilePath() {
    return path.join(__dirname, '../resources/console.txt');
}
