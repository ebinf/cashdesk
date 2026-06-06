import * as v from 'valibot';
import { command, query } from '$app/server';
import { client } from '$lib/server/database';

export const submitOrder = command(
	v.object({
		total: v.number(),
		items: v.array(
			v.object({
				productId: v.number(),
				variantId: v.optional(v.number()),
				amount: v.number()
			})
		)
	}),
	async (data) => {
		await client.order.create({
			data: {
				totalPrice: data.total,
				items: {
					createMany: {
						data: data.items.map((item) => ({
							productId: item.productId,
							variantId: item.variantId,
							amount: item.amount
						}))
					}
				}
			}
		});
		return true;
	}
);

export const getActiveOrders = query(async () => {
	const orders = await client.order.findMany({
		include: {
			items: {
				include: {
					product: true,
					variant: true
				}
			}
		},
		where: {
			finishedAt: null
		},
		orderBy: {
			createdAt: 'asc'
		}
	});
	return orders;
});

export const markOrderItemDone = command(v.number(), async (id) => {
	await client.orderItem.update({
		where: { id },
		data: { done: true }
	});
	getActiveOrders().refresh();
});

export const markOrderItemUnDone = command(v.number(), async (id) => {
	await client.orderItem.update({
		where: { id },
		data: { done: false }
	});
	getActiveOrders().refresh();
});

export const markOrderDone = command(v.number(), async (id) => {
	await client.order.update({
		where: { id },
		data: {
			finishedAt: new Date()
		}
	});
	getActiveOrders().refresh();
});
