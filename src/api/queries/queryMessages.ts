export default `query Page($sort: [ActivitySort], $isFollowing: Boolean, $type: ActivityType, $asHtml: Boolean, $page: Int, $perPage: Int) {
		  Page(page: $page, perPage: $perPage) {
		  	pageInfo {
			  hasNextPage
			  currentPage
			  perPage
			  total
			}
			activities(sort: $sort, isFollowing: $isFollowing, type: $type) {
			  ... on MessageActivity {
				message(asHtml: $asHtml)
				messenger {
				  name
				  id
				  avatar {
					large
				  }
				  donatorBadge
				  donatorTier
				}
				recipient {
				  name
				  donatorBadge
				  donatorTier
				  id
				  avatar {
					large
				  }
				}
				id
				isLiked
				type
				createdAt
				isSubscribed
				likeCount
				replyCount
				likes {
				  avatar {
					large
				  }
				  name
				}
			  }
			}
		  }
		}`;
