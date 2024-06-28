<script lang="ts">
	export let amount: number;
	export let config: App.Config;
</script>

{#if config.currency.before}{config.currency.before}&nbsp;{/if}{amount.toLocaleString(undefined, {
	minimumFractionDigits: config.currency.digits,
	maximumFractionDigits: config.currency.digits
})}{#if config.currency.after}&nbsp;{config.currency.after}{/if}
