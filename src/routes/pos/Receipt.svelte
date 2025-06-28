<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { createEventDispatcher } from 'svelte';
	import ReceiptItemEntry from './ReceiptItemEntry.svelte';
	import { getOrderItem, itemIdToItem } from '$lib/utils';

	const dispatch = createEventDispatcher();

	export let config: App.Config;
	export let currentOrder: Map<string, number>;
	export let totalPrice: number;
</script>

<div class="flex flex-col h-full">
	<div class="grow divide-y divide-gray-300 overflow-y-auto mb-4">
		{#each Array.from(currentOrder.entries()) as [key, value]}
			{@const item = getOrderItem(config, key)}
			<ReceiptItemEntry
				item={getOrderItem(config, key)}
				amount={value}
				on:click={() => dispatch('remove', item)}
				{config}
			/>
		{/each}
	</div>

	<div class="font-bold text-3xl flex flex-row justify-between">
		<span>Summe</span> <span><FormattedCurrency amount={totalPrice} {config} /></span>
	</div>
</div>
