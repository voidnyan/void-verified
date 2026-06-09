const mediaListCollection = `
    lists {
      entries {
        media {
          title {
            userPreferred
          }
          episodes
          chapters
          coverImage {
            medium
          }
          id
          type
          airingSchedule(notYetAired: $notYetAired, page: $page, perPage: $perPage) {
            nodes {
              episode
              airingAt
              timeUntilAiring
            }
          }
        }
        notes
        progress
        id
        status
      }
      name
      status
    }
`;

export default `
query InProgressMediaLists($userId: Int, $forceSingleCompletedList: Boolean, $statusIn: [MediaListStatus], $notYetAired: Boolean, $page: Int, $perPage: Int) {
  anime: MediaListCollection(userId: $userId, forceSingleCompletedList: $forceSingleCompletedList, type: ANIME, status_in: $statusIn) {
    ${mediaListCollection}
  }
  manga: MediaListCollection(userId: $userId, forceSingleCompletedList: $forceSingleCompletedList, type: MANGA, status_in: $statusIn) {
    ${mediaListCollection}
  }
}
`;
