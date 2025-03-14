export class ALScrollock {
	static lock() {
		document.body.classList.add("scroll-lock");
	}

	static unlock(){
		document.body.classList.remove("scroll-lock");
	}
}
