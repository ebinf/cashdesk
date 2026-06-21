<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getActiveOrders, getFloatingOrders } from '../commands.remote';
	import FloatingOrderPanel from '../FloatingOrderPanel.svelte';
	import OrderPanel from '../OrderPanel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let orderPanel: HTMLDivElement | null = $state(null);

	let combinedFilter: string[] | null = $state(null);
	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const filterParam = params.getAll('filter');
		if (filterParam) {
			combinedFilter = filterParam;
		} else {
			combinedFilter = null;
		}
	});

	let filterCategories: number[] | null = $derived(
		combinedFilter && (combinedFilter as string[]).some((f) => f.startsWith('c_'))
			? (combinedFilter as string[])
					.filter((f) => f.startsWith('c_'))
					.map((f) => parseInt(f.slice(2)))
			: null
	);
	let filterProducts: number[] | null = $derived(
		combinedFilter && (combinedFilter as string[]).some((f) => f.startsWith('p_'))
			? (combinedFilter as string[])
					.filter((f) => f.startsWith('p_'))
					.map((f) => parseInt(f.slice(2)))
			: null
	);

	let now: Date = $state(new Date());
	onMount(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		const params = new URLSearchParams(window.location.search);
		if (combinedFilter) {
			params.delete('filter');
			combinedFilter.forEach((id) => params.append('filter', id.toString()));
			// params.append('filter');
		} else {
			params.delete('filter');
		}
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	});
</script>

<div class="mt-5 flex max-w-full flex-row items-center justify-between gap-4">
	<select
		bind:value={combinedFilter}
		multiple
		class="h-10 shrink resize rounded-lg bg-gray-50 px-4 py-2 text-gray-800 shadow-xl"
	>
		<optgroup label="Kategorien">
			{#each data.categories.filter((c) => !c.isArchived) as category}
				<option value="c_{category.id}">{category.name}</option>
			{/each}
		</optgroup>
		<option disabled>
			<hr />
		</option>
		{#each data.categories.filter((c) => !c.isArchived && c.products.some((p) => !p.isArchived)) as category}
			<optgroup label={category.name}>
				{#each category.products.filter((p) => !p.isArchived && !p.hideInOrders) as product}
					<option value="p_{product.id}">
						<span>
							{@html product.name.replace(/\*(\S+)\*/g, '<span class="font-bold">*$1*</span>')}
						</span>
					</option>
				{/each}
			</optgroup>
		{/each}
	</select>

	<button
		class="h-10 shrink-0 rounded-lg bg-gray-50 px-4 py-2 text-gray-800 shadow-xl hover:bg-gray-100"
		onclick={() => orderPanel?.requestFullscreen()}
	>
		Vollbild
	</button>
</div>

<div class="-m-5 h-screen bg-gray-800 px-5" bind:this={orderPanel}>
	<div class="fixed top-2 right-5 left-5 flex justify-between text-right text-xl text-white">
		<span class="line-clamp-1 text-left">
			{data.config.title ?? 'Kasse'}
		</span>
		<span>
			{now.toLocaleTimeString('de-DE')}
		</span>
	</div>
	<div class="-mx-5 my-5 mt-10 h-full space-y-4 overflow-y-auto px-5">
		{#each await getActiveOrders() as order (order.id)}
			<OrderPanel {filterCategories} {filterProducts} {order} />
		{/each}
		{#each await getFloatingOrders() as order (order.id)}
			<FloatingOrderPanel {filterCategories} {filterProducts} {order} />
		{/each}
	</div>
</div>
