import * as v from 'valibot';
import { command, form } from '$app/server';
import { client } from '$lib/server/database';
import { Color, PaymentStatus } from '$lib/prisma/enums';
import events from '$lib/server/events';
import fs from 'node:fs/promises';
import { CONFIG_PATH, DATABASE_URL } from '$lib/server/environment';
import { defaultSettings } from '$lib/defaultSettings';

export const editSettings = command(
	v.object({
		title: v.string(),
		itemsPerRow: v.pipe(v.number(), v.minValue(1), v.maxValue(9)),
		currency: v.object({
			before: v.string(),
			after: v.string(),
			digits: v.pipe(v.number(), v.minValue(0), v.maxValue(20))
		})
	}),
	async (data) => {
		try {
			const currentConfig: App.Config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));
			await fs.writeFile(CONFIG_PATH, JSON.stringify({ ...currentConfig, ...data }, null, 2));
		} catch (e: any) {
			if (e.code && e.code === 'ENOENT') {
				await fs.writeFile(CONFIG_PATH, JSON.stringify({ ...defaultSettings, ...data }, null, 2));
			} else {
				console.error('Error editing settings:', e);
				return false;
			}
		}
		events.emit('update', 'catalogue');
		return true;
	}
);

export const editCardPayment = command(
	v.object({
		enabled: v.boolean(),
		sumUpIntegration: v.object({
			enabled: v.boolean(),
			accessToken: v.string(),
			merchantCode: v.string(),
			readerId: v.string(),
			currency: v.string()
		})
	}),
	async (data) => {
		if (data.sumUpIntegration.enabled) {
			if (!data.sumUpIntegration.accessToken || !data.sumUpIntegration.merchantCode) {
				data.sumUpIntegration.enabled = false;
			}
		}
		try {
			const currentConfig: App.Config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));
			if (data.sumUpIntegration.accessToken === '__UNCHANGED__') {
				data.sumUpIntegration.accessToken =
					currentConfig.cardPayment?.sumUpIntegration?.accessToken ?? '';
			}
			await fs.writeFile(
				CONFIG_PATH,
				JSON.stringify({ ...currentConfig, cardPayment: data }, null, 2)
			);
		} catch (e: any) {
			if (e.code && e.code === 'ENOENT') {
				await fs.writeFile(
					CONFIG_PATH,
					JSON.stringify({ ...defaultSettings, cardPayment: data }, null, 2)
				);
			} else {
				console.error('Error editing settings:', e);
				return false;
			}
		}
		events.emit('update', 'catalogue');
		return true;
	}
);

export const addCategory = command(
	v.object({
		name: v.string(),
		color: v.enum(Color)
	}),
	async (data) => {
		const largestOrder = await client.category.findFirst({
			orderBy: {
				order: 'desc'
			},
			where: {
				isArchived: false
			},
			select: {
				order: true
			}
		});
		await client.category.create({
			data: {
				name: data.name,
				color: data.color,
				order: (largestOrder?.order ?? 0) + 1
			}
		});
		events.emit('update', 'catalogue');
		return true;
	}
);

export const editCategory = command(
	v.object({
		id: v.number(),
		name: v.string(),
		color: v.enum(Color)
	}),
	async (data) => {
		await client.category.update({
			where: {
				id: data.id
			},
			data: {
				name: data.name,
				color: data.color
			}
		});
		events.emit('update', 'catalogue');
		return true;
	}
);

export const moveCategoryUp = command(v.number(), async (id) => {
	const category = await client.category.findUnique({
		where: {
			id: id
		}
	});
	if (!category) return;
	const previousCategory = await client.category.findFirst({
		where: {
			order: {
				lt: category.order
			},
			isArchived: false
		},
		orderBy: {
			order: 'desc'
		}
	});
	if (!previousCategory) return;
	await client.$transaction([
		client.category.update({
			where: {
				id: category.id
			},
			data: {
				order: previousCategory.order
			}
		}),
		client.category.update({
			where: {
				id: previousCategory.id
			},
			data: {
				order: category.order
			}
		})
	]);
	events.emit('update', 'catalogue');
});

