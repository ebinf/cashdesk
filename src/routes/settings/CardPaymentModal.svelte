<script lang="ts">
	import { editCardPayment } from './settings.remote';

	interface Props {
		config: App.Config;
		open: boolean;
	}

	let { open = $bindable(false), config }: Props = $props();

	let enableCardPayment: boolean = $derived(config.cardPayment?.enabled ?? false);
	let enableSumUpIntegration: boolean = $derived(
		config.cardPayment?.sumUpIntegration?.enabled ?? false
	);
	let sumUpAccessToken: string = $derived(config.cardPayment?.sumUpIntegration?.accessToken ?? '');
	let sumUpMerchantCode: string = $derived(
		config.cardPayment?.sumUpIntegration?.merchantCode ?? ''
	);
	let sumUpReaderId: string = $derived(config.cardPayment?.sumUpIntegration?.readerId ?? '');
	let sumUpCurrency: string = $derived(config.cardPayment?.sumUpIntegration?.currency ?? 'EUR');
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="max-h-11/12 w-4/5 max-w-2xl overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">Kartenzahlung</h2>
			<div class="mt-4 flex flex-col gap-4">
				<div>
					<label for="enableCardPayment" class="block text-sm leading-6 font-medium text-gray-900">
						Kartenzahlung aktivieren
					</label>
					<div class="mt-2">
						<label class="flex flex-row items-start gap-2 text-sm text-gray-500">
							<input
								type="checkbox"
								name="enableCardPayment"
								id="enableCardPayment"
								class="mt-1 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300"
								bind:checked={enableCardPayment}
							/>
							Kartenzahlung wird als Zahlungsmöglichkeit in der Kasse angezeigt. Ohne Einrichtung der
							SumUp-Integration unten müssen die Zahlungen manuell über das Kartenterminal abgewickelt
							und anschließend bestätigt werden.
						</label>
					</div>
				</div>
				{#if enableCardPayment}
					<hr class="border-gray-300" />
					<h3 class="text-lg font-medium text-gray-800">SumUp-Integration</h3>
					<div>
						<label
							for="enableSumUpIntegration"
							class="block text-sm leading-6 font-medium text-gray-900"
						>
							SumUp-Integration aktivieren
							<span class="text-xs text-gray-500">(optional)</span>
						</label>
						<div class="mt-2">
							<label class="flex flex-row items-start gap-2 text-sm text-gray-500">
								<input
									type="checkbox"
									name="enableSumUpIntegration"
									id="enableSumUpIntegration"
									class="mt-1 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300"
									bind:checked={enableSumUpIntegration}
								/>
								Kartenzahlungen werden automatisch über SumUp abgewickelt. Nach Abschluss der Zahlung
								wird die Bestellung automatisch als bezahlt markiert.
							</label>
						</div>
					</div>
					{#if enableSumUpIntegration}
						<div>
							<label
								for="sumUpAccessToken"
								class="block text-sm leading-6 font-medium text-gray-900"
							>
								API-Schlüssel
							</label>
							<div class="mt-2">
								<input
									type="password"
									name="sumUpAccessToken"
									id="sumUpAccessToken"
									class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
									bind:value={sumUpAccessToken}
								/>
							</div>
						</div>
						<div>
							<label
								for="sumUpMerchantCode"
								class="block text-sm leading-6 font-medium text-gray-900"
							>
								Händler-Account
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="sumUpMerchantCode"
									id="sumUpMerchantCode"
									class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
									bind:value={sumUpMerchantCode}
								/>
							</div>
						</div>
						<div>
							<label for="sumUpReaderId" class="block text-sm leading-6 font-medium text-gray-900">
								Kartenterminal-ID
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="sumUpReaderId"
									id="sumUpReaderId"
									class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
									bind:value={sumUpReaderId}
								/>
							</div>
						</div>
						<div>
							<label for="sumUpCurrency" class="block text-sm leading-6 font-medium text-gray-900">
								Währungs-Code
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="sumUpCurrency"
									id="sumUpCurrency"
									class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
									bind:value={sumUpCurrency}
								/>
							</div>
							<span class="mt-2 block text-sm text-gray-500">
								ISO 4217 Währungs-Code, z. B.
								<code class="rounded bg-gray-200 px-1 py-0.5 text-gray-800">EUR</code>
								oder
								<code class="rounded bg-gray-200 px-1 py-0.5 text-gray-800">USD</code>
							</span>
						</div>
					{/if}
				{/if}
			</div>
			<div class="mt-8 flex flex-col justify-start gap-4">
				<button
					type="button"
					onclick={async () => {
						await editCardPayment({
							enabled: enableCardPayment,
							sumUpIntegration: {
								enabled: enableSumUpIntegration,
								accessToken: sumUpAccessToken,
								merchantCode: sumUpMerchantCode,
								readerId: sumUpReaderId,
								currency: sumUpCurrency
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
