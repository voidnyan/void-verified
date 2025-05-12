import {InputComponent} from "../../components/inputComponent";
import {IconButton, Label} from "../../components/components";
import {ChatBubbleLeftRightIcon, XMarkIcon} from "../../assets/icons";
import {DOM} from "../../utils/DOM";
import {ButtonComponent} from "../../components/ButtonComponent";
import {ICreatePoll, VoidApi} from "../../api/voidApi";
import {Toaster} from "../../utils/toaster";
import {Dialog} from "../../utils/dialog";
import {SelectComponent} from "../../components/selectComponent";

export
class PollFormComponent {
	element: HTMLDivElement;
	trigger: HTMLDivElement;
	private readonly body: HTMLDivElement;
	private titleInput: InputComponent;
	private allowMultipleVotesInput: SelectComponent;
	private closesAtInput: InputComponent;
	private optionsContainer: HTMLDivElement;
	private options: {
		description: InputComponent,
		link: InputComponent
	}[] = [];

	private textarea: HTMLTextAreaElement;
	constructor(markdownEditor: HTMLDivElement) {
		this.trigger = IconButton(ChatBubbleLeftRightIcon(), () => {

		}, "gif-button") as HTMLDivElement;
		this.trigger.setAttribute("title", "Create Poll");
		this.trigger.addEventListener("click", () => {
			const isClosed = this.element.getAttribute("closed") === "true";
			this.element.setAttribute("closed", (!isClosed).toString());
		})

		this.textarea = markdownEditor.parentElement.querySelector(".input textarea");

		this.element = DOM.createDiv("markdown-dialog-container");
		this.element.setAttribute("closed", "true");
		this.element.append(DOM.createDiv("markdown-dialog-header", "Create a Poll"));

		if (!VoidApi.token) {
			this.body = DOM.createDiv("markdown-dialog-body", "Creating polls requires authorizing VoidVerified API in the settings.");
			this.element.append(this.body);
			return;
		}
		this.body = DOM.createDiv("markdown-dialog-body flex flex-column gap-5 items-start");
		this.element.append(this.body);

		this.titleInput = new InputComponent("w-100", "Ask a question...");
		this.body.append(this.titleInput.element);
		this.addOption = this.addOption.bind(this);
		this.createPoll = this.createPoll.bind(this);
		this.addControls();
	}

	private addControls() {
		this.optionsContainer = DOM.createDiv("flex flex-column gap-5 w-100");
		this.body.append(this.optionsContainer);
		this.addOption();
		this.addOption();
		this.addAddButton();
		this.addPollConfiguration();
		this.addCreatePollButton();
	}

	private addOption() {
		const input = new InputComponent("w-100", "Option...");
		const linkInput = new InputComponent(null, "Link (optional)");
		const deleteButton = DOM.createDiv("has-icon cursor-pointer", XMarkIcon());
		const container = DOM.createDiv("flex gap-5 items-center", [input.element, linkInput.element, deleteButton]);
		const o = {
			description: input,
			link: linkInput
		}
		deleteButton.addEventListener("click", () => {
			container.remove();
			this.options = this.options.filter(x => x !== o);
		})
		this.optionsContainer.append(container);
		this.options.push(o);
	}

	private addAddButton() {
		const button = new ButtonComponent("Add an Option", this.addOption);
		this.body.append(button.element);
	}

	private addPollConfiguration() {
		const container = DOM.createDiv("mt-10");
		this.allowMultipleVotesInput = new SelectComponent("No", ["Yes", "No"], () => {});
		container.append(Label("Allow multiple votes", this.allowMultipleVotesInput.element));

		this.closesAtInput = new InputComponent();
		this.closesAtInput.setType("datetime-local");
		this.closesAtInput.element.setAttribute("min", new Date().toISOString().slice(0, -8));
		container.append(Label("Closes at", this.closesAtInput.element));

		this.body.append(container);
	}

	private addCreatePollButton() {
		const button = new ButtonComponent("Create Poll", this.createPoll);
		this.body.append(button.element);
	}

	private async createPoll() {
		const createPoll: ICreatePoll = {
			title: this.titleInput.getValue(),
			options: this.options.map(x => {return {description: x.description.getValue(), link: x.link.getValue()}}),
			allowMultipleVotes: this.allowMultipleVotesInput.activeValue === "Yes",
			closesAt: new Date(this.closesAtInput.getValue())
		};

		if (!this.pollIsValid(createPoll)) {
			return;
		}

		try {
			const poll = await VoidApi.createPoll(createPoll);
			this.textarea.setRangeText(`[ img100%(${VoidApi.url}/polls/poll-image/${poll.id}) ](${VoidApi.url.replace("/api", "")})`);
			this.textarea.dispatchEvent(new Event('input', {bubbles: true}));
		} catch (error) {
			Toaster.error("Failed to create a poll.", error);
		}
	}

	private pollIsValid(createPoll: ICreatePoll): boolean {
		let validationErrors: string[] = [];
		if (createPoll.title.length < 5 || createPoll.title.length > 50) {
			validationErrors.push("Poll title should be between 5 and 50 characters.");
		}

		if (createPoll.options.length < 2 || createPoll.options.length > 15) {
			validationErrors.push("Poll should have between 2 and 15 options.");
		}

		if (createPoll.options.map(x => x.description).some(x => x.length < 2 || x.length > 50)) {
			validationErrors.push("All options should be between 2 and 50 characters.");
		}

		if (createPoll.closesAt && new Date(createPoll.closesAt).getTime() < new Date().getTime()) {
			validationErrors.push("Close time should be in the future.");
		}

		if (validationErrors.length > 0) {
			Dialog.inform(validationErrors.join("\n"), "Invalid Poll");
			return false;
		}

		return true;
	}
}