export const moveCategoryDown = command(v.number(), async (id) => {
	const category = await client.category.findUnique({
		where: {
			id: id
		}
	});
	if (!category) return;
	const nextCategory = await client.category.findFirst({
		where: {
			order: {
				gt: category.order
			},
			isArchived: false
		},
		orderBy: {
			order: 'asc'
		}
	});
	if (!nextCategory) return;
	await client.$transaction([
		client.category.update({
			where: {
				id: category.id
			},
			data: {
				order: nextCategory.order
			}
		}),
		client.category.update({
			where: {
				id: nextCategory.id
			},
			data: {
				order: category.order
			}
		})
	]);
	events.emit('update', 'catalogue');
});

export const deleteCategory = command(v.number(), async (id) => {
	const category = await client.category.findUnique({
		where: {
			id: id,
			products: {
				none: {
					isArchived: false
				}
			}
		}
	});
	if (!category) return;
	await client.category.update({
		where: {
			id: id
		},
		data: {
			isArchived: true
		}
	});
	events.emit('update', 'catalogue');
});

export const restoreCategory = command(v.number(), async (id) => {
	const category = await client.category.findUnique({
		where: {
			id: id
		}
	});
	if (!category) return;
	await client.category.update({
		where: {
			id: id
		},
		data: {
			isArchived: false
		}
	});
	events.emit('update', 'catalogue');
});

export const addProduct = command(
	v.object({
		name: v.string(),
		color: v.optional(v.enum(Color)),
		price: v.number(),
		categoryId: v.number(),
		hideInOrders: v.optional(v.boolean()),
		variantNameOverridesName: v.optional(v.boolean())
	}),
	async (data) => {
		const largestOrder = await client.product.findFirst({
			where: {
				categoryId: data.categoryId,
				isArchived: false
			},
			orderBy: {
				order: 'desc'
			},
			select: {
				order: true
			}
		});
		await client.product.create({
			data: {
				name: data.name,
				color: data.color ?? null,
				price: data.price,
				categoryId: data.categoryId,
				order: (largestOrder?.order ?? 0) + 1,
				hideInOrders: data.hideInOrders ?? false,
				variantNameOverridesName: data.variantNameOverridesName ?? false
			}
		});
		events.emit('update', 'catalogue');
		return true;
	}
);

export const editProduct = command(
	v.object({
		id: v.number(),
		name: v.string(),
		color: v.optional(v.enum(Color)),
		price: v.number(),
		categoryId: v.number(),
		hideInOrders: v.optional(v.boolean()),
		variantNameOverridesName: v.optional(v.boolean())
	}),
	async (data) => {
		const product = await client.product.findUnique({
			where: {
				id: data.id
			},
			include: {
				variants: {
					where: {
						isArchived: false
					}
				},
				_count: {
					select: {
						orderItems: true
					}
				}
			}
		});
		if (!product) return false;
		if (
			(product.name === data.name && product.price === data.price) ||
			product._count.orderItems === 0
		) {
			await client.product.update({
				where: {
					id: data.id
				},
				data: {
					name: data.name,
					color: data.color ?? null,
					price: data.price,
					categoryId: data.categoryId,
					hideInOrders: data.hideInOrders ?? false,
					variantNameOverridesName: data.variantNameOverridesName ?? false
				}
			});
		} else {
			await client.product.create({
				data: {
					name: data.name,
					color: data.color ?? null,
					price: data.price,
					categoryId: data.categoryId,
					order: product.order,
					hideInOrders: data.hideInOrders ?? false,
					variantNameOverridesName: data.variantNameOverridesName ?? false,
					variants: {
						create: product.variants.map((v) => ({
							name: v.name,
							priceDifference: v.priceDifference,
							color: v.color,
							order: v.order
						}))
					}
				}
			});
			await client.product.update({
				where: {
					id: data.id
				},
				data: {
					isArchived: true
				}
			});
		}
		events.emit('update', 'catalogue');
		return true;
	}
);

