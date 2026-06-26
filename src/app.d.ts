// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface Config {
			title?: string;
			itemsPerRow?: number;
			currency: {
				before: string;
				after: string;
				digits: number;
			};
			cardPayment?: {
				enabled?: boolean;
				sumUpIntegration?:
					| {
							enabled: true;
							accessToken: string;
							merchantCode: string;
							readerId: string;
							currency: string;
					  }
					| ({ enabled: false } & Record<string, never>);
			};
		}
	}
}

export {};
