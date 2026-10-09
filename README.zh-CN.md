# dsh-openclaw-memory

[English](README.md)

**让 DeepSeek Harness（DSH）直接拥有 OpenClaw 的人格与记忆——同一组 Markdown 文件，安全注入、可浏览、可编辑、有边界。**

`dsh-openclaw-memory` 是一个 DSH 插件，直接读取规范 OpenClaw workspace，把人格文件与 daily memory（`AGENTS.md`、`SOUL.md`、`USER.md`、`MEMORY.md`、`memory/YYYY-MM-DD*.md`）以**有界、安全**的方式注入 DSH agent，并提供完整的 Sidebar 页面浏览、编辑、预览、搜索这些文件。

## ✨ 为什么做这个

OpenClaw 与 DSH 应该共享同一份事实源，而不是各自越来越偏离。安装本插件后，DSH 直接读取你的 OpenClaw `workspace`，把已经维护好的人格、记忆文件搬进 DSH 上下文——无需复制、无需迁移，即可让两个助手共享同一份记忆与设定。

## ✨ 功能亮点

- **共享人格与记忆注入**：六个 bootstrap 候选文件（`AGENTS.md`、`SOUL.md`、`IDENTITY.md`、`USER.md`、`BOOTSTRAP.md`、`MEMORY.md`）独立开关，独立按文件与总计字符预算截断。
- **有界 daily memory**：最近两天的 `memory/YYYY-MM-DD.md` 与每天最多 4 个最新的 `memory/YYYY-MM-DD-*.md`，以明确的 untrusted quoted block 引入。
- **有界关键词检索**：`openclaw_memory_search` 工具，带按文件与总字符上限。
- **精确上下文预览**：在 Sidebar 里查看**实际将注入的内容**，每个文件的源大小、预算、注入字符数与截断状态一目了然。
- **安全 Sidebar 编辑器**：VS Code 风格文件树（顶层 Markdown 与可折叠 `memory/` 分开）、源码/渲染预览切换、live `Settings`/`ConfigEditor`、乐观并发写入保护、逐文件截断检查。
- **`continuation-skip`**：同一 agent 在共享文件未变化时复用快照，避免上下文频繁变更。
- **live 配置热生效**：所有配置字段都是 volatile，live profile 热协商无需重启 DSH；带有乐观修订检查，防止覆盖并发修改。

## ⚖️ 默认隐私与安全

- 默认排除凭据与 secret 文件名（凭据类文件名、JSON 产物默认不注入、不列出、不读取、不搜索、不可写），除非显式设置 `includeCredentials: true`。
- 仅 bootstrap Markdown 与 `memory/**/*.md` 可编辑；拒绝路径穿越与绝对路径；忽略 symlink；读写有上限；写入带乐观版本检查。
- 共享文件是 workspace 数据，不是更高优先级的指令；不得覆盖 DSH system policy。

## 🚀 安装

安装到 DSH profile（按需替换 profile 名称）：

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

本地开发 checkout：

```sh
dsh plugin --profile web add link:/path/to/dsh-openclaw-memory
```

搭配 `cordis.patch.yml` 中的默认配置：

```yaml
- id: openclaw-memory
  name: dsh-openclaw-memory
  config:
    root: /home/sunrise/.openclaw/workspace
    contextInjection: continuation-skip
    bootstrapFiles: [AGENTS.md, SOUL.md, IDENTITY.md, USER.md, BOOTSTRAP.md, MEMORY.md]
    bootstrapMaxChars: 20000
    bootstrapTotalMaxChars: 60000
    userMaxChars: 4000
    dailyMemoryDays: 2
    dailyFileMaxBytes: 16384
    dailyFileMaxChars: 1200
    dailyTotalMaxChars: 2800
    timeZone: Asia/Shanghai
    includeDailyStartup: true
    includeCredentials: false
    maxFileChars: 200000
```

`contextInjection` 可选 `always`、`continuation-skip`、`never`。

## 📸 效果展示

> 截图区域：Sidebar 总览、文件树、预览、配置面板。图片随后补充。

## ✅ 无头快速验证

不依赖浏览器直接试用核心库：

```sh
node --input-type=module - <<'NODE'
import { buildContextSnapshot, loadBootstrap } from 'dsh-openclaw-memory/memory-core';
const snapshot = await buildContextSnapshot('/home/sunrise/.openclaw/workspace', { bootstrapFiles: ['MEMORY.md'] });
console.log(snapshot);
console.log((await loadBootstrap('/home/sunrise/.openclaw/workspace', { bootstrapFiles: ['MEMORY.md'] })).map((f) => f.path));
NODE
```

## 📦 配置参考

`cordis.patch.yml` 中的字段都可以在 Sidebar 里直接编辑。仓库中的 `cordis.patch.yml` 是规范默认配置。

## 🧱 OpenClaw workspace 注意事项

本插件**读取**规范 OpenClaw workspace（默认 `/home/sunrise/.openclaw/workspace`）。若 OpenClaw 的 `main` agent 仍指向 `/home/sunrise/.openclaw/workspace-main`，本插件不会修改它；true runtime sharing 需要你自行审查并切换 OpenClaw 配置。

本包只读取和编辑共享文件，不会复制、迁移或删除任何 OpenClaw 文件。

## 🧪 工程质量与测试

- 全 TypeScript，按职责拆分到 `src/`（core 配置/路径/Bootstrap/Daily/文件/上下文、service、remote/typert 协议、client Sidebar）。
- 根目录 `.js` 只是兼容入口；`npm run build` 编译到 `dist/` 并打包客户端。
- 14 项自动化测试覆盖行为与协议导出、声明文件、DSH 客户端加载协议。
- 测试只使用临时目录，不影响真实 OpenClaw workspace 或生产 profile。

```sh
npm run typecheck
npm test
npm pack --dry-run
```

## 🗺 Roadmap

- 更多 daily memory 来源与多时区聚合；
- 检索相关性优化与分面过滤；
- 更多社区发行渠道与市场收录。

## 🤝 社区与支持

- Issue / 功能请求：[GitHub Issues](https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/issues)
- DSH Plugin Hub：[dsh-plugin.org/zh/submit](https://dsh-plugin.org/zh/submit)
- DSH 官方“Show Your Plugins!”交流区欢迎讨论。

## 📄 许可证

MIT
