import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

// Get the equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, "..");

const filePath = join(__root, "dist", "assets", "content.jsx-loader.js");

console.log("Postbuild: Starting modification of content.jsx-loader.js");

try {
  console.log(`Reading file: ${filePath}`);
  const data = await fs.readFile(filePath, "utf8");

  if (!data) {
    throw new Error(`File is empty: ${filePath}`);
  }

  console.log("File read successfully. Performing replacement...");
  const result = data.replace(
    `chrome.runtime.getURL("assets/content.jsx.js")`,
    '"./content.jsx.js"'
  );

  if (result === data) {
    console.warn("Warning: No changes were made to the file content.");
  }
  await fs.writeFile(filePath, result, "utf8");

  console.log("Postbuild replacement completed successfully.");
} catch (error) {
  console.error("Error during postbuild process:");
  console.error(`- Message: ${error.message}`);
  console.error(`- Stack: ${error.stack}`);
  process.exit(1);
}
