# Official DSH Discussion draft

Post title:

```text
dsh-openclaw-memory: 从 OpenClaw 迁移到 DSH，不丢掉已经积累的人格与记忆
```

Post body:

```markdown
如果你已经在 OpenClaw 里积累了 `SOUL.md`、`IDENTITY.md`、`USER.md`、`MEMORY.md` 和 `memory/`，迁移到 DSH 时不一定要重新建立一套人格和记忆。

我做了 `dsh-openclaw-memory`：它让 DSH 直接读取同一个 OpenClaw workspace，把配置中的 Markdown 以有界上下文注入 DSH，并在 Sidebar 中提供配置、注入预览、文件树、源码/渲染预览和编辑保存。

**安装：**

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

**适合的迁移方式：**

1. 保持原有 OpenClaw workspace 不变；
2. 在测试 profile 安装插件并配置 `root`；
3. 先在“注入预览”中查看实际会发送的上下文；
4. 再逐步把工作流迁移到 DSH，两个客户端继续共享同一个 workspace。

**边界：**

- 共享内容有单文件和总字符预算；
- 默认排除凭据类文件、JSON 产物和 symlink；
- Remote 读写拒绝包含 symlink 的路径；
- workspace 内容按数据处理，不能覆盖 DSH system policy；
- 插件不会复制、删除或自动迁移 OpenClaw 文件；
- 不同步 OpenClaw 私有 session 数据库。

**项目：**

- GitHub: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory
- npm: https://www.npmjs.com/package/dsh-openclaw-memory
- 当前版本：`0.1.4`
- 许可证：MIT

欢迎反馈：尤其是 OpenClaw workspace 布局、DSH profile 配置，以及哪些上下文边界对迁移最有帮助。
```

## Publishing note

Publish this only after the user explicitly authorizes creating a public Discussion under the GitHub account.
