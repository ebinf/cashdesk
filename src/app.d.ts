// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface Order {
			id: number;
			timestamp: number;
			items: {
				[id: string]: number;
			};
			totalPrice: number;
		}

		interface Item {
			name: string;
			price: number;
			id: string;
		}

		interface Category {
			name: string;
			color: 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' | 'pink' | 'teal';
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
