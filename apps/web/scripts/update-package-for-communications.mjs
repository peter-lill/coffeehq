import fs from "node:fs";

const packagePath = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

packageJson.scripts = {
  ...packageJson.scripts,
  "mail:sync": "tsx scripts/sync-incoming-claims.ts",
};

packageJson.dependencies = {
  ...packageJson.dependencies,
  imapflow: "^1.0.191",
  mailparser: "^3.7.4",
};

packageJson.devDependencies = {
  ...packageJson.devDependencies,
  "@types/mailparser": "^3.4.6",
  tsx: packageJson.devDependencies?.tsx ?? "^4.20.6",
};

fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
console.log("package.json updated for the Communications Engine.");
