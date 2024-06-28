<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';

	export let config: App.Config;
	export let item: App.Item;
	export let color: string;
	export let amount: number;

	let itemColor = item.color ?? color;
</script>

<button
	on:click
	type="button"
	class="relative min-h-20 aspect-1 rounded-md bg-{itemColor}-600 px-3.5 py-2.5 text-white shadow-sm overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
>
	<p class="text-xl font-semibold text-ellipsis overflow-hidden leading-tight">
		{@html item.name.replace(/\*(\S+)\*/g, '<span class="font-extrabold italic">$1</span>')}
	</p>
	<p class="text-base pt-2">
		<FormattedCurrency amount={item.price} {config} />
	</p>
	{#if amount > 0}
		<p class="opacity-30 text-9xl font-bold absolute -left-1 -bottom-7 leading-none">
			{amount}
		</p>
	{/if}
</button>
