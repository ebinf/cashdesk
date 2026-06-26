<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import type { Prisma } from '$lib/prisma/client';
	import { restoreCategory, restoreProduct, restoreVariant } from './settings.remote';

	interface Props {
		config: App.Config;
		open: boolean;
		categories: Prisma.CategoryGetPayload<{
			include: { products: { include: { variants: true } } };
		}>[];
	}

	let { open = $bindable(false), categories, config }: Props = $props();
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="max-h-11/12 w-4/5 max-w-2xl overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">Papierkorb</h2>
			<div class="flex flex-col divide-y divide-gray-300">
				<div>
					<h3 class="mt-2 text-left text-lg font-bold text-gray-800">Kategorien</h3>
					<div class="my-2 flex flex-col gap-2">
						{#each categories.filter((c) => c.isArchived) as category (category.id)}
							<div
								class="mx-2 rounded-md border border-gray-300 bg-gray-50 px-3.5 py-2 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
							>
								<div class="flex flex-row items-center justify-between gap-2">
									<span class="text-gray-800">{category.name}</span>
									<button
										class="flex flex-row gap-x-2 rounded-md bg-gray-50 px-3.5 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
										onclick={async () => {
											await restoreCategory(category.id);
										}}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="size-4"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
											/>
										</svg>

										Wiederherstellen
									</button>
								</div>
							</div>
						{:else}
							<p class="mb-2 text-sm text-gray-500">Keine gelöschten Kategorien.</p>
						{/each}
					</div>
				</div>
				<div>
					<h3 class="mt-2 text-left text-lg font-bold text-gray-800">Produkte</h3>
					<div class="my-2 flex flex-col gap-2">
						{#each categories.flatMap( (c) => c.products.filter((p) => p.isArchived) ) as product (product.id)}
							<div
								class="mx-2 rounded-md border border-gray-300 bg-gray-50 px-3.5 py-2 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
							>
								<div class="flex flex-row items-center justify-between gap-2">
									<div class="flex flex-col">
										<span class="text-gray-800">
											{@html product.name.replace(
												/\*(\S+)\*/g,
												'<span class="font-extrabold italic">$1</span>'
											)}
										</span>
										<span class="text-sm font-normal text-gray-600">
											{categories.find((c) => c.products.some((p) => p.id === product.id))?.name}
											–
											<FormattedCurrency amount={product.price} {config} />
										</span>
									</div>
									<button
										class="flex flex-row gap-x-2 rounded-md bg-gray-50 px-3.5 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
										onclick={async () => {
											await restoreProduct(product.id);
										}}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="size-4"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
											/>
										</svg>

										Wiederherstellen
									</button>
								</div>
							</div>
						{:else}
							<p class="mb-2 text-sm text-gray-500">Keine gelöschten Produkte.</p>
						{/each}
					</div>
				</div>
				<div>
					<h3 class="mt-2 text-left text-lg font-bold text-gray-800">Produkt-Varianten</h3>
					<div class="my-2 flex flex-col gap-2">
						{#each categories
							.flatMap((c) => c.products)
							.flatMap((p) => p.variants?.filter((v) => v.isArchived) || []) as variant (variant.id)}
							{@const product = categories
								.find((c) => c.products.some((p) => p.variants?.some((v) => v.id === variant.id)))
								?.products.find((p) => p.variants?.some((v) => v.id === variant.id))}
							<div
								class="mx-2 rounded-md border border-gray-300 bg-gray-50 px-3.5 py-2 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
							>
								<div class="flex flex-row items-center justify-between gap-2">
									<div class="flex flex-col">
										<span class="text-gray-800">
											{@html product?.name.replace(
												/\*(\S+)\*/g,
												'<span class="font-extrabold italic">$1</span>'
											)}
											<span class="italic">
												{@html variant.name}
											</span>
										</span>
										<span class="text-sm font-normal text-gray-600">
											{categories.find((c) => c.products.some((p) => p.id === product?.id))?.name}
											–
											<FormattedCurrency
												showSign={true}
												amount={variant.priceDifference ?? 0}
												{config}
											/>
										</span>
									</div>
									<button
										class="flex flex-row gap-x-2 rounded-md bg-gray-50 px-3.5 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
										onclick={async () => {
											await restoreVariant(variant.id);
										}}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="size-4"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
											/>
										</svg>

										Wiederherstellen
									</button>
								</div>
							</div>
						{:else}
							<p class="mb-2 text-sm text-gray-500">Keine gelöschten Produkt-Varianten.</p>
						{/each}
					</div>
				</div>
			</div>
			<button
				onclick={() => (open = false)}
				type="button"
				class="mt-8 w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
			>
				Schließen
			</button>
		</div>
	</div>
{/if}
