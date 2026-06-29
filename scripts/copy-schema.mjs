import fs from "fs";
import path from "path";

const from = path.resolve("electron/db/schema.sql");
const toDir = path.resolve("build-electron/db");
const to = path.join(toDir, "schema.sql");

fs.mkdirSync(toDir, { recursive: true });
fs.copyFileSync(from, to);
