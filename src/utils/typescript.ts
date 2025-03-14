export class Typescript {
	static getTypeKeys(type: any) {
		return Object.keys(type).filter(key => isNaN(Number(key)))
	}
}
