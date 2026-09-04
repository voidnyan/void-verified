import {ActivityReplyQueryPartial} from "./queryActivityReplies";

export const CreateActivityQuery = (includeReplies: boolean) => `
query ActivityQuery($activityId: Int) {
  Activity(id: $activityId) {
   ... on ListActivity {
	createdAt
	id
	isLiked
	isSubscribed
	likeCount
	likes {
	  avatar {
		large
	  }
	  name
	}
	media {
	  coverImage {
		large
	  }
	  type
	  id
	  title {
		userPreferred
	  }
	}
	progress
	replyCount
	${includeReplies ? `replies {${ActivityReplyQueryPartial}}` : ""}
	status
	type
	user {
	  name
	  id
	  donatorBadge
	  donatorTier
	  moderatorRoles
	  avatar {
		large
	  }
	}
  }

  			  ... on MessageActivity {
				createdAt
				id
				isLiked
				isSubscribed
				likeCount
				replyCount
				${includeReplies ? `replies {${ActivityReplyQueryPartial}}` : ""}
				likes {
				  avatar {
					large
				  }
				  name
				}
				recipient {
				  avatar {
					large
				  }
				  id
				  moderatorRoles
				  donatorTier
				  donatorBadge
				  name
				}
				message
				messenger {
				  avatar {
					large
				  }
				  id
				  moderatorRoles
				  name
				  donatorBadge
				  donatorTier
				}
				type
			  }

			  ... on TextActivity {
				createdAt
				isLiked
				isSubscribed
				likeCount
				likes {
				  avatar {
					large
				  }
				  name
				}
				replyCount
				${includeReplies ? `replies {${ActivityReplyQueryPartial}}` : ""}
				text
				type
				user {
				  avatar {
					large
				  }
				  moderatorRoles
				  name
				  id
				  donatorBadge
				  donatorTier
				}
				id
			  }

}
}

`;
