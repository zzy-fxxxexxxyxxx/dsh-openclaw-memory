# dsh-openclaw-memory

一个面向 DeepSeek Harness（DSH）的 OpenClaw 共享人格与记忆插件。

它直接读取指定的 OpenClaw workspace，把人格文件、长期记忆和最近 daily memory 以有界、安全的方式注入 DSH；同时提供 DSH Sidebar 页面，用于查看和编辑允许范围内的 Markdown 文件。

> 当前初版默认共享根目录是 `/home/sunrise/.openclaw/workspace`，**不是** `/home/sunrise/.openclaw/workspace-main`。

## 功能

- 读取 OpenClaw bootstrap 文件：
  - `AGENTS.md`
  - `SOUL.md`
  - `IDENTITY.md`
  - `USER.md`
  - `BOOTSTRAP.md`
  - `MEMORY.md`
- 注入最近两天的 daily memory：
  - `memory/YYYY-MM-DD.md`
  - 每天最多选择 4 个最新的 `memory/YYYY-MM-DD-*.md`
- 对上下文使用独立预算：
  - 普通 bootstrap 文件单文件最多 `20,000` 字符
  - bootstrap 总计最多 `60,000` 字符
  - `USER.md` 最多 `4,000` 字符
  - 每个完整 daily quoted block 最多 `1,200` 字符
  - daily blocks 总计最多 `2,800` 字符
- 使用 `continuation-skip` 缓存不变的 agent 上下文快照；源文件的修改时间或大小变化后自动刷新。
- 提供 `openclaw_memory_search` 有界 Markdown 检索工具。
- 提供官方 DSH Typert Remote：列出、读取、搜索和带乐观并发保护的写入。
- 提供 DSH Web Sidebar：安全浏览和编辑共享 Markdown 文件。

## 隐私与安全边界

- 默认排除凭据和 secret 文件名，包括 `memory/part-of-account.md`。
- 默认不列出、读取、搜索或编辑 JSON 文件。
- 默认忽略 symlink。
- 拒绝绝对路径和路径穿越。
- UI 只能访问 bootstrap Markdown 与 `memory/**/*.md`。
- 写入使用文件版本检查，避免覆盖其他编辑者刚刚保存的内容。
- daily memory 会放在明确的 untrusted quoted block 中。共享文件是 workspace data，不具有高于 DSH system policy 的指令优先级。

如需显式打开凭据访问，必须在配置中设置 `includeCredentials: true`。不建议在生产环境这样做。

## 配置

`cordis.patch.yml` 中的默认配置如下：

```yaml
root: /home/sunrise/.openclaw/workspace
contextInjection: continuation-skip
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
```

`contextInjection` 可设置为：

- `always`：每次组装模型请求时生成上下文；
- `continuation-skip`：同一 agent 在共享文件未变化时复用快照；
- `never`：关闭模型上下文注入和模型侧搜索工具。

## 安装

在 DSH profile 中安装：

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

或者使用本地路径进行开发测试：

```sh
dsh plugin --profile web add link:/path/to/dsh-openclaw-memory
```

安装后，在 profile 的 patch 中加入插件配置，并按照 DSH 官方方式重启服务。生产环境操作前请先备份 profile 配置。

## OpenClaw workspace 注意事项

安装本插件不会自动修改 OpenClaw 的 agent 配置。若 OpenClaw 的 `main` agent 仍然使用 `/home/sunrise/.openclaw/workspace-main`，OpenClaw 本身和 DSH 读取的就不是同一个 workspace。

要实现 OpenClaw 运行时也使用同一事实源，需要单独审查并确认 OpenClaw workspace 配置，将其切换到：

```text
/home/sunrise/.openclaw/workspace
```

本插件只读取和编辑共享文件，不会自动复制、迁移或删除任何 OpenClaw 文件。

## 开发与验证

测试使用临时目录，不会读取真实 OpenClaw workspace：

```sh
npm test
node --check index.js
node --check client.js
node --check remote.js
node --check typert.host.js
npm pack --dry-run
```

当前测试覆盖：

- bootstrap 与 daily 独立预算；
- 日期主题 daily 文件发现；
- quoted daily block 格式与完整 block 预算；
- `continuation-skip` 和 `never`；
- 凭据与 JSON 排除；
- 有界搜索；
- 路径安全；
- 乐观并发写入冲突。

## 发布

本项目以 MIT License 发布。发布前应依次检查：

1. `cordis.patch.yml` 中的共享根目录和隐私配置；
2. `npm test`、语法检查和 Typert manifest 校验；
3. `npm pack --dry-run` 的实际文件列表；
4. GitHub 仓库和 npm 包元数据；
5. 不要把凭据、profile backup 或真实 memory 文件提交进仓库。

## 许可证

MIT
