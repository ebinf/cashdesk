<script lang="ts">
	import { type Prisma } from '$lib/prisma/client';
	import { Color } from '$lib/prisma/enums';
	import {
		addProduct,
		deleteVariant,
		editProduct,
		moveVariantLeft,
		moveVariantRight
	} from './settings.remote';
	import ProductVariantModal from './ProductVariantModal.svelte';
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';

	interface Props {
		config: App.Config;
		product?: Prisma.ProductGetPayload<{
			include: {
				variants: true;
			};
		}>;
		category: number;
		categories: Prisma.CategoryGetPayload<{}>[];
		open: boolean;
		onclose?: () => void;
	}

	let { open = $bindable(), config, product, category, categories, onclose }: Props = $props();

	let color: Color | undefined = $derived(product?.color ?? undefined);
	let name: string = $derived(product?.name ?? '');
	let categoryId: number = $derived(category);
	let price: number = $derived(product?.price ?? 0);
	let hideInOrders: boolean = $derived(product?.hideInOrders ?? false);
	let variantNameOverridesName: boolean = $derived(product?.variantNameOverridesName ?? false);

	let editVariant: number | true | null = $state(null);
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="max-h-11/12 w-4/5 max-w-2xl overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">
				{product ? 'Produkt bearbeiten' : 'Produkt hinzufügen'}
			</h2>
			<div class="mt-4 flex flex-col gap-4">
				<div>
					<label for="name" class="block text-sm leading-6 font-medium text-gray-900">Name</label>
					<div class="mt-2">
						<input
							type="text"
							name="name"
							id="name"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
							bind:value={name}
						/>
					</div>
					<span class="mt-2 block text-sm text-gray-500">
						Verwende <code class="rounded bg-gray-200 px-1 py-0.5 text-gray-800">*</code> für eine
						Hervorhebung, beispielsweise
						<code class="rounded bg-gray-200 px-1 py-0.5 text-gray-800">Cola *Light*</code>
						für
						<span class="rounded bg-gray-200 px-1 py-0.5 text-black"
							>Cola <span class="font-bold italic">Light</span></span
						>.
					</span>
				</div>
				<div>
					<label for="color" class="block text-sm leading-6 font-medium text-gray-900">Farbe</label>
					<div class="mt-2 flex flex-row flex-wrap gap-2">
						<label
							for="color-none"
							class="relative size-12 rounded-md border-0 bg-gray-600 p-0 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
						>
							<span
								class="absolute inset-0 self-center text-center text-4xl font-black text-gray-300"
							>
								A
							</span>
							<input
								type="radio"
								class="absolute inset-0 size-full rounded-md border-0 bg-transparent p-0 ring-1 ring-gray-300 ring-inset"
								value={undefined}
								name="color"
								id="color-none"
								bind:group={color}
							/>
						</label>
						{#each Object.values(Color) as icolor}
							<input
								type="radio"
								class="size-12 rounded-md border-0 p-0 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
								value={icolor}
								name="color"
								bind:group={color}
								class:bg-red-600={icolor === Color.red}
								class:bg-green-600={icolor === Color.green}
								class:bg-blue-600={icolor === Color.blue}
								class:bg-yellow-600={icolor === Color.yellow}
								class:bg-purple-600={icolor === Color.purple}
								class:bg-orange-600={icolor === Color.orange}
								class:bg-pink-600={icolor === Color.pink}
								class:bg-teal-600={icolor === Color.teal}
								class:bg-rose-600={icolor === Color.rose}
								class:bg-taupe-600={icolor === Color.taupe}
							/>
						{/each}
					</div>
				</div>
				<div>
					<label for="category" class="block text-sm leading-6 font-medium text-gray-900">
						Kategorie
					</label>
					<div class="mt-2">
						<select
							name="category"
							id="category"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
							bind:value={categoryId}
						>
							{#each categories.filter((c) => !c.isArchived) as c}
								<option value={c.id}>{c.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div>
					<label for="hideInOrders" class="block text-sm leading-6 font-medium text-gray-900">
						In Bestellungen verstecken
					</label>
					<div class="mt-2">
						<label class="flex flex-row items-start gap-2 text-sm text-gray-500">
							<input
								type="checkbox"
								name="hideInOrders"
								id="hideInOrders"
								class="mt-1 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300"
								bind:checked={hideInOrders}
							/>
							Das Produkt kann zwar gekauft werden, wird aber in der Bestellübersicht nicht angezeigt.
							Das ist nützlich für Produkte, die zwar bezahlt werden müssen, aber nicht herausgegeben
							werden, beispielsweise Pfand oder Spenden.
						</label>
					</div>
				</div>
				<div>
					<label for="price" class="block text-sm leading-6 font-medium text-gray-900">Preis</label>
					<div class="mt-2 flex flex-row items-center gap-2">
						{#if config.currency.before}
							<span>{config.currency.before}</span>
						{/if}
						<input
							type="number"
							name="price"
							id="price"
							step="0.{'0'.repeat(config.currency.digits - 1)}1"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
							value={(price / 10 ** config.currency.digits).toFixed(config.currency.digits)}
							onchange={(e) => {
								const value = parseFloat((e.target as HTMLInputElement).value);
								if (!isNaN(value)) {
									price = Math.round(value * 10 ** config.currency.digits);
								}
							}}
						/>
						{#if config.currency.after}
							<span>{config.currency.after}</span>
						{/if}
					</div>
				</div>
				<div>
					<label
						for="variantNameOverridesName"
						class="block text-sm leading-6 font-medium text-gray-900"
					>
						Varianten-Name überschreibt Produkt-Name
					</label>
					<div class="mt-2">
						<label class="flex flex-row items-start gap-2 text-sm text-gray-500">
							<input
								type="checkbox"
								name="variantNameOverridesName"
								id="variantNameOverridesName"
								class="mt-1 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300"
								bind:checked={variantNameOverridesName}
							/>
							In den Bestellungen wird nur der Name der Variante angezeigt, nicht der Name des Produkts.
							Das ist nützlich, wenn die Varianten sehr unterschiedliche Namen haben, beispielsweise bei
							Getränken mit verschiedenen Geschmacksrichtungen.
						</label>
					</div>
				</div>
				<div>
					<label for="variants" class="block text-sm leading-6 font-medium text-gray-900"
						>Varianten</label
					>
					<div class="mt-2">
						{#if !product}
							<p class="text-sm text-gray-500">
								Varianten können nach dem Erstellen eines Produkts hinzugefügt werden.
							</p>
						{:else}
							<div class="mb-2 grid grid-cols-4 gap-2 empty:mb-0">
								{#each product.variants.filter((v) => !v.isArchived) as variant, i (variant.id)}
									{@const color: Color = variant.color ?? product.color ?? categories.find((c) => c.id === category)?.color ?? Color.red}
									<div class="flex w-full flex-col items-stretch">
										<button
											onclick={() => {
												editVariant = variant.id;
											}}
											type="button"
											class="relative aspect-square overflow-hidden rounded-md px-3.5 py-2.5 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
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
											<p class="pt-2 text-base">
												<FormattedCurrency
													showSign={true}
													amount={variant.priceDifference ?? 0}
													{config}
												/>
											</p>
										</button>
										<div class="-mt-2 flex justify-between">
											<button
												type="button"
												class="flex flex-row rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200"
												disabled={i === 0}
												onclick={async () => {
													await moveVariantLeft(variant.id);
												}}
												title="Nach links"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="1.5"
													stroke="currentColor"
													class="size-5"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
													/>
												</svg>
											</button>
											<button
												type="button"
												class="flex flex-row rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200"
												onclick={async () => {
													if (!confirm('Möchten Sie diese Variante wirklich löschen?')) return;
													await deleteVariant(variant.id);
												}}
												title="Variante löschen"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="1.5"
													stroke="currentColor"
													class="size-5"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
													/>
												</svg>
											</button>
											<button
												type="button"
												class="flex flex-row rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200"
												disabled={i === product.variants.filter((v) => !v.isArchived).length - 1}
												onclick={async () => {
													await moveVariantRight(variant.id);
												}}
												title="Nach rechts"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="1.5"
													stroke="currentColor"
													class="size-5"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
													/>
												</svg>
											</button>
										</div>
									</div>
								{/each}
							</div>
							<button
								type="button"
								class="flex flex-row gap-x-2 rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200"
								onclick={() => {
									editVariant = true;
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
								</svg>

								Variante hinzufügen
							</button>
							<ProductVariantModal
								{config}
								open={editVariant !== null}
								{product}
								variant={typeof editVariant === 'number'
									? product.variants.find((v) => v.id === editVariant)
									: undefined}
								onclose={() => {
									editVariant = null;
								}}
							/>
						{/if}
					</div>
				</div>
			</div>
			<div class="mt-8 flex flex-col justify-start gap-4">
				<button
					type="button"
					onclick={async () => {
						if (product) {
							if (
								await editProduct({
									id: product.id,
									name: name,
									color: color,
									price: price,
									categoryId: categoryId,
									hideInOrders: hideInOrders,
									variantNameOverridesName: variantNameOverridesName
								})
							) {
								onclose?.();
							}
						} else {
							if (
								await addProduct({
									name: name,
									color: color,
									price: price,
									categoryId: categoryId,
									hideInOrders: hideInOrders,
									variantNameOverridesName: variantNameOverridesName
								})
							) {
								onclose?.();
							}
						}
					}}
					class="w-full rounded-md bg-gray-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					Speichern
				</button>
				<button
					onclick={() => {
						onclose?.();
					}}
					type="button"
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
				>
					Abbrechen
				</button>
			</div>
		</div>
	</div>
{/if}
