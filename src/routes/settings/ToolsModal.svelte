<script lang="ts">
	import {
		cancelDanglingCardPayments,
		deleteAllOrders,
		deleteFloatingOrders
	} from './settings.remote';

	interface Props {
		config: App.Config;
		open: boolean;
	}

	let { open = $bindable(false), config }: Props = $props();

	let submitting = $state(false);
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="max-h-11/12 w-4/5 max-w-2xl overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">Werkzeuge</h2>
			<div class="mt-4 flex flex-col justify-start gap-4">
				<button
					type="button"
					disabled={submitting}
					onclick={async () => {
						if (
							confirm(
								'Sind Sie sicher, dass Sie alle hängenden Kartenzahlungen abbrechen möchten? Stellen Sie sicher, dass aktuell keine Kartenzahlung läuft, bevor Sie fortfahren.'
							)
						) {
							submitting = true;
							await cancelDanglingCardPayments();
							submitting = false;
						}
					}}
					class="w-full rounded-md bg-yellow-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-yellow-300"
				>
					Hängende Kartenzahlungen abbrechen
				</button>
				<button
					type="button"
					disabled={submitting}
					onclick={async () => {
						if (
							confirm(
								'Sind Sie sicher, dass Sie alle ausstehenden (noch nicht bezahlten) Bestellungen löschen möchten? Sobald sich ein Warenkorb ändert, wird sie wieder als ausstehende Bestellung angezeigt.'
							)
						) {
							submitting = true;
							await deleteFloatingOrders();
							submitting = false;
						}
					}}
					class="w-full rounded-md bg-yellow-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-yellow-300"
				>
					Ausstehende Bestellungen löschen
				</button>
				<button
					type="button"
					disabled={submitting}
					onclick={async () => {
						if (
							confirm(
								'Sind Sie sicher, dass Sie alle Bestellungen löschen möchten? Der Kassenstand wird auf 0 zurückgesetzt. Alle Bestellungen gehen verloren. Kategorien und Artikel bleiben erhalten. Diese Aktion kann nicht rückgängig gemacht werden.'
							)
						) {
							if (
								confirm(
									'Der Kassenstand wird auf 0 zurückgesetzt. Alle Bestellungen gehen verloren. Möchten Sie wirklich fortfahren?'
								)
							) {
								submitting = true;
								await deleteAllOrders();
								submitting = false;
							}
						}
					}}
					class="w-full rounded-md bg-red-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-red-300"
				>
					Alle Bestellungen löschen & Kassenstand zurücksetzen
				</button>
			</div>
			<div class="mt-8 flex flex-col justify-start gap-4">
				<button
					disabled={submitting}
					onclick={() => {
						open = false;
					}}
					type="button"
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200"
				>
					Abbrechen
				</button>
			</div>
		</div>
	</div>
{/if}
