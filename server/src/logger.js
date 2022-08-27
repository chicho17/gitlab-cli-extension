const fs = require("fs");
const path = require("path");
const END_OF_CONTENT = "<br>";

export function getLogFilePath() {
  return path.join(__dirname, "../resources/console.txt");
}

const log = async (content) => {
  const logFilePath = getLogFilePath();
  try {
    await fs.appendFileSync(logFilePath, content + END_OF_CONTENT, {
      encoding: "utf-8",
    });
  } catch (e) {
    console.log(e);
  }
};

const init = () => {
  const logFilePath = getLogFilePath();
  try {
    fs.writeFileSync(logFilePath, "");
  } catch (e) {
    console.log(e);
  }
};

export { log, init };
