export const itemIdToItem = (config: App.Config, id: string): App.Item | undefined => {
	for (const category of config.categories) {
		for (const item of category.items) {
			if (item.id === id) {
				return item;
			}
		}
	}
};

export const getOrderItem = (
	config: App.Config,
	id: string
): { item: App.Item; variant?: App.Variant; price: number } | undefined => {
	const [itemId, variantId] = id.split('-');
	const item = config.categories
		.flatMap((category) => category.items)
		.find((item) => item.id === itemId);
	if (!item) return undefined;
	if (variantId && item.variants && item.variants.length > 0) {
		const variant = item.variants.find((v) => v.idSuffix === variantId);
		console.log('Variant', variant);
		if (variant)
			return {
				item: item,
				variant: variant,
				price: item.price + (variant.priceDifference ?? 0)
			};
	}
	return {
		item: item,
		variant: undefined,
		price: item.price
	};
};
