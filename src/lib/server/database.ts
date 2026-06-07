import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../prisma/client';
import { env } from '$env/dynamic/private';

const connectionString = env.DATABASE_URL ?? 'file:./dev.db';

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const client = new PrismaClient({ adapter });

await client.floatingOrder.deleteMany({
	where: {}
});

export { client };
