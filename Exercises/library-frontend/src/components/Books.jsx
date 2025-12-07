import { useEffect, useState } from 'react'


const Books = (props) => {
    const books = props.books
    
    const genre = books ? Array.from(new Set(books.flatMap(b => b.genres || []))) : [];

    const [selectedGenre, setSelectedGenre] = useState(null);
    

    useEffect(() => {
      setSelectedGenre(selectedGenre);
    }, [selectedGenre]);
 
    if (!props.show) {
        return null
    }

    const handleGenreClick = (genre) => {
        console.log('genre', genre);
      setSelectedGenre(genre);

    }   

  
const displayedBooks = books
    ? (selectedGenre
            ? books.filter(b => (b.genres || []).includes(selectedGenre))
            : books)
    : [];

return (
        <div>
                <h2>books</h2>

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
                <div>
                        <button
                                onClick={() => handleGenreClick(null)}
                                style={{
                                        fontWeight: selectedGenre === null ? "600" : "normal",
                                }}
                        >
                                all genres
                        </button>
                        {genre.map((g) => (
                                <button
                                        key={g}
                                        onClick={() => handleGenreClick(g)}
                                        style={{
                                                fontWeight: selectedGenre === g ? "600" : "normal",
                                        }}
                                >
                                        {g}
                                </button>
                        ))}
                </div>
        </div>
)
}

export default Books
