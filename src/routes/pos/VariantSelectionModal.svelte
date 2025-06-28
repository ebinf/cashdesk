<script lang="ts">
	import FormattedCurrency from '$lib/FormattedCurrency.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let config: App.Config;
	export let openItem: App.Item | null = null;
</script>

{#if openItem !== null && openItem.variants}
	<div
		class="bg-black bg-opacity-40 rounded-xl backdrop-blur-sm absolute bottom-0 left-0 right-0 top-0 items-center justify-center flex"
	>
		<div class="bg-gray-50 w-4/5 rounded-lg max-w-2xl shadow-xl overflow-hidden p-4">
			<div class="flex flex-row gap-4 justify-start mb-4">
				{#each openItem.variants as variant}
					<button
						on:click={() => {
							dispatch('selected', {
								variant: variant
							});
						}}
						type="button"
						class="relative w-1/4 aspect-1 rounded-md bg-{variant.color}-600 px-3.5 py-2.5 text-white shadow-sm overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
					>
						<p class="text-xl font-semibold text-ellipsis overflow-hidden leading-tight">
							{@html variant.name.replace(
								/\*(\S+)\*/g,
								'<span class="font-extrabold italic">$1</span>'
							)}
						</p>
						{#if openItem.variants.some((v) => v.priceDifference !== undefined && v.priceDifference !== 0)}
							<p class="text-base pt-2">
								<FormattedCurrency showSign={true} amount={variant.priceDifference ?? 0} {config} />
							</p>
						{/if}
					</button>
				{/each}
			</div>
			<button
				on:click={() => dispatch('cancel')}
				type="button"
				class="w-full rounded-md bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 border-gray-300 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
			>
				Abbrechen
			</button>
		</div>
	</div>
{/if}
