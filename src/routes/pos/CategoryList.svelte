<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<dl class="divide-y divide-gray-900/10">
	{@render children()}
</dl>
