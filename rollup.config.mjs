import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
    input: 'index.js',
    output: {
        file: 'dist/mapbox-gl-compare.js',
        format: 'umd',
        name: 'MapboxCompare'
    },
    plugins: [
        resolve({ browser: true, preferBuiltins: false }),
        commonjs(),
        terser()
    ]
};
