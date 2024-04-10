import { DOM } from "../utils/DOM";

const Accordion = (head, body, isOpen) => {
	const bodyWrapper = DOM.create("div", "accordion-body", body);
	bodyWrapper.setAttribute("data-is-open", isOpen);
	head.addEventListener("click", () => {
		if (bodyWrapper.getAttribute("data-is-open")) {
			bodyWrapper.setAttribute("data-is-open", false);
		} else {
			bodyWrapper.setAttribute("data-is-open", true);
		}
	});

	const accordion = DOM.create("div", "accordion");
	accordion.append(head, bodyWrapper);
	return accordion;
};
