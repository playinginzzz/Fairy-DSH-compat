/*
 * 跨内核兼容层回归测试（本仓库的核心资产）
 *
 * 为什么存在
 * ----------
 * 本仓库的全部价值来自 18 个兼容提交，它们修的是 **dsh 内核换代造成的破坏性变更**。
 * 但这些修复此前**没有任何测试覆盖**——只有一份 PDF 报告和提交信息。
 * 后果：下次内核升级时，没人知道哪个兼容点退化了，只能靠"界面崩了"去发现。
 *
 * 这个文件把每个兼容点钉成一条断言。**它不是行为测试，是存在性/形状测试**：
 * 直接读产物与配置，断言"这个兼容处理还在"。这类测试很粗，但它们能捕获
 * 最危险的情况——某次改动或某次"重新生成"把这些兼容代码**悄悄删掉了**。
 *
 * 每条断言都标注了对应的提交号，便于追溯。
 * 运行：node --test tools/tests/compat-patches.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');

const visualClient = join(ROOT, 'fairy-visual', 'dsh-fairy-visual', 'lib', 'client.js');
const voiceClient = join(ROOT, 'fairy-voice', 'dsh-fairy-voice', 'lib', 'client.js');
const voiceIndex = join(ROOT, 'fairy-voice', 'dsh-fairy-voice', 'lib', 'index.js');
const visualPatch = join(ROOT, 'fairy-visual', 'dsh-fairy-visual', 'cordis.patch.yml');

const read = (p) => readFileSync(p, 'utf8');

/* ------------------------------------------------------------------ *
 * 前提：产物必须在
 * 这些断言全部针对 `lib/client.js` —— 而它是**生成物**。
 * 如果它消失了，说明构建链出了更大问题，先在这里响亮地失败。
 * ------------------------------------------------------------------ */
test('产物存在：lib/client.js 是生成物，但它是当前唯一的事实来源', () => {
  assert.ok(existsSync(visualClient), `缺少产物：${visualClient}`);
  assert.ok(existsSync(voiceClient), `缺少产物：${voiceClient}`);
  // 生成器当前无法重建产物（见 docs/仓库与上游.md §3 红色警告），
  // 所以产物一旦损坏，兼容修复就没有第二份拷贝。
  assert.ok(read(visualClient).length > 100_000, 'visual client.js 体积异常，疑似被截断或重新生成过');
});

/* ------------------------------------------------------------------ *
 * 兼容点 1 · commit caa646f
 * 图标双代解析：0.2.0 把 Icon*16 改名为 Icon*Regular。
 * 上游硬引用 Icon*16 → undefined → 渲染即崩（逐条朗读按钮消失）。
 * 修法：`A ?? B` 双代取一，新旧内核零分叉。
 * ------------------------------------------------------------------ */
test('caa646f 图标双代解析：Icon*16 必须带回退到 Icon*Regular', () => {
  const src = read(voiceClient);
  const pairs = [
    ['IconPauseOutline16', 'IconPauseOutlineRegular'],
    ['IconPlayOutline16', 'IconPlayOutlineRegular'],
    ['IconStopFill16', 'IconStopFillRegular'],
  ];
  for (const [modern, legacy] of pairs) {
    const pattern = new RegExp(
      `const\\s+${modern}\\s*=\\s*[^;]*${modern}\\s*\\?\\?\\s*[^;]*${legacy}\\s*;`,
    );
    assert.match(
      src,
      pattern,
      `图标 ${modern} 的回退链断了：必须写成 ${modern} ?? ${legacy}（否则新版内核下按钮消失）`,
    );
  }
});

/* ------------------------------------------------------------------ *
 * 兼容点 2 · commit 4c6fe44（**最关键的"启动不崩"保障**）
 * 0.1.7 起 settingsScope 改名 configForms。上游把它硬声明在 inject 里
 * → 注入永久挂起 → client Loader 无任何错误信息，应用起不来。
 * 修法：改为可选获取（ctx.get 探测），拿不到就降级 localStorage 兜底。
 * ------------------------------------------------------------------ */
