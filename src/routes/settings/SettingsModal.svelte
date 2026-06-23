<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { editSettings } from './settings.remote';

	interface Props {
		config: App.Config;
		open: boolean;
	}

	let { open = $bindable(false), config }: Props = $props();

	let title: string | null | undefined = $derived(config.title);
	let itemsPerRow: number | null | undefined = $derived(config.itemsPerRow);
	let currencyPrefix: string | null = $derived(config.currency.before);
	let currencyDecimals: number | null = $derived(config.currency.digits);
	let currencySuffix: string | null = $derived(config.currency.after);
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="max-h-11/12 w-4/5 max-w-2xl overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">Einstellungen</h2>
			<div class="mt-4 flex flex-col gap-4">
				<div>
					<label for="title" class="block text-sm leading-6 font-medium text-gray-900">Titel</label>
					<div class="mt-2">
						<input
							type="text"
							name="title"
							id="title"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
							bind:value={title}
						/>
					</div>
				</div>
				<div>
					<label for="layout" class="block text-sm leading-6 font-medium text-gray-900"
						>Layout</label
					>
					<div class="mt-2">
						<select
							name="layout"
							id="layout"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
							bind:value={itemsPerRow}
						>
							{#each Array.from({ length: 9 }, (_, i) => i + 1) as num}
								<option value={num}>
									{num} Produkt{num !== 1 ? 'e' : ''} pro Zeile
								</option>
							{/each}
						</select>
					</div>
				</div>
				<div>
					<span class="block text-sm leading-6 font-medium text-gray-900">Währung</span>
					<div class="grid grid-cols-4 gap-2">
						<div>
							<label for="currencyPrefix" class="block text-sm leading-6 font-medium text-gray-900"
								>Präfix</label
							>
							<input
								type="text"
								name="currencyPrefix"
								id="currencyPrefix"
								class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
								bind:value={currencyPrefix}
							/>
						</div>
						<div>
							<label
								for="currencyDecimals"
								class="block text-sm leading-6 font-medium text-gray-900">Anzahl Stellen</label
							>
							<input
								id="currencyDecimals"
								type="number"
								min="0"
								max="20"
								step="1"
								class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
								bind:value={currencyDecimals}
							/>
						</div>
						<div>
							<label for="currencySuffix" class="block text-sm leading-6 font-medium text-gray-900"
								>Suffix</label
							>
							<input
								type="text"
								name="currencySuffix"
								id="currencySuffix"
								class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
								bind:value={currencySuffix}
							/>
						</div>
						<div>
							<span class="block text-sm leading-6 font-medium text-gray-900">Vorschau</span>
							<div class="block w-full py-1.5 text-gray-900">
								<FormattedCurrency
									config={{
										...config,
										currency: {
											before: currencyPrefix ?? '',
											digits: currencyDecimals ?? 2,
											after: currencySuffix ?? ''
										}
									}}
									amount={1234}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-8 flex flex-col justify-start gap-4">
				<button
					type="button"
					onclick={async () => {
						await editSettings({
							title: title ?? 'Kasse',
							itemsPerRow: itemsPerRow ?? 4,
							currency: {
								before: currencyPrefix ?? '',
								digits: currencyDecimals ?? 2,
								after: currencySuffix ?? ''
							}
						});
						open = false;
					}}
					class="w-full rounded-md bg-gray-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					Speichern
				</button>
				<button
					onclick={() => {
						open = false;
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
