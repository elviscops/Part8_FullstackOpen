import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ME } from '../App.jsx'


const Recommended = (props) => {
    const books = props.books
    const user = useQuery(ME);
    const favoriteGenre = user.data?.me?.favoriteGenre;

    const displayedBooks = books
    ? (favoriteGenre
            ? books.filter(b => (b.genres || []).includes(favoriteGenre))
            : books)
    : [];

 
    if (!props.show) {
        return null
    }


return (
        <div>
                <h2>Recommended books</h2>

                <table>
                        <tbody>
                                <tr>
                                        <th>x</th>
                                        <th>author</th>
                                        <th>published</th>
                                        <th>genre</th>
                                </tr>
                                {displayedBooks.map((a) => (
                                        <tr key={a.title}>
                                                <td>{a.title}</td>
                                                <td>{a.author?.name ?? "Unknown"}</td>
                                                <td>{a.published}</td>
                                                <td>{a.genres?.join(", ")}</td>
                                        </tr>
                                ))}
                        </tbody>
                </table>
        </div>
)
}

export default Recommended
