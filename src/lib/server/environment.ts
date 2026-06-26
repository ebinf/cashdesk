import { env } from '$env/dynamic/private';

export const CONFIG_PATH = env.CONFIG_PATH ?? './config.json';
export const DATABASE_URL = env.DATABASE_URL ?? 'file:./dev.db';
