import { version } from './package.json';
import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: 'lib/index.mjs',
		output: [
			{
				file: 'dist/efficy-enterprise-api-browser-cjs.js',
				format: 'cjs'
			},
			{
				file: 'dist/efficy-enterprise-api-browser-es.js',
				format: 'es'
			},
			{
				file: 'dist/efficy-enterprise-api-browser-es.min.js',
				format: 'es',
				plugins: [terser()],
				name: 'EfficyEnterpriseApi',
				banner: `/* efficy-enterprise-api, browser version ${version} */`
			}
		]
	}
];

