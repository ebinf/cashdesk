import type { Prisma, Product, Variant } from './prisma/client';

export const getOrderItem = (
	categories: Prisma.CategoryGetPayload<{
		include: {
			products: {
				include: {
					variants: true;
				};
			};
		};
	}>[],
	id: number,
	variantId?: number
): (Product & { variant?: Variant }) | null => {
	for (const category of categories) {
		for (const product of category.products) {
			if (variantId !== undefined) {
				const variant = product.variants?.find((v) => v.id === variantId);
				if (variant) {
					return { ...product, variant, price: product.price + (variant.priceDifference ?? 0) };
				}
			}
			if (product.id === id) return product;
		}
	}
	return null;
};
