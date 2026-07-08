export interface IViewer {
	options: {
		activityMergeTime: number,
		disabledListActivity: IDisabledActivity[]
	}
}

interface IDisabledActivity {
	disabled: boolean;
	type: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING"
}
