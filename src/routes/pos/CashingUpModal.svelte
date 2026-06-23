<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { getTotal } from '../commands.remote';

	interface Props {
		config: App.Config;
		open: boolean;
	}

	$effect(() => {
		if (open) {
			getTotal().refresh();
		}
	});

	let { open = $bindable(), config }: Props = $props();
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="w-4/5 max-w-2xl overflow-hidden rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">Kassensturz</h2>
			<div class="mt-4 mb-8 flex flex-col justify-start gap-4">
				{#await getTotal()}
					Lädt...
				{:then { total, byMethod }}
					<p class="mb-2 text-center text-sm text-gray-500">
						Stand: {new Date().toLocaleString()}
					</p>
					<table class="border-collapse">
						<thead>
							<tr class="border-b border-gray-300">
								<th class="w-1/4"></th>
								<th
									class="w-1/4 border-x border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700"
								>
									Bar
								</th>
								<th
									class="w-1/4 border-x border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700"
								>
									Kartenzahlung
								</th>
								<th class="w-1/4 bg-gray-200 px-4 py-2 text-right text-sm font-bold text-gray-900"
									>Gesamt</th
								>
							</tr>
						</thead>
						<tbody>
							<tr class="border-b border-gray-300">
								<td class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
									>Anzahl</td
								>
								<td class="border-x border-gray-300 px-4 py-2 text-right text-sm text-gray-700">
									{byMethod.find((m) => m.paymentMethod === 'cash')?._count._all || 0}
								</td>
								<td class="border-x border-gray-300 px-4 py-2 text-right text-sm text-gray-700">
									{byMethod.find((m) => m.paymentMethod === 'card')?._count._all || 0}
								</td>
								<td class="bg-gray-100 px-4 py-2 text-right text-sm font-bold text-gray-900"
									>{total._count._all}</td
								>
							</tr>
							<tr>
								<td class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
									>Betrag</td
								>
								<td class="border-x border-gray-300 px-4 py-2 text-right text-sm text-gray-700">
									<FormattedCurrency
										amount={byMethod.find((m) => m.paymentMethod === 'cash')?._sum.totalPrice || 0}
										showSign={true}
										{config}
									/>
								</td>
								<td class="border-x border-gray-300 px-4 py-2 text-right text-sm text-gray-700">
									<FormattedCurrency
										amount={byMethod.find((m) => m.paymentMethod === 'card')?._sum.totalPrice || 0}
										showSign={true}
										{config}
									/>
								</td>
								<td class="bg-gray-100 px-4 py-2 text-right text-sm font-bold text-gray-900">
									<FormattedCurrency amount={total._sum.totalPrice || 0} showSign={true} {config} />
								</td>
							</tr>
						</tbody>
					</table>
				{/await}
			</div>
			<button
				onclick={() => {
					open = false;
				}}
				type="button"
				class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
			>
				Schließen
			</button>
		</div>
	</div>
{/if}
