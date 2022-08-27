import { getCurrentTab } from "./utils";

function getCSRFToken() {
  const csrf_token = document.querySelector('[name="csrf-token"]').content;
  console.log(csrf_token);
  chrome.runtime.sendMessage({ token: csrf_token }, function (response) {
    console.log(response.status);
  });
}
document
  .getElementById("btn-cherry-pick")
  .addEventListener("click", async () => {
    const currentTab = await getCurrentTab();
    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      function: getCSRFToken,
    });
    let csrf_token;
    await chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      csrf_token = request.token;
      sendResponse({ status: "OK" });
      window.open(
        chrome.runtime.getURL(
          `cherrypick.html?currentURL=${encodeURIComponent(
            currentTab.url
          )}&csrf_token=${encodeURIComponent(csrf_token)}`
        )
      );
    });
  });

document.getElementById("btn-options").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});
