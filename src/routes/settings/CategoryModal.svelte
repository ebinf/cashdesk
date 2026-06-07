<script lang="ts">
	import { type Prisma } from '$lib/prisma/client';
	import { Color } from '$lib/prisma/enums';
	import { addCategory, editCategory } from './settings.remote';

	interface Props {
		category?: Prisma.CategoryGetPayload<{}>;
		open: boolean;
		onclose?: () => void;
	}

	let { open = $bindable(), category, onclose }: Props = $props();

	let color: Color = $derived(category?.color ?? Color.red);
	let name: string = $derived(category?.name ?? '');
</script>

{#if open}
	<div
		class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
	>
		<div class="w-4/5 max-w-2xl overflow-hidden rounded-lg bg-gray-50 p-4 shadow-xl">
			<h2 class="text-center text-2xl font-bold text-gray-800">
				{category ? 'Kategorie bearbeiten' : 'Kategorie hinzufügen'}
			</h2>
			<div class="mt-4 flex flex-col gap-4">
				<div>
					<label for="name" class="block text-sm leading-6 font-medium text-gray-900">Name</label>
					<div class="mt-2">
						<input
							type="text"
							name="name"
							id="name"
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
							bind:value={name}
						/>
					</div>
				</div>
				<div>
					<label for="color" class="block text-sm leading-6 font-medium text-gray-900">Farbe</label>
					<div class="mt-2 flex flex-row flex-wrap gap-2">
						{#each Object.values(Color) as icolor}
							<input
								type="radio"
								class="size-12 rounded-md border-0 p-0 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-gray-600 focus:ring-inset sm:text-sm sm:leading-6"
								value={icolor}
								name="color"
								bind:group={color}
								class:bg-red-600={icolor === Color.red}
								class:bg-green-600={icolor === Color.green}
								class:bg-blue-600={icolor === Color.blue}
								class:bg-yellow-600={icolor === Color.yellow}
								class:bg-purple-600={icolor === Color.purple}
								class:bg-orange-600={icolor === Color.orange}
								class:bg-pink-600={icolor === Color.pink}
								class:bg-teal-600={icolor === Color.teal}
								class:bg-rose-600={icolor === Color.rose}
								class:bg-taupe-600={icolor === Color.taupe}
							/>
						{/each}
					</div>
				</div>
			</div>
			<div class="mt-8 flex flex-col justify-start gap-4">
				<button
					type="button"
					onclick={async () => {
						if (category) {
							if (
								await editCategory({
									id: category.id,
									name: name,
									color: color
								})
							) {
								onclose?.();
							}
						} else {
							if (
								await addCategory({
									name: name,
									color: color
								})
							) {
								onclose?.();
							}
						}
					}}
					class="w-full rounded-md bg-gray-600 px-3.5 py-4.5 text-base font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					Speichern
				</button>
				<button
					onclick={() => {
						onclose?.();
					}}
					type="button"
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3.5 py-4 text-base font-semibold text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
				>
					Abbrechen
				</button>
			</div>
		</div>
	</div>
{/if}
