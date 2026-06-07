<script lang="ts">
	import type { Prisma } from '$lib/prisma/client';
	import { markOrderDone, markOrderItemDone, markOrderItemUnDone } from './commands.remote';

	interface Props {
		order: Prisma.OrderGetPayload<{
			include: {
				items: {
					include: {
						product: true;
						variant: true;
					};
				};
			};
		}>;
		filter?: number[] | null;
	}

	let { order, filter = null }: Props = $props();

	let confirm = $state(false);

	let now = $state(new Date());
	$effect(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});
	let timeSinceOrder = $derived((now.valueOf() - order.createdAt.valueOf()) / 1000);

	async function pressed() {
		if (confirm) {
			return await markOrderDone(order.id);
		}
		confirm = true;
		setTimeout(() => {
			confirm = false;
		}, 3000);
	}
</script>

<div class="w-full overflow-hidden rounded-xl bg-gray-50 shadow-2xl">
	<div class="bg-gray-200">
		<div class="flex flex-row items-center justify-between px-4 py-1">
			<div class="w-10 shrink-0 text-xl font-semibold text-gray-800">
				#{order.id}
			</div>
			<div class="shrink-0 text-lg text-gray-500">
				{new Date(order.createdAt).toLocaleTimeString()} Uhr
			</div>
			<div class="w-10 shrink-0 text-right text-lg text-gray-800">
				{#if timeSinceOrder >= 0}
					{Math.floor(timeSinceOrder / 60)}:{Math.floor(timeSinceOrder % 60)
						.toString()
						.padStart(2, '0')}
				{:else}
					{timeSinceOrder.toFixed(0)} s
				{/if}
			</div>
		</div>
	</div>
	<div class="divide-y divide-gray-300 text-3xl text-gray-800">
		{#each order.items.filter((item) => !filter || filter!.includes(item.productId)) as item (item.id)}
			{@const key = `${item.productId}${item.variantId ? `_${item.variantId}` : ''}`}
			<button
				class="w-full px-4 py-3 text-left"
				class:line-through={item.done}
				onclick={async () => {
					if (item.done) {
						await markOrderItemUnDone(item.id);
					} else {
						await markOrderItemDone(item.id);
					}
				}}
			>
				{#if item.amount > 1}
					<span class="font-bold">{item.amount}</span>
				{/if}
				<span
					>{@html item.product.name.replace(
						/\*(\S+)\*/g,
						'<span class="font-bold">$1</span>'
					)}</span
				>
				{#if item.variant}
					<span class="italic">{item.variant.name}</span>
				{/if}
			</button>
		{/each}
	</div>
	{#if !filter || filter.length === 0}
		<div>
			<button
				onclick={pressed}
				disabled={!!markOrderDone.pending}
				class:font-bold={confirm}
				class:font-semibold={!confirm}
				class="h-full w-full bg-green-100 py-3 text-lg text-green-500"
			>
				{#if !!markOrderDone.pending}
					<svg
						class="mx-auto my-0.5 size-6 animate-spin text-green-500"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				{:else if confirm}
					<span class:animate-pulse={confirm}> Erneut drücken zum Bestätigen </span>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="inline size-5"
					>
						<path
							fill-rule="evenodd"
							d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
							clip-rule="evenodd"
						/>
					</svg>
					Abgeschlossen
				{/if}
			</button>
		</div>
	{/if}
</div>
