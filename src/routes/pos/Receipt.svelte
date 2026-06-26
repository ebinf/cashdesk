<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import type { Prisma } from '$lib/prisma/client';
	import { getOrderItem } from '$lib/utils';
	import ReceiptItemEntry from './ReceiptItemEntry.svelte';

	interface Props {
		categories: Prisma.CategoryGetPayload<{
			include: {
				products: {
					include: {
						variants: true;
					};
				};
			};
		}>[];
		config: App.Config;
		currentOrder: Map<string, number>;
		totalPrice: number;
		onremove: (id: number, variantId?: number) => void;
	}

	let { categories, config, currentOrder, totalPrice, onremove }: Props = $props();
</script>

<div class="flex h-full flex-col">
	<div class="mb-4 grow divide-y divide-gray-300 overflow-y-auto">
		{#each Array.from(currentOrder.entries()) as [key, value] (key)}
			{@const [productId, variantId] = key.split('_').map(Number)}
			{@const item = getOrderItem(categories, productId, variantId)!}
			<ReceiptItemEntry
				{item}
				amount={value}
				onclick={() => onremove(item.id, item.variant?.id)}
				{config}
			/>
		{/each}
	</div>

	<div class="flex flex-row justify-between p-4 text-3xl font-bold">
		<span>Summe</span>
		<span><FormattedCurrency amount={totalPrice} {config} /></span>
	</div>
</div>
