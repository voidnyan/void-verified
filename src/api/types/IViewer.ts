import {ActivityType} from "./activityType";

export interface IViewer {
	options: {
		activityMergeTime: number,
		disabledListActivity: IDisabledActivity[]
	}
}

interface IDisabledActivity {
	disabled: boolean;
	type: ActivityType
}
