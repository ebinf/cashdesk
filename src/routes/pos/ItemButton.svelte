<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import type { Prisma } from '$lib/prisma/client';
	import { Color } from '$lib/prisma/enums';

	interface Props {
		config: App.Config;
		item: Prisma.ProductGetPayload<{
			include: {
				variants: true;
			};
		}>;
		color: Color;
		amount: number;
		onclick: () => void;
	}

	let { config, item, color, amount, onclick }: Props = $props();
</script>

<button
	{onclick}
	type="button"
	class="relative aspect-square min-h-20 shrink-0 overflow-hidden rounded-md px-3.5 py-2.5 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
	class:bg-red-600={(item.color ?? color) === Color.red}
	class:bg-green-600={(item.color ?? color) === Color.green}
	class:bg-blue-600={(item.color ?? color) === Color.blue}
	class:bg-yellow-600={(item.color ?? color) === Color.yellow}
	class:bg-purple-600={(item.color ?? color) === Color.purple}
	class:bg-orange-600={(item.color ?? color) === Color.orange}
	class:bg-pink-600={(item.color ?? color) === Color.pink}
	class:bg-teal-600={(item.color ?? color) === Color.teal}
	class:bg-rose-600={(item.color ?? color) === Color.rose}
	class:bg-taupe-600={(item.color ?? color) === Color.taupe}
>
	<p class="overflow-hidden text-xl leading-tight font-semibold text-ellipsis">
		{@html item.name.replace(/\*(\S+)\*/g, '<span class="font-extrabold italic">$1</span>')}
	</p>
	<p class="pt-2 text-base">
		<FormattedCurrency amount={item.price} {config} />
		{#if item.variants?.some((v) => !v.isArchived)}*{/if}
	</p>
	{#if amount > 0}
		<p class="absolute -bottom-7 -left-1 text-9xl leading-none font-bold opacity-30">
			{amount}
		</p>
	{/if}
</button>
