import { readFile, writeFile, rename } from "node:fs/promises";
import {
  emptyHealthAdvisories,
  validateHealthAdvisories,
  parseHealthAdvisories,
  healthFeedUrl,
} from "../src/data/healthAdvisories.ts";
const checkedAt = new Date().toISOString();
let data = emptyHealthAdvisories;
try {
  data = validateHealthAdvisories(
    JSON.parse(await readFile("public/data/health-advisories.json", "utf8")),
  );
} catch {
  /* First installation. */
}
try {
  const response = await fetch(healthFeedUrl(), {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw Error("WHO HTTP " + response.status);
  data = parseHealthAdvisories(await response.json(), checkedAt);
} catch (error) {
  data = {
    ...data,
    checkedAt,
    ok: false,
    error: (error instanceof Error
      ? error.message
      : "WHO refresh failed"
    ).slice(0, 240),
  };
}
validateHealthAdvisories(data);
await writeFile(
  "public/data/health-advisories.json.tmp",
  JSON.stringify(data, null, 2) + "\n",
);
await rename(
  "public/data/health-advisories.json.tmp",
  "public/data/health-advisories.json",
);
console.log(
  JSON.stringify({
    provider: "WHO DON",
    ok: data.ok,
    items: data.items.length,
    sourceIssue: data.items[0]?.issuedAt ?? null,
    retrievedAt: data.retrievedAt,
  }),
);
