export default `
mutation Mutation($id: Int) {
  DeleteActivity(id: $id) {
    deleted
  }
}
`;
