<script lang="ts">
	import type { Prisma } from '$lib/prisma/client';
	import {
		getActiveOrders,
		markOrderDone,
		markOrderItemDone,
		markOrderItemUnDone
	} from './commands.remote';

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
		ondone: () => void;
	}

	let { order, ondone }: Props = $props();

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
			<div class="text-xl font-semibold text-gray-800">
				#{order.id}
			</div>
			<div class="flex flex-row items-center gap-4">
				<div class="text-lg text-gray-500">
					{new Date(order.createdAt).toLocaleTimeString()} Uhr
				</div>
				<div class="text-lg text-gray-800">
					{#if timeSinceOrder >= 60}
						{(timeSinceOrder / 60).toPrecision(3)} min
					{:else}
						{timeSinceOrder.toFixed(0)} s
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="divide-y divide-gray-300 text-3xl text-gray-800">
		{#each order.items as item (item.id)}
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
	<div>
		<button
			onclick={pressed}
			disabled={!!markOrderDone.pending}
			class:font-bold={confirm}
			class:font-semibold={!confirm}
			class:animate-pulse={confirm}
			class="h-full w-full bg-green-100 py-3 text-lg text-green-500"
		>
			{#if !!markOrderDone.pending}
				Lädt...
			{:else if confirm}
				Erneut drücken zum Bestätigen
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
</div>
