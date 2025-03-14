export default `mutation ToggleActivitySubscription($activityId: Int, $subscribe: Boolean) {
    ToggleActivitySubscription(activityId: $activityId, subscribe: $subscribe) {
        ... on TextActivity {
            isSubscribed
        }
        ... on ListActivity {
            isSubscribed
        }
        ... on MessageActivity {
            isSubscribed
        }
    }
}
`;

export interface IToggleActivitySubscription {
	isSubscribed: boolean
}
