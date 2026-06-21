<script lang="ts">
	import { onMount } from 'svelte';
	import CategoryList from './CategoryList.svelte';
	import Category from './Category.svelte';
	import type { PageData } from './$types';
	import ItemButton from './ItemButton.svelte';
	import type { Prisma, Product, Variant } from '$lib/prisma/client';
	import VariantSelectionModal from './VariantSelectionModal.svelte';
	import CancelModal from './CancelModal.svelte';
	import { getOrderItem } from '$lib/utils';
	import Receipt from './Receipt.svelte';
	import PayModal from './PayModal.svelte';
	import {
		addItemToFloatingOrder,
		clearFloatingOrder,
		getActiveOrders,
		getFloatingOrders,
		keepAliveFloatingOrder,
		newFloatingOrder,
		removeItemFromFloatingOrder,
		submitFloatingOrder,
		submitOrder,
		updateItemAmountInFloatingOrder
	} from '../commands.remote';
	import OrderPanel from '../OrderPanel.svelte';
	import FloatingOrderPanel from '../FloatingOrderPanel.svelte';
	import { onNavigate } from '$app/navigation';
	import { browser } from '$app/env';
	import SettingsModal from './SettingsModal.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showSettings: boolean = $state(false);
	let variantOpenItemId: number | null = $state(null);
	let variantOpenItem: Prisma.ProductGetPayload<{ include: { variants: true } }> | null = $derived(
		variantOpenItemId
			? (data.categories.flatMap((c) => c.products).find((p) => p.id === variantOpenItemId) ?? null)
			: null
	);
	let payModalOpen: boolean = $state(false);
	let cancelModalOpen: boolean = $state(false);

	let floatingOrderId: number | null = null;
	let floatingOrderInterval: NodeJS.Timeout | null = null;

	let currentOrder: Map<string, number> = $state(new Map());
	let totalPrice = $derived(
		Array.from(currentOrder.entries()).reduce((acc, [key, value]) => {
			const [productId, variantId] = key.split('_').map(Number);
			const product = getOrderItem(data.categories, productId, variantId);
			if (product) {
				acc += product.price * value;
			}
			return acc;
		}, 0)
	);

	const clearOrder = async () => {
		currentOrder = new Map();
		resetFloatingOrder();
	};

	async function setupNewFloatingOrder() {
		if (floatingOrderId) return;
		floatingOrderId = await newFloatingOrder();
		floatingOrderInterval = setInterval(() => {
			if (floatingOrderId) {
				keepAliveFloatingOrder(floatingOrderId);
			}
		}, 10 * 1000);
		for (const [key, amount] of currentOrder.entries()) {
			const [productId, variantId] = key.split('_').map(Number);
			await updateItemAmountInFloatingOrder({
				orderId: floatingOrderId!,
				productId,
				variantId: isNaN(variantId) ? undefined : variantId,
				amount
			});
		}
	}

	function resetFloatingOrder() {
		if (!floatingOrderId) return;
		clearFloatingOrder(floatingOrderId);
		floatingOrderId = null;
		if (floatingOrderInterval) {
			clearInterval(floatingOrderInterval);
			floatingOrderInterval = null;
		}
	}

	const addItem = async (product: Product, variant?: Variant) => {
		if (!floatingOrderId) {
			await setupNewFloatingOrder();
		}
		const index = `${product.id}${variant ? `_${variant.id}` : ''}`;
		if (currentOrder.has(index)) {
			currentOrder.set(index, currentOrder.get(index)! + 1);
			if (
				(await updateItemAmountInFloatingOrder({
					orderId: floatingOrderId!,
					productId: product.id,
					variantId: variant?.id,
					amount: currentOrder.get(index)!
				})) === false
			) {
				await setupNewFloatingOrder();
			}
		} else {
			currentOrder.set(index, 1);
			if (
				(await addItemToFloatingOrder({
					orderId: floatingOrderId!,
					productId: product.id,
					variantId: variant?.id
				})) === false
			) {
				await setupNewFloatingOrder();
			}
		}
		currentOrder = new Map(currentOrder);
	};

	const removeItem = async (product: number, variant?: number) => {
		const index = `${product}${variant ? `_${variant}` : ''}`;
		if (!currentOrder.has(index)) return;
		if (!floatingOrderId) {
			await setupNewFloatingOrder();
		}
		if (currentOrder.get(index)! <= 1) {
			currentOrder.delete(index);
			if (
				(await removeItemFromFloatingOrder({
					orderId: floatingOrderId!,
					productId: product,
					variantId: variant
				})) === false
			) {
				await setupNewFloatingOrder();
			}
		} else {
			currentOrder.set(index, currentOrder.get(index)! - 1);
			if (
				(await updateItemAmountInFloatingOrder({
					orderId: floatingOrderId!,
					productId: product,
					variantId: variant,
					amount: currentOrder.get(index)!
				})) === false
			) {
				await setupNewFloatingOrder();
			}
		}
		currentOrder = new Map(currentOrder);
	};

	let now: Date = $state(new Date());
	onMount(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	onNavigate(async () => {
		resetFloatingOrder();
	});

	if (browser) {
		window.onbeforeunload = async (event) => {
			resetFloatingOrder();
		};
	}
</script>

<div class="flex h-full flex-row gap-10">
	<div class="relative flex w-3/4 flex-row rounded-xl bg-gray-50 shadow-2xl">
		<div class="flex w-3/4 flex-col">
			<div class="flex flex-row border-b border-gray-200 p-4 text-2xl font-semibold text-gray-800">
				<p class="flex grow items-center gap-2">
					<button onclick={() => (showSettings = true)}>
						<img src="/logo.svg" alt="Logo" class="inline h-8" />
					</button>
					{data.config.title ?? 'Kasse'}
				</p>
				<div class="text-right font-normal">{now.toLocaleTimeString('de-DE')}</div>
			</div>
			<div class="overflow-y-auto">
				<CategoryList>
					{#each data.categories.filter((c) => !c.isArchived && c.products.some((p) => !p.isArchived)) as category}
						<Category title={category.name} config={data.config}>
							{#each category.products.filter((p) => !p.isArchived) as item (item.id)}
								{@const amount = currentOrder.get(`${item.id}`) ?? 0}
								{@const variantAmount = item.variants
									? item.variants.reduce((sum, variant) => {
											return sum + (currentOrder.get(`${item.id}_${variant.id}`) ?? 0);
										}, 0)
									: 0}
								<ItemButton
									{item}
									color={category.color}
									amount={amount + variantAmount}
									config={data.config}
									onclick={() => {
										if (item.variants.length > 0) {
											variantOpenItemId = item.id;
											return;
										}
										addItem(item);
									}}
								/>
							{/each}
						</Category>
					{/each}
				</CategoryList>
			</div>
		</div>
		<div class="flex h-full w-1/3 flex-col divide-y divide-gray-300 rounded-r-xl bg-gray-200">
			<div class="grow overflow-hidden">
				<Receipt
					categories={data.categories}
					{currentOrder}
					{totalPrice}
					config={data.config}
					onremove={(id, variantId) => {
						removeItem(id, variantId);
					}}
				/>
			</div>
			<div class="flex flex-col gap-4 p-4">
				<button
					onclick={() => (payModalOpen = true)}
					disabled={currentOrder.size === 0}
					type="button"
					class="w-full rounded-md bg-gray-600 px-3.5 py-10 text-2xl font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					Abschließen & Bezahlen
				</button>
				<button
					onclick={() => (cancelModalOpen = true)}
					disabled={currentOrder.size === 0}
					type="button"
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200"
				>
					Alles stornieren
				</button>
			</div>
		</div>

		<SettingsModal config={data.config} bind:open={showSettings} />
		<VariantSelectionModal
			openItem={variantOpenItem}
			categoryColor={data.categories.find((c) => c.products.some((p) => p.id === variantOpenItemId))
				?.color}
			config={data.config}
			onselected={(variant: Variant) => {
				if (!variantOpenItem) return;
				addItem(variantOpenItem, variant);
				variantOpenItemId = null;
			}}
			oncancel={() => (variantOpenItemId = null)}
		/>
		<CancelModal
			open={cancelModalOpen}
			oncancel={() => (cancelModalOpen = false)}
			ondelete={() => {
				cancelModalOpen = false;
				clearOrder();
			}}
		/>
		<PayModal
			config={data.config}
			{totalPrice}
			open={payModalOpen}
			onpayed={async () => {
				let floatingOrderSubmitResult: null | boolean = null;
				if (floatingOrderId) {
					floatingOrderSubmitResult = await submitFloatingOrder({
						floatingOrderId: floatingOrderId,
						items: Array.from(currentOrder.entries()).map(([key, amount]) => {
							const [productId, variantId] = key.split('_').map(Number);
							return { productId, variantId, amount };
						}),
						total: totalPrice
					});
				}
				if (!floatingOrderId || floatingOrderSubmitResult === false) {
					await submitOrder({
						items: Array.from(currentOrder.entries()).map(([key, amount]) => {
							const [productId, variantId] = key.split('_').map(Number);
							return { productId, variantId, amount };
						}),
						total: totalPrice
					});
				}
				resetFloatingOrder();
				currentOrder = new Map();
				payModalOpen = false;
			}}
			oncancel={() => (payModalOpen = false)}
		/>
	</div>
	<div class="-mt-5 -mr-5 -mb-5 w-1/3 space-y-4 overflow-y-auto p-5">
		{#each await getActiveOrders() as order (order.id)}
			<OrderPanel {order} />
		{/each}
		{#each await getFloatingOrders() as order (order.id)}
			<FloatingOrderPanel {order} />
		{/each}
	</div>
</div>
