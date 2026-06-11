import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "@heroui", "styles", "dist", "heroui.min.css");
const destDir = join(root, "public");
const dest = join(destDir, "heroui.min.css");

if (!existsSync(src)) {
  console.warn("[copy-heroui-css] @heroui/styles not installed, skipping");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("[copy-heroui-css] copied to public/heroui.min.css");
