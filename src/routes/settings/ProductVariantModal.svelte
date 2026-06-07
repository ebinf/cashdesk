<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { type Prisma } from '$lib/prisma/client';
	import { Color } from '$lib/prisma/enums';
	import { addVariant, editVariant } from './settings.remote';

	interface Props {
		config: App.Config;
		product?: Prisma.ProductGetPayload<{
			include: {
				variants: true;
			};
		}>;
		variant?: Prisma.VariantGetPayload<{}>;
		open: boolean;
		onclose?: () => void;
	}

	let { open = $bindable(), config, product, variant, onclose }: Props = $props();

	let color: Color | undefined = $derived(variant?.color ?? undefined);
	let name: string = $derived(variant?.name ?? '');
	let priceDifference: number = $derived(variant?.priceDifference ?? 0);
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="w-4/5 max-w-2xl overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">
				{variant ? 'Produkt-Variante bearbeiten' : 'Produkt-Variante hinzufügen'}
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
					<label for="priceDifference" class="block text-sm leading-6 font-medium text-gray-900"
						>Preis-Differenz</label
					>
					<div class="mt-2 flex flex-row items-center gap-2">
						{#if config.currency.before}
							<span>{config.currency.before}</span>
						{/if}
						<input
							type="number"
							name="priceDifference"
							id="priceDifference"
							step="0.{'0'.repeat(config.currency.digits - 1)}1"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
							value={(priceDifference / 100).toFixed(config.currency.digits)}
							onchange={(e) => {
								const value = parseFloat((e.target as HTMLInputElement).value);
								if (!isNaN(value)) {
									priceDifference = Math.round(value * 100);
								}
							}}
						/>
						{#if config.currency.after}
							<span>{config.currency.after}</span>
						{/if}
					</div>
					<span class="mt-2 block text-sm text-gray-500">
						Gesamtpreis:
						<span class="rounded bg-gray-200 px-1 py-0.5 text-black">
							<FormattedCurrency amount={(product?.price ?? 0) + priceDifference} {config} />
						</span>
					</span>
				</div>
			</div>
			<div class="mt-8 flex flex-col justify-start gap-4">
				<button
					type="button"
					onclick={async () => {
						if (variant) {
							if (
								await editVariant({
									id: variant.id,
									name: name,
									color: color,
									priceDifference: priceDifference,
									productId: product!.id
								})
							) {
								onclose?.();
							}
						} else {
							if (
								await addVariant({
									name: name,
									color: color,
									priceDifference: priceDifference,
									productId: product!.id
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
