import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import terser from '@rollup/plugin-terser';


const src = 'app/src/main.mjs';

const onWarn = function(warning, warn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') return;
  warn(warning);
};


const dist = {
  input: src,
  output: {
    file: 'dist/script.min.js',
    format: 'iife',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    string({
      include: ['**/*.html', '**/*.css'],
    }),
    terser()
  ],
  onwarn: onWarn
};


export default dist;
