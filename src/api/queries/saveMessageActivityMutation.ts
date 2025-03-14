export default `
mutation SaveMessageActivity($id: Int, $content: String) {
  SaveMessageActivity(id: $id, message: $content) {
    message
  }
}
`;
