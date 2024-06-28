import { writable, type Writable } from "svelte/store";

export const config: Writable<App.Config> = writable();