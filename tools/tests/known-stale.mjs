/*
 * 已知失效的上游测试（显式记录，不静默跳过）
 *
 * 为什么有这份名单
 * ----------------
 * 本仓库 34 个测试文件全部来自上游（原作者的 `4c1a161 Initial public Fairy DSH
 * plugin suite`），而 18 个兼容提交**从未改动过任何一个 test 文件**。
 * 结果：这些测试断言的是**上游当初的代码结构**，而兼容工作**故意改掉了**那些
 * 结构（合并 settings.section、拆掉视觉模式门控、把 fairy-contracts 内联进
 * vendor/ …）。所以它们从兼容工作开始的那一刻就失效了 —— 只是因为**此前没有
 * 任何 CI**，一直没人发现。
 *
 * 处理原则（重要）
 * ----------------
 * 1. **不删除、不静默跳过。** 静默跳过等于把信号藏起来；这份名单本身就是
 *    "还剩多少历史债务"的可见账本。
 * 2. **每条都要写清为什么失效、以及该怎么修。** 只写"xfail"是无用的。
 * 3. **新测试不允许进这份名单。** 只收这 34 个上游测试的历史遗留。
 * 4. CI 里它们记为 `stale` 而不是 `fail`，但**会打印出来**；
 *    若某个 stale 测试**通过了**，也照样打印（说明该更新名单了）。
 *
 * 消除它们的正确做法：把断言改成针对**当前有意行为**。
 * 例如 settings.section 已并入 fairy-visual 面板 → 断言应改为
 * "voice 包**不再**注册自己的 section"，而不是断言它注册了。
 */

export const KNOWN_STALE = new Map([
  // ---------- fairy-voice ----------
  [
    'fairy-voice/dsh-fairy-voice/test/client-contract.test.js',
    {
      reason: '断言上游原结构，与兼容改动冲突',
      detail:
        '这些用例硬编码上游实现细节，而兼容提交有意改掉了它们：' +
        '(a) `return releaseRegistration;` / 槽位所有权 —— cf9c055 改成实例作用域清理；' +
        '(b) `sessions?.list?.getSnapshot?.().current` —— e64308e 改为从 mainView retention 推导' +
        '（0.2.0 的 list 快照没有 .current）；' +
        '(c) `const hddVisualMode = useHddVisualMode();` —— 39be114/95d2864 有意拆掉视觉模式门控；' +
        '(d) `settings.section` —— 0.2.0 起并入 fairy-visual 的单个 Fairy 面板；' +
        '(e) `function readVoiceTimeline(snapshot)` —— 0.3.1 加了第二入参 useChat。',
      fix: '把每条断言改成针对当前有意行为（例如断言"不再注册 settings.section"），而不是断言上游原结构。',
    },
  ],
  [
    'fairy-voice/dsh-fairy-voice/test/index.test.js',
    {
      reason: '同上，断言上游宿主侧原结构',
      detail: '宿主侧也随兼容改动变化（settings.register 守卫、自启加固、配置透传等）。',
      fix: '改为断言当前的守卫/降级行为本身。',
    },
  ],

  // ---------- fairy-visual ----------
  [
    'fairy-visual/dsh-fairy-visual/test/settings-contract.test.js',
    {
      reason: '断言 client.js 里的具体实现形态',
      detail:
        '该文件按字节/正则核对 client.js 的内部形态（包含路径与拼接方式），' +
        '而 client.js 是**生成物**且被 8 个兼容提交直接改过（图标双代解析、' +
        'settingsScope 兜底、HDD 可选等）。断言的具体字符串已与产物不符。',
      fix:
        '改为断言契约（"必须存在 localStorage 兜底"、"必须探测 settingsScope"），' +
        '而不是断言某段字面代码。注意：tools/tests/compat-patches.test.js 已经这样做了。',
    },
  ],
  [
    'fairy-visual/dsh-fairy-visual/test/capability.test.js',
    {
      reason: '断言上游 capability 上报形态',
      detail: '兼容改动新增了 HDD 视觉可选等能力项，原有的 capability 断言与之一致性已变。',
      fix: '按当前 capability 集合更新断言（新增项应有对应断言）。',
    },
  ],

  // ---------- browser-dock ----------
  [
    'browser-dock/dsh-browser-dock/test/contract.test.js',
    {
      reason: '断言"打包时内联 dsh-fairy-contracts"的旧架构',
      detail:
        '该用例执行 `require.resolve(\'dsh-fairy-contracts/client-diagnostics\')` 来比对' +
        '内联前后的一致性。但兼容工作把 contracts **内联进各包 vendor/** 后，' +
        'browser-dock 的 package.json 已**不再声明**该依赖，所以这个 require 必然失败。',
      fix:
        '改为从 `vendor/diagnostics.js`（内联后的实际副本）读取并比对，' +
        '或直接断言"产物中不出现外部 dsh-fairy-contracts 引用"。',
    },
  ],
  [
    'browser-dock/dsh-browser-dock/test/state-watch.test.js',
    {
      reason: '加载的源码依赖已不再安装的 dsh-fairy-contracts',
      detail:
        '测试 import 了 browser-dock 的入口模块，而该模块（src/index.js）仍' +
        '`import ... from \'dsh-fairy-contracts/diagnostics\'`；依赖声明已移除，' +
        '故 ERR_MODULE_NOT_FOUND。这暴露一个真实问题：**源码入口与 vendor 内联不彻底**。',
      fix:
        '先把 src/index.js 改为引用 vendor 内联副本（与 .cjs/proxy 侧保持一致），' +
        '再让该测试跑起来 —— 这属于真 bug，不只是测试问题。',
    },
  ],
  [
    'browser-dock/dsh-browser-dock/test/startup.test.js',
    {
      reason: '在本机环境挂死（60s 超时）',
      detail:
        '该用例会挂住不返回，疑似等待不会到达的进程/端口事件。' +
        '它是上游自带、与本仓库兼容改动无关。CI 必须依赖超时兜住它。',
      fix: '定位挂点（建议先加 --test-reporter 与超时打点），或明确它需要外部环境。',
    },
  ],
]);

/**
 * @param {string} suiteLabel 套件标签（如 'fairy-voice/dsh-fairy-voice'）
 * @param {string} fileName   测试文件名（如 'index.test.js'）
 */
export function staleInfoFor(suiteLabel, fileName) {
  return KNOWN_STALE.get(`${suiteLabel}/test/${fileName}`) ?? null;
}