export const moveProductLeft = command(v.number(), async (id) => {
	const product = await client.product.findUnique({
		where: {
			id: id
		}
	});
	if (!product) return;
	const previousProduct = await client.product.findFirst({
		where: {
			order: {
				lt: product.order
			},
			categoryId: product.categoryId,
			isArchived: false
		},
		orderBy: {
			order: 'desc'
		}
	});
	if (!previousProduct) return;
	await client.$transaction([
		client.product.update({
			where: {
				id: product.id
			},
			data: {
				order: previousProduct.order
			}
		}),
		client.product.update({
			where: {
				id: previousProduct.id
			},
			data: {
				order: product.order
			}
		})
	]);
	events.emit('update', 'catalogue');
});

export const moveProductRight = command(v.number(), async (id) => {
	const product = await client.product.findUnique({
		where: {
			id: id
		}
	});
	if (!product) return;
	const nextProduct = await client.product.findFirst({
		where: {
			order: {
				gt: product.order
			},
			categoryId: product.categoryId,
			isArchived: false
		},
		orderBy: {
			order: 'asc'
		}
	});
	if (!nextProduct) return;
	await client.$transaction([
		client.product.update({
			where: {
				id: product.id
			},
			data: {
				order: nextProduct.order
			}
		}),
		client.product.update({
			where: {
				id: nextProduct.id
			},
			data: {
				order: product.order
			}
		})
	]);
	events.emit('update', 'catalogue');
});

export const deleteProduct = command(v.number(), async (id) => {
	const product = await client.product.findUnique({
		where: {
			id: id
		}
	});
	if (!product) return;
	await client.product.update({
		where: {
			id: id
		},
		data: {
			isArchived: true
		}
	});
	events.emit('update', 'catalogue');
});

export const restoreProduct = command(v.number(), async (id) => {
	const product = await client.product.findUnique({
		where: {
			id: id
		}
	});
	if (!product) return;
	await client.product.update({
		where: {
			id: id
		},
		data: {
			isArchived: false
		}
	});
	events.emit('update', 'catalogue');
});

export const addVariant = command(
	v.object({
		name: v.string(),
		color: v.optional(v.enum(Color)),
		priceDifference: v.number(),
		productId: v.number()
	}),
	async (data) => {
		const largestOrder = await client.variant.findFirst({
			where: {
				productId: data.productId,
				isArchived: false
			},
			orderBy: {
				order: 'desc'
			},
			select: {
				order: true
			}
		});
		await client.variant.create({
			data: {
				name: data.name,
				color: data.color ?? null,
				priceDifference: data.priceDifference,
				productId: data.productId,
				order: (largestOrder?.order ?? 0) + 1
			}
		});
		events.emit('update', 'catalogue');
		return true;
	}
);

export const moveVariantLeft = command(v.number(), async (id) => {
	const variant = await client.variant.findUnique({
		where: {
			id: id
		}
	});
	if (!variant) return;
	const previousVariant = await client.variant.findFirst({
		where: {
			order: {
				lt: variant.order
			},
			productId: variant.productId,
			isArchived: false
		},
		orderBy: {
			order: 'desc'
		}
	});
	if (!previousVariant) return;
	await client.$transaction([
		client.variant.update({
			where: {
				id: variant.id
			},
			data: {
				order: previousVariant.order
			}
		}),
		client.variant.update({
			where: {
				id: previousVariant.id
			},
			data: {
				order: variant.order
			}
		})
	]);
	events.emit('update', 'catalogue');
});

