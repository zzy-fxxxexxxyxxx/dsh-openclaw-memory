# LINUX DO / 中文社区发布草稿

建议标题：

```text
从 OpenClaw 迁移到 DSH，不必丢掉已经积累的人格与记忆：dsh-openclaw-memory
```

正文：

```markdown
如果你已经在 OpenClaw 里维护了 `SOUL.md`、`IDENTITY.md`、`USER.md`、`MEMORY.md` 和 `memory/`，现在想把部分工作流迁移到 DeepSeek Harness，最麻烦的通常不是安装 DSH，而是如何保留已经积累的上下文连续性。

我做了一个开源 DSH 插件：`dsh-openclaw-memory`。

它不建立第二套数据库，也不自动复制或迁移文件，而是直接读取你已有的 OpenClaw workspace：

- 选择要共享的 bootstrap Markdown 文件；
- 为单文件和总上下文设置字符预算；
- 在 Sidebar 里预览实际会注入的上下文和截断状态；
- 浏览、搜索、编辑和保存允许的 Markdown 文件；
- 默认排除凭据类文件、JSON 产物和 symlink；
- Remote 读写拒绝包含 symlink 的路径；
- workspace 内容按数据处理，不覆盖 DSH system policy。

安装：

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

推荐先在测试 profile 使用，指向已有 workspace，打开注入预览后再逐步迁移工作流。

项目：
https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory

npm：
https://www.npmjs.com/package/dsh-openclaw-memory

当前版本：`0.1.4`，MIT。

如果你也在维护 OpenClaw + DSH 双客户端，欢迎反馈 workspace 布局、注入边界和 Sidebar 编辑体验。
```

发布前检查：选择允许插件/项目展示的板块；保留 Markdown 代码块；不要粘贴真实 workspace 内容、私密路径或截图中的私人记忆。
