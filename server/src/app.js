const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PQueue = require("p-queue");
import { getLocalRepository } from "./utils/helper.js";
import { mergeProcess } from "./utils/merge.js";
import { getMergeCommits } from "./utils/getMergeCommits.js";
import { cherryPickProcess } from "./utils/cherryPick.js";
import {
  getProfiles,
  addProfile,
  deleteProfile,
  updateProfile,
} from "./utils/profiles.js";
import { log, init as initLogger } from "./logger.js";

//Globals
const PORT = 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const queue = new PQueue({ concurrency: 1 });

//Routes
app.get("/", (req, res) => {
  res.send("App is running");
});

app.get("/merge", async function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
    "access-control-allow-origin": "*",
  });
  try {
    const { source, target, location } = req.query;
    const localRepo = await getLocalRepository(location);
    res.write(`Merge Queued`);
    log(`Merge Queued`);
    queue.add(
      async () => await mergeProcess(res, source, target, localRepo.path)
    );
  } catch (e) {
    res.write(e.toString());
  }
});

app.get("/handshake", async function (req, res) {
  try {
    res.status(200).end();
    log("Handshake successful !!");
    res.end();
  } catch (e) {
    log(e);
    res.status(400).end();
  }
});

app.get("/profiles", async function (req, res) {
  try {
    const profileResponse = await getProfiles();
    res.status(200).send(profileResponse);
  } catch (e) {
    log(e);
    res.status(400).send(e);
  }
});
app.post("/profiles", async function (req, res) {
  try {
    const profileResponse = await addProfile(req.body);
    res.status(200).send(profileResponse);
  } catch (e) {
    log(e);
    res.status(400).send(e);
  }
});
app.delete("/profiles", async function (req, res) {
  try {
    const profileResponse = await deleteProfile(req.body.id);
    res.status(200).send(profileResponse);
  } catch (e) {
    log(e);
    res.status(400).send(e);
  }
});
app.put("/profiles", async function (req, res) {
  try {
    const profileResponse = await updateProfile(
      req.body.id,
      req.body.profileData
    );
    res.status(200).send(profileResponse);
  } catch (e) {
    log(e);
    res.status(400).send(e);
  }
});

app.post("/cherrypick", async function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
    "access-control-allow-origin": "*",
  });
  res.write(`Cherry-Pick Queued `);
  log(`Cherry-Pick Queued`);
  queue.add(async () => await cherryPickProcess(req, res));
});

app.post("/mergecommits", async function (req, res) {
  try {
    const { commitAuthor, commitTime, fetchMergeCommitBranch, location } =
      req.body;
    const localRepo = await getLocalRepository(location);
    const jsonResponse = await getMergeCommits(
      commitAuthor,
      commitTime,
      fetchMergeCommitBranch,
      localRepo
    );
    res.writeHead(200, {
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    });
    res.end(JSON.stringify(jsonResponse));
  } catch (e) {
    log(e);
    res.status(400).end(e.toString());
  }
});

const init = async () => {
  try{
    await initLogger();
    app.listen(PORT);
  }
  catch(e){
    log(e);
  }
};

init();
