import SumUp from '@sumup/sdk';
import fs from 'node:fs/promises';

export const getSumUp = async () => {
	const currentConfig: App.Config = JSON.parse(await fs.readFile('config.json', 'utf-8'));

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
