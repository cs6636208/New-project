import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const rootEnvPath = path.resolve(currentDir, "../../../.env");

dotenv.config({ path: rootEnvPath });
dotenv.config();

const cwd = path.resolve(currentDir, "..");
const commandParts = ["npx", "prisma", ...process.argv.slice(2)];
const result =
  process.platform === "win32"
    ? spawnSync("cmd.exe", ["/d", "/s", "/c", commandParts.join(" ")], {
        stdio: "inherit",
        env: process.env,
        cwd
      })
    : spawnSync("npx", ["prisma", ...process.argv.slice(2)], {
        stdio: "inherit",
        env: process.env,
        cwd
      });

process.exit(result.status ?? 1);
