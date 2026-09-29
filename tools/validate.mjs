// Repository checks run in CI and before every release: node tools/validate.mjs
// 1. Every skill has valid frontmatter (Agent Skills limits: name <= 64 chars, lowercase-hyphen,
//    matching its folder; description <= 1024 chars).
// 2. Plugin and marketplace manifests parse, carry the required fields, and agree on name and version.
// 3. No machine-specific paths leaked into the published skill.
// 4. The skill's own link checker reports zero broken links.
import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (message) => errors.push(message);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

// 1. Skill frontmatter
const skillsDir = path.join(root, "skills");
const skills = (await readdir(skillsDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
if (skills.length === 0) fail("no skills found in skills/");
for (const name of skills) {
  const file = path.join(skillsDir, name, "SKILL.md");
  const text = await readFile(file, "utf8").catch(() => null);
  if (text === null) { fail(`${name}: missing SKILL.md`); continue; }
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) { fail(`${name}: SKILL.md has no frontmatter`); continue; }
  const field = (key) => fm[1].match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim();
  const skillName = field("name");
  const description = field("description");
  if (!skillName) fail(`${name}: frontmatter has no name`);
  else {
    if (skillName !== name) fail(`${name}: frontmatter name "${skillName}" does not match its folder`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skillName) || skillName.length > 64) fail(`${name}: name must be lowercase-hyphen and at most 64 characters`);
  }
  if (!description) fail(`${name}: frontmatter has no description`);
  else {
    if (description.length > 1024) fail(`${name}: description is ${description.length} characters (limit 1024)`);
    if (/: |\s#/.test(description)) fail(`${name}: description contains ": " or " #", which breaks plain YAML scalars`);
  }
}

// 2. Manifests
const readJson = async (rel) => {
  try { return JSON.parse(await readFile(path.join(root, rel), "utf8")); }
  catch (error) { fail(`${rel}: ${error.message}`); return null; }
};
const plugin = await readJson(".claude-plugin/plugin.json");
const market = await readJson(".claude-plugin/marketplace.json");
if (plugin) for (const key of ["name", "version", "description"]) if (!plugin[key]) fail(`plugin.json: missing ${key}`);
if (market) {
  if (!market.name || !market.owner?.name) fail("marketplace.json: missing name or owner.name");
  const entry = market.plugins?.find((p) => p.name === plugin?.name);
  if (!entry) fail(`marketplace.json: no entry for plugin "${plugin?.name}"`);
  else {
    if (entry.version !== plugin.version) fail(`version mismatch: plugin.json ${plugin.version}, marketplace entry ${entry.version}`);
    if (market.metadata?.version && market.metadata.version !== plugin.version) fail(`version mismatch: marketplace metadata ${market.metadata.version}, plugin.json ${plugin.version}`);
  }
}

// 3. Machine-specific paths
const leak = /[A-Za-z]:\\Users\\|[A-Za-z]:\/Users\/|\/home\/[a-z]|\/Users\/[a-z]|OneDrive/;
for (const file of await walk(skillsDir)) {
  if (!/\.(md|mjs|js|json|txt)$/.test(file)) continue;
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, i) => { if (leak.test(line)) fail(`${path.relative(root, file)}:${i + 1}: machine-specific path`); });
}

// 4. Links inside every skill's references
for (const name of skills) {
  const checker = path.join(skillsDir, name, "scripts", "maintenance", "check-links.mjs");
  const exists = await readFile(checker).then(() => true, () => false);
  if (!exists) continue;
  const output = execFileSync(process.execPath, [checker, "--links"], { encoding: "utf8" });
  const broken = Number(output.match(/(\d+) broken links/)?.[1] ?? NaN);
  if (broken !== 0) fail(`${name}: link checker reported ${Number.isNaN(broken) ? "no summary" : `${broken} broken links`}\n${output.trim()}`);
}

if (errors.length) {
  console.error(`Validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Validation passed: ${skills.length} skill(s), manifests agree on ${plugin.name}@${plugin.version}, no machine paths, no broken links.`);
