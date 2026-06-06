<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';

	interface Props {
		open: boolean;
		totalPrice: number;
		config: App.Config;
		onpayed: () => void;
		oncancel: () => void;
	}

	let { open, totalPrice, config, onpayed, oncancel }: Props = $props();

	let payed: number = $state(0);
	let paymentLeft: number = $derived(totalPrice - payed);

	const paymentOptions = [50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];
	let smartPaymentOptions: number[] = $state([]);
	$effect(() => {
		let smartPaymentOptionsSet = new Set<number>();
		paymentOptions
			.filter((option) => option * 100 < totalPrice)
			.forEach((option) => {
				let priceDifference = totalPrice - option * 100;
				let current = option * 100;
				while (priceDifference > 0) {
					priceDifference -= option * 100;
					current += option * 100;
				}
				smartPaymentOptionsSet.add(current * 100);
			});
		paymentOptions.forEach((option) => {
			smartPaymentOptionsSet.delete(option * 100);
		}); // Remove exact payment options to avoid confusion
		smartPaymentOptionsSet.add(totalPrice * 100); // Always include the total price as an option
		smartPaymentOptionsSet.delete(0); // Remove zero to avoid confusion
		smartPaymentOptions = Array.from(smartPaymentOptionsSet)
			.sort((a, b) => a - b)
			.map((value) => value / 100);
	});
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="grid w-4/5 grid-cols-2 overflow-hidden rounded-lg bg-gray-50 shadow-xl">
			<div class="flex flex-col gap-y-4 p-4">
				<div class="grow">
					<div class="grid grid-cols-2 gap-4">
						{#each [50, 20, 10, 5] as amount}
							<button
								onclick={() => (payed += amount * 100)}
								type="button"
								class="aspect-2/1 overflow-hidden shadow-xl"
							>
								<img
									src={`/money/${amount.toFixed(config.currency.digits)}.jpg`}
									alt={amount.toFixed(config.currency.digits)}
									class="h-full w-full object-cover"
								/>
								<span class="sr-only">
									<FormattedCurrency amount={amount * 100} {config} />
								</span>
							</button>
						{/each}
					</div>
					<div class="mt-4 grid grid-cols-4 gap-4">
						{#each [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01] as amount}
							<button
								onclick={() => (payed += amount * 100)}
								type="button"
								class="aspect-square overflow-hidden rounded-full shadow-xl"
							>
								<img
									src={`/money/${amount.toFixed(config.currency.digits)}.jpg`}
									alt={amount.toFixed(config.currency.digits)}
									class="h-full w-full object-cover"
								/>
								<span class="sr-only">
									<FormattedCurrency amount={amount * 100} {config} />
								</span>
							</button>
						{/each}
					</div>
				</div>
				<div class="flex flex-row flex-wrap gap-3">
					{#each smartPaymentOptions as smartPaymentOption}
						<button
							onclick={() => (payed = smartPaymentOption)}
							type="button"
							class="rounded-md bg-gray-600 px-3.5 py-4 text-base font-semibold text-white shadow-sm first:bg-green-700 first:px-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
						>
							<FormattedCurrency amount={smartPaymentOption} {config} />
						</button>
					{/each}
				</div>
				<div>
					<button
						onclick={() => (payed = 0)}
						type="button"
						class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
					>
						Löschen
					</button>
				</div>
			</div>
			<div class="flex flex-col justify-between bg-gray-200 p-4">
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
						onclick={() => {
							open = false;
							payed = 0;
							onpayed();
						}}
						class="w-full rounded-md bg-gray-600 px-3.5 py-10 text-2xl font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						Bestellung abschließen
					</button>
					<button
						onclick={oncancel}
						type="button"
						class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
					>
						Abbrechen
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
