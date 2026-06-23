import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../prisma/client';
import { env } from '$env/dynamic/private';
import { building } from '$app/env';

const connectionString = env.DATABASE_URL ?? 'file:./dev.db';

const adapter = new PrismaBetterSqlite3({ url: connectionString });
export const client = new PrismaClient({ adapter });

if (!building) {
	await client.floatingOrder.deleteMany({
		where: {}
	});
}

process.on('sveltekit:shutdown', async (reason) => {
	await client.$disconnect();
});
