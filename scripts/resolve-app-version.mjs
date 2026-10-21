// Version helpers for ignite-api CI releases — keep in sync with mobile/ignite/scripts/resolve-app-version.mjs
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkg = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8")
);

export function normalizeAppVersion(raw) {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim().replace(/^v/i, "");
  if (!trimmed || /x/i.test(trimmed)) return "";
  return trimmed;
}

export function resolveBuildNumber() {
  return String(process.env.GITHUB_RUN_NUMBER || process.env.CI_PIPELINE_IID || process.env.CI_JOB_ID || "0").trim();
}

export function resolveBuildSha() {
  const fromEnv = (
    process.env.BUILD_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CI_COMMIT_SHA ||
    process.env.GIT_COMMIT ||
    ""
  ).trim();

  if (fromEnv) {
    return fromEnv.replace(/^v/i, "").slice(0, 7);
  }

  try {
    return execSync("git rev-parse --short=7 HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export function resolveAppSemver() {
  const fromEnv = normalizeAppVersion(process.env.APP_VERSION);
  if (fromEnv) return fromEnv;

  const fromPkg = normalizeAppVersion(pkg.version);
  if (fromPkg) return fromPkg;

  return "0.0.0";
}

export function resolveAppVersion() {
  const semver = resolveAppSemver();
  const sha = resolveBuildSha();
  return sha ? `${semver} (${sha})` : semver;
}

export function resolveReleaseTag() {
  const semver = resolveAppSemver();
  const build = resolveBuildNumber();
  return `v${semver}-${build}`;
}

export function resolveReleaseTitle(prefix = "ignite-api") {
  return `${prefix} ${resolveAppSemver()} (build ${resolveBuildNumber()})`;
}
