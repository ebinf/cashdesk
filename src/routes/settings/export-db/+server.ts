import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'node:fs/promises';
import { DATABASE_URL } from '$lib/server/environment';

export const GET: RequestHandler = async ({}) => {
	try {
		const file = await fs.readFile(DATABASE_URL.replace('file:', ''));
		return new Response(new Uint8Array(file), {
			headers: {
				'Content-Type': 'application/vnd.sqlite3',
				'Content-Length': file.byteLength.toString(),
				'Content-Disposition': 'attachment; filename="database.db"'
			},
			status: 200
		});
	} catch (e) {
		console.log('Error reading database file:', e);
		error(404, { message: 'File not found' });
	}
};
