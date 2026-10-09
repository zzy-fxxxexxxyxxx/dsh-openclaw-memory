declare module '@deepseek-ai/schemastery' {
  const schema: any;
  export default schema;
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  export const Remote: any;
  export const RemoteError: any;
  export const TypertRemoteService: any;
}

declare module '@deepseek-ai/dsh-tools' {
  export const defineTool: any;
}

declare module '@deepseek-ai/dsh-client-ui-primitives' {
  export const MarkdownText: any;
}

declare module 'react' {
  export = React;
}

declare global {
  interface Window {
    __ModuleLoader__: { load(module: unknown): void };
  }
}

export {};
