// Office joke entry, v2 — "per my last email".
// One fixed line from joke.txt is copied verbatim to $MAKEFUN_OUTPUT_DIR/entry.txt.
// No generation, no network, no secrets: the text the judge grades is the
// text already in this repository, nothing is invented at run time.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MIN_CHARS = 1;
const MAX_CHARS = 200;

function loadJoke(): string {
  const folder = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(resolve(folder, "joke.txt"), "utf8");
  // Strip a UTF-8 byte-order mark if an editor left one behind, so the
  // graded text starts at the first real character, then tolerate one
  // trailing newline or CRLF so the graded text is the line itself.
  return raw.replace(/^\uFEFF/, "").replace(/\r?\n$/, "");
}

function checkLine(line: string): void {
  if (line.length < MIN_CHARS || line.length > MAX_CHARS) {
    throw new Error(
      `joke is ${line.length} characters, must be ${MIN_CHARS}-${MAX_CHARS}`,
    );
  }
  if (line.trim().length === 0) {
    throw new Error("joke is only white space");
  }
}

function deliver(line: string): string {
  const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(targetDir, { recursive: true });
  const target = resolve(targetDir, "entry.txt");
  writeFileSync(target, line, "utf8");
  return target;
}

function confirmIdentical(target: string, line: string): void {
  const back = readFileSync(target);
  const expected = Buffer.from(line, "utf8");
  if (!back.equals(expected)) {
    throw new Error("entry.txt is not byte-identical to joke.txt after writing");
  }
}

try {
  const line = loadJoke();
  checkLine(line);
  const target = deliver(line);
  confirmIdentical(target, line);
  console.log(`wrote ${line.length} characters to ${target}`);
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
