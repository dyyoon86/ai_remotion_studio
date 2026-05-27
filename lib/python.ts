import { existsSync } from "node:fs";

const FALLBACK =
  "C:\\Users\\duyoung\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";

export const PYTHON_PATH =
  process.env.PYTHON_PATH || (existsSync(FALLBACK) ? FALLBACK : "python");
