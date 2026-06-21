import events from '$lib/server/events';
import type { RequestHandler } from '@sveltejs/kit';

const listeners: ReadableStreamDefaultController[] = [];

events.on('update', (message: string) => {
	for (const listener of listeners) {
		try {
			listener.enqueue(`data: ${message}\n\n`);
		} catch (e) {
			if (e instanceof TypeError) {
				delete listeners[listeners.indexOf(listener)];
			}
		}
	}
});

export const GET: RequestHandler = async ({}) => {
	const stream = new ReadableStream<string>({
		start(controller) {
			listeners.push(controller);
			setTimeout(() => {
				controller.enqueue('data: connected\n\n');
			}, 200);
		},
		cancel() {}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache',
			connection: 'keep-alive'
		}
	});
};
