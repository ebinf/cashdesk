/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors';

import forms from '@tailwindcss/forms';
import aspect_ratio from '@tailwindcss/aspect-ratio';
import typography from '@tailwindcss/typography';

const money = [
	'200.00',
	'100.00',
	'50.00',
	'20.00',
	'10.00',
	'5.00',
	'2.00',
	'1.00',
	'0.50',
	'0.20',
	'0.10',
	'0.05',
	'0.02',
	'0.01'
];

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'money-200.00': "url('/money/200.00.jpg')",
				'money-100.00': "url('/money/100.00.jpg')",
				'money-50.00': "url('/money/50.00.jpg')",
				'money-20.00': "url('/money/20.00.jpg')",
				'money-10.00': "url('/money/10.00.jpg')",
				'money-5.00': "url('/money/5.00.jpg')",
				'money-2.00': "url('/money/2.00.jpg')",
				'money-1.00': "url('/money/1.00.jpg')",
				'money-0.50': "url('/money/0.50.jpg')",
				'money-0.20': "url('/money/0.20.jpg')",
				'money-0.10': "url('/money/0.10.jpg')",
				'money-0.05': "url('/money/0.05.jpg')",
				'money-0.02': "url('/money/0.02.jpg')",
				'money-0.01': "url('/money/0.01.jpg')"
			}
		},
		fontFamily: {
			sans: ['FiraGO', 'sans-serif']
		}
	},
	safelist: [
		...Object.keys(colors).map((color) => `bg-${color}-600`),
		...money.map((m) => `bg-money-${m}`),
		...[...Array(9).keys()].flatMap((i) => [
			`grid-cols-${i + 1}`,
			`xs:grid-cols-${i + 1}`,
			`sm:grid-cols-${i + 1}`,
			`md:grid-cols-${i + 1}`,
			`lg:grid-cols-${i + 1}`,
			`xl:grid-cols-${i + 1}`,
			`2xl:grid-cols-${i + 1}`
		]),
		'line-through'
	],
	plugins: [forms, aspect_ratio, typography]
};
