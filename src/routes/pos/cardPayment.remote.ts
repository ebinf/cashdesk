import * as v from 'valibot';
import { command, query } from '$app/server';
import fs from 'node:fs/promises';
import { PaymentStatus as PrismaPaymentStatus } from '$lib/prisma/enums';
import { getSumUp } from '$lib/server/sumUp';
import { client } from '$lib/server/database';
import { APIError, type TransactionStatus } from '@sumup/sdk';
import { PaymentStatus } from '$lib/enums';

const sumUp = await getSumUp();

const getConfig = async (): Promise<App.Config> => {
	const currentConfig: App.Config = JSON.parse(await fs.readFile('config.json', 'utf-8'));
	return currentConfig;
};

export const startCardPayment = command(
	v.object({
		total: v.number()
	}),
	async (data) => {
		const config = await getConfig();
		if (!config.cardPayment?.enabled || !config.cardPayment.sumUpIntegration?.enabled) {
			throw new Error('Card payment is not enabled');
		}
		const dbCheckout = await client.sumUpPayment.create({
			data: {
				status: PrismaPaymentStatus.waitingForTerminal,
				amount: data.total
			}
		});
		return dbCheckout.id;
	}
);

const cardPaymentError = ({ paymentId }: { paymentId: number }) => {
	client.sumUpPayment
		.update({
			where: { id: paymentId },
			data: {
				status: PrismaPaymentStatus.error
			}
		})
		.then();
	return PaymentStatus.error;
};

export const cardPaymentStatus = query.live(
	v.object({ paymentId: v.number() }),
	async function* (data) {
		if (!data.paymentId) return;
		const config = await getConfig();
		if (!config.cardPayment?.enabled || !config.cardPayment.sumUpIntegration?.enabled) {
			yield cardPaymentError({ paymentId: data.paymentId });
			console.error('SumUp integration is not enabled');
			return;
		}
		let dbPayment = await client.sumUpPayment.findUnique({
			where: { id: data.paymentId }
		});
		if (!dbPayment) {
			yield cardPaymentError({ paymentId: data.paymentId });
			console.error('Payment not found');
			return;
		}
		yield PaymentStatus.waitingForTerminal;
		while (true) {
			const waitingForPayments = await client.sumUpPayment.count({
				where: {
					id: {
						lt: data.paymentId
					},
					status: {
						in: [
							PrismaPaymentStatus.waitingForTerminal,
							PrismaPaymentStatus.inProcess,
							PrismaPaymentStatus.pending
						]
					}
				}
			});
			if (waitingForPayments == 0) break;
			await new Promise((t) => setTimeout(t, 1000));
		}
		while (true) {
			try {
				const terminalStatus = await sumUp!.readers.getStatus(
					config.cardPayment.sumUpIntegration.merchantCode,
					config.cardPayment.sumUpIntegration.readerId
				);
				if (terminalStatus.data.state === 'IDLE') break;
				await new Promise((t) => setTimeout(t, 1000));
			} catch (e) {
				console.log(e);
				yield cardPaymentError({ paymentId: data.paymentId });
				console.error('Failed to get terminal status');
				return;
			}
		}
		yield PaymentStatus.starting;
		try {
			const checkout = await sumUp!.readers.createCheckout(
				config.cardPayment.sumUpIntegration.merchantCode,
				config.cardPayment.sumUpIntegration.readerId,
				{
					total_amount: {
						currency: config.cardPayment.sumUpIntegration.currency,
						value: dbPayment.amount,
						minor_unit: config.currency.digits
					}
				}
			);
			dbPayment = await client.sumUpPayment.update({
				where: { id: data.paymentId },
				data: {
					paymentId: checkout.data.client_transaction_id,
					status: PrismaPaymentStatus.inProcess
				}
			});
		} catch (e) {
			console.log(e);
			yield cardPaymentError({ paymentId: data.paymentId });
			console.error('Failed to create checkout');
			return;
		}
		while (true) {
			const terminalStatus = await sumUp!.readers.getStatus(
				config.cardPayment.sumUpIntegration.merchantCode,
				config.cardPayment.sumUpIntegration.readerId
			);
			if (terminalStatus.data.state === 'IDLE') break;
			if (terminalStatus.data.state === 'WAITING_FOR_CARD') {
				yield PaymentStatus.waitingForCard;
			}
			if (terminalStatus.data.state === 'WAITING_FOR_PIN') {
				yield PaymentStatus.waitingForPin;
			}
			if (terminalStatus.data.state === 'WAITING_FOR_SIGNATURE') {
				yield PaymentStatus.waitingForSignature;
			}
			await new Promise((t) => setTimeout(t, 1000));
		}
		yield PaymentStatus.processing;
		let finalStatus: TransactionStatus;
		while (true) {
			try {
				const transaction = await sumUp!.transactions.get(
					config.cardPayment.sumUpIntegration.merchantCode,
					{
						client_transaction_id: dbPayment.paymentId!
					}
				);
				if (
					transaction.status === 'SUCCESSFUL' ||
					transaction.status === 'FAILED' ||
					transaction.status === 'CANCELLED'
				) {
					finalStatus = transaction.status;
					break;
				}
			} catch (e) {
				if (e instanceof APIError && e.status === 404) {
					continue;
				}
				console.log(e);
				yield cardPaymentError({ paymentId: data.paymentId });
				console.error('Failed to get transaction status');
				return;
			}
			await new Promise((t) => setTimeout(t, 1000));
		}
		await client.sumUpPayment.update({
			where: { id: data.paymentId },
			data: {
				status:
					finalStatus === 'SUCCESSFUL'
						? PrismaPaymentStatus.completed
						: finalStatus === 'FAILED'
							? PrismaPaymentStatus.failed
							: PrismaPaymentStatus.cancelled
			}
		});
		yield finalStatus === 'SUCCESSFUL'
			? PaymentStatus.completed
			: finalStatus === 'FAILED'
				? PaymentStatus.failed
				: PaymentStatus.cancelled;
	}
);

export const cancelCardPayment = command(
	v.object({
		paymentId: v.number()
	}),
	async (data) => {
		if (!data.paymentId) return;
		const config = await getConfig();
		if (!config.cardPayment?.enabled || !config.cardPayment.sumUpIntegration?.enabled) {
			throw new Error('Card payment is not enabled');
		}
		const dbPayment = await client.sumUpPayment.findUnique({
			where: { id: data.paymentId }
		});
		if (!dbPayment) {
			return;
		}
		if (
			(
				[
					PrismaPaymentStatus.cancelled,
					PrismaPaymentStatus.failed,
					PrismaPaymentStatus.completed,
					PrismaPaymentStatus.error
				] as PrismaPaymentStatus[]
			).includes(dbPayment.status)
		) {
			return;
		}
		if (dbPayment.paymentId) {
			await sumUp!.readers.terminateCheckout(
				config.cardPayment!.sumUpIntegration!.merchantCode,
				config.cardPayment!.sumUpIntegration!.readerId
			);
		}
		await client.sumUpPayment.update({
			where: { id: data.paymentId },
			data: { status: PrismaPaymentStatus.cancelled }
		});
	}
);
