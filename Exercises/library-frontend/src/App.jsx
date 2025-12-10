import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Recommended from "./components/Recommended";
import Login from "./components/Login";
import { gql} from '@apollo/client'
import { useQuery } from '@apollo/client/react'


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

const App = () => {
    const resultAuthors = useQuery(ALL_AUTHORS);
    const resultBooks = useQuery(ALL_BOOKS);
    const userLoggedIn = false; 
    const client = localStorage.getItem('user-token')
    const [token, setToken] = useState(localStorage.getItem('user-token') ?? null);
    const [page, setPage] = useState("authors");

    const logout = () => {
        setToken(null)
        localStorage.clear("user-token")
        client.resetStore()
    }

   

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
