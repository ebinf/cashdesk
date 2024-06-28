export const itemIdToItem = (config: App.Config, id: string): App.Item | undefined => {
	for (const category of config.categories) {
		for (const item of category.items) {
			if (item.id === id) {
				return item;
			}
		}
	}
};
