export default `
query Query($search: String, $perPage: Int) {
  Page(perPage: $perPage) {
    users(search: $search) {
      avatar {
        large
      }
      id
      name
    }
  }
}
`;