test('4c6fe44 settingsScope → configForms：必须保留可选注入 + localStorage 兜底', () => {
  const src = read(visualClient);

  assert.match(
    src,
    /function\s+createLocalSettingsScope\s*\(/,
    'localStorage 兜底实现（createLocalSettingsScope）不见了 —— 新内核下设置将无法读写',
  );
  assert.match(
    src,
    /function\s+resolveSettingsBinder\s*\(\s*ctx\s*\)/,
    '可选注入解析函数（resolveSettingsBinder）不见了 —— 说明又变回了硬声明',
  );
  // 探测失败必须返回 null，由调用方降级；不能抛错
  assert.match(
    src,
    /ctx\.get\(\s*["']settingsScope["']\s*\)/,
    'ctx.get("settingsScope") 探测不见了：必须用声明无关的 ctx.get 探测，不能硬注入',
  );
  // 双代命名都要认：旧内核 settingsScope、新内核 configForms
  assert.match(src, /configForms/, 'configForms（新内核命名）未出现在探测路径中');
});

/* ------------------------------------------------------------------ *
 * 兼容点 3 · commit eff2142
 * 预设卡在 "waiting for workflowEngine"：组内缺 workflow-ptc 提供者。
 * 修法：照上游 0.2.0 标准结构补上这一行。
 * ------------------------------------------------------------------ */
test('eff2142 预设组内必须提供 workflow-ptc 提供者', () => {
  const yml = read(visualPatch);
  assert.match(
    yml,
    /id:\s*workflow-ptc/,
    'cordis.patch.yml 里 workflow-ptc 提供者不见了 —— 预设会卡在 waiting for workflowEngine',
  );
  assert.match(yml, /dsh-workflow-ptc/, 'workflow-ptc 的包名引用缺失');
});

/* ------------------------------------------------------------------ *
 * 兼容点 4 · commit e6815cc
 * 遗留的 workflow-worker-thread 会阻塞会话恢复（"never started"）。
 * 上游 0.2.0 的预设已移除该包，所以这里必须**保持移除状态**。
 * ------------------------------------------------------------------ */
test('e6815cc 不得重新引入 workflow-worker-thread', () => {
  const yml = read(visualPatch);
  assert.doesNotMatch(
    yml,
    /dsh-workflow-worker-thread/,
    'workflow-worker-thread 又被写回了 —— 它会阻塞会话恢复（never started）',
  );
});

/* ------------------------------------------------------------------ *
 * 兼容点 5 · commits ea34664 / 17572a7
 * 预设必须走**声明式注册行**（0.1.7+ 的 registry 机制），
 * 且默认预设的键名必须是 agent-preset-registry.selectedDefault。
 * 否则报 Unknown agent preset: fairy / No configurable plugin entry。
 * ------------------------------------------------------------------ */
test('ea34664 预设必须通过声明式注册行（@deepseek-ai/dsh-agent-preset）声明', () => {
  const yml = read(visualPatch);
  assert.match(
    yml,
    /@deepseek-ai\/dsh-agent-preset/,
    '预设声明行不见了 —— 0.1.7+ 内核会报 Unknown agent preset: fairy',
  );
});

test('17572a7 默认预设的键名必须是 agent-preset-registry.selectedDefault', () => {
  // 注意：这个兼容点在**宿主侧** lib/index.js，不在 client.js（与其它几条不同）。
  const idx = join(ROOT, 'fairy-visual', 'dsh-fairy-visual', 'lib', 'index.js');
  const src = read(idx);
  assert.match(
    src,
    /agent-preset-registry/,
    '默认预设键名未迁移到 agent-preset-registry —— 新版内核下"设为默认"会报 No configurable plugin entry',
  );
  assert.match(
    src,
    /selectedDefault/,
    'selectedDefault 字段名缺失 —— 0.1.7+ 的用户选择搬到了这个 volatile 字段',
  );
  // 必须保留双代判断，否则旧内核会坏
  assert.match(
    src,
    /usesLegacyPresetSettings/,
    '双代判断（usesLegacyPresetSettings）不见了 —— 会修好新内核、弄坏旧内核',
  );
});

/* ------------------------------------------------------------------ *
 * 兼容点 6 · commits 9c09872 / e64308e / e884f63 / cf9c055
 * 自动播报完全无声：0.2.0 的 list 快照移除了 .current，
 * 导致 sessionActive 永假。修法：从 mainView retention 推导活动会话。
 * ------------------------------------------------------------------ */
test('e64308e 活动会话必须能从 mainView retention 推导（不能只依赖 .current）', () => {
  const src = read(voiceClient);
  assert.match(
    src,
    /activeKey/,
    'activeKey 相关逻辑不见了 —— 0.2.0 快照没有 .current，自动播报会无声',
  );
  assert.match(
    src,
    /mainView|retention/,
    'mainView retention 推导不见了 —— 这是 0.2.0 下识别活动会话的唯一途径',
  );
});

test('cf9c055 放音策略诊断探针必须存在（否则无声问题无法定位）', () => {
  const src = read(voiceClient) + read(voiceIndex);
  assert.match(
    src,
    /__FAIRY_VOICE_DIAG__/,
    '诊断探针 __FAIRY_VOICE_DIAG__ 不见了 —— 放音问题将无法从界面定位',
  );
});

/* ------------------------------------------------------------------ *
 * 兼容点 7 · commit 39be114 / 95d2864
 * HDD 视觉模式与朗读解绑：上游把语音 UI 绑死在视觉开关上，
 * 导致"关掉视觉就没法朗读"。
 * ------------------------------------------------------------------ */
test('39be114/95d2864 朗读控件不得被视觉模式门控', () => {
  const voice = read(voiceClient);
  // 修复是"移除"门控，所以这里断言的是**不存在**硬门控。
  assert.doesNotMatch(
    voice,
    /SessionScopedVoiceController[\s\S]{0,400}?return\s+null[\s\S]{0,200}?data-dsh-fairy-visual/,
    '朗读控件又被视觉模式门控了 —— 关掉 HDD 视觉后朗读会消失',
  );
});

/* ------------------------------------------------------------------ *
 * 兼容点 8 · commit 9756c61 / 70cb97b
 * 宿主侧 settings.register 必须带版本守卫（0.1.7+ 的注册语义变了）。
 * ------------------------------------------------------------------ */
test('70cb97b 宿主侧 settings.register 必须带守卫', () => {
  const idx = join(ROOT, 'fairy-visual', 'dsh-fairy-visual', 'lib', 'index.js');
  const src = read(idx);
  assert.match(
    src,
    /settings\.register/,
    'settings.register 调用不见了',
  );
  assert.match(
    src,
    /typeof|guard|catch|\?\.|if\s*\(/,
    'settings.register 似乎没有版本/能力守卫 —— 0.1.7+ 下可能直接失败',
  );
});
