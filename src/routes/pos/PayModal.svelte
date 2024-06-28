<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open: boolean = false;
	export let totalPrice: number;
	export let config: App.Config;

	let payed: number = 0;
	$: paymentLeft = totalPrice - payed;
</script>

{#if open}
	<div
		class="bg-black bg-opacity-40 backdrop-blur-sm absolute bottom-0 left-0 right-0 top-0 items-center justify-center flex"
	>
		<div class="bg-gray-50 w-4/5 rounded-lg shadow-xl grid grid-cols-2 overflow-hidden">
			<div class="p-4 flex flex-col">
				<div class="grow">
					<div class="grid grid-cols-2 gap-4">
						{#each [50, 20, 10, 5] as amount}
							<button
								on:click={() => (payed += amount)}
								type="button"
								class=" aspect-2 shadow-xl bg-money-{amount.toFixed(
									config.currency.digits
								)} bg-cover"
							></button>
						{/each}
					</div>
					<div class="grid grid-cols-4 gap-4 mt-4">
						{#each [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01] as amount}
							<button
								on:click={() => (payed += amount)}
								type="button"
								class=" aspect-1 rounded-full shadow-xl bg-money-{amount.toFixed(
									config.currency.digits
								)} bg-cover"
							></button>
						{/each}
					</div>
				</div>
				<div class="mt-4">
					<button
						on:click={() => (payed = 0)}
						type="button"
						class="w-full rounded-md bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 border-gray-300 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
					>
						Löschen
					</button>
				</div>
			</div>
			<div class="p-4 flex flex-col justify-between bg-gray-200">
				<dl class="mb-12 space-y-6 text-2xl font-medium text-gray-900">
					<div class="flex items-center justify-between">
						<dt class="text-gray-700">Zwischensumme</dt>
						<dd><FormattedCurrency amount={totalPrice} {config} /></dd>
					</div>

					<div class="flex items-center justify-between">
						<dt class="text-gray-700">Gegeben</dt>
						<dd><FormattedCurrency amount={payed} {config} /></dd>
					</div>

					<div class="flex items-center justify-between border-t border-gray-300 pt-4">
						<dt class="text-3xl">
							{#if paymentLeft >= 0}Noch zu zahlen{:else}Rückgeld{/if}
						</dt>
						<dd class="text-3xl"><FormattedCurrency amount={paymentLeft} {config} /></dd>
					</div>
				</dl>
				<div class="flex flex-col gap-4">
					<button
						type="button"
						disabled={Math.round(paymentLeft * 100) > 0}
						on:click={() => {
							open = false;
							payed = 0;
							dispatch('payed');
						}}
						class="w-full rounded-md bg-gray-600 px-3.5 py-10 text-2xl font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						Bestellung abschließen
					</button>
					<button
						on:click={() => dispatch('cancel')}
						type="button"
						class="w-full rounded-md bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 border-gray-300 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
					>
						Abbrechen
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
