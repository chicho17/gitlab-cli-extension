import { ajaxClient } from "./ajaxClient";

function disableAllFormButton() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.setAttribute("disabled", "true");
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
  const jsonInputBody = { id: profileNumber };
  const res = await ajaxClient.DELETE({
    path: "profiles",
    jsonInputBody,
  });
  if (res.status === 400) {
    setContentInDesc(`Delete Failed`);
    return;
  }
  renderProfiles();
}
async function updateProfile(profileNumber, profileData) {
  const jsonInputBody = { id: profileNumber, profileData };
  const res = await ajaxClient.PUT({
    path: "profiles",
    jsonInputBody,
  });
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
function addFormHeader() {
  return `
    <th scope="col">Repository URL</th>
    <th scope="col">Local Path</th>
    <th scope="col" style="width:5%">Update</th>
    <th scope="col" style="width:5%">Remove</th>`;
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
    const res = await ajaxClient.GET({
      path: "profiles",
      requestType: "CLIRequest",
    });
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

    const formHeader = document.createElement("tr");
    formHeader.innerHTML = addFormHeader();
    tableHead.appendChild(formHeader);

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
    document.body.appendChild(form);
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
    const jsonInputBody = [...formData].reduce((jsonData, [key, value]) => {
      jsonData[key] = value;
      return jsonData;
    }, {});
    setContentInDesc(`Adding Profile`);
    try {
      const res = await ajaxClient.POST({
        path: "profiles",
        jsonInputBody,
      });
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
const main = async () => {
  try {
    await ajaxClient.GET({
      path: `handshake`,
      requestType: "CLIRequest",
    });
  } catch (e) {
    console.log(e);
    setContentInDesc(`Server not Initialised`);
    disableAllFormButton();
    return false;
  }
  getProfile();
  AddProfile();
};
main();
export {};
