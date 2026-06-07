import { client } from '$lib/server/database';
import type { LayoutServerLoad } from './$types';
import fs from 'node:fs/promises';

export const load: LayoutServerLoad = async ({ locals }) => {
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

	const config: App.Config = JSON.parse(await fs.readFile('config.json', 'utf-8'));

	return { categories, config };
};
