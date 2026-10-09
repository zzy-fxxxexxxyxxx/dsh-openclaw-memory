# dsh-openclaw-memory

[English](README.md)

[![npm version](https://img.shields.io/npm/v/dsh-openclaw-memory?color=cb3837&label=npm)](https://www.npmjs.com/package/dsh-openclaw-memory)
[![CI](https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/actions/workflows/ci.yml)
[![许可证](https://img.shields.io/npm/l/dsh-openclaw-memory)](LICENSE)

## 从 OpenClaw 迁移到 DSH，不必从零开始

你已经在 OpenClaw 里积累了人格设定、用户偏好、工作规则和长期记忆。迁移到 DeepSeek Harness，不应该意味着重新训练一个“陌生的助手”。

**`dsh-openclaw-memory` 就是这条连续性迁移层：**它让 DSH 直接读取同一个 OpenClaw workspace，在明确的上下文预算和隐私边界内复用已有记忆，并通过原生 DSH Sidebar 管理这些共享 Markdown 文件。

```text
OpenClaw workspace  ──┬──> OpenClaw
                      └──> dsh-openclaw-memory ──> DSH

一份 workspace，两个客户端，不再维护两套记忆。
```

> **适合人群：**正在使用 OpenClaw、准备把部分工作流迁移到 DSH，同时希望保留原有身份、偏好、行为规则和历史记忆的人。

## 为什么需要它

一个助手不只有模型接口。真正形成连续性的，往往是围绕模型维护的 workspace：

- `SOUL.md`、`IDENTITY.md` 定义助手的行为与身份；
- `USER.md` 保存用户信息和交互偏好；
- `AGENTS.md`、`BOOTSTRAP.md`、`MEMORY.md` 承载工作规则和长期上下文；
- `memory/` 保存持续增长的 daily memory。

从 OpenClaw 迁移到 DSH 时，最昂贵的不是再安装一个客户端，而是避免这些积累被拆成两份、逐渐产生偏差。

本插件把 workspace 保持为唯一事实源。DSH 直接读取它，只注入你明确配置且经过预算限制的内容，并通过受控 Sidebar 提供相同文件的浏览、预览和编辑能力。

## 你将获得什么

### 不建立第二套记忆系统

直接指向你已经信任的 OpenClaw workspace。没有隐藏数据库、没有强制导入向导，也不会自动迁移文件。文件仍在原处，两个客户端可以面对同一份事实源。

### 可解释的上下文边界

选择要注入的 bootstrap 文件，设置单文件与总字符预算。在上下文真正进入 agent 之前，先预览完整结果、文件大小、注入字符数、预算和截断状态。

### 在 DSH 内维护同一套文件

通过 Sidebar 浏览顶层 Markdown 与 `memory/` 文件树，切换源码和渲染预览，编辑并显式保存。写入范围受限于允许的 workspace 表面，并使用乐观版本检查保护并发修改。

### 默认克制的安全边界

凭据类文件、JSON 产物、symlink、绝对路径和路径穿越默认被排除。共享 workspace 内容被视为数据，不具有高于 DSH system policy 的指令优先级。

### 稳定的跨轮次连续性

使用 `continuation-skip` 时，同一 agent 会复用未变化的上下文快照，直到相关源文件或配置发生变化，避免每轮无意义地重新注入。

## 功能面

- **Bootstrap 上下文**：独立选择 `AGENTS.md`、`SOUL.md`、`IDENTITY.md`、`USER.md`、`BOOTSTRAP.md`、`MEMORY.md`。
- **Daily memory**：可选注入最近的 `memory/YYYY-MM-DD.md`，以及每天最多 4 个最新的 `memory/YYYY-MM-DD-*.md`。
- **上下文预览**：查看实际组装后的 snapshot 以及每个文件的预算统计。
- **记忆检索**：通过 `openclaw_memory_search` 提供有界关键词检索。
- **Remote API**：通过 DSH Typert Remote 完成列出、读取、搜索、预览和带冲突保护的写入。
- **Sidebar 编辑器**：文件树、源码/渲染预览、配置编辑、刷新和显式保存。
- **实时设置**：通过 DSH `Settings`/`ConfigEditor` 更新 volatile 配置，并使用乐观修订检查。

## 实际使用界面

### 1. 从 DSH 首页进入共享记忆

插件以原生 DSH 入口出现，与 workspace、终端等操作并列。

![DSH 首页中的共享记忆入口](docs/screenshots/welcome.png)

### 2. 配置迁移边界

选择哪些 OpenClaw 文件参与模型上下文，设置共享根目录，并独立控制 daily memory。所有边界都可见，而不是隐藏在不可解释的适配层里。

![DSH Sidebar 中的共享 OpenClaw workspace 配置](docs/screenshots/configuration.png)

### 3. 核对 DSH 实际会收到什么

注入预览展示完整上下文、每个文件的字符统计和截断状态。这是谨慎迁移的关键检查点：先看清楚边界，再让它进入日常上下文。

![实际注入上下文预览](docs/screenshots/context-preview.png)

### 4. 继续维护同一套 workspace

在 Sidebar 中编辑同一批 Markdown 文件，预览渲染结果，确认后再保存。OpenClaw 与 DSH 仍然通过同一个 workspace 相遇。

![DSH Sidebar 中的 Markdown 文件树与编辑器](docs/screenshots/editor.png)

## 安装

将已发布插件安装到 DSH profile：

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

本地开发 checkout：

```sh
dsh plugin --profile web add link:/path/to/dsh-openclaw-memory
```

然后将插件配置加入 profile patch，或参考仓库中的 [`cordis.patch.yml`](cordis.patch.yml)：

```yaml
- id: openclaw-memory
  name: dsh-openclaw-memory
  config:
    # 指向已经包含 OpenClaw 记忆的 workspace。
    root: /home/sunrise/.openclaw/workspace
    contextInjection: continuation-skip
    bootstrapFiles:
      - AGENTS.md
      - SOUL.md
      - IDENTITY.md
      - USER.md
      - BOOTSTRAP.md
      - MEMORY.md
    bootstrapMaxChars: 20000
    bootstrapTotalMaxChars: 60000
    userMaxChars: 4000
    dailyMemoryDays: 2
    dailyFileMaxBytes: 16384
    dailyFileMaxChars: 1200
    dailyTotalMaxChars: 2800
    includeDailyStartup: true
    timeZone: Asia/Shanghai
    includeCredentials: false
    maxFileChars: 200000
```

`contextInjection` 支持：

- `always`：每次模型请求都重新组装上下文；
- `continuation-skip`：同一 agent 在源文件未变化时复用快照；
- `never`：关闭模型上下文注入与模型侧搜索工具；插件加载后，文件 Remote 仍可按 profile 配置使用。

### 建议的低风险迁移流程

1. **保持现有 OpenClaw workspace 不变。**按你的日常运维方式先做好备份，再调整生产配置。
2. **先在测试或独立 DSH profile 中安装。**将 `root` 指向已经包含 OpenClaw 身份和记忆文件的 workspace。
3. **从较小范围开始。**只启用你确认需要共享的文件，并保持 `includeCredentials: false`。
4. **打开“注入预览”。**核对实际 snapshot、预算和截断状态，再启用常规上下文注入。
5. **逐步迁移工作流。**保留 OpenClaw 可用，同时对照验证 DSH 回复和 Sidebar 编辑是否都作用于同一批文件。

本插件不会修改 OpenClaw 的 agent 配置。如果 OpenClaw 与 DSH 指向不同目录，它们就没有共享同一份事实源；这项切换需要单独审查。

## 信任与安全模型

本插件是 workspace bridge，不是通用文件浏览器。

- 示例 patch 的默认根目录是 `/home/sunrise/.openclaw/workspace`，请替换成你自己的规范 workspace。
- 受管理范围仅包含配置中的 bootstrap Markdown 与 `memory/**/*.md`。
- 凭据和 secret 文件名默认排除；`includeCredentials: true` 是显式 opt-in，不建议在生产环境开启。
- JSON 产物默认不进入索引，symlink 会被忽略。
- 拒绝绝对路径和路径穿越。
- 读写受配置限制，写入使用乐观版本检查，避免覆盖更新版本。
- workspace 文本属于不可信数据，不得覆盖 DSH system policy。
- 本包不会复制、迁移、删除或悄悄重写 OpenClaw 文件。

## 兼容性与边界

- 需要支持 bundle patch 与 Web client surface 的 DSH profile。
- 当前发布版本针对本项目使用的 DSH `0.2.0-rc.2` 依赖线。
- 插件读取 Markdown workspace 文件；不会同步 OpenClaw 私有 session 数据库，也不会从其他客户端的 session store 重建会话。
- 插件提供共享文件/上下文边界，不承诺 OpenClaw 与 DSH 在不同模型和运行时下表现完全一致。
- profile Loader 支持时，配置更新会 live reconcile；如果 DSH 报告无法热生效，请按该 profile 的正常 reload 流程处理。

## 开发与验证

长期维护的源代码位于 `src/` TypeScript 目录。根目录 `.js` 文件是兼容入口，浏览器 Sidebar 会单独打包以适配 DSH module loader。

```sh
npm install
npm run typecheck
npm test
npm pack --dry-run
```

测试使用临时目录，不读取真实 OpenClaw workspace 或生产 profile，覆盖行为、异步/同步一致性、路径与写入安全、package exports、声明文件、Remote/Typert descriptors 以及 DSH client loader contract。

## 项目状态

`dsh-openclaw-memory` 是 MIT 许可的社区插件，当前版本为 `0.1.4`。

- 仓库：<https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory>
- npm：<https://www.npmjs.com/package/dsh-openclaw-memory>
- Issue：<https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/issues>
- DSH Plugin Hub 提交入口：<https://dsh-plugin.org/zh/submit>

## 许可证

MIT
