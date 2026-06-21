<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { getTotal } from '../commands.remote';

	interface Props {
		config: App.Config;
		open: boolean;
	}

	let total: number | null = $state(null);

	let { open = $bindable(), config }: Props = $props();

	$effect(() => {
		if (!open) {
			total = null;
		}
	});
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="w-4/5 max-w-2xl overflow-hidden rounded-lg bg-gray-50 p-4 shadow-xl">
			<div class="mb-8 flex flex-col justify-start gap-4">
				<button
					type="button"
					onclick={() => {
						if (
							!document.fullscreenElement &&
							// @ts-ignore
							!document.mozFullScreenElement &&
							// @ts-ignore
							!document.webkitFullscreenElement
						) {
							if (document.documentElement.requestFullscreen) {
								document.documentElement.requestFullscreen();
							} else if (
								// @ts-ignore
								document.documentElement.mozRequestFullScreen
							) {
								// @ts-ignore
								document.documentElement.mozRequestFullScreen();
							} else if (
								// @ts-ignore
								document.documentElement.webkitRequestFullscreen
							) {
								// @ts-ignore
								document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
							}
						} else {
							if (
								// @ts-ignore
								document.cancelFullScreen
							) {
								// @ts-ignore
								document.cancelFullScreen();
							} else if (
								// @ts-ignore
								document.mozCancelFullScreen
							) {
								// @ts-ignore
								document.mozCancelFullScreen();
							} else if (
								// @ts-ignore
								document.webkitCancelFullScreen
							) {
								// @ts-ignore
								document.webkitCancelFullScreen();
							}
						}
					}}
					class="w-full rounded-md bg-gray-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					Vollbild umschalten
				</button>
				<a
					href="/settings"
					class="w-full rounded-md bg-gray-600 px-3.5 py-4.5 text-center text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					Produkte bearbeiten
				</a>
				<button
					type="button"
					onclick={async () => {
						await getTotal().refresh();
						total = await getTotal();
					}}
					class="w-full rounded-md bg-gray-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					Kassensturz{#if total}: <FormattedCurrency amount={total} showSign={true} {config} />{/if}
				</button>
			</div>
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
{/if}
