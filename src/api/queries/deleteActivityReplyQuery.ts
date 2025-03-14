export default `
mutation Mutation($id: Int) {
  DeleteActivityReply(id: $id) {
    deleted
  }
}
`;
