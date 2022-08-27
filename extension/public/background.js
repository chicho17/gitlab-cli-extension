/* global chrome */
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      let exampleRule = {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostSuffix: ".gitlab.com",
            },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostSuffix: "prod-gitlab.sprinklr.com",
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      };
      let rules = [exampleRule];
      chrome.declarativeContent.onPageChanged.addRules(rules);
    });
  });
  