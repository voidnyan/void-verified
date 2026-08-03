export const socialTabFollowingQuery = `query Page($page: Int, $perPage: Int, $isFollowing: Boolean, $mediaId: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    mediaList(isFollowing: $isFollowing, mediaId: $mediaId) {
      notes
      progress
      repeat
      user {
        name
      }
      media {
        chapters
        episodes
      }
    }
  }
}`;
