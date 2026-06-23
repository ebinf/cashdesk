import * as v from 'valibot';
import { command, query } from '$app/server';
import { client } from '$lib/server/database';
import events from '$lib/server/events';

let floatingOrderKeepAliveTimeouts: Record<number, NodeJS.Timeout> = {};

export const newFloatingOrder = command(async () => {
	const order = await client.floatingOrder.create({});
	keepAliveFloatingOrder(order.id);
	events.emit('update', 'floatingOrders');
	return order.id;
});

export const clearFloatingOrder = command(v.number(), async (id) => {
	if (!(await client.floatingOrder.findUnique({ where: { id } }))) {
		return false;
	}
	if (floatingOrderKeepAliveTimeouts[id]) {
		clearTimeout(floatingOrderKeepAliveTimeouts[id]);
		delete floatingOrderKeepAliveTimeouts[id];
	}
	await client.floatingOrder.deleteMany({
		where: { id }
	});
	events.emit('update', 'floatingOrders');
});

export const keepAliveFloatingOrder = command(v.number(), async (id) => {
	if (!(await client.floatingOrder.findUnique({ where: { id } }))) {
		return false;
	}
	await client.floatingOrder.update({
		where: { id },
		data: {
			lastKeepAlive: new Date()
		}
	});
	if (floatingOrderKeepAliveTimeouts[id]) {
		clearTimeout(floatingOrderKeepAliveTimeouts[id]);
	}
	floatingOrderKeepAliveTimeouts[id] = setTimeout(async () => {
		clearFloatingOrder(id);
	}, 12000);
});

export const addItemToFloatingOrder = command(
	v.object({
		orderId: v.number(),
		productId: v.number(),
		variantId: v.optional(v.number())
	}),
	async (data) => {
		if (!(await client.floatingOrder.findUnique({ where: { id: data.orderId } }))) {
			return false;
		}
		await client.floatingOrder.update({
			where: { id: data.orderId },
			data: {
				items: {
					create: {
						productId: data.productId,
						variantId: data.variantId,
						amount: 1
					}
				}
			}
		});
		keepAliveFloatingOrder(data.orderId);
		events.emit('update', 'floatingOrders');
	}
);

export const removeItemFromFloatingOrder = command(
	v.object({
		orderId: v.number(),
		productId: v.number(),
		variantId: v.optional(v.number())
	}),
	async (data) => {
		if (!(await client.floatingOrder.findUnique({ where: { id: data.orderId } }))) {
			return false;
		}
		await client.orderItem.deleteMany({
			where: {
				orderId: null,
				floatingOrderId: data.orderId,
				productId: data.productId,
				variantId: data.variantId
			}
		});
		keepAliveFloatingOrder(data.orderId);
		events.emit('update', 'floatingOrders');
	}
);

export const updateItemAmountInFloatingOrder = command(
	v.object({
		orderId: v.number(),
		productId: v.number(),
		variantId: v.optional(v.number()),
		amount: v.number()
	}),
	async (data) => {
		if (!(await client.floatingOrder.findUnique({ where: { id: data.orderId } }))) {
			return false;
		}
		if (
			(await client.orderItem.count({
				where: {
					orderId: null,
					floatingOrderId: data.orderId,
					productId: data.productId,
					variantId: data.variantId
				}
			})) === 0
		) {
			await client.orderItem.create({
				data: {
					orderId: null,
					floatingOrderId: data.orderId,
					productId: data.productId,
					variantId: data.variantId,
					amount: data.amount,
					done: false
				}
			});
		} else {
			await client.orderItem.updateMany({
				where: {
					orderId: null,
					floatingOrderId: data.orderId,
					productId: data.productId,
					variantId: data.variantId
				},
				data: {
					amount: data.amount,
					done: false
				}
			});
		}
		keepAliveFloatingOrder(data.orderId);
		events.emit('update', 'floatingOrders');
	}
);

