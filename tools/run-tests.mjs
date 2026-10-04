/*
 * 统一测试入口
 *
 * 为什么需要它
 * ------------
 * 这个仓库有 34 个上游测试文件散在 5 个包里，**没有根 package.json、
 * 没有 CI**，所以它们从没被自动跑过。测试存在但不执行，价值接近零。
 *
 * 这个脚本做三件事：
 *   1. 跑本仓库自己的**兼容层与发布卫生**测试（tools/tests/）
 *   2. 跑各包自带的上游测试（`node --test`）
 *   3. 对每个测试文件加**超时**，避免单个挂死拖垮整轮
 *
 * 超时是必需的：browser-dock/test/startup.test.js 在本机环境下会挂住
 * （上游自带、与本仓库改动无关）。没有超时，CI 会一直卡到被强制取消。
 *
 * 用法：
 *   node tools/run-tests.mjs              # 全部
 *   node tools/run-tests.mjs --tools-only # 只跑本仓库的兼容/卫生测试
 */

import { spawn } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';
import { staleInfoFor, KNOWN_STALE } from './tests/known-stale.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');

const PER_FILE_TIMEOUT_MS = Number(process.env.FAIRY_TEST_TIMEOUT_MS ?? 60_000);

const toolsOnly = process.argv.includes('--tools-only');

/** 收集待测文件：{ label, dir, files[] } */
function collectSuites() {
  const suites = [];

  // 1) 本仓库自己的测试
  const toolsTests = join(ROOT, 'tools', 'tests');
  if (existsSync(toolsTests)) {
    suites.push({
      label: 'tools/tests (本仓库兼容 + 发布卫生)',
      dir: ROOT,
      files: readdirSync(toolsTests)
        .filter((f) => f.endsWith('.test.js'))
        .sort()
        .map((f) => join(toolsTests, f)),
    });
  }

  if (toolsOnly) return suites;

  // 2) 各包自带的上游测试
  const pkgs = [
    'fairy-visual/dsh-fairy-visual',
    'fairy-voice/dsh-fairy-voice',
    'balance-meter/dsh-balance-meter',
    'browser-dock/dsh-browser-dock',
    'fairy-startup/dsh-fairy-startup',
  ];
  for (const rel of pkgs) {
    const dir = join(ROOT, rel);
    const testDir = join(dir, 'test');
    if (!existsSync(testDir)) continue;
    const files = readdirSync(testDir)
      .filter((f) => f.endsWith('.test.js'))
      .sort()
      .map((f) => join(testDir, f));
    if (files.length) suites.push({ label: rel, dir, files });
  }
  return suites;
}

/** 跑一个测试文件，返回 { pass, fail, timedOut, crashed } */
function runFile(file, cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--test', file], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (out += d.toString()));

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({ pass: 0, fail: 0, timedOut: true, crashed: false, out });
    }, PER_FILE_TIMEOUT_MS);

    child.on('close', (code) => {
      clearTimeout(timer);
      const num = (re) => {
        const m = [...out.matchAll(re)];
        return m.length ? Number(m[m.length - 1][1]) : 0;
      };
      const pass = num(/^# pass (\d+)$/gm) || num(/^ℹ pass (\d+)$/gm);
      const fail = num(/^# fail (\d+)$/gm) || num(/^ℹ fail (\d+)$/gm);
      resolve({
        pass,
        fail,
        timedOut: false,
        // 有输出但既没 pass 也没 fail => 崩在加载阶段
        crashed: code !== 0 && pass === 0 && fail === 0,
        out,
      });
    });
  });
}

const suites = collectSuites();
const results = [];
let totalPass = 0;
let totalFail = 0;
let totalStale = 0;
const staleSeen = new Set();
const unexpectedPasses = [];

for (const suite of suites) {
  console.log(`\n=== ${suite.label} ===`);
  let sp = 0;
  let sf = 0;
  for (const file of suite.files) {
    const r = await runFile(file, suite.dir);
    const name = basename(file);
    // 本仓库自己的测试不允许进 stale 名单（见 known-stale.mjs 处理原则 3）
    const stale = suite.label.startsWith('tools/tests') ? null : staleInfoFor(suite.label, name);

    if (stale) {
      staleSeen.add(`${suite.label}/test/${name}`);
      if (r.fail === 0 && !r.timedOut && !r.crashed) {
        // 名单过时了 —— 明确提示，避免它悄悄腐化
        console.log(`  STALE-OK ${name}  <-- 已通过，请从 known-stale.mjs 移除`);
        unexpectedPasses.push(`${suite.label}/test/${name}`);
        sp += r.pass;
      } else {
        totalStale += 1;
        console.log(`  stale    ${name}  (历史遗留: ${stale.reason})`);
      }
      continue;
    }

    if (r.timedOut) {
      console.log(`  TIMEOUT  ${name}  (>${PER_FILE_TIMEOUT_MS}ms)`);
      results.push({ suite: suite.label, file: name, status: 'timeout' });
      sf += 1;
    } else if (r.crashed) {
      console.log(`  CRASH    ${name}`);
      results.push({ suite: suite.label, file: name, status: 'crash' });
      sf += 1;
    } else {
      sp += r.pass;
      sf += r.fail;
      if (r.fail > 0) {
        console.log(`  FAIL     ${name}  (pass=${r.pass} fail=${r.fail})`);
        results.push({ suite: suite.label, file: name, status: 'fail' });
      } else {
        console.log(`  ok       ${name}  (${r.pass})`);
      }
    }
  }
  console.log(`  -> ${suite.label}: pass=${sp} fail=${sf}`);
  totalPass += sp;
  totalFail += sf;
}

console.log('\n' + '='.repeat(60));
console.log(`TOTAL  pass=${totalPass}  fail=${totalFail}  stale=${totalStale}`);

// 名单腐化检测：名单里列了但已不存在的文件。
// ⚠️ 只在**全量**运行时检查 —— `--tools-only` 刻意跳过各包，包级条目当然不会被访问，
// 那时报"条目不存在"是假警报（CI 上真的踩过）。
const missing = toolsOnly
  ? []
  : [...KNOWN_STALE.keys()].filter((k) => !staleSeen.has(k));
if (missing.length) {
  console.log('\nknown-stale.mjs 里的以下条目已不存在（请清理名单）：');
  for (const m of missing) console.log(`  ${m}`);
}

if (unexpectedPasses.length) {
  console.log('\n以下已知失效测试已通过 —— 历史债务已还清，请从 known-stale.mjs 移除：');
  for (const u of unexpectedPasses) console.log(`  ${u}`);
}

const problems = results.filter((r) => r.status !== 'ok');
if (problems.length) {
  console.log('\n需要处理（新问题，不属于历史遗留）：');
  for (const p of problems) console.log(`  [${p.status}] ${p.suite} :: ${p.file}`);
}

if (totalStale > 0) {
  console.log(
    `\n注意：另有 ${totalStale} 个**上游测试因兼容改动而失效**（历史遗留，已记录在 tools/tests/known-stale.mjs）。`,
  );
  console.log('它们不是新问题，但也不该长期如此 —— 消除办法见该文件里每条的 fix 说明。');
}

process.exit(totalFail > 0 || missing.length > 0 ? 1 : 0);
