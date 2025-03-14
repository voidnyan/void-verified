export default `mutation SaveActivityReply($activityId: Int, $text: String) {
  SaveActivityReply(activityId: $activityId, text: $text) {
    activityId
    createdAt
    id
    likeCount
    likes {
      avatar {
        large
      }
      name
    }
    isLiked
    text
    user {
      avatar {
        large
      }
      name
      id
    }
  }
}`;
