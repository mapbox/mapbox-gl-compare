import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'index.esm.js',
    output: {
        file: 'dist/mapbox-gl-compare.esm.js',
        format: 'es'
    },
    plugins: [
        resolve({ browser: true, preferBuiltins: false }),
        commonjs()
    ]
};
