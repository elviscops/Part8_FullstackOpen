

const Books = (props) => {
  if (!props.show) {
    return null
  }

  const books = props.books

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th>x</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name ?? "Unknown"}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
