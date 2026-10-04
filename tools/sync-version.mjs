/*
 * 版本号同步器 —— 让版本只有一个来源
 *
 * 背景（为什么需要它）
 * --------------------
 * 版本号此前散在 5 个地方，发版时至少 3 处要手工同步：
 *   · VERSION 文件                       （裸基线，如 0.3.8）
 *   · client.js 的 LOCAL_VERSION          （必须带 -compat.N，否则更新提示失灵）
 *   · lib/settings-merge.ps1 的后缀常量    （生成器里同一份信息）
 *   · git tag                            （v0.3.8-compat.N）
 *   · 各包 package.json 的 version         （各包独立，不参与发布版本）
 *
 * 漏改其中一处的后果是真实发生过的两次：
 *   1. LOCAL_VERSION 停在 '0.3.5' → 面板显示错误版本
 *   2. 即便改成 '0.3.8-compat.1'，若不带 -compat.N 后缀，
 *      版本比较会把 compat.2 也判成"不最新" → 更新提示永久失灵
 *
 * 本脚本把"改动点"收敛为一个参数：`-compat.N` 里的 N。
 * 用法：
 *   node tools/sync-version.mjs            # 报告当前状态，不写文件
 *   node tools/sync-version.mjs --write    # 按 VERSION + 最新 tag 同步
 *   node tools/sync-version.mjs --bump     # 递增 compat 序号并同步
 *
 * 编码契约（必须遵守，否则会制造噪音 diff 或弄坏脚本）：
 *   · 两个目标文件都是 **UTF-8 无 BOM**、**LF** 换行
 *   · lib/settings-merge.ps1 需要 **BOM**（PowerShell 5.1 + CP936）
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');

const CLIENT = join(ROOT, 'fairy-visual', 'dsh-fairy-visual', 'lib', 'client.js');
const MERGE_PS1 = join(ROOT, 'lib', 'settings-merge.ps1');
const VERSION_FILE = join(ROOT, 'VERSION');

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write') || argv.includes('--bump');
const BUMP = argv.includes('--bump');

const readText = (p) => readFileSync(p, 'utf8');

/** 终端里也能正确显示中文（Windows 控制台默认可能不是 UTF-8） */
function log(s) {
  try {
    process.stdout.write(s + '\n');
  } catch {
    process.stdout.write(Buffer.from(s + '\n', 'utf8'));
  }
}

// ---------- 读取当前状态 ----------
const baseline = readText(VERSION_FILE).trim();
if (!/^\d+\.\d+\.\d+$/.test(baseline)) {
  log(`ERROR: VERSION 文件内容不是裸三段版本号：'${baseline}'`);
  process.exit(2);
}

const clientSrc = readText(CLIENT);
const mergeSrc = readText(MERGE_PS1);

const clientMatch = clientSrc.match(/const LOCAL_VERSION = '([^']+)';/);
// 注意：PowerShell 里这一行**没有分号结尾**（`$localVersionSuffix = '-compat.1'`），
// 所以分号必须可选 —— 之前写成必须带 `;` 导致匹配为 null。
const suffixMatch = mergeSrc.match(/(\$localVersionSuffix\s*=\s*')([^']*)(')/);
if (!clientMatch) {
  log('ERROR: 在 client.js 里找不到 LOCAL_VERSION');
  process.exit(2);
}
if (!suffixMatch) {
  log('ERROR: 在 settings-merge.ps1 里找不到 $localVersionSuffix');
  process.exit(2);
}

const currentLocal = clientMatch[1];          // 例如 0.3.8-compat.1
const currentSuffix = suffixMatch[2];         // 例如 -compat.1

let tag = '';
try {
  tag = execFileSync('git', ['-C', ROOT, 'describe', '--tags', '--abbrev=0'], {
    encoding: 'utf8',
  }).trim();
} catch {
  tag = '(无 tag)';
}

// ---------- 算出目标版本 ----------
let suffix = currentSuffix;                   // 保持 -compat.N 形态
if (!/^-compat\.\d+$/.test(suffix)) {
  log(`WARN: 现有后缀 '${suffix}' 不是 -compat.N 形态，将按 -compat.1 处理`);
  suffix = '-compat.1';
}
if (BUMP) {
  const n = Number(suffix.replace('-compat.', '')) + 1;
  suffix = `-compat.${n}`;
}
const target = `${baseline}${suffix}`;

log('当前状态');
log(`  VERSION 文件                : ${baseline}`);
log(`  client.js LOCAL_VERSION     : ${currentLocal}`);
log(`  settings-merge 后缀常量     : ${currentSuffix}`);
log(`  最新 git tag                : ${tag}`);
log(`  ---> 目标完整版本           : ${target}`);

const problems = [];
if (currentLocal !== target) problems.push(`client.js LOCAL_VERSION 应为 '${target}'，实为 '${currentLocal}'`);
if (currentSuffix !== suffix) problems.push(`settings-merge 后缀应为 '${suffix}'，实为 '${currentSuffix}'`);
if (!currentLocal.startsWith(baseline)) {
  problems.push(`LOCAL_VERSION 的基线部分与 VERSION 不一致（${currentLocal} vs ${baseline}）`);
}
if (tag !== `v${target}` && tag !== '(无 tag)') {
  // tag 落后不算错误：改完版本、提交后才打 tag
  problems.push(`最新 tag ${tag} 与目标 v${target} 不同 —— 同步后需 git tag v${target}`);
}

if (problems.length === 0) {
  log('\nOK: 所有来源已一致。');
  process.exit(0);
}

log('\n发现不一致：');
for (const p of problems) log(`  · ${p}`);

if (!WRITE) {
  log('\n（只报告，未改动。加 --write 同步，加 --bump 递增 compat 序号）');
  process.exit(1);
}

// ---------- 写回（保持各文件的编码契约） ----------
function writePreserving(file, text, { bom }) {
  const buf = readFileSync(file);
  const hadBom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  const crlf = buf.includes(Buffer.from('\r\n'));
  let out = text.replace(/\r?\n/g, '\n');
  if (crlf) out = out.replace(/\n/g, '\r\n');
  const enc = bom ?? hadBom;
  writeFileSync(file, Buffer.concat([enc ? Buffer.from([0xef, 0xbb, 0xbf]) : Buffer.alloc(0), Buffer.from(out, 'utf8')]));
}

let changed = 0;

if (currentLocal !== target) {
  const next = clientSrc.replace(
    /const LOCAL_VERSION = '[^']+';/,
    `const LOCAL_VERSION = '${target}';`,
  );
  writePreserving(CLIENT, next, { bom: false });
  log(`  已写: client.js LOCAL_VERSION -> '${target}'`);
  changed += 1;
}

if (currentSuffix !== suffix) {
  const next = mergeSrc.replace(
    /(\$localVersionSuffix\s*=\s*')[^']*(')/,
    `$1${suffix}$2`,
  );
  writePreserving(MERGE_PS1, next, { bom: true });
  log(`  已写: settings-merge.ps1 后缀 -> '${suffix}'`);
  changed += 1;
}

log(`\n完成，改动 ${changed} 个文件。`);
log(`下一步：git add -A && git commit -m "release: v${target}" && git tag v${target} && git push origin main --tags`);
