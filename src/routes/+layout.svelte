<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import '@fontsource/firago/100.css';
	import '@fontsource/firago/100-italic.css';
	import '@fontsource/firago/200.css';
	import '@fontsource/firago/200-italic.css';
	import '@fontsource/firago/300.css';
	import '@fontsource/firago/300-italic.css';
	import '@fontsource/firago/400.css';
	import '@fontsource/firago/400-italic.css';
	import '@fontsource/firago/500.css';
	import '@fontsource/firago/500-italic.css';
	import '@fontsource/firago/600.css';
	import '@fontsource/firago/600-italic.css';
	import '@fontsource/firago/700.css';
	import '@fontsource/firago/700-italic.css';
	import '@fontsource/firago/800.css';
	import '@fontsource/firago/800-italic.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
