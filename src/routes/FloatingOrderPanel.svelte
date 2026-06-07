<script lang="ts">
	import type { Prisma } from '$lib/prisma/client';
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
		filter?: number[] | null;
	}

	let { order, filter = null }: Props = $props();
</script>

<div class="w-full overflow-hidden rounded-xl bg-gray-50 opacity-75 shadow-2xl">
	<div class="bg-gray-200">
		<div class="flex flex-row items-center justify-between px-4 py-1">
			<div class="text-xl font-semibold text-gray-800">ausstehende Bestellung</div>
		</div>
	</div>
	<div class="divide-y divide-gray-300 text-3xl text-gray-800">
		{#each order.items.filter((item) => !filter || filter!.includes(item.productId)) as item (item.id)}
			<button
				class="w-full px-4 py-3 text-left"
				class:line-through={item.done}
				onclick={async () => {
					if (item.done) {
						await markOrderItemUnDone(item.id);
					} else {
						await markOrderItemDone(item.id);
					}
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
