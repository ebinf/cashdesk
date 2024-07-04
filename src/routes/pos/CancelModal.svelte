<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open: boolean = false;
</script>

{#if open}
	<div
		class="bg-black bg-opacity-40 rounded-xl backdrop-blur-sm absolute bottom-0 left-0 right-0 top-0 items-center justify-center flex"
	>
		<div class="max-w-2xl bg-gray-50 rounded-lg shadow-xl selection:overflow-hidden p-6">
			<div
				class="mx-auto flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-red-100"
			>
				<svg
					class="h-16 w-16 text-red-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
					/>
				</svg>
			</div>

			<div class="mt-4 text-center">
				<h1 class="font-semibold text-2xl leading-6 text-gray-900">Bestellung stornieren?</h1>
				<div class="mt-2">
					<p class="text-lg text-gray-500">
						Bist du sicher, dass du die Bestellung stornieren möchtest? Alle Artikel werden aus dem
						Warenkorb entfernt.
					</p>
				</div>
			</div>

			<div class="mt-5 grid grid-cols-2 gap-4">
				<button
					on:click={() => dispatch('delete')}
					type="button"
					class="w-full rounded-md bg-red-600 px-3.5 py-4 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
				>
					Bestellung stornieren
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
{/if}
