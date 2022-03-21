import { version } from './package.json';
import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: 'lib/index.mjs',
		output: [
			{
				file: 'dist/es.js',
				format: 'es'
			},
			{
				file: 'dist/es.min.js',
				format: 'es',
				plugins: [terser()],
				name: 'EfficyEnterpriseApi',
				banner: `/* efficy-enterprise-api, browser version ${version} */`
			}
		]
	}
];

