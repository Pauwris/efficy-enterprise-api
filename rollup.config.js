import { version } from './package.json';
import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: 'lib/index.mjs',
		output: [
			{
				file: 'dist/efficy-enterprise-api-browser-es.js',
				format: 'es'
			}
		]
	}
];

