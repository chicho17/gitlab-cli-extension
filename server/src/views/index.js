const fs = require("fs");
const path = require("path");
const ts = require('tail-stream');

(() => {
  const logFileContentInDescriptionBox = (content) => {
    const consoleBox = document.getElementById('console-box');
    const descriptionBox = document.getElementById("console-desc");
    descriptionBox.insertAdjacentHTML("beforeend",content);
    consoleBox.scrollTop = consoleBox.scrollHeight;
  };
  const streamLogFile = () => {
    const FILE_PATH = path.join(__dirname, "../resources/console.txt");
    try{
      const tstream = ts.createReadStream(FILE_PATH, {
        beginAt: 0
      });
      tstream.on('data', function(data) {
        logFileContentInDescriptionBox(data);
      });
      tstream.on('error', function(err) {
        logFileContentInDescriptionBox(`${err.toString()}<br>`);
      });
    }catch (e) {
      logFileContentInDescriptionBox(`${e.toString()}<br>`);
    }
  }

  async function fetchProfileRequest(jsonInputBody, method) {
    const PORT = 4e3;
    if (method === "GET") {
      return fetch(`http://localhost:${PORT}/profiles`);
    }
    return fetch(`http://localhost:${PORT}/profiles`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonInputBody),
    });
  }

  function setContentInDesc(content) {
    const el = document.getElementById("options-desc");
    if (content.toString().trim() === "") {
      el.style.display = "none";
      return;
    }
    el.style.display = "block";
    el.textContent = content;
  }
  async function deleteProfile(profileNumber) {
    const jsonFormdata = { id: profileNumber };
    const res = await fetchProfileRequest(jsonFormdata, "DELETE");
    if (res.status === 400) {
      setContentInDesc(`Delete Failed`);
      return;
    }
    renderProfiles();
  }
  async function updateProfile(profileNumber, profileData) {
    const jsonFormdata = { id: profileNumber, profileData };
    const res = await fetchProfileRequest(jsonFormdata, "PUT");
    if (res.status === 400) {
      setContentInDesc(`Update Failed`);
      return;
    }
    renderProfiles();
  }
  function addFormBody(profile) {
    return `
<td><input type="text" class="form-control" id="profile-url" value="${profile.url}" readonly=true></td>
<td><input type="text" class="form-control" id="profile-path" value="${profile.path}" readonly=true></td>`;
  }
  function addFormHeader(tableHead) {
    const formHeader = document.createElement("tr");
    formHeader.innerHTML = `
    <th scope="col">Repository URL</th>
    <th scope="col">Local Path</th>
    <th scope="col" style="width:5%">Update</th>
    <th scope="col" style="width:5%">Remove</th>`;
    tableHead.appendChild(formHeader);
  }
  function renderEditProfileButton(buttonType) {
    const editProfileButton = document.createElement("button");
    if (buttonType === "Delete")
      editProfileButton.classList.add("btn", "btn-outline-danger");
    else editProfileButton.classList.add("btn", "btn-outline-primary");
    editProfileButton.setAttribute("type", "button");
    editProfileButton.style.marginTop = "5px";
    editProfileButton.innerText = buttonType;
    return editProfileButton;
  }
  async function renderProfiles() {
    try {
      const res = await fetchProfileRequest(null, "GET");
      if (res.status === 400) {
        throw new Error(`Config File Missing`);
      }
      const profiles = await res.json();
      const profileForm = document.querySelector(".profile-form");
      if (profileForm != null) {
        document.body.removeChild(profileForm);
      }
      const profilesFound =
      profiles.repos.length > 1
        ? `${profiles.repos.length} Profiles Found`
        : `${profiles.repos.length} Profile Found`;
    setContentInDesc(profilesFound);
      if (!profiles.repos.length) {
        document.querySelector(".btn-show-profile").innerText =
          "Get Active Profiles";
        return;
      }
      const form = document.createElement("form");
      form.classList.add("profile-form");
      const tableDiv = document.createElement("div");
      tableDiv.classList.add("list-profiles");
      tableDiv.style.maxHeight = "400px";
      tableDiv.style.overflowY = "scroll";
      form.appendChild(tableDiv);
      const table = document.createElement("table");
      table.classList.add("table");
      tableDiv.appendChild(table);
      const tableHead = document.createElement("thead");
      table.appendChild(tableHead);
      addFormHeader(tableHead);
      const tableBody = document.createElement("tbody");
      table.appendChild(tableBody);
      profiles.repos.forEach((profile, profileNumber) => {
        const tableRow = document.createElement("tr");
        tableRow.style.height = "5%";
        tableRow.setAttribute("id", profileNumber);
        tableBody.append(tableRow);
        tableRow.innerHTML = addFormBody(profile);
        const tableColumnUpdate = document.createElement("td");
        const updateButton = renderEditProfileButton("Edit");
        updateButton.addEventListener("click", () => {
          const profileURL = tableRow.querySelector("#profile-url");
          const profilePath = tableRow.querySelector("#profile-path");
          if (updateButton.innerText === "Save") {
            updateProfile(profileNumber, {
              url: profileURL.value,
              path: profilePath.value,
            });
            updateButton.innerText = "Edit";
            profileURL.setAttribute("readonly", "true");
            profilePath.setAttribute("readonly", "true");
          } else {
            updateButton.innerText = "Save";
            profileURL.removeAttribute("readonly");
            profilePath.removeAttribute("readonly");
          }
        });
        tableColumnUpdate.appendChild(updateButton);
        tableRow.appendChild(tableColumnUpdate);
        const tableColumnDelete = document.createElement("td");
        const deleteButton = renderEditProfileButton("Delete");
        deleteButton.addEventListener("click", () => {
          deleteProfile(profileNumber);
        });
        tableColumnDelete.appendChild(deleteButton);
        tableRow.appendChild(tableColumnDelete);
      });
      const optionDescription = document.getElementById("options-desc");
      optionDescription.parentNode.insertBefore(
        form,
        optionDescription.nextSibling
      );
      document.querySelector(".btn-show-profile").innerText =
        "Hide Active Profiles";
    } catch (e) {
      setContentInDesc(e);
    }
  }
  function getProfile() {
    const showProfile = document.querySelector(".btn-show-profile");
    showProfile.addEventListener("click", async () => {
      if (showProfile.innerText === "Hide Active Profiles") {
        const profileForm = document.querySelector(".profile-form");
        if (profileForm != null) {
          document.body.removeChild(profileForm);
        }
        setContentInDesc(" ");
        showProfile.innerText = "Get Active Profiles";
      } else {
        await renderProfiles();
      }
    });
  }
  function AddProfile() {
    const addProfileForm = document.querySelector(".add-profile-form");
    addProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const jsonFormdata = {};
      formData.forEach((value, key) => (jsonFormdata[key] = value));
      setContentInDesc(`Adding Profile`);
      try {
        const res = await fetchProfileRequest(jsonFormdata, "POST");
        if (res.status === 400) {
          throw new Error();
        }
        setContentInDesc(" ");
        addProfileForm.reset();
        renderProfiles();
      } catch (e) {
        setContentInDesc(e);
      }
    });
  }
  function expandConsole() {
    const consoleExpandButton = document.getElementById("console-expand");
    consoleExpandButton.addEventListener("click", () => {
      const consoleBox = document.getElementById("console-box");
      if (consoleExpandButton.innerText === "Expand") {
        consoleBox.style.height = "100%";
        consoleExpandButton.innerText = "-";
      } else {
        consoleBox.style.height = "200px";
        consoleExpandButton.innerText = "Expand";
      }
    });
  }
  const main = () => {
    streamLogFile();
    getProfile();
    AddProfile();
    expandConsole();
  };
  main();
})();
