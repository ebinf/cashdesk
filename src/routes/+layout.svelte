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
	import { browser } from '$app/env';
	import { getActiveOrders, getFloatingOrders } from './commands.remote';
	import { invalidateAll } from '$app/navigation';

	let { children } = $props();

	let connectionState = $state(0);
	let connectionTimeout: NodeJS.Timeout | null = null;
	let eventSources: EventSource[] = [];
	let eventSource: EventSource | undefined = $derived.by(() => {
		if (!browser) return undefined;
		eventSources.forEach((es) => es.close());
		const eventSource = new EventSource('/sse');
		eventSources.push(eventSource);
		return eventSource;
	});

	$effect(() => {
		if (!eventSource) return;

		eventSource.onmessage = async (event) => {
			connectionState = eventSource.readyState;
			if (connectionTimeout) {
				clearTimeout(connectionTimeout);
				connectionTimeout = null;
			}
			if (event.data === 'activeOrders') {
				getActiveOrders().refresh();
			} else if (event.data === 'floatingOrders') {
				getFloatingOrders().refresh();
			} else if (event.data === 'catalogue') {
				invalidateAll();
			}
		};

		eventSource.onerror = () => {
			connectionTimeout = setTimeout(() => {
				connectionState = eventSource.readyState;
			}, 2000);
		};

		eventSource.onopen = () => {
			connectionTimeout = setTimeout(() => {
				connectionState = eventSource.readyState;
			}, 2000);
		};
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if browser && (!eventSource || connectionState !== EventSource.OPEN)}
	<div
		class="absolute inset-0 z-10 flex h-screen flex-col items-center justify-center gap-4 bg-gray-800/80 p-5 text-gray-100 backdrop-blur-md"
	>
		<div class="text-2xl font-bold">Verbindung zum Server wird hergestellt...</div>
		<div class="animate-pulse text-lg text-gray-400">Bitte warten Sie einen Moment.</div>
	</div>
{/if}

{@render children()}
