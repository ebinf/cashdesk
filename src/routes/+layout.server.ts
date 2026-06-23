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

	try {
		const config: App.Config = JSON.parse(await fs.readFile('config.json', 'utf-8'));
		if (config.cardPayment?.sumUpIntegration?.accessToken) {
			config.cardPayment.sumUpIntegration.accessToken = '__UNCHANGED__';
		}
		return { categories, config };
	} catch (error) {
		console.error('Error reading config.json:', error);
		const config: App.Config = {
			title: 'Kasse',
			itemsPerRow: 3,
			currency: {
				before: '€',
				after: '',
				digits: 2
			},
			cardPayment: {
				enabled: false
			}
		};
		return { categories, config };
	}
};
