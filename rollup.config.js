import ignore from 'rollup-plugin-ignore';

export default [
	{
		input: 'lib/index.mjs',
		output: [
			{
				file: 'dist/es.js',
				format: 'es'
			}
		],
		plugins: [ignore(["node-fetch"])],
	}
];

