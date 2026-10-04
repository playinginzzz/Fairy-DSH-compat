# 测试体系与 CI

> 这份文档回答两件事：**怎么跑测试**，以及**为什么有 7 个测试是失效的**。
>
> 在此之前，本仓库**没有任何 CI**，34 个测试文件从来没有被自动跑过。
> 测试存在但不执行，价值接近零 —— 更糟的是，**没人知道它们其实早就失败了**。

---

## 1. 怎么跑

```powershell
# 全部（本仓库 + 各包上游测试）
node tools\run-tests.mjs

# 只跑本仓库自己的（快，约 1 秒，23 项）
node tools\run-tests.mjs --tools-only

# 自定义单文件超时（默认 60s）
$env:FAIRY_TEST_TIMEOUT_MS = '120000'; node tools\run-tests.mjs
```

首次需要在各包目录安装依赖（仓库没有根 workspace 声明）：

```powershell
foreach ($d in @('fairy-visual\dsh-fairy-visual','fairy-voice\dsh-fairy-voice',
                 'balance-meter\dsh-balance-meter','browser-dock\dsh-browser-dock',
                 'fairy-startup\dsh-fairy-startup')) {
  Push-Location $d; pnpm install --ignore-scripts; Pop-Location
}
```

---

## 2. 三组测试，三种作用

| 组 | 位置 | 数量 | 作用 |
| --- | --- | --- | --- |
| **本仓库 · 兼容层回归** | `tools/tests/compat-patches.test.js` | 11 | 钉住 18 个兼容提交的关键点，防止升级或"重新生成"把兼容代码**悄悄删掉** |
| **本仓库 · 发布卫生** | `tools/tests/release-hygiene.test.js` | 12 | 编码契约、URL 指向、版本一致性、lock 文件、永久下载地址 |
| **上游 · 各包自带** | `<包>/test/*.test.js` | 34 文件 | 上游原有的契约与行为测试 |

### 为什么兼容层测试是**存在性/形状**测试

它们直接读产物与配置，断言"这个兼容处理还在"，而不是跑起真实内核。
这类测试很粗，但能捕获最危险的情况：**兼容代码被删掉而没人发现**。

真实内核的端到端验证仍然只能靠人工 —— `verify-isolated.ps1` 需要完整的
DSH 环境（Node ≥20 + pnpm + Chrome/Edge），无法进 CI。这一点是已知边界。

---

## 3. ⚠️ 7 个上游测试为什么失效

**全部** 34 个上游测试文件都来自原作者的首次公开提交
（`4c1a161 Initial public Fairy DSH plugin suite`），而 **18 个兼容提交从未改动
过任何一个 `test` 文件**。所以它们断言的是**兼容改动之前的结构**，
而兼容工作**故意改掉了**那些结构。

> 这不是"最近才坏"——它们从兼容工作开始的那一刻就失效了，
> 只因**此前没有 CI**，一直没人发现。

失效清单与修法在 [`tools/tests/known-stale.mjs`](../tools/tests/known-stale.mjs)，
每条都写了**为什么失效**和**该怎么修**。摘要：

| 测试 | 失效原因 | 修法方向 |
| --- | --- | --- |
| `fairy-voice/test/client-contract.test.js` | 断言上游原结构，与兼容改动冲突（槽位所有权 `cf9c055`、活动会话推导 `e64308e`、视觉门控 `39be114`、`settings.section` 合并 `0.2.0`、`readVoiceTimeline` 签名 `0.3.1`） | 改为断言**当前有意行为** |
| `fairy-voice/test/index.test.js` | 同上（宿主侧） | 断言当前的守卫/降级行为 |
| `fairy-visual/test/settings-contract.test.js` | 按字面核对 `client.js` 内部形态，而它是**生成物**且被 8 个兼容提交改过 | 改为断言**契约**（已由 `compat-patches.test.js` 示范） |
| `fairy-visual/test/capability.test.js` | 上游 capability 集合已因 HDD 可选而变化 | 按当前集合更新 |
| `browser-dock/test/contract.test.js` | 断言"打包时内联 `dsh-fairy-contracts`"的旧架构；该依赖已从 `package.json` 移除，`require.resolve` 必然失败 | 改为从 `vendor/diagnostics.js` 比对 |
| `browser-dock/test/state-watch.test.js` | 其加载的入口模块仍 `import 'dsh-fairy-contracts/diagnostics'`，但依赖已移除 → `ERR_MODULE_NOT_FOUND`。**这暴露一个真 bug：`src/index.js` 的 vendor 内联不彻底** | 先修 `src/index.js` 引用，再让测试跑起来 |
| `browser-dock/test/startup.test.js` | 在本机环境**挂死**（60s 超时），疑似等待不会到达的事件 | 定位挂点或标注所需外部环境 |

### 处理原则（重要）

`known-stale.mjs` **不是"跳过名单"**，它是一个**可见的历史债务账本**：

1. **不删除、不静默跳过。** 静默跳过等于把信号藏起来。
2. **每条都写清原因与修法。** 只写 `xfail` 是无用的。
3. **新测试不允许进名单。** 只收这 34 个上游测试的历史遗留；
   `tools/tests/` 下的测试若失败，一律计为真实失败。
4. 跑测试时它们标记为 `stale` 并**打印出来**；若它们**通过了**，
   也会提示"请从名单移除"，防止名单腐化。
5. 名单里列了但文件已不存在的条目会让 CI **失败**，强制清理。

---

## 4. CI

[`.github/workflows/test.yml`](../.github/workflows/test.yml)

| Job | 内容 |
| --- | --- |
| `test` | windows-latest，Node **20 与 22** 双版本；先跑本仓库测试（最快给出兼容信号），再跑上游测试 |
| `encoding` | 单独 job 复验编码契约：`.ps1` 必须有 BOM；`.cmd` 编码契约与 U+FFFD |

**为什么用 windows-latest**：本仓库的核心缺陷类型（CP936 编码、BOM、
`.cmd` 中文）只在 Windows 上成立。用 ubuntu 跑会漏掉最该守的那一类。

---

## 5. 版本一致性

版本号此前散在 5 处，发版时至少 3 处要手工同步。已收敛为**一个参数**：

```powershell
node tools\sync-version.mjs          # 报告（不一致时退出码 1）
node tools\sync-version.mjs --bump   # 递增 compat 序号并同步 client.js 与生成器
```

单一来源是仓库根的 [`VERSION`](../VERSION)（裸基线，如 `0.3.8`）
+ 最新 git tag 的 `-compat.N` 后缀。同步器负责写入：

- `fairy-visual/…/lib/client.js` 的 `LOCAL_VERSION`（**必须带 `-compat.N`**，
  否则版本比较会把新版本判成"已是最新"）
- `lib/settings-merge.ps1` 的 `$localVersionSuffix`（生成器里的同一份信息）

各包 `package.json` 的 `version` 是**独立**的（插件市场靠它判断更新），不参与发布版本。

> 📌 真实事故：`LOCAL_VERSION` 曾停在 `'0.3.5'`；改成 `'0.3.8-compat.1'` 后又发现
> 即使带上后缀，旧比较逻辑因 `Number('compat')` 是 `NaN` 仍判为"不更新"。
> 现在这两点都有测试钉住。
