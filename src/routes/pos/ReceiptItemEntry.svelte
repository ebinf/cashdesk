<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';

	export let item: { item: App.Item; variant?: App.Variant; price: number } | undefined;
	export let amount: number;
	export let config: App.Config;
</script>

<button class="bg-gray-200 flex flex-row py-3 text-2xl w-full gap-2" on:click>
	<div class="font-semibold text-right">{amount}</div>
	<div class="grow flex flex-col text-left">
		{#if item}
			<span class="mb-0"
				>{@html item.item.name.replace(/\*(\S+)\*/g, '<span class="font-semibold">$1</span>')}</span
			>
			{#if item.variant}
				<span class="text-gray-600 text-lg -mt-2">{item.variant.name}</span>
			{/if}
		{:else}
			<span class="text-gray-600">Unknown</span>
		{/if}
	</div>
	<div class="font-bold text-right">
		{#if item}
			<FormattedCurrency amount={amount * item.price} {config} />
		{:else}
			<FormattedCurrency amount={0} {config} />
		{/if}
	</div>
</button>
