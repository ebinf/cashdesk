<script lang="ts">
	interface Props {
		amount: number;
		showSign?: boolean;
		config: App.Config;
	}

	let { amount, showSign = false, config }: Props = $props();
</script>

{#if config.currency.before}{config.currency.before}&#8239;{/if}{#if showSign && amount > 0}+{/if}{(
	amount / 100
).toLocaleString(undefined, {
	minimumFractionDigits: config.currency.digits,
	maximumFractionDigits: config.currency.digits
})}{#if config.currency.after}&#8239;{config.currency.after}{/if}
