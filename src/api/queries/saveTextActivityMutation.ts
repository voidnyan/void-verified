export default `
mutation SaveTextActivity($content: String, $id: Int) {
  SaveTextActivity(text: $content, id: $id) {
    text
  }
}`;
