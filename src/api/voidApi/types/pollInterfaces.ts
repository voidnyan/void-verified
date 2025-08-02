export interface ICreatePoll {
	title: string,
	options: ICreatePollOption[],
	allowMultipleVotes: boolean,
	closesAt?: Date | string,
}

export interface ICreatePollOption {
	description: string,
	link?: string,
}

export interface IVotePoll {
	pollId: number,
	optionId: number,
	isVoted: boolean
}

export interface IPoll {
	id: number,
	title: string,
	options: IPollOption[],
	allowMultipleVotes: boolean,
	closesAt?: Date
	isOwner: boolean,
	isClosed: boolean
}

export interface IPollOption {
	id: number,
	description: string,
	link?: string,
	voteCount: number,
	isVoted: boolean
}
