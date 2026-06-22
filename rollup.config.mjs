import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const plugins = [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(),
    terser()
];

export default [
    {
        input: 'index.js',
        output: {
            file: 'dist/mapbox-gl-compare.js',
            format: 'umd',
            name: 'mapboxgl.Compare'
        },
        plugins
    },
    {
        input: 'index.js',
        output: {
            file: 'dist/mapbox-gl-compare.esm.js',
            format: 'es'
        },
        plugins
    }
];
