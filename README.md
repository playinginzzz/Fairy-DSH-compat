# Fairy-DSH 跨内核兼容版

> **DSH Desktop 跨内核兼容版 Fairy 插件套件** —— 在 `dsh` 内核大版本换代期间，让 Fairy（视觉浮层 / HDD 主题 / 朗读 / 余额）继续可用。
>
> 本仓库由 **[playinginzzz](https://github.com/playinginzzz)** 维护，是 `Guzhou2002/Fairy-DSH-Optimized` v0.3.8 的下游 fork，
> 追加 **18 个内核兼容提交**，实测覆盖 `dsh 0.1.5-rc.1` 与 `dsh 0.2.0-rc.2` 两条内核线
> （对应 **DSH Desktop 2.0.9** 与 **2.0.17**），修复 10 类内核破坏性变更导致的故障。

| | |
| --- | --- |
| **当前版本** | 基线 `v0.3.8`（孤舟版）+ 18 个兼容提交 → 标签 `v0.3.8-compat.1` |
| **插件包版本** | `dsh-fairy-visual` 0.1.8 · `dsh-fairy-voice` 1.0.5 · `dsh-balance-meter` 0.2.0 |
| **适配内核** | `dsh 0.1.5-rc.1` → `dsh 0.2.0-rc.2` ｜ DSH Desktop `2.0.9` → `2.0.17` |
| **许可** | Apache-2.0（继承自上游，见 [LICENSE](LICENSE) / [NOTICE](NOTICE)） |
| **下载** | **[本仓库 Releases](https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest)** |
| **问题反馈** | **[本仓库 Issues](https://github.com/playinginzzz/Fairy-DSH-compat/issues)** |

---

## 一、血缘与归属（请先读这一节）

本项目**不是原创项目**，是 Apache-2.0 开源项目 Fairy-DSH 的下游二次开发分支。
完整的血缘是三段（外加一支无血缘关系的平行分支）：

| 角色 | 作者 | 仓库 | 贡献 |
| --- | --- | --- | --- |
| 🍊 **原作者** | **橙汁本色**（`Chengzhibense`） | [Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH) | **Fairy 插件套件的全部原创代码**：人设语料、HDD 视觉、布局、mascot、朗读逻辑。Apache-2.0。本项目的技术地基 |
| ⛵ **上游 fork（本仓库的直接基线）** | **孤舟蓑笠**（`Guzhou2002`） | [Guzhou2002/Fairy-DSH-Optimized](https://github.com/Guzhou2002/Fairy-DSH-Optimized) | 「孤舟版」：把上游整理成**可分发的整合包** —— `install.cmd` 一键安装、GitHub Releases + SHA256、朗读自检面板、设置栏合并、MOSS-TTS-Nano 第二朗读引擎、MOSS 一键安装脚本、新手文档。**本仓库的基线为 v0.3.8** |
| 🍴 **本仓库（跨内核兼容版）** | **playinginzzz** | [playinginzzz/Fairy-DSH-compat](https://github.com/playinginzzz/Fairy-DSH-compat) | 在孤舟版 v0.3.8 之上修复 **`dsh` 内核换代造成的故障**：18 个兼容提交、10 类故障，双内核 feature-detection 兼容 |
| ☁️ **平行分支（无血缘）** | `addsas222` | [addsas222/Fairy-DSH-Exp](https://github.com/addsas222/Fairy-DSH-Exp) | 「云朵版」：另一支**独立**的功能实验版（人格包引擎、多会话、多 TTS 引擎），与孤舟版 / 本仓库**无代码血缘** |

```
Chengzhibense/Fairy-DSH          （原创 · 橙汁本色 · Apache-2.0）
        │
        └── Guzhou2002/Fairy-DSH-Optimized   （孤舟版 · 整合分发 · 基线 v0.3.8）
                    │
                    └── playinginzzz/Fairy-DSH-compat   ★ 本仓库（跨内核兼容）

addsas222/Fairy-DSH-Exp          （云朵版 · 独立分支 · 与上面无血缘）
```

### ⚠️ 归属红线

- **上游作者与孤舟版作者均未参与本仓库的 18 个兼容改动。** 本仓库的兼容提交由 `playinginzzz` 独立完成。
- 本仓库是**非官方**分支，**不代表**原作者、孤舟版作者或 DeepSeek 官方的立场，**未获任何背书**。
- **本仓库的问题请开 [本仓库 Issues](https://github.com/playinginzzz/Fairy-DSH-compat/issues)**，不要打扰上游作者。
- 上游通用功能问题（与内核兼容无关的）请去 [孤舟版仓库](https://github.com/Guzhou2002/Fairy-DSH-Optimized/issues)。
- 改动遵循 Apache-2.0 §4(b)：每处对上游文件的修改都带 `[local patch 0.x.x]` 注释，逐条说明见 [`docs/本地改动.md`](docs/本地改动.md)。
- 上游的 `LICENSE` / `NOTICE` / `THIRD_PARTY_NOTICES.md` / `TRADEMARKS.md` **全部原样保留**。
- ⚠️ **孤舟版与云朵版装的东西会互相覆盖 —— 只装一个。**

### 授权说明

对本仓库改动上游朗读逻辑这件事：**原作者橙汁本色已明确同意**（2026-09-13，口头授权）。
「朗读业务逻辑不许改」原本是一条红线，本次是在获得作者同意后才动的，且 **GPT-SoVITS 原路径一个字节未改**，新增的 MOSS 引擎是**并列第二条路**而非替换。

---

## 二、本仓库和上游到底有什么不同

### 2.1 与其他分支的横向对比

| | 原作者 · 橙汁本色 | 孤舟版（上游） | **本仓库 · 跨内核兼容版** | 云朵版 |
| --- | --- | --- | --- | --- |
| **解决的问题** | 从零实现 Fairy | **怎么装得上** | **内核换代后还能不能跑** | 功能实验 |
| 一键安装器 | ❌ 无 | ✅ `install.cmd` | ✅ 继承（并修了编码陷阱） | 自备 |
| Release + 校验 | ❌ | ✅ | ✅ + `SHA256SUMS.txt` | 自备 |
| 朗读自检面板 | ❌ | ✅ | ✅ 继承 | — |
| MOSS-TTS-Nano（CPU 朗读） | ❌ | ✅ | ✅ 继承 | — |
| **跨 `dsh` 内核兼容** | — | ❌ 只适配 `0.1.2-rc.1` 一代 | ✅ **`0.1.5-rc.1` ~ `0.2.0-rc.2` 双代兼容** | — |
| **HDD 视觉可关闭** | ❌ 视觉与朗读绑定 | ❌ 同 | ✅ **可关视觉、保留朗读** | — |
| **GPT-SoVITS 自动拉起加固** | ❌ | 部分（bat 守卫有挂死缺陷） | ✅ Node 端口探针直连，绕开挂死 | — |
| 诊断探针 | ❌ | 部分 | ✅ `__FAIRY_VOICE_DIAG__` 放音策略 / 快照 / activeKey | — |
| 内核适配策略 | — | 版本钉死 | **feature-detection 双代解析，不判版本号** | — |

### 2.2 本仓库独有的：18 个兼容提交修了什么

**起因**：DSH Desktop 升级到新版内核（`dsh 0.1.7+` / `0.2.0-rc.2`）后，新版内核的多项**破坏性变更**导致 Fairy 三个插件整体崩溃、**应用无法启动**（client Loader 无任何错误信息）。本仓库的 18 个提交就是为此而生。

| # | 故障现象 | 根因 | 提交 |
| --- | --- | --- | --- |
| 1 | 启动失败，client Loader 无错误信息 | `0.1.7` 起 `settingsScope` 改名 `configForms`，注入永久挂起 | `4c6fe44` |
| 2 | 恢复会话报 `Unknown agent preset: fairy` | `0.1.7+` 预设改为**声明式注册行**，fairy 未声明 | `ea34664` |
| 3 | 恢复会话报 `workflow-worker-thread never started` | 遗留条目；上游 `0.2.0` 预设已移除该包 | `e6815cc` |
| 4 | 预设卡在 `waiting for workflowEngine` | 组内缺 `workflow-ptc` 提供者（上游标准结构） | `eff2142` |
| 5 | 设为默认报 `No configurable plugin entry` | 键改 `agent-preset-registry`、字段改 `selectedDefault` | `17572a7` |
| 6 | **自动播报完全无声** | `list` 快照移除 `.current` → `sessionActive` 永假 | `e64308e` 等 4 个提交 |
| 7 | 逐条朗读按钮消失 | 图标导出 `Icon*16` → `Icon*Regular`，`undefined` 导致渲染即崩 | `caa646f` |
| 8 | voice 宿主 `failed to import` | profile 依赖树 59 个空壳目录（mdast 系列被掏空） | pnpm 强装修复 |
| 9 | GPT-SoVITS 不自动拉起 | 上游仓库缺本机补丁 + bat 端口守卫 `findstr` 挂死 | `14d768a` 等 3 个提交 |
| 10 | **朗读控件被视觉模式隐藏** | 上游把语音 UI 绑死在 HDD 视觉模式开关上 | `95d2864` / `39be114` |

**提交分布**：基础兼容 2 · GPT-SoVITS 自动拉起 3 · 语音/视觉体验 2 · `0.2.0` 内核适配 10（另一提交为安装脚本 UTF-16LE BOM 编码修复）。

### 2.3 修复策略：为什么这次能跨两代内核

**明确不采用「判版本号」**，而是 **feature-detection（能力探测）**：

| 策略 | 说明 |
| --- | --- |
| **双代兼容解析** | 两代 API 并存时取其一：`IconPlayOutline16 ?? IconPlayOutlineRegular` —— 新旧内核**零分叉** |
| **可选注入 + 降级** | 被改名的服务不再硬声明，`ctx.get` 探测失败即降级 `localStorage` 兜底，**保证启动** |
| **声明式对齐上游** | 预设注册、`workflow-ptc` 一律照上游 `0.2.0` 标准结构改写，不逆势造轮子 |
| **探针驱动诊断** | 放音策略、`list` 快照、`activeKey` 全部打进 `__FAIRY_VOICE_DIAG__`，点「复制诊断」即可定位卡点 |
| **源码与产物分离** | 旧内核走 `.agent-presets` 目录、新内核走 fork patch 行，**互不干扰** |

> 🆕 **HDD 视觉模式可选**：打开设置面板会有横幅提示，自检面板多一条 `warn` 级提示项 —— 关掉视觉也能用朗读。
>
> 📄 完整技术档案：[`docs/DSH Desktop × Fairy 兼容性适配报告.pdf`](<docs/DSH Desktop × Fairy 兼容性适配报告.pdf>)（8 页，含时间线、故障清单、验收证据）

> ⚠️ **诚实声明**：本 fork 的改动**没有对表现层做任何修改** —— 人设语料 / 布局 / mascot / 样式**一个字节都没动**。改的都是内核接口的适配层。

---

## 三、装起来

### 🤖 让 Agent 帮你装

把下面这段话丢给你的 DSH Agent：

> 从 https://github.com/playinginzzz/Fairy-DSH-compat 安装 `dsh-fairy-visual` 和
> `dsh-balance-meter` 和 `dsh-fairy-voice` 到我的 web profile，**不要**装 `dsh-fairy-startup` 和 `dsh-browser-dock`。
> 更完整的说明见 **[AGENTS.md](AGENTS.md)**。
> 装完执行 `dsh --profile web --dump-config` 确认已经挂载。

### 🟢 完全不懂技术 → 下载、双击

| 下载这个 | 干什么 | 给谁用 |
| --- | --- | --- |
| **[`install.cmd`](https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download/install.cmd)** | 装 3 个：视觉浮层 + 朗读 + 余额 | ✅ **推荐，绝大多数人用这个** |
| **[`install_full.cmd`](https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download/install_full.cmd)** | 装全部 5 个（多装启动画面 + 截图 Dock，**有已知风险**） | ⚠️ 清楚后果、确实想要的人 |
| **[`uninstall.cmd`](https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download/uninstall.cmd)** | **卸**：卸掉插件与预设，并把你改过的「默认预设」还原回去 | 🧹 不用了、想清干净的人 |

**📦 即装即卸**

- **装（推荐）**：下 `install.cmd`，双击 —— 自动装 3 个安全插件（视觉浮层 / 朗读 / 余额）
- **装全部 5 个**：下 `install_full.cmd`，双击（装前会先把风险讲清楚并要求确认）
- **卸**：下 `uninstall.cmd`，双击 —— ⚠️ **`uninstall.ps1` 要一起下**，两个放同一个文件夹里（那个 `.cmd` 只是启动器，真正的逻辑在 `.ps1` 里）
- 不想用安装器：直接下 5 个 `.tgz`，用 `dsh plugin --profile web add <文件路径>` 装

下载完 **双击它**，按屏幕上的中文提示走就行。缺什么它会自己装、自己说人话，失败了也会告诉你卡在哪一步、该怎么办。

> 🔒 **卸载不删你的数据**：参考音频、朗读设置、语音简报的 API Key 都在 `~/.dsh/fairy-voice/`，
> 卸载脚本**一个字节都不动** —— 要彻底清干净，脚本会在最后把这个路径打给你，删不删由你自己决定。

> 💡 这几个链接**永远指向最新版** —— 收藏起来，想更新时重新下载再双击一次就行。
>
> ⚠️ 如果你是从 **Releases 页面**进来的，会看到一堆 `.tgz` 文件 ——
> **那些不用管**，只需要下载里面的 `install.cmd`（或 `install_full.cmd`）；卸载则用 `uninstall.cmd` + `uninstall.ps1`。

### 🟡 会敲命令 → 一条就够

```powershell
dsh plugin --profile web add `
  https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download/dsh-fairy-visual.tgz `
  https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download/dsh-fairy-voice.tgz `
  https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download/dsh-balance-meter.tgz
```

> 用的是别的 profile？把 `web` 换成你的 profile 名。
> 想装某几个而不是全部？把不要的那几行 URL 删掉。

---

## 四、⚠️ 装之前先看这张表

| 插件 | 干什么 | 建议 |
| --- | --- | --- |
| `dsh-fairy-visual` | **核心**。宠物浮层、HDD 主题、界面重绘、设置里的 Fairy 面板 | ✅ **推荐** |
| `dsh-fairy-voice` | 朗读回复（可接本机 GPT-SoVITS，也可用 MOSS-TTS-Nano 走 CPU） | ✅ 可用，朗读需额外配置 |
| `dsh-balance-meter` | 侧栏显示 DeepSeek 余额 | ✅ 可用 |
| `dsh-fairy-startup` | 启动画面 | ⚠️ **谨慎**：每次启动都会清空会话选择并自动开新会话，**你上次没结束的对话可能就找不回来了** |
| `dsh-browser-dock` | 截图 Dock | ❌ **不建议**：控制 token 会交给任何能访问 Web 端口的程序；页面截图会落盘；takeover 功能还硬编码了 macOS 路径，Windows 上根本用不了 |

**`install.cmd` 只装前 3 个。** 后两个必须显式用 `install_full.cmd` 安装，它会先把风险讲清楚再问你。

---

## 五、装完做什么

| 步骤 | 做什么 |
| --- | --- |
| 1 | **重启 DSH**（关掉再打开） |
| 2 | 设置 → **Fairy** → 把最上面的「**启用**」打开 |
| 3 | （可选）想把 Fairy 当默认人设：同一个设置页里打开「**Fairy 人设预设**」 |
| 4 | （可选）想用朗读：点「**开始自检**」，看能不能出声 |

> 💡 **第 2 步不做的话，视觉和朗读都不会出现** —— 插件装好后默认是关着的，这是故意的。

---

## 六、需要什么

| 项 | 说明 |
| --- | --- |
| **DSH** | 已装好、能正常启动。**适配 `dsh 0.1.5-rc.1` ~ `0.2.0-rc.2`**（对应 DSH Desktop `2.0.9` ~ `2.0.17`） |
| **Node.js** | ≥ 20。`install.cmd` 会检查；缺了它会告诉你去哪装 |
| **pnpm** | ⚠️ 装 DSH 时**不会**自带它。用 `install.cmd` 会自动帮你装；手动装是 `npm install -g pnpm` |
| **网络** | 要能连上 GitHub Releases 和 npm 仓库。**国内建议挂代理**，否则可能卡在下载那一步 |
| **GPT-SoVITS** | **只有**用朗读功能才需要。不装也能用其他部分；也可改用 MOSS-TTS-Nano（CPU 可跑） |

---

## 七、朗读功能：两条路线（GPT-SoVITS / MOSS-TTS-Nano）

`dsh-fairy-voice` 的朗读有**两个引擎**，默认仍是上游设计的本机 GPT-SoVITS：

| 引擎 | 需要什么 | 适合谁 |
| --- | --- | --- |
| **GPT-SoVITS**（默认，上游原路） | 本机跑 SoVITS（`127.0.0.1:9880`）+ 参考音频。**流式**：边合成边播 | 有显卡、想要最好的音色 |
| **MOSS-TTS-Nano** | 装一套 MOSS（本机 `127.0.0.1:18083`）+ **同一个参考音频**。**CPU 就能跑**，不要显卡 | 没显卡、不想折腾 SoVITS |

在 **设置 → Fairy → 朗读设置 → 朗读引擎** 里切换，**改完即时生效、不用重启**；
两个引擎各自记住自己的地址，来回切换不会丢。**参考音频两份共用**，不用配两遍。

> ⚠️ **MOSS 那条路要自己先装**：在仓库目录跑一条命令即可（坑都写死了，可重复运行）
> ```powershell
> .\tools\install-moss.ps1
> ```
> 不想自己动手的：**设置 → Fairy → 朗读设置** 里有「**复制安装说明**」按钮，
> 把复制到的那段话发给你的 AI Agent，它会照着一份写好的说明去装。
> 装好后本仓库配套的 `tools\moss-tts-server\server.py` 就是它的服务端 ——
> 它为什么存在、为什么不用官方的 `app_onnx.py`，见 [`docs/本地改动.md`](docs/本地改动.md) 里的说明。
>
> ⚠️ MOSS 是**整句合成完再出声**（不像 SoVITS 那样流式），所以按了朗读要等几秒才开始响，
> 这是设计如此、不是卡住了。本机实测约 **0.45× 实时**（10.5 秒合成 4.7 秒语音）。

### GPT-SoVITS 这条路的具体要求

| 项 | 要求 |
| --- | --- |
| TTS 服务 | 默认本机 `http://127.0.0.1:9880`；**可在设置里改成别的端口或另一台机器** |
| 参考音频 | `~/.dsh/fairy-voice/reference/fairy_ref.wav`（**路径可在设置里改**）；建议 3–10 秒干净人声。该目录**插件启动时自动创建** |
| 参考文本 | 同目录 `fairy_ref.txt`（缺失时用内置回落文案，不影响出声） |

没跑 GPT-SoVITS 时：**朗读按钮是灰色的**、不会出声 —— 这是上游设计，不是故障。

### 你的东西放在哪（和插件代码是分开的）

| | 路径 | 说明 |
| --- | --- | --- |
| **插件代码** | 源码装：你 clone 的目录 / `~/.dsh/plugins/…`<br>`dsh plugin add` 装：**profile 下的 `node_modules`** | 随时可能被重装、清掉、换版本 |
| **你的数据** | `~/.dsh/fairy-voice/` | `reference/`（音色）、`runtime/config.json`（设置）、`voice-brain.json`（语音简报密钥） |

**为什么必须分开**：`dsh plugin add <包>` 会把包**解进 profile 的 `node_modules`**，
而那是 **pnpm 随时会重建**的目录 —— 把音色和 API Key 放进去，**升一次版本就没了**。

所以你的东西一律留在 `~/.dsh/fairy-voice/`：它由插件**运行时**自己创建，
**跟插件装在哪、怎么装、装几次都无关**。

### 先点一次「开始自检」（强烈建议）

最常见的困惑是"朗读不好使"，却看不出卡在哪一层。设置 → **Fairy** → **朗读自检** → 点「开始自检」，
会逐项给出结论与修法（7 项）：插件宿主 / 本地朗读服务 / 参考音频 / **真实合成一句话** /
浏览器音频能力 / 朗读控件是否挂上 / 消息识别。

面板底部的「复制诊断信息」会把结果写进剪贴板（**不含任何聊天内容**），直接贴出来即可，不用截图、不用看日志。

> 自检面板里也写明了：**朗读按钮与自动朗读开关只在真实会话页面出现**，
> 首页和刚建的空白会话不显示 —— 这是 DSH 自身的设计。

### 设置里只有一个 Fairy 入口

原来有「HDD 视觉与 Fairy 身份」和「语音简报」两个入口，现在合并为一个：设置 → **Fairy**。里面还有：

- **朗读设置**：`SoVITS 地址`（或 MOSS 地址）、`参考音频路径` 可直接改并保存，**改完即时生效、无需重启**
- **语音简报（可选）**：原「语音简报」的 API Key 表单搬到了这里

> 说明：`fairy-voice` **没有语音输入功能**。输入框左侧那个控件是「自动朗读开关 / 音量」，
> 不是麦克风。**本仓库已解除它与 HDD 视觉模式的绑定**（上游把它绑死了）。

---

## 八、自检工具

双击根目录的 **`verify.cmd`**，它会在**临时目录**里新建一套完全独立的 DSH 环境 →
启动 → 无头浏览器探针 → 自动清理。**不会碰你现有的 profile。**

DSH 升级后建议先跑一次（上游依赖官方 DOM 选择器与私有 slot 契约，升级后可能静默降级）。

---

## 九、兼容性：为什么它能跑在你的版本上

**请勿自行"统一版本"。** `dsh-fairy-visual` 的宿主侧第一行是：

```js
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
```

该导出在 **`0.1.1-rc.2` 存在**，但在 **`0.1.2-rc.1` 已被移除**（改为 `installSettingsSection`）。
插件把依赖**精确 pin 到 `0.1.1-rc.2`**，因此 pnpm 会为它安装一份自己的副本；
而 `settingsNamespace` 只是「校验命名空间格式后原样返回字符串」，与宿主的 `settings.register(ns, schema)` 完全兼容。

> 一旦把这个依赖提升/覆盖成宿主的 `0.1.2-rc.1`，插件会在导入阶段直接失败。

**跨内核声明**：三个包都声明了宽松的 `peerDependencies`：

```json
"@deepseek-ai/dsh-settings": "^0.1.0-rc.7 || ^0.1.1-rc.2 || ^0.1.2-alpha.2 || ^0.2.0-rc.1"
```

配合 feature-detection 代码路径，覆盖 `0.1.x` 与 `0.2.x` 两条内核线。

**升级提醒**：上游设计依赖官方 DOM 选择器、ARIA 锚点与 slot 私有契约。
DSH 升级后若界面元素变化，插件会**静默降级**（有 capability 上报机制，不会崩）。
本 fork 的适配层只在**已知的**内核变更点上生效，**新出现的内核变更仍可能造成故障**。

---

## 十、部署机制：`dsh.bundle`

每个插件包在 `package.json` 里声明了：

```json
"dsh": { "bundle": { "patch": "./cordis.patch.yml" }, "client": { "platform": "web" } }
```

并各自带一个 `cordis.patch.yml`（只有一条 insert 行）。DSH CLI 在 `plugin add` 之后会把
**声明了 `dsh.bundle` 的依赖自动追加进 `dsh.profile.bundles`**，于是插件自动成为 profile 的一层。

> **`0.1.x` 的老写法已废弃**：那时靠脚本往 profile 的 `cordis.patch.yml` 里写一个「Fairy-DSH managed block」。
> 现在如果你是从很老的版本升级上来的，`install.cmd` 不会再动那个块，遇到重复注册请手动清理。

---

## 十一、环境要求

| 项 | 要求 |
| --- | --- |
| 系统 | Windows（脚本为 PowerShell；插件本身跨平台） |
| DSH | **`0.1.5-rc.1` ~ `0.2.0-rc.2`**（DSH Desktop `2.0.9` ~ `2.0.17`）；上游在 `0.1.1-rc.2` 验收 |
| Node.js | ≥ 20 |
| pnpm | 安装时需要，用于装插件依赖 |
| 浏览器 | 自检时需要 Chrome 或 Edge（脚本会自动探测） |

首次安装需要联网（从 GitHub 和 npm 拉取），装好后离线可用。

---

## 十二、已知限制与注意

1. **会和别的 UI 插件抢 DOM**：若你已装了其他改界面的插件（如 `beauticode`、`whale-widget`、
   `live2d-companion`、`liang-slider`、`ui-task-board`），建议先禁用一部分再启用 Fairy。
2. **`fairy-startup`** 每次加载都会清空会话选择，谨慎启用（默认不装）。
3. **`fairy-voice`** 的长回答（≥260 字）会发往 `api.deepseek.com` 做语音简报，
   密钥明文存于 `~/.dsh/fairy-voice/voice-brain.json`。
4. **`browser-dock`** 会暴露控制 token、缓存页面截图，不建议安装（默认不装）。
5. 上游仓库自带的测试 profile 使用 `danger-full-access` + `approval: never`，**本整合包未采用**。
6. 上游仓库不含完整世界观语料、TTS 模型与用户数据；《绝区零》相关素材不随包分发，
   本项目不授予相关版权、商标或官方关联权利。
7. ⚠️ **本仓库的兼容层仍有未验证项**（据兼容性适配报告 §07）：
   - **`2.0.17 → 2.0.9` 的完整回退演练（T11）未执行** —— 回退步骤已固化，但**尚未真机跑通**。
     代码层面保留了双内核兼容路径，但"回退零副作用"**未经端到端验证**，请勿当作已证事实。
   - **`0.1.7+` 内核下 Fairy 设置暂存于 `localStorage`**，尚未与 `settings.yaml` 双向同步
     （待官方 `Config` schema 迁移后对齐）。这意味着**设置面板上的改动在部分内核下不写回配置文件**。
   - 适配以「能启动、能对话、能朗读」为第一优先；**中间版本内核未逐一实测**，
     只在 `2.0.9` 与 `2.0.17` 两端做了真机验证。
   - **未做长时间压测**：Fairy 含 `document.body` 级监听 + rAF 动画 + 定时器。

---

## 十三、本地改动（相对上游）

上游文件的所有改动都用 `[local patch 0.x.x]` 注释标注（Apache-2.0 §4(b) 对 modified files 的要求）。

| 版本 | 改了什么 | 归属 |
| --- | --- | --- |
| **本 fork** | 18 个内核兼容提交（10 类故障，见 §2.2） | 🍴 **playinginzzz** |
| 0.3.2 | 🆕 朗读引擎可切换：新增 MOSS-TTS-Nano（CPU 就能跑） | ⛵ 孤舟版 |
| 0.3.1 | 消息识别适配 DSH `0.1.2-rc.1`；诊断信息与右下角异常提示 | ⛵ 孤舟版 |
| 0.3.0 | 分发方式换成 `.tgz` + `install.cmd` | ⛵ 孤舟版 |
| 0.2.3 | 朗读自检面板；SoVITS 地址 / 参考音频可配置 | ⛵ 孤舟版 |
| 0.2.0 | 设置栏合并 | ⛵ 孤舟版 |

**完整说明**：[`docs/本地改动.md`](docs/本地改动.md)（孤舟版改动）
· 本 fork 改动 → [`docs/DSH Desktop × Fairy 兼容性适配报告.pdf`](<docs/DSH Desktop × Fairy 兼容性适配报告.pdf>)
· 与上游的合并方式 → [`docs/仓库与上游.md`](docs/仓库与上游.md)

一句话版本：**表现层（人设语料 / 布局 / 样式）自始至终一个字节没动**；
本 fork 改的都是**内核接口的适配层**，孤舟版改的是安装分发、设置面板与朗读读取适配层。

---

## 十四、Contributors

**本仓库的所有者与维护者：**

| | |
| --- | --- |
| **Repository Owner / Maintainer** | **[playinginzzz](https://github.com/playinginzzz)** |

> 本仓库的 **18 个跨内核兼容提交、全部文档重写、Release 发布与日常维护**均由此账号完成。
> 提交身份：`playinginzzz <playinginzzz@users.noreply.github.com>`

**上游贡献者（非本仓库成员，向他们的工作致谢）：**

| | |
| --- | --- |
| **原作者（Fairy-DSH 原创代码）** | **橙汁本色** · [Chengzhibense](https://github.com/Chengzhibense) · [Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH) |
| **直接上游（孤舟版 · 整合分发）** | **孤舟蓑笠** · [Guzhou2002](https://github.com/Guzhou2002) · [Guzhou2002/Fairy-DSH-Optimized](https://github.com/Guzhou2002/Fairy-DSH-Optimized) |

> 上游作者与孤舟版作者**均未参与**本仓库的兼容改动，**其提交记录不属于本仓库的 Contributors**。
> 在此对其 Apache-2.0 开源贡献表示感谢 —— 没有它们，本仓库无从谈起。

---

## 十五、许可与归属

- **上游原创代码**：Apache License 2.0，作者 **橙汁本色**（`Chengzhibense`）—— 见 [LICENSE](LICENSE) / [NOTICE](NOTICE) / [UPSTREAM-README.md](UPSTREAM-README.md)
- **孤舟版增补**：作者 **孤舟蓑笠**（`Guzhou2002`），同一许可
- **本仓库增补**：作者 **playinginzzz**，同一许可
- **第三方依赖**：各自许可，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
- **商标**：Fairy / DSH / DeepSeek / 《绝区零》相关名称与标识归各自权利人，本许可不授予相关权利 —— 见 [TRADEMARKS.md](TRADEMARKS.md)

> ### ⚠️ 这是**非官方**分支，出问题请不要找上游作者
>
> 原作者（橙汁本色）与孤舟版作者（孤舟蓑笠）**都没有参与本仓库的任何改动**。
> 跨内核兼容层、HDD 视觉可选、GPT-SoVITS 自动拉起加固、放音诊断探针都是本仓库加的，
> 找他们解决不了，还会平白打扰人家。
>
> - 本仓库的问题 → 提到 **[本仓库 Issues](https://github.com/playinginzzz/Fairy-DSH-compat/issues)**
> - 上游通用功能问题 → [孤舟版 Issues](https://github.com/Guzhou2002/Fairy-DSH-Optimized/issues)
> - 本仓库与上游的关系、如何合并上游更新 → [`docs/仓库与上游.md`](docs/仓库与上游.md)

---

## 十六、更多文档

| 文件 | 内容 |
| --- | --- |
| [`CONTRIBUTORS.md`](CONTRIBUTORS.md) | **谁做了什么**：本仓库所有者、上游两位作者的分工，以及"上游贡献不属于本仓库 Contributors"的归属边界 |
| [`AGENTS.md`](AGENTS.md) | **给 AI Agent 看的**：标准安装指令、可装/不可装清单、**故障判定表（含"该停下来问人"的清单）** |
| **[`docs/DSH Desktop × Fairy 兼容性适配报告.pdf`](<docs/DSH Desktop × Fairy 兼容性适配报告.pdf>)** | **本仓库核心档案**：跨内核适配全记录（时间线 / 10 类故障 / 修复策略 / 8 项验收 / 遗留事项） |
| **[`docs/本地改动.md`](docs/本地改动.md)** | 相对上游改了什么、为什么改（分发方式 / 消息识别适配 / 诊断面板 / MOSS 引擎 / 设置栏合并） |
| [`docs/仓库与上游.md`](docs/仓库与上游.md) | fork 维护手册：remote 分工、合并上游更新、结构性冲突点、**⚠️ 生成器不可用警告 + 编码规则** |
| [`docs/验证报告.md`](docs/验证报告.md) | 隔离环境实测过程与结论（宿主侧 / 客户端侧 / 唯一降级项 / 未覆盖项） |
| [`docs/风险-DSH换代.md`](docs/风险-DSH换代.md) | DSH 换代风险登记 |
| [`docs/改动清单.md`](docs/改动清单.md) | 相对上游的文件分类清单（新增 / 修改 / 改名 / 删除） |
| [`docs/install-moss.md`](docs/install-moss.md) | **给 AI Agent 的任务书**：装 MOSS-TTS-Nano（朗读的第二引擎，CPU 可跑） |
| [`docs/安装机制实测.md`](docs/安装机制实测.md) | `dsh plugin add` 各种形态的实测记录 |
| [`docs/分发策略.md`](docs/分发策略.md) | 分发与发版策略 |
| [`docs/收录规则.md`](docs/收录规则.md) | 仓库收录与整理规则 |
| [`docs/Release正文模板.md`](docs/Release正文模板.md) | 发版时填 Release 正文用（带「提交前自检」清单） |
| [`docs/调研-同源项目Fairy-DSH-Exp.md`](docs/调研-同源项目Fairy-DSH-Exp.md) | 生态同源项目 + DSH 运行时契约（含"组 id 同名会卡死事件循环"） |
| [`docs/调研-CPU音色克隆引擎.md`](docs/调研-CPU音色克隆引擎.md) | 无显卡可玩的音色克隆引擎调研（MOSS-TTS-Nano 等） |
| [`docs/形态对比.md`](docs/形态对比.md) | 各分支形态对比 |
| [`docs/旧版说明-v0.2.3.md`](docs/旧版说明-v0.2.3.md) | **v0.2.3 及之前的旧文档存档**（已不适用，仅备查） |
| [`legacy/README.md`](legacy/README.md) | 已废弃的旧脚本说明 |

---

## 十七、出问题了？

> 🔎 **先看这条**：如果只是"朗读不出声"，**不用翻日志** ——
> 设置 → **Fairy** → 点「**开始自检**」，它会逐项告诉你卡在哪一层，并给出修法。
>
> 下面按**症状**分组查。每行都写了「**怎么认出来**」和「**怎么办**」。

### A. 装不上

| 症状 | 怎么认出来 / 怎么办 |
| --- | --- |
| 双击 `.cmd` **一闪就没了** | 窗口瞬间消失，什么都没看到。**从命令行跑一次就能看到它说了什么**：Win+R → 输入 `cmd` → 回车 → 把 `.cmd` 文件**拖进黑窗口** → 回车 |
| 卡在下载很久不动 | 网络问题。挂上代理再试；也可以改用 `install.cmd`（它自带网络自查） |
| 开头一堆乱码 + `'xx' is not recognized as an internal or external command`，**但标题和部分提示又显示正常** | ⚠️ **这是安装器的编码坏了，不是你的操作问题。** 在命令行敲 `chcp`：显示 **936** 说明你这台机器会中招。**重新下载一次安装器**；还不行就提 Issue |
| 报 `dsh: pnpm failed` | 没装 pnpm。执行 `npm install -g pnpm`，然后重试 |
| 提示 **404** / 下载不到文件 | 用了带版本号的旧链接。用本文档上面那两个 `latest/download` 链接 —— **它们永远指向最新版** |
| 提示缺 Node / pnpm | Node 要 **≥ 20**；pnpm 用 `npm install -g pnpm`（**装 DSH 时不会自带它**） |

### B. 装上了，但界面上什么都没出现

| 症状 | 怎么办 |
| --- | --- |
| 一点变化都没有 | **99% 是这两步没做**：① **重启 DSH**（关掉再打开）② **设置 → Fairy → 打开最上面的「启用」**。插件装好后**默认是关着的**，这是故意的，不是坏了 |
| 重启了、也开了，还是没有 | 跑 `dsh --profile web --dump-config`，看输出里有没有 `fairy-visual` 这一条 |
| 设置里根本找不到「Fairy」 | 同上；并确认你装的是 `dsh-fairy-visual`（**提供设置面板的就是它**） |
| 报 `settingsNamespace` 不存在 | 依赖被解析错了 —— 见上面「**兼容性**」一节。**千万不要自己"统一版本"** |

### C. 朗读不出声 / 按钮是灰的

| 症状 | 怎么办 |
| --- | --- |
| 朗读按钮**是灰色的** | 先确认：本机有没有跑 GPT-SoVITS（`127.0.0.1:9880`），或切到 MOSS 引擎。没跑的话按钮就是灰的 —— **这是上游设计，不是故障** |
| 跑了 SoVITS 还是不出声 | 设置 → Fairy → 点「**开始自检**」。7 项会逐项告诉你卡在哪层：插件宿主 / 本地朗读服务 / 参考音频 / **真实合成一句话** / 浏览器音频能力 / 朗读控件 / 消息识别 |
| 自检说缺参考音频 | 放一段 **3–10 秒干净人声**到 `~/.dsh/fairy-voice/reference/fairy_ref.wav`（路径也能在设置里改）。同目录的 `fairy_ref.txt` 缺失**不影响出声**（有内置回落文案） |
| 朗读控件**整个不见** | 前提是装的是 `fairy-visual`，而且**必须停在真实会话页面** —— 首页和刚建的空白会话**就是不显示**，这是 DSH 自身的设计。（**HDD 视觉模式已不再是前提** —— 本仓库解除了这个绑定） |
| GPT-SoVITS 没自动拉起 | 本仓库已加固（Node 端口探针 + 直连 python 路径，绕开上游 bat 的 `findstr` 挂死）。仍失败请点「复制诊断信息」提 Issue |
| "输入框左边那个是不是麦克风？" | **不是。** `fairy-voice` **完全没有语音输入功能**。那个控件是「自动朗读开关 / 音量」 |

### D. 界面乱 / 变慢 / 和别的插件打架

| 症状 | 怎么办 |
| --- | --- |
| 界面元素错位、被挤掉 | Fairy 会和**改界面**的插件抢 DOM。先禁用其他同类插件，再启用 Fairy：`beauticode`、`whale-widget`、`live2d-companion`、`liang-slider`、`ui-task-board` |
| 用久了变卡 | **已知未覆盖项**：Fairy 含页面级动画与监听（`document.body` 级监听 + rAF 动画 + 定时器），**没有做过长时间压测**。卡的话先关掉「启用」开关，再提 Issue |

### E. 卸载 / 彻底重来

**不会打命令？双击 [`uninstall.cmd`](https://github.com/playinginzzz/Fairy-DSH-compat/releases/latest/download/uninstall.cmd)**
（**记得把 `uninstall.ps1` 一起下下来，放同一个文件夹**）。

它会做七件事：备份 profile 与设置 → 卸掉装过的 Fairy 插件 → **把你改过的「新会话默认预设」还原回去**
→ 删掉人设预设目录 → 扫描历史版本残留 → 校验 profile → 把保留的用户数据路径打给你。

> 🔴 **为什么一定要还原默认预设**：不还原的话，`settings.yaml` 里还写着"新会话默认用 Fairy"，
> 而预设已经被删了 —— 结果就是**「点新建会话没反应」**。卸载反而把机器弄坏，这个脚本专治它。

会打命令就这样：

```powershell
# 想手工卸（脚本也走同一条路）
dsh plugin --profile web remove dsh-fairy-visual dsh-fairy-voice dsh-balance-meter

# 老版本（0.2.x）可能留过受管块、或 package.json 里有残留行，加开关让脚本一起清（会先备份）
.\uninstall.ps1 -CleanBundle
```

> 🔒 **卸载不删用户数据**：`~/.dsh/fairy-voice/`（参考音频 / 朗读设置 / 语音简报 API Key）原样保留。
> 要彻底清干净就自己删那个目录 —— **删了就找不回来**。

也可以双击根目录的 **`install.cmd`** 重装一遍 —— 它同时是**安装器**和**修复器**。

### F. 要把问题发出去

**别截图、别贴日志** —— 设置 → Fairy → 面板**最底部**点「**复制诊断信息**」，
把结果直接粘进 Issue 就行。它**不含任何聊天内容**，只有字段名和状态。

> 🤖 **让 AI Agent 帮你排查**：本仓库的 [`AGENTS.md`](AGENTS.md) 里有一份**更细的故障判定表**
> —— 每一行都写了"看到什么信号 = 卡在哪一层 = 该做什么、什么时候必须停下来问人"。
> 可以把那份文件直接喂给你的 DSH Agent。
