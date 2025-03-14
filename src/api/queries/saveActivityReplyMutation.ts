export default `
mutation SaveActivityReply($id: Int, $content: String) {
  SaveActivityReply(id: $id, text: $content) {
    text
  }
}
`;
