<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import type { Product, Variant } from '$lib/prisma/client';

	interface Props {
		item: Product & { variant?: Variant };
		amount: number;
		config: App.Config;
		onclick: () => void;
	}

	let { item, amount, config, onclick }: Props = $props();
</script>

<button class="flex w-full flex-row gap-2 px-4 py-3 text-2xl" {onclick}>
	<div class="text-right font-semibold">{amount}</div>
	<div class="flex grow flex-col text-left">
		<span class="mb-0">
			{@html item.name.replace(/\*(\S+)\*/g, '<span class="font-semibold">$1</span>')}
		</span>
		{#if item.variant}
			<span class="-mt-2 text-lg text-gray-600">{item.variant.name}</span>
		{/if}
	</div>
	<div class="text-right font-bold">
		<FormattedCurrency amount={amount * item.price} {config} />
	</div>
</button>
