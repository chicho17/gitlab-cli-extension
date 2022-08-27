const git = require("simple-git");

import { log } from "../logger.js";

import { wait, renderPauseMessage } from "./helper.js";

async function cherryPickProcess(req, res) {
  try {
    const { localPath, commitBranch, targetBranch, requestType } = req.body;
    await wait(100);
    if (requestType === "new") {
      await git(localPath).fetch("origin", targetBranch);
      await git(localPath).checkout(targetBranch);
      try {
        await git(localPath).fetch("origin", commitBranch);
        await git(localPath).checkout(commitBranch);
        await git(localPath).raw("reset", "--hard", `origin/${commitBranch}`);
      } catch {
        try {
          await git(localPath).deleteLocalBranch(commitBranch, true);
          await git(localPath).checkoutBranch(commitBranch, targetBranch);
          res.write(
            `Deleted existing branch ${commitBranch} and created new branch ${commitBranch}`
          );
          log(
            `Deleted existing branch ${commitBranch} and created new branch ${commitBranch}`
          );
        } catch {
          await git(localPath).checkoutBranch(commitBranch, targetBranch);
          res.write(`Created new branch ${commitBranch}`);
          log(`Created new branch ${commitBranch}`);
        }
      }
    } else if (requestType === "continue") {
      await git(localPath).checkout(commitBranch);
    }
    const commitIds = req.body.commits;
    let completedCommits = 0;
    let currentCommitSHA;
    try {
      for (const commitId of commitIds) {
        completedCommits += 1;
        currentCommitSHA = commitId.commitSHA;
        res.write(`Cherry pick ${commitId.commitSHA}`);
        const cherryPickResult = await git(localPath).raw([
          "cherry-pick",
          "-m",
          "1",
          commitId.commitSHA,
        ]);
        await wait(200);
        log(`Cherry-pick ${commitId.commitSHA} Successful`);
        log(cherryPickResult);
        res.write(`Cherry-pick ${commitId.commitSHA} Successful`);
        await wait(200);
      }
    } catch (e) {
      await git(localPath).raw(["cherry-pick", "--abort"]);
      res.write(renderPauseMessage(currentCommitSHA, e));
      await wait(100);
      res.write(`Paused {${completedCommits}}`);
      log("Failed");
      res.end();
      log(e);
      return;
    }
    res.write(`Pushing ${commitBranch}`);
    await git(localPath).push("origin", commitBranch);
    res.write("COMPLETED Cherry-Pick");
    res.end();
  } catch (e) {
    res.write(e.toString());
    console.error(e);
    res.end();
  }
}

export { cherryPickProcess };
