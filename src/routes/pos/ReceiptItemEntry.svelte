<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';

	export let item: App.Item;
	export let amount: number;
	export let config: App.Config;
</script>

<button class="bg-gray-200 flex flex-row py-3 text-2xl w-full gap-2" on:click>
	<div class="font-semibold text-right">{amount}</div>
	<div class="grow text-left">
		{@html item.name.replace(/\*(\S+)\*/g, '<span class="font-semibold">$1</span>')}
		<span class="font-light text-gray-600 text-xl">
			(<FormattedCurrency amount={item.price} {config} />)</span
		>
	</div>
	<div class="font-bold text-right">
		<FormattedCurrency amount={amount * item.price} {config} />
	</div>
</button>
