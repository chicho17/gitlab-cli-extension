const esbuild = require("esbuild");

Promise.all([
  esbuild.build({
    entryPoints: ["src/content.ts"],
    bundle: true,
    outfile: "dist/extension/content.js",
  }),
  esbuild.build({
    entryPoints: ["src/cherryPickForm.ts"],
    bundle: true,
    outfile: "dist/extension/assets/cherryPickForm.js",
  }),
  esbuild.build({
    entryPoints: ["src/popup.ts"],
    bundle: true,
    outfile: "dist/extension/assets/popup.js",
  }),
  esbuild.build({
    entryPoints: ["src/profileScript.ts"],
    bundle: true,
    outfile: "dist/extension/assets/profileScript.js",
  })
])
  .then(() => {
    const fs = require("fs");
    const filesToCopy = fs.readdirSync("./public");
    return Promise.all([
      ...filesToCopy.map((file) => {
        return new Promise((resolve) =>
          fs.copyFile(
            `./public/${file}`,
            `dist/extension/${file}`,
            resolve
          )
        );
      }),
    ]);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
