<script lang="ts">
	import { PaymentStatus } from '$lib/enums';
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { cancelCardPayment, cardPaymentStatus, startCardPayment } from './cardPayment.remote';

	interface Props {
		open: boolean;
		totalPrice: number;
		config: App.Config;
		onpayed: () => Promise<void>;
		oncancel: (() => Promise<void>) | (() => void);
	}

	let { open = $bindable(false), totalPrice, config, onpayed, oncancel }: Props = $props();

	let submitting: boolean = $state(false);
	let paymentId: number | null = $state(null);
	let paymentStarting: boolean = $state(false);
	let status = $derived(paymentId ? cardPaymentStatus({ paymentId }) : null);

	$effect(() => {
		if (!open) return;
		if (!config.cardPayment?.sumUpIntegration?.enabled) return;
		if (!totalPrice || totalPrice <= 0) return;
		if (paymentId) return;
		if (paymentStarting) return;
		if (submitting) return;
		paymentStarting = true;
		startCardPayment({ total: totalPrice }).then((id) => {
			if (!id) {
				paymentStarting = false;
				return;
			}
			paymentId = id;
			paymentStarting = false;
		});
	});

	$effect(() => {
		if (!status) return;
		if (!status.current) return;
		if (submitting) return;
		if (status.current === PaymentStatus.completed) {
			submitting = true;
			onpayed().then(() => {
				setTimeout(() => {
					open = false;
					submitting = false;
					paymentId = null;
				}, 2000);
			});
		}
	});
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="w-2xl rounded-lg bg-gray-50 p-6 shadow-xl selection:overflow-hidden">
			<div
				class="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1"
					stroke="currentColor"
					class="size-16 text-blue-600"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
					/>
				</svg>
			</div>

			<div class="mt-4 text-center">
				<h1 class="text-2xl leading-6 font-semibold text-gray-900">Kartenzahlung</h1>
				{#if totalPrice !== null && totalPrice !== undefined && totalPrice > 0}
					<h2 class="mt-1 text-xl leading-6 text-gray-600">
						Zu zahlen:
						<span class="font-bold">
							<FormattedCurrency amount={totalPrice} {config} />
						</span>
					</h2>
				{/if}
				{#if config.cardPayment?.sumUpIntegration?.enabled}
					{@const currentStatus = await status}
					{#if currentStatus !== null}
						<div class="mt-4 inline-flex items-center gap-2">
							{#if ([PaymentStatus.waitingForTerminal, PaymentStatus.starting, PaymentStatus.waitingForCard, PaymentStatus.waitingForPin, PaymentStatus.waitingForSignature, PaymentStatus.processing] as PaymentStatus[]).includes(currentStatus)}
								<svg
									class="mx-auto my-0.5 size-5 animate-spin text-gray-500"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								<p class="text-lg text-gray-500">
									{#if currentStatus === PaymentStatus.waitingForTerminal}
										Warte auf Terminal...
									{:else if currentStatus === PaymentStatus.starting}
										Zahlung wird gestartet...
									{:else if currentStatus === PaymentStatus.waitingForCard}
										Warte auf Karte...
									{:else if currentStatus === PaymentStatus.waitingForPin}
										Warte auf PIN...
									{:else if currentStatus === PaymentStatus.waitingForSignature}
										Warte auf Unterschrift...
									{:else if currentStatus === PaymentStatus.processing}
										Zahlung wird verarbeitet...
									{/if}
								</p>
							{:else if ([PaymentStatus.failed, PaymentStatus.cancelled, PaymentStatus.error] as PaymentStatus[]).includes(currentStatus)}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5 text-red-500"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
									/>
								</svg>

								<p class="text-lg text-red-500">
									{#if currentStatus === PaymentStatus.cancelled}
										Zahlung wurde abgebrochen.
									{:else if currentStatus === PaymentStatus.failed}
										Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.
									{:else if currentStatus === PaymentStatus.error}
										Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
									{/if}
								</p>
							{:else if currentStatus === PaymentStatus.completed}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5 text-green-600"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
								</svg>
								<p class="text-lg text-green-600">Zahlung erfolgreich!</p>
							{/if}
						</div>
					{/if}
				{:else}
					<p class="text-lg text-gray-500">
						Bitte führen Sie die Zahlung am Kartenterminal durch und bestätigen Sie anschließend die
						Zahlung.
					</p>
				{/if}
			</div>

			<div class="mt-5 flex flex-col gap-4">
				{#if !config.cardPayment?.sumUpIntegration?.enabled}
					<button
						type="button"
						onclick={async () => {
							submitting = true;
							await onpayed();
							open = false;
							submitting = false;
						}}
						class="w-full rounded-md bg-gray-600 px-3.5 py-10 text-2xl font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{#if submitting}
							<svg
								class="mx-auto my-0.5 size-7 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						{:else}
							Bezahlung erfolgt
						{/if}
					</button>
				{/if}
				<button
					onclick={async () => {
						submitting = true;
						if (paymentId) {
							await cancelCardPayment({ paymentId });
						}
						paymentId = null;
						await oncancel();
						submitting = false;
						open = false;
					}}
					disabled={submitting}
					type="button"
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200"
				>
					Abbrechen
				</button>
			</div>
		</div>
	</div>
{/if}
