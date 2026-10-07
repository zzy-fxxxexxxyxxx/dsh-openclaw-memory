window.__ModuleLoader__.load({
  id: 'dsh-openclaw-memory',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'openclawMemory';
    const TAB_ID = 'dsh-openclaw-memory';
    const KIND = 'openclaw-memory';
    const zh = {
      title: '共享记忆', description: '查看和编辑与 OpenClaw 共用的人格与记忆文件', guideTitle: '共享记忆', guideDescription: '打开 OpenClaw 共用 workspace 的记忆文件',
      refresh: '刷新', save: '保存', saved: '已保存', readOnly: '只读文件', selectFile: '选择一个文件', conflict: '文件已被其他进程修改，请刷新后再保存', error: '共享记忆不可用',
    };
    const en = {
      title: 'Shared Memory', description: 'View and edit persona and memory files shared with OpenClaw', guideTitle: 'Shared Memory', guideDescription: 'Open the OpenClaw shared workspace memory files',
      refresh: 'Refresh', save: 'Save', saved: 'Saved', readOnly: 'Read-only file', selectFile: 'Select a file', conflict: 'The file changed elsewhere; refresh before saving', error: 'Shared memory is unavailable',
    };
    function useTabInfo(props) { return props.useTabInfo(); }
    function Button({ children, disabled, onClick }) { return h('button', { type: 'button', disabled, onClick, style: { border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--button-bg, transparent)', color: 'inherit', borderRadius: 6, padding: '6px 10px', cursor: disabled ? 'default' : 'pointer' } }, children); }
    function MemoryBody(props) {
      const info = useTabInfo(props);
      const t = props.t;
      const [files, setFiles] = React.useState([]);
      const [selected, setSelected] = React.useState('');
      const [content, setContent] = React.useState('');
      const [version, setVersion] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [status, setStatus] = React.useState('');
      const loadFiles = React.useCallback(async () => {
        setBusy(true); setStatus('');
        const result = await props.remote.openclawMemory.listFiles();
        if (!result.ok) { setStatus(t('error')); setBusy(false); return; }
        setFiles(result.value.files);
        if (selected && result.value.files.includes(selected)) setBusy(false);
        else if (result.value.files[0]) setSelected(result.value.files[0]);
        else setBusy(false);
      }, [props.remote, selected, t]);
      React.useEffect(() => { void loadFiles(); }, []);
      React.useEffect(() => {
        if (!selected) return;
        let active = true;
        setBusy(true); setStatus('');
        props.remote.openclawMemory.readFile(selected).then((result) => {
          if (!active) return;
          if (!result.ok) { setStatus(t('error')); return; }
          setContent(result.value.content); setVersion(result.value.version);
        }).catch(() => { if (active) setStatus(t('error')); }).finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
      }, [selected, props.remote, t]);
      const save = async () => {
        if (!selected) return;
        setBusy(true); setStatus('');
        const result = await props.remote.openclawMemory.writeFile(selected, content, version);
        if (!result.ok) { setStatus(result.error?.code === 'memory-conflict' ? t('conflict') : t('error')); setBusy(false); return; }
        setVersion(result.value.version); setStatus(t('saved')); setBusy(false);
      };
      return h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(180px, 30%) 1fr', height: '100%', minHeight: 0, gap: 10, padding: 12, boxSizing: 'border-box' } },
        h('div', { style: { overflow: 'auto', borderRight: '1px solid var(--border-color, #e2e8f0)', paddingRight: 8 } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } }, h('strong', null, t('title')), h(Button, { disabled: busy, onClick: () => void loadFiles() }, t('refresh'))),
          files.map((file) => h('button', { type: 'button', key: file, onClick: () => setSelected(file), style: { display: 'block', width: '100%', textAlign: 'left', border: 0, background: file === selected ? 'var(--surface-active, #e2e8f0)' : 'transparent', color: 'inherit', borderRadius: 4, padding: '7px 8px', cursor: 'pointer', overflowWrap: 'anywhere' } }, file)),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, gap: 8 } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 } }, h('strong', { style: { overflowWrap: 'anywhere' } }, selected || t('selectFile')), selected && h(Button, { disabled: busy, onClick: () => void save() }, t('save'))),
          h('textarea', { value: content, onChange: (event) => setContent(event.target.value), readOnly: !selected || selected.toLowerCase().includes('credential') || selected.toLowerCase().includes('secret'), spellCheck: false, style: { flex: 1, minHeight: 240, width: '100%', resize: 'none', boxSizing: 'border-box', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, lineHeight: 1.5, padding: 10, border: '1px solid var(--border-color, #cbd5e1)', borderRadius: 6, background: 'var(--input-bg, transparent)', color: 'inherit' } }),
          h('div', { role: 'status', style: { minHeight: 18, color: status === t('saved') ? 'var(--success-color, #15803d)' : 'var(--muted-color, #64748b)', fontSize: 12 } }, status || (selected && selected.toLowerCase().includes('credential') ? t('readOnly') : '')),
        ),
      );
    }
    function MemoryTitle(props) { const info = useTabInfo(props); return h('span', null, info.tab.navigation.address || props.t('title')); }
    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs', 'remote'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'openclaw-memory: locale');
        const t = ctx.locale.bind(NS);
        ctx.effect(() => ctx.sidebarRightTabs.register({ id: TAB_ID, kind: KIND, priority: 'extension', title: () => t('title'), guide: [{ id: KIND, order: 90, title: () => t('guideTitle'), description: () => t('guideDescription') }] }), 'openclaw-memory: tab type');
        ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS, inject: () => ({ remote: ctx.remote }) }, MemoryBody)), 'openclaw-memory: tab body');
        ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: TAB_ID, locale: NS }, MemoryTitle)), 'openclaw-memory: tab title');
      },
    };
  },
});
