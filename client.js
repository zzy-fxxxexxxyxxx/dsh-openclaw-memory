window.__ModuleLoader__.load({
  id: 'dsh-openclaw-memory',
  factory(require) {
    const React = require('react');
    const { MarkdownText } = require('@deepseek-ai/dsh-client-ui-primitives');
    // Client module rows only materialize package roots (and /client aliases).
    // Keep this browser-safe contribution inline instead of requiring the Host-side
    // `./remote` subpath, which is not a client module-table entry.
    const strict = (typeSymbol) => ({ mode: 'strict', typeSymbol, create: () => ({}) });
    const parameter = (name, typeSymbol = `dsh-openclaw-memory#${name}:parameter`) => ({ name, wire: name, source: 'json', codec: strict(typeSymbol) });
    const optionalParameter = (name) => ({ name, wire: name, source: 'json', acceptsUndefined: true, codec: strict(`dsh-openclaw-memory#${name}:parameter`) });
    const memoryRemote = {
      package: 'dsh-openclaw-memory',
      descriptors: [
        ['listFiles', []],
        ['readFile', [parameter('relativePath')]],
        ['writeFile', [parameter('relativePath'), parameter('content'), optionalParameter('expectedVersion')]],
        ['search', [parameter('query'), optionalParameter('limit')]],
        ['getConfig', []],
        ['updateConfig', [parameter('patch', 'dsh-openclaw-memory#configPatch:parameter'), optionalParameter('expectedRevision')]],
        ['preview', []],
      ].map(([method, parameters]) => ({
        id: `dsh-openclaw-memory#openclawMemory/${method}`,
        service: 'openclawMemory',
        namespace: 'openclawMemory',
        method,
        invocation: { kind: 'direct' },
        parameters,
        result: strict(`dsh-openclaw-memory#openclawMemory/${method}:result`),
      })),
    };
    const h = React.createElement;
    const NS = 'openclawMemory';
    const TAB_ID = 'dsh-openclaw-memory';
    const KIND = 'openclaw-memory';
    const zh = {
      title: '共享记忆', description: '查看、预览和编辑与 OpenClaw 共用的人格与记忆文件', guideTitle: '共享记忆', guideDescription: '打开 OpenClaw 共用 workspace 的配置、上下文和文件',
      refresh: '刷新', save: '保存', saved: '已保存', source: '源码', rendered: '预览', copy: '复制', copied: '已复制', code: '代码', wrap: '自动换行', unwrap: '取消换行', footnotes: '脚注', bootstrapFiles: '自动注入的 Bootstrap 文件', bootstrapFileHint: '只影响模型上下文注入，不影响文件浏览、编辑和搜索', dailyInjection: '自动注入启动 daily memory', memoryFolder: 'memory/ 文件夹', readOnly: '只读文件', selectFile: '选择一个文件', conflict: '文件已被其他进程修改，请刷新后再保存', error: '共享记忆不可用', remoteLoading: '正在连接共享记忆服务…', settings: '配置', preview: '注入预览', files: '文件编辑', apply: '应用配置', applied: '配置已热生效', restartRequired: '配置已保存；需要重启 DSH 才能完全生效', contextDisabled: '当前未启用上下文注入', sourceChars: '源字符', sourceBytes: '源字节', injectedChars: '注入字符', limit: '上限', truncated: '已截断', full: '完整', openFile: '打开文件', snapshotChars: '完整上下文字符', bootstrap: 'Bootstrap', daily: 'Daily memory', live: '热生效', contextInjection: '上下文注入', root: '共享根目录', includeDailyStartup: '注入启动 daily memory', includeCredentials: '允许凭据文件', timeZone: '时区', dailyMemoryDays: 'Daily 天数', dailyFileMaxBytes: 'Daily 单文件字节上限', dailyFileMaxChars: 'Daily 单文件字符上限', dailyTotalMaxChars: 'Daily 总字符上限', bootstrapMaxChars: 'Bootstrap 单文件字符上限', bootstrapTotalMaxChars: 'Bootstrap 总字符上限', userMaxChars: 'USER.md 字符上限', maxFileChars: '文件读写字符上限', always: '总是注入', continuationSkip: '连续请求复用快照', never: '不注入', yes: '是', no: '否', configConflict: '配置已被其他操作修改，请刷新后再试', noPreview: '暂无注入内容', liveHint: '配置通过 DSH ConfigEditor 写回 profile，并由 live Loader 热重载',
    };
    const en = {
      title: 'Shared Memory', description: 'View, preview, and edit persona and memory files shared with OpenClaw', guideTitle: 'Shared Memory', guideDescription: 'Open shared workspace configuration, context, and files',
      refresh: 'Refresh', save: 'Save', saved: 'Saved', source: 'Source', rendered: 'Preview', copy: 'Copy', copied: 'Copied', code: 'Code', wrap: 'Wrap', unwrap: 'Unwrap', footnotes: 'Footnotes', bootstrapFiles: 'Bootstrap files injected automatically', bootstrapFileHint: 'Only affects model context injection; browsing, editing, and search remain available', dailyInjection: 'Inject startup daily memory automatically', memoryFolder: 'memory/ folder', readOnly: 'Read-only file', selectFile: 'Select a file', conflict: 'The file changed elsewhere; refresh before saving', error: 'Shared memory is unavailable', remoteLoading: 'Connecting to shared memory…', settings: 'Config', preview: 'Injection preview', files: 'File editor', apply: 'Apply config', applied: 'Config applied live', restartRequired: 'Config saved; restart DSH for full effect', contextDisabled: 'Context injection is disabled', sourceChars: 'Source chars', sourceBytes: 'Source bytes', injectedChars: 'Injected chars', limit: 'Limit', truncated: 'Truncated', full: 'Full', openFile: 'Open file', snapshotChars: 'Full context chars', bootstrap: 'Bootstrap', daily: 'Daily memory', live: 'Live', contextInjection: 'Context injection', root: 'Shared root', includeDailyStartup: 'Inject startup daily memory', includeCredentials: 'Allow credential files', timeZone: 'Time zone', dailyMemoryDays: 'Daily days', dailyFileMaxBytes: 'Daily file byte limit', dailyFileMaxChars: 'Daily file character limit', dailyTotalMaxChars: 'Daily total character limit', bootstrapMaxChars: 'Bootstrap per-file character limit', bootstrapTotalMaxChars: 'Bootstrap total character limit', userMaxChars: 'USER.md character limit', maxFileChars: 'File read/write character limit', always: 'Always inject', continuationSkip: 'Reuse snapshot on continuation', never: 'Never inject', yes: 'Yes', no: 'No', configConflict: 'Config changed elsewhere; refresh and try again', noPreview: 'No injected context', liveHint: 'Config is written through DSH ConfigEditor and hot-reloaded by the live Loader',
    };
    const BOOTSTRAP_FILES = ['AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 'BOOTSTRAP.md', 'MEMORY.md'];
    const CONFIG_FIELDS = [
      ['root', 'string'], ['contextInjection', 'select'], ['bootstrapMaxChars', 'number'], ['bootstrapTotalMaxChars', 'number'], ['userMaxChars', 'number'], ['dailyMemoryDays', 'number'], ['dailyFileMaxBytes', 'number'], ['dailyFileMaxChars', 'number'], ['dailyTotalMaxChars', 'number'], ['timeZone', 'string'], ['includeCredentials', 'boolean'], ['maxFileChars', 'number'],
    ];
    function useTabInfo(props) { return props.useTabInfo(); }
    function Button({ children, disabled, onClick, active }) { return h('button', { type: 'button', disabled, onClick, style: { border: '1px solid var(--border-color, #cbd5e1)', background: active ? 'var(--surface-active, #e2e8f0)' : 'var(--button-bg, transparent)', color: 'inherit', borderRadius: 6, padding: '6px 10px', cursor: disabled ? 'default' : 'pointer' } }, children); }
    function Metric({ label, value, warn }) { return h('span', { style: { color: warn ? 'var(--warning-color, #b45309)' : 'var(--muted-color, #64748b)', marginRight: 10 } }, `${label}: ${value}`); }
    function Disclosure({ label, children, defaultOpen = true, style, contentStyle }) {
      const [open, setOpen] = React.useState(defaultOpen);
      return h('section', { style },
        h('button', { type: 'button', 'aria-expanded': open, onClick: () => setOpen((value) => !value), style: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0, padding: 0, border: 0, background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer' } },
          h('span', { 'aria-hidden': true, style: { flex: '0 0 16px', width: 16, textAlign: 'center', fontSize: 12 } }, open ? '▼' : '▶'),
          label,
        ),
        open && h('div', { style: contentStyle }, children),
      );
    }
    function makeFileTree(files) {
      const root = { files: [], folders: new Map() };
      for (const file of files) {
        const parts = file.split('/');
        let node = root;
        for (const folder of parts.slice(0, -1)) {
          if (!node.folders.has(folder)) node.folders.set(folder, { files: [], folders: new Map() });
          node = node.folders.get(folder);
        }
        node.files.push(file);
      }
      return root;
    }
    function FileTree({ files, selected, onSelect, t }) {
      const [expanded, setExpanded] = React.useState(() => new Set(['memory']));
      const tree = makeFileTree(files);
      React.useEffect(() => {
        const parts = selected?.split('/') ?? [];
        if (parts.length < 2) return;
        setExpanded((current) => {
          const next = new Set(current);
          for (let index = 1; index < parts.length; index += 1) next.add(parts.slice(0, index).join('/'));
          return next;
        });
      }, [selected]);
      const toggle = (path) => setExpanded((current) => {
        const next = new Set(current);
        if (next.has(path)) next.delete(path); else next.add(path);
        return next;
      });
      const countFiles = (node) => node.files.length + [...node.folders.values()].reduce((sum, child) => sum + countFiles(child), 0);
      const renderFile = (file, depth) => h('button', { type: 'button', 'aria-current': file === selected ? 'page' : undefined, key: file, onClick: () => onSelect(file), title: file, style: { display: 'block', width: '100%', minWidth: 0, textAlign: 'left', border: 0, background: file === selected ? 'var(--surface-active, #e2e8f0)' : 'transparent', color: 'inherit', borderRadius: 4, padding: '7px 8px 7px ' + (8 + depth * 14) + 'px', cursor: 'pointer', overflowWrap: 'anywhere' } }, file.slice(file.lastIndexOf('/') + 1));
      const renderFolder = (name, node, path, depth) => h(React.Fragment, { key: path },
        h('button', { type: 'button', 'aria-expanded': expanded.has(path), onClick: () => toggle(path), style: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', minWidth: 0, textAlign: 'left', border: 0, background: 'transparent', color: 'inherit', borderRadius: 4, padding: '7px 8px 7px ' + (8 + depth * 14) + 'px', cursor: 'pointer', overflowWrap: 'anywhere' } },
          h('span', { 'aria-hidden': true, style: { flex: '0 0 14px', width: 14, textAlign: 'center', fontSize: 11 } }, expanded.has(path) ? '▼' : '▶'),
          h('span', { style: { minWidth: 0, flex: 1 } }, path === 'memory' ? t('memoryFolder') : name),
          h('span', { style: { color: 'var(--muted-color, #64748b)', fontSize: 11 } }, countFiles(node)),
        ),
        expanded.has(path) && h('div', { role: 'group' },
          [...node.files].sort((a, b) => a.localeCompare(b)).map((file) => renderFile(file, depth + 1)),
          [...node.folders.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([folder, child]) => renderFolder(folder, child, `${path}/${folder}`, depth + 1)),
        ),
      );
      return h('div', { role: 'tree', style: { height: '100%', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' } },
        [...tree.files].sort((a, b) => a.localeCompare(b)).map((file) => renderFile(file, 0)),
        [...tree.folders.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([folder, node]) => renderFolder(folder, node, folder, 0)),
      );
    }
    function ConfigForm({ value, onChange, onApply, busy, t }) {
      const selectedBootstrap = new Set(Array.isArray(value?.bootstrapFiles) ? value.bootstrapFiles : BOOTSTRAP_FILES);
      const toggleBootstrap = (relativePath, enabled) => onChange('bootstrapFiles', BOOTSTRAP_FILES.filter((candidate) => candidate === relativePath ? enabled : selectedBootstrap.has(candidate)));
      return h('div', { style: { display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', gap: 10, height: '100%', minHeight: 0, overflow: 'hidden', padding: 12, boxSizing: 'border-box' } },
        h('div', { style: { minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'grid', alignContent: 'start', gap: 10, paddingRight: 4 } },
        h('div', { style: { color: 'var(--muted-color, #64748b)', fontSize: 12 } }, t('liveHint')),
        h('fieldset', { style: { display: 'grid', gap: 7, margin: 0, padding: 10, border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 6 } },
          h('legend', { style: { padding: '0 4px', fontWeight: 600 } }, t('bootstrapFiles')),
          h('div', { style: { color: 'var(--muted-color, #64748b)', fontSize: 12 } }, t('bootstrapFileHint')),
          BOOTSTRAP_FILES.map((relativePath) => h('label', { key: relativePath, style: { display: 'flex', gap: 8, alignItems: 'center', overflowWrap: 'anywhere' } },
            h('input', { type: 'checkbox', checked: selectedBootstrap.has(relativePath), onChange: (event) => toggleBootstrap(relativePath, event.target.checked) }),
            h('span', null, relativePath),
          )),
        ),
        h('label', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
          h('input', { type: 'checkbox', checked: !!value?.includeDailyStartup, onChange: (event) => onChange('includeDailyStartup', event.target.checked) }),
          h('span', null, t('dailyInjection')),
        ),
        CONFIG_FIELDS.map(([key, kind]) => {
          const label = t(key);
          const val = value?.[key];
          let control;
          if (kind === 'boolean') control = h('input', { type: 'checkbox', checked: !!val, onChange: (event) => onChange(key, event.target.checked) });
          else if (key === 'contextInjection') control = h('select', { value: val ?? '', onChange: (event) => onChange(key, event.target.value), style: { width: '100%', padding: 7, background: 'var(--input-bg, transparent)', color: 'inherit' } }, h('option', { value: 'always' }, t('always')), h('option', { value: 'continuation-skip' }, t('continuationSkip')), h('option', { value: 'never' }, t('never')));
          else control = h('input', { type: kind === 'number' ? 'number' : 'text', value: val ?? '', min: kind === 'number' ? (key === 'dailyMemoryDays' ? 0 : 1) : undefined, onChange: (event) => onChange(key, kind === 'number' ? Number(event.target.value) : event.target.value), style: { width: '100%', boxSizing: 'border-box', padding: 7, background: 'var(--input-bg, transparent)', color: 'inherit', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 5 } });
          return h('label', { key, style: { display: 'grid', gridTemplateColumns: 'minmax(150px, 38%) 1fr', alignItems: 'center', gap: 8, fontSize: 13 } }, h('span', null, label), control);
        }),
        ),
        h(Button, { disabled: busy, onClick: onApply }, t('apply')),
      );
    }
    function PreviewFile({ file, title, onOpen, t }) {
      return h(Disclosure, {
        style: { minWidth: 0, border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 6, padding: 10 },
        contentStyle: { display: 'grid', minWidth: 0, gap: 6, paddingTop: 8 },
        label: h('span', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, minWidth: 0, overflowWrap: 'anywhere' } },
          h('strong', null, file.path),
          h('span', { style: { color: 'var(--muted-color, #64748b)', fontSize: 12 } }, `${title} · ${file.injectedChars} ${t('injectedChars')}`),
          h('span', { style: { color: file.truncated ? 'var(--warning-color, #b45309)' : 'var(--success-color, #15803d)', fontSize: 12 } }, file.truncated ? t('truncated') : t('full')),
        ),
      },
        h('div', { style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, alignItems: 'center' } },
          h('div', { style: { fontSize: 12 } }, h(Metric, { label: t('sourceChars'), value: file.sourceChars }), h(Metric, { label: t('sourceBytes'), value: file.sourceBytes }), h(Metric, { label: t('limit'), value: file.maxChars })),
          h(Button, { onClick: onOpen }, t('openFile')),
        ),
        h('pre', { style: { maxHeight: 180, minWidth: 0, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 11, background: 'var(--surface-secondary, rgba(127,127,127,.08))', padding: 8, borderRadius: 4 } }, file.block),
      );
    }
    function MemoryBody(props) {
      const info = useTabInfo(props);
      const t = props.t;
      const callRemote = async (method, ...args) => {
        const result = await props.remote.openclawMemory[method](...args);
        if (result?.ok) return result.value;
        const failure = result?.error ?? {};
        const error = new Error(failure.message || t('error'));
        error.code = failure.code;
        throw error;
      };
      const errorText = (error) => `${error?.code ? `${error.code}: ` : ''}${error?.message || t('error')}`;
      const [mode, setMode] = React.useState('preview');
      const [files, setFiles] = React.useState([]);
      const [selected, setSelected] = React.useState('');
      const [content, setContent] = React.useState('');
      const [editorView, setEditorView] = React.useState('source');
      const [version, setVersion] = React.useState('');
      const [config, setConfig] = React.useState(null);
      const [revision, setRevision] = React.useState(0);
      const [preview, setPreview] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [status, setStatus] = React.useState('');
      const markdownLabels = React.useMemo(() => ({
        code: { copyLabel: t('copy'), copiedLabel: t('copied'), toolbarLabels: { codeLabel: t('code'), wrapLabel: t('wrap'), unwrapLabel: t('unwrap') } },
        footnotes: t('footnotes'),
      }), [t]);
      const loadConfig = React.useCallback(async () => {
        const result = await callRemote('getConfig');
        setConfig(result.config); setRevision(result.revision);
      }, [props.remote]);
      const loadPreview = React.useCallback(async () => {
        const result = await callRemote('preview');
        setPreview(result);
      }, [props.remote]);
      const loadFiles = React.useCallback(async () => {
        const result = await callRemote('listFiles');
        setFiles(result.files);
        setSelected((current) => current && result.files.includes(current) ? current : (result.files[0] ?? ''));
      }, [props.remote]);
      const refresh = React.useCallback(async () => {
        setBusy(true); setStatus('');
        try { await Promise.all([loadConfig(), loadPreview(), loadFiles()]); } catch (error) { setStatus(errorText(error)); }
        finally { setBusy(false); }
      }, [loadConfig, loadPreview, loadFiles, t]);
      React.useEffect(() => { void refresh(); }, [refresh]);
      React.useEffect(() => {
        if (!selected) return;
        let active = true;
        callRemote('readFile', selected).then((value) => { if (active) { setContent(value.content); setVersion(value.version); } }).catch((error) => { if (active) setStatus(errorText(error)); });
        return () => { active = false; };
      }, [selected, props.remote, t]);
      const updateConfig = (key, value) => setConfig((current) => ({ ...current, [key]: value }));
      const applyConfig = async () => {
        if (!config) return;
        setBusy(true); setStatus('');
        try {
          const value = await callRemote('updateConfig', config, revision);
          setConfig(value.config); setRevision(value.revision); setStatus(t('applied')); await loadPreview();
        } catch (error) {
          setStatus(error?.code === 'settings-conflict' ? t('configConflict') : error?.code === 'config-reload-failed' ? t('restartRequired') : errorText(error));
        }
        setBusy(false);
      };
      const save = async () => {
        if (!selected) return;
        setBusy(true); setStatus('');
        try {
          const value = await callRemote('writeFile', selected, content, version);
          setVersion(value.version); setStatus(t('saved')); await loadPreview();
        } catch (error) {
          setStatus(error?.code === 'memory-conflict' ? t('conflict') : errorText(error));
        }
        setBusy(false);
      };
      const openFile = (path) => { setSelected(path); setMode('files'); };
      const tab = h('div', { style: { display: 'flex', gap: 6, padding: '10px 12px 0', borderBottom: '1px solid var(--border-color, #e2e8f0)' } },
        h(Button, { active: mode === 'settings', onClick: () => setMode('settings') }, t('settings')),
        h(Button, { active: mode === 'preview', onClick: () => setMode('preview') }, t('preview')),
        h(Button, { active: mode === 'files', onClick: () => setMode('files') }, t('files')),
        h(Button, { disabled: busy, onClick: () => void refresh() }, t('refresh')),
      );
      let body;
      if (mode === 'settings') body = config ? h(ConfigForm, { value: config, onChange: updateConfig, onApply: () => void applyConfig(), busy, t }) : null;
      else if (mode === 'files') body = h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0, 30%) minmax(0, 1fr)', height: '100%', minHeight: 0, gap: 10, padding: 12, boxSizing: 'border-box' } },
        h('div', { style: { minWidth: 0, minHeight: 0, overflow: 'hidden', borderRight: '1px solid var(--border-color, #e2e8f0)', paddingRight: 8 } }, h(FileTree, { files, selected, onSelect: setSelected, t })),
        h('div', { style: { display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, gap: 8 } },
          h('div', { style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 } },
            h('strong', { style: { minWidth: 0, overflowWrap: 'anywhere' } }, selected || t('selectFile')),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' } },
              h('div', { role: 'group', 'aria-label': t('files'), style: { display: 'inline-flex', gap: 2, padding: 2, border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 6 } },
                h(Button, { active: editorView === 'source', onClick: () => setEditorView('source') }, t('source')),
                h(Button, { active: editorView === 'rendered', onClick: () => setEditorView('rendered') }, t('rendered')),
              ),
              selected && h(Button, { disabled: busy, onClick: () => void save() }, t('save')),
            ),
          ),
          editorView === 'source'
            ? h('textarea', { value: content, onChange: (event) => setContent(event.target.value), readOnly: !selected, spellCheck: false, style: { flex: 1, minHeight: 240, width: '100%', resize: 'none', boxSizing: 'border-box', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, lineHeight: 1.5, padding: 10, border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 6, background: 'var(--input-bg, transparent)', color: 'inherit' } })
            : h('div', { style: { flex: 1, minHeight: 240, minWidth: 0, overflow: 'auto', boxSizing: 'border-box', padding: 12, border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 6 } }, selected && h(MarkdownText, { text: content, streaming: false, labels: markdownLabels, variant: 'body' })),
          h('div', { role: 'status', style: { minHeight: 18, color: 'var(--muted-color, #64748b)', fontSize: 12 } }, status || ''),
        ),
      );
      else body = preview ? h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' } },
        h('div', { style: { flex: '0 0 auto', padding: '12px 12px 0', fontSize: 12 } }, h(Metric, { label: t('snapshotChars'), value: preview.snapshotChars }), h(Metric, { label: t('bootstrap'), value: `${preview.bootstrap.length} (${preview.bootstrapInjectedChars})` }), h(Metric, { label: t('daily'), value: `${preview.daily.length} (${preview.dailyInjectedChars})` }), !preview.contextEnabled && h('span', { style: { color: 'var(--warning-color, #b45309)' } }, t('contextDisabled'))),
        h('div', { style: { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: 12, display: 'grid', alignContent: 'start', gap: 10, boxSizing: 'border-box' } },
          preview.snapshot && h(Disclosure, { label: h('strong', null, t('preview')), style: { minWidth: 0, border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 6, padding: 8 }, contentStyle: { minWidth: 0 } }, h('pre', { style: { maxHeight: 360, overflow: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '8px 0 0', fontSize: 11 } }, preview.snapshot)),
          preview.bootstrap.map((file) => h(PreviewFile, { key: `b:${file.path}`, file, title: t('bootstrap'), onOpen: () => openFile(file.path), t })),
          preview.daily.map((file) => h(PreviewFile, { key: `d:${file.path}`, file, title: t('daily'), onOpen: () => openFile(file.path), t })),
        ),
      ) : h('div', { style: { padding: 12 } }, t('noPreview'));
      return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 } }, tab, h('div', { style: { flex: 1, minHeight: 0, overflow: 'hidden' } }, body), h('div', { role: 'status', style: { minHeight: 18, padding: '0 12px 8px', color: 'var(--muted-color, #64748b)', fontSize: 12 } }, status));
    }
    function MemoryTitle(props) { const info = useTabInfo(props); return h('span', null, info.tab.navigation.address || props.t('title')); }
    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs', 'remote'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'openclaw-memory: locale');
        const t = ctx.locale.bind(NS);
        // `$mount()` is asynchronous. Register the tab only after the namespace
        // exists, otherwise its first render can race the Remote installation.
        ctx.effect(async () => {
          const disposeRemote = await ctx.remote.$mount(memoryRemote);
          const memoryNamespace = ctx.get('remote.openclawMemory');
          if (!memoryNamespace) throw new Error('openclawMemory Remote namespace did not mount');
          const disposeType = ctx.sidebarRightTabs.register({ id: TAB_ID, kind: KIND, priority: 'extension', title: () => t('title'), guide: [{ id: KIND, order: 90, title: () => t('guideTitle'), description: () => t('guideDescription') }] });
          const disposeBody = ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS, inject: () => ({ remote: { openclawMemory: memoryNamespace } }) }, MemoryBody));
          const disposeTitle = ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: TAB_ID, locale: NS }, MemoryTitle));
          return async () => {
            disposeTitle?.();
            disposeBody?.();
            disposeType?.();
            await disposeRemote?.();
          };
        }, 'openclaw-memory: Remote and UI');
      },
    };
  },
});
