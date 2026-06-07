<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getActiveOrders, getFloatingOrders } from '../commands.remote';
	import FloatingOrderPanel from '../FloatingOrderPanel.svelte';
	import OrderPanel from '../OrderPanel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let orderPanel: HTMLDivElement | null = $state(null);

	let filter: number[] | null = $state(null);
	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const filterParam = params.get('filter');
		if (filterParam) {
			filter = filterParam.split(',').map(Number);
		} else {
			filter = null;
		}
	});

	let now: Date = $state(new Date());
	onMount(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		const params = new URLSearchParams(window.location.search);
		if (filter) {
			params.set('filter', filter.join(','));
		} else {
			params.delete('filter');
		}
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	});
</script>

<div class="mt-5 flex flex-row items-center justify-between gap-4">
	<select
		bind:value={filter}
		multiple
		class="h-10 resize rounded-lg bg-gray-50 px-4 py-2 text-gray-800 shadow-xl"
	>
		{#each data.categories.filter((c) => !c.isArchived && c.products.some((p) => !p.isArchived)) as category}
			<optgroup label={category.name}>
				{#each category.products.filter((p) => !p.isArchived) as product}
					<option value={product.id}>
						<span>
							{@html product.name.replace(/\*(\S+)\*/g, '<span class="font-bold">*$1*</span>')}
						</span>
					</option>
				{/each}
			</optgroup>
		{/each}
	</select>

	<button
		class="h-10 rounded-lg bg-gray-50 px-4 py-2 text-gray-800 shadow-xl hover:bg-gray-100"
		onclick={() => orderPanel?.requestFullscreen()}
	>
		Vollbild
	</button>
</div>

<div class="-m-5 h-screen overflow-y-scroll bg-gray-800 px-5" bind:this={orderPanel}>
	<div class="fixed top-2 right-5 left-5 flex justify-between text-right text-xl text-white">
		<span class="line-clamp-1 text-left">
			{data.config.title ?? 'Kasse'}
		</span>
		<span>
			{now.toLocaleTimeString('de-DE')}
		</span>
	</div>
	<div class="my-5 mt-10 space-y-4">
		{#each (await getActiveOrders()).filter((o) => !filter || o.items.some( (item) => filter!.includes(item.productId) )) as order (order.id)}
			<OrderPanel {filter} {order} />
		{/each}
		{#each (await getFloatingOrders()).filter((o) => !filter || o.items.some( (item) => filter!.includes(item.productId) )) as order (order.id)}
			<FloatingOrderPanel {filter} {order} />
		{/each}
	</div>
</div>
