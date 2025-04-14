// tsup.base.ts
import { type Options } from 'tsup';
import cpy from 'cpy';
import { resolve } from 'path';

export const tsupBaseConfig: Options = {
  entry: ['src'],
  outDir: 'build',
  format: ['esm', 'cjs'],
  target: 'es2020',
  sourcemap: true,
  dts: {
    resolve: true,
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext'
    }
  },
  clean: true,
  skipNodeModulesBundle: true,

  // ✅ Tell tsup to use the shared source config
  esbuildOptions(options) {
    options.tsconfig = resolve(__dirname, 'tsconfig.source.json');
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
