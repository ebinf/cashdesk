<script lang="ts">
	import type { Prisma } from '$lib/prisma/client';
	import { untrack } from 'svelte';
	import { markOrderItemDone, markOrderItemUnDone } from './commands.remote';

	interface Props {
		order: Prisma.FloatingOrderGetPayload<{
			include: {
				items: {
					include: {
						product: true;
						variant: true;
					};
				};
			};
		}>;
		filterCategories?: number[] | null;
		filterProducts?: number[] | null;
	}

	let { order, filterCategories = null, filterProducts = null }: Props = $props();

	let filteredItems = $derived(
		order.items.filter(
			(item) =>
				keepDoneItemsTimeouts.has(item.id) ||
				(filterCategories && filterCategories.includes(item.product.categoryId!)) ||
				(filterProducts && filterProducts.includes(item.productId)) ||
				(!filterCategories && !filterProducts)
		)
	);

	let keepDoneItemsTimeouts: Map<number, NodeJS.Timeout> = $state(new Map());

	$effect(() => {
		order;

		const doneTimeouts = untrack(() => keepDoneItemsTimeouts);
		for (const [itemId, timeout] of doneTimeouts) {
			if (order.items.find((item) => item.id === itemId)?.done !== true) {
				clearTimeout(timeout);
				untrack(() => {
					keepDoneItemsTimeouts.delete(itemId);
				});
			}
		}
		untrack(() => {
			keepDoneItemsTimeouts = new Map(keepDoneItemsTimeouts);
		});
	});
</script>

{#if filteredItems.length > 0 && (!(filterCategories || filterProducts) || filteredItems.some((item) => !item.done || keepDoneItemsTimeouts.has(item.id)))}
	<div class="w-full overflow-hidden rounded-xl bg-gray-50 opacity-75 shadow-2xl">
		<div class="bg-gray-200">
			<div class="flex flex-row items-center justify-between px-4 py-1">
				<div class="text-xl font-semibold text-gray-800">ausstehende Bestellung</div>
			</div>
		</div>
		<div class="divide-y divide-gray-300 text-3xl text-gray-800">
			{#each filteredItems as item (item.id)}
				<button
					class="w-full px-4 py-3 text-left"
					class:line-through={item.done || keepDoneItemsTimeouts.has(item.id)}
					onclick={async () => {
						if (keepDoneItemsTimeouts.has(item.id)) {
							clearTimeout(keepDoneItemsTimeouts.get(item.id)!);
							keepDoneItemsTimeouts.delete(item.id);
						}
						if (item.done) {
							await markOrderItemUnDone(item.id);
						} else {
							await markOrderItemDone(item.id);
							if (filterCategories || filterProducts) {
								const timeout = setTimeout(() => {
									keepDoneItemsTimeouts.delete(item.id);
									keepDoneItemsTimeouts = new Map(keepDoneItemsTimeouts);
								}, 5000);
								keepDoneItemsTimeouts.set(item.id, timeout);
							}
						}
						keepDoneItemsTimeouts = new Map(keepDoneItemsTimeouts);
					}}
				>
					{#if item.amount > 1}
						<span class="font-bold">{item.amount}</span>
					{/if}
					<span
						>{@html item.product.name.replace(
							/\*(\S+)\*/g,
							'<span class="font-bold">$1</span>'
						)}</span
					>
					{#if item.variant}
						<span class="italic">{item.variant.name}</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}
