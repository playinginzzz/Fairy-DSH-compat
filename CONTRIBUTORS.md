# Contributors

> 本文件说明 **谁做了什么**。分开列示是为了不把别人的功劳算到自己头上，也不让自己的改动被误记到上游。
>
> 关键词：**原作者 ≠ 上游 fork 作者 ≠ 本仓库维护者**。

---

## 本仓库所有者与维护者

| | |
| --- | --- |
| **Repository Owner / Maintainer** | **playinginzzz** |
| GitHub | https://github.com/playinginzzz |
| 提交身份 | `playinginzzz <playinginzzz@users.noreply.github.com>` |

**本仓库由 `playinginzzz` 独立完成的工作：**

- **18 个跨内核兼容提交** —— `dsh 0.1.5-rc.1` ~ `0.2.0-rc.2` 双代内核适配，
  修复 10 类内核破坏性变更导致的故障（详见 [兼容性适配报告](<docs/DSH Desktop × Fairy 兼容性适配报告.pdf>)）
- 内核接口适配层：`settings.register` 守卫、`settingsScope`→`configForms` 可选注入兜底、
  预设声明式注册行、`workflow-ptc` 补齐、图标双代解析、`active session` 推导重写、槽位竞态修复
- GPT-SoVITS 自动拉起加固（Node 端口探针直连，绕开上游 `bat` 的 `findstr` 挂死）
- **HDD 视觉模式解绑** —— 关掉视觉仍可用朗读（上游把语音 UI 绑死在视觉开关上）
- 放音策略 / 快照 / `activeKey` 诊断探针
- README 与文档重写、仓库元数据与 Release 维护

---

## 上游贡献者（**非本仓库成员**，在此致谢）

> ⚠️ 以下作者的提交**不属于本仓库的 Contributors**。他们的工作以 Apache-2.0 发布，
> 本仓库是在其之上做二次开发。**他们没有参与本仓库的任何兼容改动。**

| | |
| --- | --- |
| **原作者**（Fairy-DSH 原创代码） | **橙汁本色**（`Chengzhibense`） |
| GitHub | https://github.com/Chengzhibense |
| 仓库 | https://github.com/Chengzhibense/Fairy-DSH |
| 贡献 | Fairy 插件套件的**全部原创实现**：人设语料、HDD 视觉、界面重绘、布局、mascot、朗读逻辑 |
| 许可 | Apache-2.0 |

| | |
| --- | --- |
| **直接上游**（孤舟版 · 整合分发 · 本仓库基线） | **孤舟蓑笠**（`Guzhou2002`） |
| GitHub | https://github.com/Guzhou2002 |
| 仓库 | https://github.com/Guzhou2002/Fairy-DSH-Optimized |
| 贡献 | 把上游整理成**可分发整合包**：`install.cmd` / `install_full.cmd` 一键安装、GitHub Releases + SHA256、`uninstall.cmd` 卸载程序、朗读自检面板、设置栏合并、**MOSS-TTS-Nano 第二朗读引擎**（CPU 可跑）、MOSS 一键安装脚本、新手文档 |
| 许可 | Apache-2.0（继承自原作者） |

---

## 平行分支（**无代码血缘，未参与本项目**）

| | |
| --- | --- |
| 「云朵版」 | `addsas222` · https://github.com/addsas222/Fairy-DSH-Exp |

另有一支**独立**的功能实验版（人格包引擎、多会话模式、多 TTS 引擎等），
与孤舟版及本仓库**无代码血缘**。三套 Fairy 分发**装的东西会互相覆盖 —— 只装一个**。

---

## 血缘一览

```
Chengzhibense/Fairy-DSH                   原作者 橙汁本色 · Apache-2.0
        │
        └── Guzhou2002/Fairy-DSH-Optimized  孤舟蓑笠 · 整合分发 · 本仓库基线 v0.3.8
                    │
                    └── playinginzzz/Fairy-DSH-compat   ★ 本仓库 · 跨内核兼容

addsas222/Fairy-DSH-Exp                   云朵版 · 独立分支 · 无血缘
```

---

## 归属红线

- 本仓库是**非官方**分支，**不代表**原作者、孤舟版作者或 DeepSeek 官方的立场，**未获任何背书**。
- **本仓库的问题请开 [本仓库 Issues](https://github.com/playinginzzz/Fairy-DSH-compat/issues)**，
  不要打扰上游作者 —— 兼容层是本仓库加的，找他们解决不了。
- 上游通用功能问题（与内核兼容无关的）请去
  [孤舟版 Issues](https://github.com/Guzhou2002/Fairy-DSH-Optimized/issues)。
- 对上游文件的所有修改均带 `[local patch 0.x.x]` 注释（Apache-2.0 §4(b) 对 modified files 的要求）。
- `LICENSE` / `NOTICE` / `THIRD_PARTY_NOTICES.md` / `TRADEMARKS.md` **全部原样保留**。

> 📌 关于朗读逻辑的改动授权：**原作者橙汁本色已明确同意**本分支改动朗读逻辑（2026-09-13，口头授权）。
> 且 **GPT-SoVITS 原路径一个字节未改**，新增的 MOSS 引擎是**并列第二条路**而非替换。

---

## 许可

上游原创代码与派生工作均以 **Apache License 2.0** 发布 —— 见 [LICENSE](LICENSE) / [NOTICE](NOTICE)。
第三方依赖各自许可，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
商标边界见 [TRADEMARKS.md](TRADEMARKS.md)。
