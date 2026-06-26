<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { type Prisma, type Variant } from '$lib/prisma/client';
	import { Color } from '$lib/prisma/enums';

	interface Props {
		config: App.Config;
		categoryColor?: Color;
		openItem: Prisma.ProductGetPayload<{ include: { variants: true } }> | null;
		onselected: (variant: Variant) => void;
		oncancel: () => void;
	}

	let { config, categoryColor, openItem, oncancel, onselected }: Props = $props();
</script>

{#if openItem !== null && openItem.variants}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="w-4/5 max-w-2xl overflow-hidden rounded-lg bg-gray-50 p-4 shadow-xl">
			<div class="mb-4 flex flex-row flex-wrap justify-around gap-4">
				{#each openItem.variants.filter((v) => !v.isArchived) as variant (variant.id)}
					{@const color: Color = variant.color ?? openItem.color ?? categoryColor ?? Color.red}
					<button
						onclick={() => {
							onselected(variant);
						}}
						type="button"
						class="relative aspect-square w-1/4 overflow-hidden rounded-md px-3.5 py-2.5 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
						class:bg-red-600={color === Color.red}
						class:bg-green-600={color === Color.green}
						class:bg-blue-600={color === Color.blue}
						class:bg-yellow-600={color === Color.yellow}
						class:bg-purple-600={color === Color.purple}
						class:bg-orange-600={color === Color.orange}
						class:bg-pink-600={color === Color.pink}
						class:bg-teal-600={color === Color.teal}
						class:bg-rose-600={color === Color.rose}
						class:bg-taupe-600={color === Color.taupe}
					>
						<p class="overflow-hidden text-xl leading-tight font-semibold text-ellipsis">
							{@html variant.name.replace(
								/\*(\S+)\*/g,
								'<span class="font-extrabold italic">$1</span>'
							)}
						</p>
						{#if openItem.variants.some((v) => v.priceDifference !== undefined && v.priceDifference !== 0)}
							<p class="pt-2 text-base">
								<FormattedCurrency showSign={true} amount={variant.priceDifference ?? 0} {config} />
							</p>
						{/if}
					</button>
				{/each}
			</div>
			<button
				onclick={oncancel}
				type="button"
				class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
			>
				Abbrechen
			</button>
		</div>
	</div>
{/if}
