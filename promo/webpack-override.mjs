import path from 'node:path';

// ../shared has no node_modules of its own; resolve its imports (react) from here.
export const webpackOverride = (c) => ({
  ...c,
  resolve: { ...c.resolve, modules: [path.join(process.cwd(), 'node_modules'), ...(c.resolve?.modules ?? ['node_modules'])] },
});
