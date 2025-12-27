import { useState } from 'react'
import { gql} from '@apollo/client'
import { useMutation} from '@apollo/client/react'
import { ALL_BOOKS } from '../App'
import { ALL_AUTHORS } from '../App'
import { updateCache } from '../App'


const ADD_BOOK = gql`
    mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(
            title: $title,
            author: $author,
            published: $published,
            genres: $genres
        ) {
            title,
            author {
                name
                born
                bookCount
            }
            published,
            genres
        }
    }
`

const NewBook = (props) => {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [published, setPublished] = useState('')
    const [genre, setGenre] = useState('')
    const [genres, setGenres] = useState([])

    const [addBook] = useMutation(ADD_BOOK, {
        refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
        onError: (error) => {
            console.error('addBook error:', error)
        },
        update: (cache, response) => {
            console.log('Updating cache with new book:', response.data.addBook)
            updateCache(cache, { query: ALL_BOOKS }, response.data.addBook)
        }   
    })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!title || title.trim() === '') {
      alert('Title is required')
      return
    }
    if (!author || author.trim() === '') {
      alert('Author is required')
      return
    }

    const publishedInt = parseInt(published, 10)
    if (Number.isNaN(publishedInt)) {
      alert('Published must be a number')
      return
    }

    try {
      addBook({
        variables: {
          title: title.trim(),
          author: author.trim(),
          published: publishedInt,
          genres
        }
      })
      setTitle('')
      setPublished('')
      setAuthor('')
      setGenres([])
      setGenre('')
    } catch (err) {
      console.error('addBook caught:', err)
    }
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
