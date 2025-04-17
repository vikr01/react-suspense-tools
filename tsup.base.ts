// tsup.base.ts
import { type Options } from 'tsup';
import cpy from 'cpy';
import { resolve } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const tsupBaseConfig: Options = {
  entry: ['src'],
  outDir: 'build',
  format: ['esm', 'cjs'],
  target: 'es2020',
  sourcemap: true,
  dts: {
    resolve: true,
    compilerOptions: {
      module: 'Preserve',
      moduleResolution: 'Bundler'
    }
  },
  clean: true,
  skipNodeModulesBundle: true,

  // ✅ Tell tsup to use the shared source config
  esbuildOptions(options) {
    options.tsconfig = require.resolve('./tsconfig.source.json');
  },

  // Copy non-code assets from src → build
  onSuccess: async () => {
    const cwd = process.cwd();
    const srcDir = resolve(cwd, 'src');
    const outDir = resolve(cwd, 'build');

    await cpy(['**/*', '!**/*.{ts,tsx,js,jsx}'], outDir, {
      cwd: srcDir
    });
  }
};
