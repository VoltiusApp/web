import path from 'node:path';
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(2);
// ../shared has no node_modules of its own; resolve its imports (react) from here.
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: { ...c.resolve, modules: [path.join(process.cwd(), 'node_modules'), ...(c.resolve?.modules ?? ['node_modules'])] },
}));