export const editVariant = command(
	v.object({
		id: v.number(),
		name: v.string(),
		color: v.optional(v.enum(Color)),
		priceDifference: v.number(),
		productId: v.number()
	}),
	async (data) => {
		const variant = await client.variant.findUnique({
			where: {
				id: data.id
			},
			include: {
				_count: {
					select: {
						orderItems: true
					}
				}
			}
		});
		if (!variant) return false;
		if (
			(variant.name === data.name && variant.priceDifference === data.priceDifference) ||
			variant._count.orderItems === 0
		) {
			await client.variant.update({
				where: {
					id: data.id
				},
				data: {
					name: data.name,
					color: data.color ?? null,
					priceDifference: data.priceDifference
				}
			});
		} else {
			await client.variant.create({
				data: {
					name: data.name,
					color: data.color ?? null,
					priceDifference: data.priceDifference,
					productId: data.productId,
					order: variant.order
				}
			});
			await client.variant.update({
				where: {
					id: data.id
				},
				data: {
					isArchived: true
				}
			});
		}
		events.emit('update', 'catalogue');
		return true;
	}
);

export const moveVariantRight = command(v.number(), async (id) => {
	const variant = await client.variant.findUnique({
		where: {
			id: id
		}
	});
	if (!variant) return;
	const nextVariant = await client.variant.findFirst({
		where: {
			order: {
				gt: variant.order
			},
			productId: variant.productId,
			isArchived: false
		},
		orderBy: {
			order: 'asc'
		}
	});
	if (!nextVariant) return;
	await client.$transaction([
		client.variant.update({
			where: {
				id: variant.id
			},
			data: {
				order: nextVariant.order
			}
		}),
		client.variant.update({
			where: {
				id: nextVariant.id
			},
			data: {
				order: variant.order
			}
		})
	]);
	events.emit('update', 'catalogue');
});

export const deleteVariant = command(v.number(), async (id) => {
	const variant = await client.variant.findUnique({
		where: {
			id: id
		}
	});
	if (!variant) return;
	await client.variant.update({
		where: {
			id: id
		},
		data: {
			isArchived: true
		}
	});
	events.emit('update', 'catalogue');
});

export const restoreVariant = command(v.number(), async (id) => {
	const variant = await client.variant.findUnique({
		where: {
			id: id
		}
	});
	if (!variant) return;
	await client.variant.update({
		where: {
			id: id
		},
		data: {
			isArchived: false
		}
	});
	events.emit('update', 'catalogue');
});

export const cancelDanglingCardPayments = command(async () => {
	await client.sumUpPayment.updateMany({
		data: {
			status: PaymentStatus.cancelled
		},
		where: {
			status: {
				in: [PaymentStatus.inProcess, PaymentStatus.pending, PaymentStatus.waitingForTerminal]
			}
		}
	});
});

export const deleteFloatingOrders = command(async () => {
	await client.orderItem.deleteMany({
		where: {
			order: null,
			floatingOrder: {
				isNot: null
			}
		}
	});
	await client.floatingOrder.deleteMany({});
	events.emit('update', 'floatingOrders');
});

export const deleteAllOrders = command(async () => {
	await client.orderItem.deleteMany({});
	await client.floatingOrder.deleteMany({});
	await client.order.deleteMany({});
	await client.sumUpPayment.deleteMany({});
	await client.$queryRaw`DELETE FROM "SQLITE_SEQUENCE" WHERE name = 'Order';`;
	events.emit('update', 'activeOrders');
	events.emit('update', 'floatingOrders');
});

export const importDatabase = form(v.object({ file: v.file() }), async ({ file }) => {
	const dbFileName = DATABASE_URL.replace('file:', '');
	try {
		await client.$disconnect();
		await fs.copyFile(dbFileName, `${dbFileName}.backup`);
		await fs.writeFile(dbFileName, Buffer.from(await file.arrayBuffer()));
		await client.$connect();
		events.emit('update', 'catalogue');
		events.emit('update', 'activeOrders');
		events.emit('update', 'floatingOrders');
		return true;
	} catch (e) {
		console.error('Error importing database:', e);
		await fs.copyFile(`${dbFileName}.backup`, dbFileName);
		await client.$connect();
		return false;
	} finally {
		await fs.unlink(`${dbFileName}.backup`).catch(() => {});
	}
});
