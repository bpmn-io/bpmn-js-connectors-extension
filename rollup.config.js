import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';

import pkg from './package.json';

function pgl(plugins=[]) {
  return [
    css({ output: 'connectors-extension.css' }),
    resolve({
      mainFields: [
        'browser',
        'module',
        'main'
      ]
    }),
    commonjs(),
    ...plugins
  ];
}

const deps = [].concat(pkg.peerDependencies || [], pkg.dependencies || []);

const external = (id) => {
  return deps.some(dep => id.startsWith(dep) || id === dep);
};

const srcEntry = pkg.source;

export default [
  {
    input: srcEntry,
    output: [
      { file: pkg.main, format: 'cjs', exports: 'auto' },
      { file: pkg.module, format: 'es' }
    ],
    external: external,
    plugins: pgl()
  }
];