export const submitOrder = command(
	v.object({
		total: v.number(),
		paymentMethod: v.string(),
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
				paymentMethod: data.paymentMethod,
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
		events.emit('update', 'activeOrders');
		return true;
	}
);

export const submitFloatingOrder = command(
	v.object({
		floatingOrderId: v.number(),
		total: v.number(),
		paymentMethod: v.string(),
		items: v.array(
			v.object({
				productId: v.number(),
				variantId: v.optional(v.number()),
				amount: v.number()
			})
		)
	}),
	async (data) => {
		if (!(await client.floatingOrder.findUnique({ where: { id: data.floatingOrderId } }))) {
			return false;
		}
		const order = await client.order.create({
			data: {
				totalPrice: data.total,
				paymentMethod: data.paymentMethod,
				items: {}
			}
		});
		const items = await client.orderItem.updateManyAndReturn({
			where: {
				orderId: null,
				floatingOrderId: data.floatingOrderId
			},
			data: {
				orderId: order.id,
				floatingOrderId: null
			}
		});
		for (const item of items) {
			const orderItem = data.items.find(
				(i) => i.productId === item.productId && (i.variantId ?? null) === item.variantId
			);
			if (!orderItem) {
				await client.orderItem.delete({
					where: {
						id: item.id
					}
				});
			}
			if (orderItem && orderItem.amount !== item.amount) {
				await client.orderItem.update({
					where: {
						id: item.id
					},
					data: {
						amount: orderItem.amount
					}
				});
			}
		}
		for (const item of data.items) {
			const orderItem = items.find(
				(i) => i.productId === item.productId && i.variantId === (item.variantId ?? null)
			);
			if (!orderItem) {
				await client.orderItem.create({
					data: {
						orderId: order.id,
						productId: item.productId,
						variantId: item.variantId,
						amount: item.amount
					}
				});
			}
		}
		if (floatingOrderKeepAliveTimeouts[data.floatingOrderId]) {
			clearTimeout(floatingOrderKeepAliveTimeouts[data.floatingOrderId]);
			delete floatingOrderKeepAliveTimeouts[data.floatingOrderId];
		}
		await client.floatingOrder.deleteMany({
			where: { id: data.floatingOrderId }
		});
		events.emit('update', 'floatingOrders');
		events.emit('update', 'activeOrders');
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
				},
				where: {
					product: {
						hideInOrders: false
					}
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

export const getFloatingOrders = query(async () => {
	const orders = await client.floatingOrder.findMany({
		include: {
			items: {
				include: {
					product: true,
					variant: true
				},
				where: {
					product: {
						hideInOrders: false
					}
				}
			}
		},
		where: {
			items: {
				some: {}
			}
		}
	});
	return orders;
});

export const markOrderItemDone = command(v.number(), async (id) => {
	const item = await client.orderItem.update({
		where: { id },
		data: { done: true }
	});
	if (item.orderId) {
		events.emit('update', 'activeOrders');
	}
	if (item.floatingOrderId) {
		events.emit('update', 'floatingOrders');
	}
});

export const markOrderItemUnDone = command(v.number(), async (id) => {
	const item = await client.orderItem.update({
		where: { id },
		data: { done: false }
	});
	if (item.orderId) {
		events.emit('update', 'activeOrders');
	}
	if (item.floatingOrderId) {
		events.emit('update', 'floatingOrders');
	}
});

export const markOrderDone = command(v.number(), async (id) => {
	await client.order.update({
		where: { id },
		data: {
			finishedAt: new Date()
		}
	});
	events.emit('update', 'activeOrders');
});

export const getTotal = query(async () => {
	const byMethod = await client.order.groupBy({
		by: ['paymentMethod'],
		_count: {
			_all: true
		},
		_sum: {
			totalPrice: true
		}
	});
	const total = await client.order.aggregate({
		_sum: {
			totalPrice: true
		},
		_count: {
			_all: true
		}
	});

	return { total, byMethod };
});
