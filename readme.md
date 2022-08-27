# Gitlab CLI 
Merge PR's and Cherry-pick mutliple merge commits using CLI in one click from your browser.

## Gitlab-cli-extension

### To build extension
1. `cd extension`
2. `npm install`
3. `yarn build`

### Setting up the extension - client
1. go to `chrome://extensions`
2. turn on the `developer mode` toggle
3. `Load unpacked`
4. select `dist/extension`

## Gitlab-cli-app
Build mac OS app with packaged gitlab cli server files

### To build a new app
1. `cd server`
2. `npm install`
3. `npm run make`

#### Location of packaged app: `out/<app-name>-darwin-x64`

### Adding Profiles
- Visit gitlab.com
- Open Profile page from popup
- Add `Homepage url of the gitLab repo` as URL and `absolute path of the local repo` as path in profile page

### Using Cherrypick
- Visit any page inside your repository
- Open Cherry-pick page from popup
- Add `Source branch` in which commits will be added
- Add `Target branch` in which Merge request will be created to merge the source branch
- Add `Author`, `Commit Time` and submit
- After the commits are fetched click on cherry-pick

### Using Cherrypick Continue/Stop
- In case of conflict, automatic cherry-pick pauses
- Click `Stop` to stop cherry-pick
- Resolve the conflict by copy pasting the command in description box
- After manually resolving the conflict, click `Continue` to proceed

#### It's highly recommended that you DO NOT use your existing local repo but instead clone afresh at a different path and use that path in your `Profile Page`.

##### Problem it solve?
- Pipeline failure due to unrelated issues prevents developers to merge branches.
- Cherry-picking multiple related merge commits has to be done manually.

#### Features
- Merge via CLI with just a click
- Find merge commits and cherry-pick them automatically
- Pause and continue cherry-pick process in case of conflict
- Add or Modify profiles right from your browser
