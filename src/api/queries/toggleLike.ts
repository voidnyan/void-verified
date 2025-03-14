export default `mutation ToggleLikeV2($toggleLikeV2Id: Int, $type: LikeableType) {
		  ToggleLikeV2(id: $toggleLikeV2Id, type: $type) {
			... on ListActivity {
			  isLiked
			  likeCount
			}
			... on TextActivity {
			  isLiked
			  likeCount
			}
			... on MessageActivity {
			  isLiked
			  likeCount
			}
			... on ActivityReply {
			  isLiked
			  likeCount
			}
			... on Thread {
			  isLiked
			  likeCount
			}
			... on ThreadComment {
			  isLiked
			  likeCount
			}
		  }
		}`;

export interface IToggleLike {
	isLiked: boolean,
	likeCount: number
}
