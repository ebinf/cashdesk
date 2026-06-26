import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../prisma/client';
import { building } from '$app/env';
import { DATABASE_URL } from './environment';

const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL });
export const client = new PrismaClient({ adapter });

if (!building) {
	await client.floatingOrder.deleteMany({
		where: {}
	});
}

process.on('sveltekit:shutdown', async (reason) => {
	await client.$disconnect();
});
