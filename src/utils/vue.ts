export class Vue {
	// @ts-ignore
	static vue = document.querySelector('#app')?.__vue__;
	// @ts-ignore
	static router = document.querySelector('#app')?.__vue__?.$router;

	static ensureIsRegistered() {
		let tries = 0;
		let vueInterval = setInterval(() => {
			if (!this.vue && tries < 20) {
				// @ts-ignore
				this.vue = document.querySelector('#app')?.__vue__;
				tries++;
			} else {
				clearInterval(vueInterval);
			}
		}, 50);

		let tries2 = 0;
		let routerInterval = setInterval(() => {
			if (!this.router && tries2 < 20) {
				// @ts-ignore
				this.router = document.querySelector('#app')?.__vue__?.$router
				tries2++;
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
