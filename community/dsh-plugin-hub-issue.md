# DSH Plugin Hub submission

This file is a copy-ready payload for the public Plugin Hub submission Issue. Creating the Issue is a separate external action and requires explicit authorization.

## URL

https://github.com/dshplugin/dsh-plugin-hub/issues/new

## Title

```text
[插件提交] zzy-fxxxexxxyxxx/dsh-openclaw-memory — 从 OpenClaw 迁移到 DSH 时保留同一份人格与记忆
```

## Body

```markdown
### 仓库地址
https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory

### 一句话价值
让正在从 OpenClaw 迁移到 DSH 的用户直接复用同一个 workspace 中的人格、长期记忆和 daily memory，不复制文件，并提供有界上下文预览与 Sidebar 编辑。

### 能力分类
记忆与上下文

### 安装命令
```sh
dsh plugin --profile web add dsh-openclaw-memory
```

### 兼容与运行要求
- DSH dependency line: 0.2.0-rc.2.
- Web profile with the DSH bundle patch and web client surface.
- The profile patch must point `root` at the user's canonical OpenClaw workspace.
- Current release: dsh-openclaw-memory@0.1.4.

### 许可证
MIT

### 截图 / 演示
- https://raw.githubusercontent.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/main/docs/screenshots/welcome.png
- https://raw.githubusercontent.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/main/docs/screenshots/configuration.png
- https://raw.githubusercontent.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/main/docs/screenshots/context-preview.png
- https://raw.githubusercontent.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/main/docs/screenshots/editor.png

### 补充说明
- The plugin reads and edits the configured OpenClaw Markdown workspace; it does not copy, migrate, delete, or rewrite files automatically.
- Bootstrap files and recent daily memory are bounded by per-file and total character budgets.
- Credential-like names, JSON artifacts, symlinks, absolute paths, and traversal attempts are excluded or rejected by default.
- Shared workspace text is treated as data, not as higher-priority instructions than DSH system policy.
- Remote reads and writes reject symlink path components; the 0.1.4 release includes regression coverage for file and directory symlinks.
- It does not synchronize OpenClaw's private session database.

### 提交前自查
- [x] 仓库已公开
- [x] 已添加 GitHub topic：dsh-plugin
- [x] README 包含安装命令
- [x] package.json 声明 `dsh.bundle.patch`：`./cordis.patch.yml`
- [x] 发布版本为 `0.1.4`
- [x] README 包含截图、许可证、权限边界和兼容说明
```

## Notes

The Hub page documents `apply(ctx)` as a generic requirement. This package uses the DSH service-class export contract already exercised by the DSH loader and by the production profile. Do not add an unsupported compatibility export just to satisfy wording on the form; if the Hub validator rejects the submission, use its concrete error as the next decision point.
