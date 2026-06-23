import SumUp from '@sumup/sdk';
import fs from 'node:fs/promises';

const currentConfig: App.Config = JSON.parse(await fs.readFile('config.json', 'utf-8'));

export const sumUp =
	currentConfig.cardPayment?.enabled && currentConfig.cardPayment?.sumUpIntegration?.enabled
		? new SumUp({
				apiKey: currentConfig.cardPayment.sumUpIntegration.accessToken ?? ''
			})
		: undefined;
