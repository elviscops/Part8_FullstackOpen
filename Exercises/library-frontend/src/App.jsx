import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Recommended from "./components/Recommended";
import Login from "./components/Login";
import { gql} from '@apollo/client'
import { useQuery, useApolloClient, useSubscription } from '@apollo/client/react'

export const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name,
      bookCount,
      born
    }
  }
`
export const ALL_BOOKS = gql`
  query {
      allBooks {
        author {
            name,
            born,
            bookCount
        }
        genres
        published
        title
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`   
export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author{
      name
      id
      born
      bookCount
    }
    id
    genres
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
export const updateCache = (cache, query, addedBook) => {
    const uniqByTitle = (a) => {
        let seen = new Set()
        return a.filter((item) => {
            let k = item.title
            return seen.has(k) ? false : seen.add(k)
        })
    }
    cache.updateQuery(query, ({ allBooks }) => {
        return {
            allBooks: uniqByTitle(allBooks.concat(addedBook))
        }
    })
}

const App = () => {
    const resultAuthors = useQuery(ALL_AUTHORS);
    const resultBooks = useQuery(ALL_BOOKS);
    const client = useApolloClient()
    const [token, setToken] = useState(localStorage.getItem('user-token') ?? null);
    const [page, setPage] = useState("authors");

    const logout = () => {
        setToken(null)
        localStorage.removeItem("user-token")
        client.resetStore()
    }

    useSubscription(BOOK_ADDED, {
        onData: ({ data, client }) => {
            console.log('New book added via subscription', data)
            if (!data) return
            const addedBook = data.data.bookAdded
            console.log('Subscription data:', addedBook)
            try {
                window.alert(`New book added: ${addedBook.title} by ${addedBook.author.name}`)
                updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
            } catch (error) {
                console.error(error)
            }
        },
        onError: (err) => console.error('Subscription error', err)
    })


   

    if (resultAuthors.loading || resultBooks.loading) {
        return <div>loading...</div>;
    }

    if (resultAuthors.error || resultBooks.error) {
        return <div>Error: {(resultAuthors.error || resultBooks.error)?.message}</div>;
    }



    return (
        <div>
            <div>
                <button onClick={() => setPage("authors")}>authors</button>
                <button onClick={() => setPage("books")}>books</button>
                {token && <button onClick={() => setPage("add")}>add book</button>}
                {token && <button onClick={() => setPage("recommend")}>recommended</button>}
                {token && <button onClick={logout}>logout</button>}
                {!token && <button onClick={() => setPage("login")}>login</button>}
            </div>

            {page === "authors" && (
                <Authors authors={resultAuthors.data.allAuthors} show={page === "authors"} />
            )}
            

            {page === "books" && (
                <Books books={resultBooks.data?.allBooks ?? []} show={page === "books"} />
            )}

            {page === "add" && token && (
                <NewBook show={page === "add"} />
            )}

            {page === "recommend" && token && (
                <Recommended user={token} books={resultBooks.data?.allBooks ?? []} show={page === "recommend"} />
            )}

            {page === "login" && (
                <Login setToken={setToken} show={page === "login"} />
            )}

        </div>
    );
};

export default App;
