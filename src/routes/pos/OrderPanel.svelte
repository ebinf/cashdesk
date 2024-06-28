<script lang="ts">
	import { itemIdToItem } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';

	export let order: App.Order;
	export let config: App.Config;

	let confirm = false;

	function pressed() {
		if (confirm) return dispatch('done');
		confirm = true;
		setTimeout(() => {
			confirm = false;
		}, 3000);
	}

	const dispatch = createEventDispatcher();

	let done: Set<String> = new Set();
</script>

<div class="bg-gray-50 w-full rounded-xl shadow-2xl overflow-hidden">
	<div class="bg-gray-200">
		<div class="px-4 py-1 items-center flex flex-row justify-between">
			<div class="text-xl font-semibold text-gray-800">
				#{order.id}
			</div>
			<div class="text-lg text-gray-600">
				{new Date(order.timestamp).toLocaleTimeString()} Uhr
			</div>
		</div>
	</div>
	<div class="text-3xl divide-y divide-gray-300 text-gray-800">
		{#each Object.entries(order.items) as [key, value]}
			<button
				class="px-4 py-3 w-full text-left"
				class:line-through={done.has(key)}
				on:click={() => {
					console.log('Clicked!');
					if (done.has(key)) {
						done.delete(key);
					} else {
						done.add(key);
					}
					done = new Set(done);
				}}
			>
				{#if value > 1}
					<span class="font-bold">{value}</span>
				{/if}
				{@html itemIdToItem(config, key)?.name.replace(
					/\*(\S+)\*/g,
					'<span class="font-bold">$1</span>'
				)}
			</button>
		{/each}
	</div>
	<div class="">
		<button
			on:click={() => pressed()}
			class:font-bold={confirm}
			class:font-semibold={!confirm}
			class="w-full h-full text-green-500 text-lg py-3 bg-green-100"
		>
			{#if confirm}
				Erneut drücken zum Bestätigen
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="size-5 inline"
				>
					<path
						fill-rule="evenodd"
						d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
						clip-rule="evenodd"
					/>
				</svg>
				Abgeschlossen
			{/if}
		</button>
	</div>
</div>
