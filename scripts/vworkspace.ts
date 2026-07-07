mport { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const projectRoot = resolve(process.cwd());
const lockfiles = [
  "package-lock.json",
  "npm-shrinkwrap.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb"
];

function existingLockfiles(root: string) {
  return lockfiles.filter((name) => existsSync(join(root, name)));
}

function warn(message: string) {
  console.warn(`[cost-ai-v2:workspace-warning] ${message}`);
}

const projectLocks = existingLockfiles(projectRoot);
const nonNpmLocks = projectLocks.filter(
  (name) => name !== "package-lock.json" && name !== "npm-shrinkwrap.json"
);

if (projectLocks.length > 1) {
  warn(
    `Critical lockfile drift detected in ${projectRoot}: ${projectLocks.join(
      ", "
    )}. Keep only one package manager lockfile for deterministic installs.`
  );
}

if (nonNpmLocks.length > 0 && projectLocks.includes("package-lock.json")) {
  warn(
    `NPM is the declared package manager, but non-NPM lockfiles also exist: ${nonNpmLocks.join(
      ", "
    )}. Remove them before release.`
  );
}

const parentRoot = dirname(projectRoot);
const parentPackage = join(parentRoot, "package.json");
const parentLocks = existsSync(parentPackage) ? existingLockfiles(parentRoot) : [];

if (parentLocks.length > 0 && projectLocks.length > 0) {
  warn(
    `Nested lockfiles detected. Parent root ${parentRoot} has ${parentLocks.join(
      ", "
    )}; project root ${projectRoot} has ${projectLocks.join(
      ", "
    )}. Next.js may infer the wrong workspace root.`
  );
}

const packageDirectories = readdirSync(projectRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
  .map((entry) => join(projectRoot, entry.name))
  .filter((entryPath) => existsSync(join(entryPath, "package.json")));

for (const packageDirectory of packageDirectories) {
  const nestedLocks = existingLockfiles(packageDirectory);
  if (nestedLocks.length > 0) {
    warn(
      `Nested package lockfiles detected in ${packageDirectory}: ${nestedLocks.join(
        ", "
      )}. Confirm this is intentional before release.`
    );
  }
}
