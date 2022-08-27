const git = require("simple-git");
import { log } from "../logger.js";

import { wait } from "./helper.js";

async function mergeProcess(res, source, target, path) {
  try {
    await wait(100);
    log("start merge");
    log(`fetching ${source}`);
    res.write(`fetching ${source}`);
    await git(path).fetch("origin", source);

    log(`fetching ${target}`);
    res.write(`fetching ${target}`);
    await git(path).fetch("origin", target);

    await git(path).checkout(source);
    await git(path).raw("reset", "--hard", `origin/${source}`);

    await git(path).checkout(target);
    await git(path).raw("reset", "--hard", `origin/${target}`);
    await git(path).merge(["--no-ff", source, "--no-edit"]);
    await wait(100);
    log(`merged, pushing ${target}`);
    res.write(`merged, pushing ${target}`);
    await git(path).push("origin", target);

    log(`pushed ${target}`);
    res.write(`pushed ${target}`);
    await wait(1000);
    res.write(`Merged`);
    log("end merge successfully");
    res.end();
  } catch (e) {
    await git(path).merge(["--abort"]);
    res.write(e.toString());
    log(e);
    log("End merge failure");
    res.end();
  }
}

export { mergeProcess };
