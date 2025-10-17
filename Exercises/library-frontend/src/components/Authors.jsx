import { useState } from 'react'
import Select from 'react-select'
import { gql} from '@apollo/client'
import { useMutation} from '@apollo/client/react'
import { ALL_AUTHORS } from '../App'

const SET_BIRTHYEAR = gql`
    mutation editAuthor($name: String!, $setBornTo: Int!) {
        editAuthor(
            name: $name,
            setBornTo: $setBornTo
        ) {
            name,
            born
        }
    }
`   



const Authors = (props) => {
    
    const [author, setAuthor] = useState('')
    const [birthyear, setBirthyear] = useState('')
    const authors = props.authors

    const [ updateAuthor ] = useMutation(SET_BIRTHYEAR, {
        refetchQueries: [ { query: ALL_AUTHORS } ]
    })

    const options = authors.map( (author)=>{
        return { value: author.name, label: author.name }
    })

    const submit = (event) => {
        event.preventDefault()

        updateAuthor({ variables: { name: author, setBornTo: Number(birthyear) } })
            
        setAuthor('')
        setBirthyear('')
    }

    if (!props.show) {
        return null
    }

  

  return (
    <>
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {authors.map((a) => (
                        <tr key={a.name}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div>
              <h2>Set birthyear</h2>
              <form onSubmit={submit}>
                <div>
                    name
                {/* <input
                    value={author}
                    onChange={({ target }) => setAuthor(target.value)}
                /> */}
                <Select
                    defaultValue={author}
                    onChange={(selectedOption) => setAuthor(selectedOption.value)}
                    options={options}
                />
                </div>
                <div>
                    born
                <input
                    type="number"
                    value={birthyear}
                    onChange={({ target }) => setBirthyear(target.value)}
                />
                </div>
                
                <button type="submit">
                    update author
                </button>
                
            </form>
        </div>
    </>
  )
}

export default Authors
