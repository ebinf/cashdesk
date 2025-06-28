// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		type Color =
			| 'red'
			| 'green'
			| 'blue'
			| 'yellow'
			| 'purple'
			| 'orange'
			| 'pink'
			| 'teal'
			| 'rose';

		interface Order {
			id: number;
			timestamp: number;
			items: {
				[id: string]: number;
			};
			totalPrice: number;
		}

		interface Variant {
			name: string;
			priceDifference?: number;
			idSuffix: string;
			color?: Color;
		}

		interface Item {
			name: string;
			price: number;
			id: string;
			color?: Color;
			hideInOrders: boolean?;
			variants?: Variant[];
		}

		interface Category {
			name: string;
			color: Color;
			items: Item[];
		}

		interface Config {
			title: string?;
			itemsPerRow: number?;
			currency: {
				before: string;
				after: string;
				digits: number;
			};
			categories: Category[];
		}
	}
}

export {};
