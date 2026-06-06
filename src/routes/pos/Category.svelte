<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		open?: boolean;
		config: App.Config;
		children: Snippet;
	}

	let { title, open = true, config, children }: Props = $props();

	function items(offset: number = 0) {
		let itemsPerRow: number = config.itemsPerRow || 3;
		return Math.max(itemsPerRow - offset, 1).toFixed(0);
	}
</script>

<div class="px-2 py-2">
	<dt>
		<button
			type="button"
			class="flex w-full items-start text-left text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
			aria-controls="faq-0"
			aria-expanded="false"
			onclick={() => (open = !open)}
		>
			<span class="mx-2 flex h-7 items-center text-gray-400">
				<svg
					class="h-4 w-4"
					class:hidden={open}
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
				</svg>
				<svg
					class="h-4 w-4"
					class:hidden={!open}
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</span>
			<span class="text-sm leading-7 font-bold tracking-wider uppercase">{title}</span>
		</button>
	</dt>
	<dd class="mx-2 mt-2" class:hidden={!open}>
		<p
			class="grid xl:grid-cols-{items(0)} lg:grid-cols-{items(1)} md:grid-cols-{items(
				2
			)} sm:grid-cols-{items(3)} grid-cols-{items(4)} gap-2"
		>
			{@render children()}
		</p>
	</dd>
</div>
