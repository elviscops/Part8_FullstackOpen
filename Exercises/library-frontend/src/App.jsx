import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { gql } from '@apollo/client'
import { useQuery} from '@apollo/client/react'



const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name,
      bookCount,
      born
    }
  }
`
const ALL_BOOKS = gql`
  query {
      allBooks {
        author
        genres
        published
        title
    }
  }
`


const App = () => {
    const resultAuthors = useQuery(ALL_AUTHORS)
    const resultBooks = useQuery(ALL_BOOKS)
    const [page, setPage] = useState("authors");


    if (resultAuthors.loading || resultBooks.loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <div>
                <button onClick={() => setPage("authors")}>authors</button>
                <button onClick={() => setPage("books")}>books</button>
                <button onClick={() => setPage("add")}>add book</button>
            </div>

            <Authors authors={resultAuthors.data.allAuthors} show={page === "authors"} />

            <Books books={resultBooks.data.allBooks} show={page === "books"} />

            <NewBook show={page === "add"} />
        </div>
    );
};

export default App;
