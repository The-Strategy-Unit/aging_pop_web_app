import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';


const src = 'app/src/main.mjs';

const onWarn = function(warning, warn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') return;
  warn(warning);
};


const dev = {
  input: src,
  output: {
    file: 'app/js/script.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    string({
      include: ['**/*.html', '**/*.css'],
    })
  ],
  onwarn: onWarn
};


export default [dev];
