<script lang="ts">
	import ItemButton from './ItemButton.svelte';
	import Category from './Category.svelte';
	import CategoryList from './CategoryList.svelte';
	import Receipt from './Receipt.svelte';
	import PayModal from './PayModal.svelte';
	import OrderPanel from './OrderPanel.svelte';
	import { onMount } from 'svelte';
	import CancelModal from './CancelModal.svelte';
	import { config } from '$lib/store';
	import { goto } from '$app/navigation';

	if (!$config) {
		goto('/');
	}

	const data: { config: App.Config } = {
		config: $config
	};

	let orderNumber: number = 0;

	let orderBacklog: App.Order[] = [];

	let currentOrder: Map<string, number> = new Map();
	$: totalPrice = Array.from(currentOrder.entries()).reduce(
		(acc, [key, value]) =>
			acc +
			data.config.categories.flatMap((category) => category.items).find((item) => item.id === key)
				?.price! *
				value,
		0
	);

	let payModalOpen: boolean = false;
	let cancelModalOpen: boolean = false;

	const addItem = (item: App.Item) => {
		if (currentOrder.has(item.id)) {
			currentOrder.set(item.id, currentOrder.get(item.id)! + 1);
		} else {
			currentOrder.set(item.id, 1);
		}
		currentOrder = new Map(currentOrder);
	};

	const removeItem = (item: App.Item | undefined) => {
		if (!item) return;
		if (!currentOrder.has(item.id)) return;
		if (currentOrder.get(item.id)! <= 1) {
			currentOrder.delete(item.id);
		} else {
			currentOrder.set(item.id, currentOrder.get(item.id)! - 1);
		}
		currentOrder = new Map(currentOrder);
	};

	const clearOrder = () => {
		currentOrder = new Map();
	};

	const submitOrder = () => {
		orderNumber++;
		orderBacklog.push({
			id: orderNumber,
			timestamp: Date.now(),
			totalPrice: totalPrice,
			items: Object.fromEntries(currentOrder.entries())
		});
		orderBacklog = [...orderBacklog];
		currentOrder = new Map();
	};

	let now: Date = new Date();

	onMount(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="flex flex-row h-full gap-10">
	<div class="bg-gray-50 w-3/4 rounded-xl shadow-2xl flex flex-row relative">
		<div class="w-2/3 flex flex-col">
			<div class="flex flex-row text-2xl font-semibold text-gray-800 p-4 border-b border-gray-200">
				<p class="grow">
					<img src="/logo.svg" alt="Logo" class="h-8 inline" />
					{data.config.title ?? 'Kasse'}
				</p>
				<div class="text-right font-normal">{now.toLocaleTimeString()}</div>
			</div>
			<div class="overflow-y-auto">
				<CategoryList>
					{#each data.config.categories as category}
						<Category title={category.name} open={true} config={data.config}>
							{#each category.items as item (item.id)}
								<ItemButton
									{item}
									color={category.color}
									amount={currentOrder.get(item.id) ?? 0}
									config={data.config}
									on:click={() => addItem(item)}
								/>
							{/each}
						</Category>
					{/each}
				</CategoryList>
			</div>
		</div>
		<div class="w-1/3 bg-gray-200 h-full rounded-r-xl flex flex-col divide-y divide-gray-300">
			<div class="p-4 grow overflow-hidden">
				<Receipt
					{currentOrder}
					{totalPrice}
					config={data.config}
					on:remove={(event) => {
						removeItem(event.detail);
					}}
				/>
			</div>
			<div class="p-4 flex flex-col gap-4">
				<button
					on:click={() => (payModalOpen = true)}
					disabled={currentOrder.size === 0}
					type="button"
					class="w-full rounded-md bg-gray-600 px-3.5 py-10 text-2xl font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					Abschließen & Bezahlen
				</button>
				<button
					on:click={() => (cancelModalOpen = true)}
					disabled={currentOrder.size === 0}
					type="button"
					class="w-full rounded-md bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 border-gray-300 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:bg-gray-200 disabled:cursor-not-allowed"
				>
					Alles stornieren
				</button>
			</div>
		</div>
		<CancelModal
			open={cancelModalOpen}
			on:cancel={() => (cancelModalOpen = false)}
			on:delete={() => {
				cancelModalOpen = false;
				clearOrder();
			}}
		/>
		<PayModal
			config={data.config}
			{totalPrice}
			open={payModalOpen}
			on:payed={() => {
				payModalOpen = false;
				submitOrder();
			}}
			on:cancel={() => (payModalOpen = false)}
		/>
	</div>
	<div class="w-1/3 space-y-4 -mt-5 overflow-y-auto -mb-5 -mr-5 p-5">
		{#each orderBacklog as order (order.id)}
			<OrderPanel
				{order}
				config={data.config}
				on:done={() => (orderBacklog = orderBacklog.filter((iorder) => iorder.id != order.id))}
			/>
		{/each}
	</div>
</div>
