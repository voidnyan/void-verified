import {IPoll, IPollOption, VoidApi} from "../../api/voidApi";
import {DOM} from "../../utils/DOM";
import {Toaster} from "../../utils/toaster";
import {ArrowTopRightOnSquareIcon, XMarkIcon} from "../../assets/icons";
import {IconButton} from "../../components/components";
import {Dialog} from "../../utils/dialog";
import {Time} from "../../utils/time";
import {DomPurify} from "../../utils/domPurify";

export class PollComponent {
	element: HTMLDivElement;
	private readonly options: HTMLDivElement;
	private readonly pollId: number;
	private totalVotes: number;
	private isClosed: boolean;
	constructor(poll: IPoll) {
		this.pollId = poll.id;
		this.isClosed = poll.isClosed;
		this.updateTotalVotesCount(poll);
		this.element = DOM.createDiv("poll-container");
		this.createHeader(poll);
		this.options = DOM.createDiv("poll-options");
		this.updateResults(poll);
		this.element.append(this.options);
	}

	private updateResults(poll: IPoll) {
		this.options.replaceChildren();
		for (const option of poll.options) {
			this.options.append(this.createOption(option));
		}
	}

	private createOption(option: IPollOption) {
		const desc = DOM.createDiv("poll-option-description", DomPurify.sanitize(option.description));
		const percentage = (option.voteCount / Math.max(this.totalVotes, 1) * 100).toFixed(1);
		const voteStats = DOM.createDiv("poll-option-count", `${option.voteCount} votes (${percentage}%)`);
		const item = DOM.createDiv("poll-option", [desc, voteStats]);
		if (!this.isClosed) {
			item.classList.add("void-cursor-pointer");
			item.addEventListener("click", async () => {
				try {
					const poll = await VoidApi.vote({
						pollId: this.pollId,
						optionId: option.id,
						isVoted: !option.isVoted
					});
					this.updateTotalVotesCount(poll);
					this.updateResults(poll);
				} catch (error) {
					Toaster.error("There was an error while voting.", error);
				}
			});
		}

		if (option.link && option.link.trim() !== "") {
			const openLink = document.createElement("a");
			openLink.setAttribute("target", "_blank");
			const href = DomPurify.sanitize(option.link);
			openLink.setAttribute("href", href);
			openLink.classList.add("void-poll-option-link");
			openLink.append(ArrowTopRightOnSquareIcon());
			desc.append(openLink);
		}


		const percentageBar = DOM.create("div", "poll-option-percentage-bar", null, {
			style: `width: ${percentage}%`
		});
		item.append(percentageBar);

		if (option.isVoted) {
			item.classList.add("void-voted");
		}
		return item;
	}

	private createHeader(poll: IPoll) {
		const header = DOM.createDiv("poll-header");
		header.append(DOM.createDiv(null, DomPurify.sanitize(poll.title)));

		const endContainer = DOM.createDiv("poll-header-time");

		console.log(poll);
		let closeMessage: string;
		if (!poll.closesAt) {
			closeMessage = "Closes never";
		} else {
			closeMessage = poll.isClosed ? "Closed " + Time.convertToString(new Date(poll.closesAt).getTime() / 1000) : "Closes " + Time.toUpcomingString(poll.closesAt);
		}

		const closesAt = DOM.createDiv(null, closeMessage);
		endContainer.append(closesAt);

		if (poll.isOwner) {
			const deleteButton = IconButton(XMarkIcon(), () => {
				Dialog.confirm(async () => {
					try {
						await VoidApi.deletePoll(poll.id);
						this.element.remove();
						Dialog.inform("Remove the element from the activity or reply.", "Poll deleted.");
					} catch (error) {
						console.error(error);
						Toaster.error("There was an error deleting poll.", error);
					}
				}, "Are you sure you want to delete this poll?", "Delete poll?");
			});
			endContainer.append(deleteButton);
		}

		header.append(endContainer);
		this.element.append(header);
	}

	private updateTotalVotesCount(poll: IPoll) {
		this.totalVotes = poll.options.reduce((a, b) => {
			return a + b.voteCount;
		}, 0);
	}
}
