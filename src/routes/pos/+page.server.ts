import { client } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const categories = await client.category.findMany({
		orderBy: {
			order: 'asc'
		},
		include: {
			products: {
				include: {
					variants: {
						orderBy: {
							order: 'asc'
						}
					}
				},
				orderBy: {
					order: 'asc'
				}
			}
		}
	});

	const config: App.Config = {
		title: 'Test',
		itemsPerRow: 3,
		currency: {
			before: '',
			after: '€',
			digits: 2
		}
	};

	return { categories, config };
};
