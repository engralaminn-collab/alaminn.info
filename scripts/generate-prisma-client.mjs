#!/usr/bin/env node

/**
 * Generate the Prisma client without downloading native query/schema engines.
 *
 * The application uses Prisma's query-compiler client with the official libSQL
 * driver adapter. Prisma's public CLI still resolves a native schema engine
 * during `prisma generate`, even though that engine is not needed to build this
 * client. `@prisma/internals` exposes the same generator orchestration with
 * `skipDownload`; versions are pinned in package.json to avoid protocol drift.
 */
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { getGenerators } = require("@prisma/internals");
const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");

const generators = await getGenerators({
  schemaPath,
  registry: {
    "prisma-client-js": {
      type: "rpc",
      generatorPath: require.resolve("@prisma/client/generator-build"),
      isNode: true,
    },
  },
  // engineType="client" declares no native engine requirement. Keep noEngine
  // false so the generator copies the packaged query-compiler WASM runtime.
  skipDownload: true,
  printDownloadProgress: false,
});

try {
  for (const generator of generators) {
    await generator.generate();
  }
  console.log("Generated Prisma query-compiler client (native engine download not required)." );
} finally {
  for (const generator of generators) {
    generator.stop();
  }
}
