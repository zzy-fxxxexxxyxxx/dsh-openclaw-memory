# dsh-openclaw-memory

一个面向 DeepSeek Harness（DSH）的 OpenClaw 共享人格与记忆插件。

它直接读取指定的 OpenClaw workspace，把人格文件、长期记忆和最近 daily memory 以有界、安全的方式注入 DSH；同时提供 DSH Sidebar 页面，用于查看和编辑允许范围内的 Markdown 文件。

> 当前初版默认共享根目录是 `/home/sunrise/.openclaw/workspace`，**不是** `/home/sunrise/.openclaw/workspace-main`。

## 功能

- 每个 bootstrap 候选文件都可以在 Sidebar 中独立控制是否自动注入；全部关闭时不会自动注入 bootstrap，但文件浏览、源码/预览、编辑和搜索仍然可用。
- `includeDailyStartup` 独立控制启动 daily memory；若要让自动上下文完全为空，请关闭全部 bootstrap 文件并关闭该开关。
- `bootstrapFiles` 默认包含以下六个候选文件；仅存在且可读、并且开关已开启的文件会进入上下文：
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
- 文件编辑器支持“源码 / 预览”切换：预览复用 DSH 内置 Markdown 渲染器，未保存内容也可直接预览，保存仍只由“保存”按钮执行。
- 在 Sidebar 中编辑全部共享记忆配置，并预览**实际会注入的上下文**、每个文件的源大小、预算、注入字符数和截断状态；预览中的总文件列表支持独立滚动，每个文件块也可以单独展开或收起。
- 配置通过 DSH `Settings`/`ConfigEditor` 写回 profile，并由 live Loader 热生效；配置冲突会被拒绝而不会覆盖别人的修改。
- 预览中的文件按钮会直接跳转到同一 Sidebar 的编辑器。

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
timeZone: Asia/Shanghai
includeDailyStartup: true
includeCredentials: false
maxFileChars: 200000
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

插件启用后，通常不需要因为配置表单的修改而重启 DSH：表单通过 live Loader 直接更新 volatile 配置，注入快照和搜索工具会读取新配置。只有 profile 不支持 live reconciliation、服务处于启动态配置模式，或 DSH 明确提示 reload 失败时，才需要使用 DSH 官方重启流程。插件管理器禁用/启用会完整销毁并重建 context、tool、Remote、Sidebar、locale 和缓存。

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

后续版本发布流程：

1. 修改 `package.json` 的版本号并提交；
2. 创建与版本一致的 tag，例如 `git tag v0.1.1`；
3. 推送 tag：`git push origin v0.1.1`；
4. GitHub Actions 的 `.github/workflows/publish.yml` 会检查 tag 与版本号一致，运行测试、语法检查和打包预览；
5. 检查通过后，使用 npm Trusted Publishing/OIDC 和 provenance 直接执行 `npm publish`。

发布 workflow 只响应 `v*` tag，不使用长期 npm token。npm Trusted Publisher 需要配置为：

- GitHub 用户：`zzy-fxxxexxxyxxx`；
- 仓库：`dsh-openclaw-memory`；
- workflow 文件：`publish.yml`；
- Publishing access：允许 `npm publish`。

## 许可证

MIT
