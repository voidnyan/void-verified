export class Vue {
	// @ts-ignore
	static vue = document.querySelector('#app')?.__vue__;
	// @ts-ignore
	static router = document.querySelector('#app')?.__vue__?.$router;

	static ensureIsRegistered() {
		let vueInterval = setInterval(() => {
			if (!this.vue) {
				// @ts-ignore
				this.vue = document.querySelector('#app')?.__vue__;
			} else {
				clearInterval(vueInterval);
			}
		}, 50);

		let routerInterval = setInterval(() => {
			if (!this.router) {
				// @ts-ignore
				this.router = document.querySelector('#app')?.__vue__?.$router
			} else {
				clearInterval(routerInterval);
			}
		}, 50);
	}

	static handleAnchorClickEvent(event) {
		const target = event.target.closest("a");
		if (target.href && Vue.router) {
			if (target.hostname === window.location.hostname) {
				event.preventDefault();
				const path = target.pathname + target.search;
				const pathStart = path.slice(1).split("/")[0]
				const locationStart = window.location.pathname.slice(1).split("/")[0]
				if (pathStart && locationStart) {
					document.body.classList.add("void-hide-404");
					this.router.push("/404");
					setTimeout(() => {
						this.router.push(path);
						document.body.classList.remove("void-hide-404");
					}, 5);
				} else {
					this.router.push(path);
				}
			}
		}
	}
}
