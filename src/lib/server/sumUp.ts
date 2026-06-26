import { building } from '$app/env';
import SumUp from '@sumup/sdk';
import fs from 'node:fs/promises';
import { CONFIG_PATH } from './environment';

export const getSumUp = async () => {
	if (building) return undefined;

	const currentConfig: App.Config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));

	if (
		!currentConfig.cardPayment?.enabled ||
		!currentConfig.cardPayment?.sumUpIntegration?.enabled
	) {
		return undefined;
	}
	return new SumUp({
		apiKey: currentConfig.cardPayment.sumUpIntegration.accessToken ?? ''
	});
};
