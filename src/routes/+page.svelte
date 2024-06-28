<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/store';
	import { open } from '@tauri-apps/plugin-dialog';
	import { readTextFile } from '@tauri-apps/plugin-fs';
	import { listen, type Event } from '@tauri-apps/api/event';
	import { parse } from 'yaml';

	async function fileDialog() {
		const file = await open({
			multiple: false,
			directory: false,
			filters: [{ name: 'YAML', extensions: ['yaml', 'yml'] }],
			title: 'Konfigurationsdatei auswählen'
		});
		readConfigFile(file?.path ?? '');
		return file;
	}

    listen('tauri://drop', (event: Event<any>) => {
        readConfigFile(event.payload?.paths?.[0]);
    });

	async function readConfigFile(path: string) {
		if (!path) return;
        if (!path.endsWith('.yaml') && !path.endsWith('.yml')) {
            alert('Die Datei muss eine YAML-Datei sein.');
            return;
        }
		const content = await readTextFile(path);
		const configFile: App.Config = parse(content);
		for (const category in configFile.categories) {
			configFile.categories[category].items = configFile.categories[category].items.map((item) => {
				item.id = Math.random().toString(36).substr(2, 9);
				return item;
			});
		}
		config.set(configFile);
		goto('/pos');
	}
</script>

<div class="h-full flex flex-row">
	<div class="bg-gray-50 w-1/2 h-30 rounded-xl shadow-2xl m-auto p-4">
		<div class="col-span-full">
			<label for="cover-photo" class="block text-sm font-medium leading-6 text-gray-900"
				>Konfigurationsdatei</label
			>
			<div
				class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
			>
				<div class="text-center">
					<svg
						class="mx-auto h-12 w-12 text-gray-300"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
						/>
					</svg>

					<div class="mt-4 flex text-sm leading-6 text-gray-600">
						<button
							class="relative cursor-pointer rounded-md bg-gray-50 font-semibold text-gray-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-600 focus-within:ring-offset-2 hover:text-gray-500"
							on:click={() => fileDialog()}
						>
							<span>Datei auswählen</span>
						</button>
						<p class="pl-1">or auf diesen Bereich ziehen</p>
					</div>
					<p class="text-xs leading-5 text-gray-600">.YAML oder .YML</p>
				</div>
			</div>
		</div>
	</div>
</div>
