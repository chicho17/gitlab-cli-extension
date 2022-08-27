async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
function getSearchQueryParams(parameter) {
  const url = new URL(window.location.href);
  return url.searchParams.get(parameter);
}
export { getCurrentTab, getSearchQueryParams };
