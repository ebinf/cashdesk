export enum PaymentStatus {
	waitingForTerminal,
	starting,
	waitingForCard,
	waitingForPin,
	waitingForSignature,
	processing,
	completed,
	failed,
	cancelled,
	error
}
