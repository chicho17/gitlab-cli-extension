import { readConfigFile, writeConfigFile } from "./helper.js";

async function getProfiles() {
  try {
    const profileResponse = await readConfigFile();
    return profileResponse;
  } catch (e) {
    throw e;
  }
}

async function addProfile(profileData) {
  let configJSONData;
  try {
    configJSONData = await readConfigFile();
  } catch {
    configJSONData = {};
    configJSONData["repos"] = [];
  }
  try {
    configJSONData.repos.push(profileData);
    await writeConfigFile(configJSONData);
  } catch (e) {
    throw new Error(e.toString());
  }
}

async function deleteProfile(profileID) {
  try {
    const configJSONData = await readConfigFile();
    if (profileID > -1) {
      configJSONData.repos.splice(profileID, 1);
    }
    await writeConfigFile(configJSONData);
  } catch (e) {
    throw new Error(e.toString());
  }
}

async function updateProfile(profileID, profileData) {
  try {
    const configJSONData = await readConfigFile();
    if (profileID > -1) {
      configJSONData.repos[profileID] = profileData;
    }
    await writeConfigFile(configJSONData);
  } catch (e) {
    throw new Error(e.toString());
  }
}

export { getProfiles, addProfile, deleteProfile, updateProfile };
