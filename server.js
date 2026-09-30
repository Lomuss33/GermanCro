import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApplicationServer } from "./server/application.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const production = process.argv.includes("--production");
const port = Number(process.env.PORT) || (production ? 3001 : 3000);
const host = process.env.HOST || "127.0.0.1";
const server = createApplicationServer({
  root: production ? path.join(root, "build") : root,
  // Saving always targets the source dataset, never a generated build copy.
  userCardsFile: path.join(root, "cards.user.json"),
  production,
});
server.listen(port, host, () => {
  console.log(`GermanCro ${production ? "production preview" : "development"} at http://${host}:${port}`);
});
