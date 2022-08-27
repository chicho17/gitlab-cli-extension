import { log } from "./log";

import { fetchStream, streamBody } from "./fetchStream";

import {
  MR_WIDGET_SECTION,
  GITLAB_CLI_DESC,
  GITLAB_CLI_BUTTON,
} from "./constants/domClasses";

import { getMergeRequestInfo } from "./api";
import { ajaxClient } from "./ajaxClient";

function renderButton() {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-primary", GITLAB_CLI_BUTTON);
  return button;
}

function setContentInDesc(content) {
  const el = document.getElementById(GITLAB_CLI_DESC);
  el.style.display = "block";
  el.textContent = content;
}

function clearContentInDesc() {
  const el = document.getElementById(GITLAB_CLI_DESC);
  el.style.display = "none";
  el.textContent = "";
}

function renderMergeButton(sourceBranch, targetBranch) {
  const button = renderButton();
  button.textContent = "Merge Via CLI";
  button.id = "gitlab-cli-merge";
  button.onclick = async () => {
    disableButtons();
    try {
      await fetchStream(
        `merge?location=${window.location}&source=${encodeURIComponent(
          sourceBranch!
        )}&target=${encodeURIComponent(targetBranch!)}`,
        "GET",
        null,
        (chunkString) => {
          button.textContent = "Merging";
          setContentInDesc(chunkString);
        }
      ).then((res) => {
        button.textContent = "Merged";
        window.location.reload();
      });
    } catch (e) {
      enableButtons();
      button.textContent = "Retry Merge";
    }
  };
  return button;
}

function renderDescription() {
  const descriptionAreaEl = document.createElement("p");
  descriptionAreaEl.id = GITLAB_CLI_DESC;
  descriptionAreaEl.style.display = "none";
  descriptionAreaEl.style.borderRadius = "4px";
  descriptionAreaEl.style.marginTop = "10px";
  descriptionAreaEl.style.marginBottom = "0px";

  descriptionAreaEl.style.border = "1px solid #e5e5e5";
  descriptionAreaEl.style.backgroundColor = "#fafafa";
  descriptionAreaEl.style.padding = "12px";
  return descriptionAreaEl;
}

function render(sourceBranch, targetBranch) {
  const rootDiv = document.createElement("div");
  rootDiv.style.display = "flex";
  rootDiv.style.flexDirection = "column";
  rootDiv.style.marginLeft = "auto";
  rootDiv.style.marginRight = "auto";
  rootDiv.style.marginTop = "16px";
  rootDiv.classList.add("mr-widget-heading", "append-bottom-default");
  rootDiv.style.border = "1px solid #e5e5e5";

  const containerDiv = document.createElement("div");
  containerDiv.classList.add("mr-widget-content");

  const buttonGroup = document.createElement("div");
  const mergeButton = renderMergeButton(sourceBranch, targetBranch);
  buttonGroup.appendChild(mergeButton);
  buttonGroup.classList.add("d-flex");

  containerDiv.appendChild(buttonGroup);
  containerDiv.appendChild(renderDescription());

  rootDiv.appendChild(containerDiv);
  return rootDiv;
}

function getButtons() {
  return document.querySelectorAll("." + GITLAB_CLI_BUTTON);
}

function disableButtons() {
  getButtons().forEach((el) => {
    el.disabled = true;
  });
}

function enableButtons() {
  getButtons().forEach((el) => {
    el.disabled = false;
  });
}
function wait(millis) {
  return new Promise((res) => setTimeout(res, millis));
}

async function initialise(
  repoURLName,
  mergeRequestID,
  sourceBranch,
  targetBranch,
  isRebaseInProgress
) {
  const referenceEl = document.querySelector('.mr-state-widget');
  const el = render(sourceBranch, targetBranch);
  referenceEl.classList.add("mr-widget-workflow");
  referenceEl.append(el);  
  disableButtons();
  try {
    await ajaxClient
      .GET({
        path: `handshake`,
        requestType: "CLIRequest",
      })
      .then(async (r) => {
        if (r.status === 200) {
          const mergeButton = document.getElementById("gitlab-cli-merge");
          enableButtons();
          return true;
        }
        return false;
      });
  } catch (e) {
    console.log(e);
    setContentInDesc(`Server not Initialised`);
  }
}

function getProjectInfo(pathName) {
  let pathArray = pathName.split("/");
  const midIndex = pathArray.findIndex((element) => {
    return element == "merge_requests";
  });
  const repoURLIndex = pathArray.slice(1, midIndex - 1);
  const repoURLName = repoURLIndex.join("/");
  return { mergeRequestID: pathArray.at(midIndex + 1), repoURLName };
}
async function renderWidget(projectInfo) {
  let retryCounter = 1;
  while (retryCounter <= 2) {
    try {
      let res = await getMergeRequestInfo(
        projectInfo.repoURLName,
        projectInfo.mergeRequestID
      );
      if (!res.isMerged) {
        initialise(
          projectInfo.repoURLName,
          projectInfo.mergeRequestID,
          res.sourceBranch,
          res.targetBranch,
          res.isRebaseInProgress
        );
        return;
      }
    } catch (e) {
      console.log(e);
    }
    await wait(2000);
    retryCounter += 1;
  }
}
const main = () => {
  log("init");
  const pathName = window.location.pathname;
  const projectInfo = getProjectInfo(pathName);
  const sectionContainer = document.querySelector(".mr-section-container");
  if (sectionContainer != null) {
    renderWidget(projectInfo);
    return;
  }
  const targetNode = document.querySelector(".issuable-discussion");
  if(!targetNode){
    return;
  }
  const config = { childList: true, subtree: true };

  const callback = function (mutationList, observer) {
    for (const mutation of mutationList) {
      if (mutation.target.classList.contains("mr-section-container")) {
        log("Widget section loaded");
        observer.disconnect();
        renderWidget(projectInfo);
        break;
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
};

main();

export {};
