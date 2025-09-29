const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
    type Book {
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    }

    type Author {
        name: String!
        born: Int
        bookCount: Int!
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genres: String): [Book!]!
        allAuthors: [Author!]!
    }
`

const resolvers = {
    Query: {
        bookCount: () => books.length,
        authorCount: () => authors.length,
        allBooks: (root, args) => {
            if (args.author) {
                return books.filter(book => book.author === args.author)
            } else if (args.genres) {
                return books.filter(book => book.genres.includes(args.genres))
            } else if (args.genres && args.author) {
                return books.filter(book => book.author === args.author && book.genres.includes(args.genres))
            }
             else {
                return books
            }
        },

        
            
        allAuthors: () => authors.map(author => {
            return {
                name: author.name,
                bookCount: books.filter(book => book.author === author.name).length
            }
        })

    },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})


// 8.1 Exercise 1:
// Returned:
// {
//   "data": {
//     "bookCount": 7,
//     "authorCount": 5
//   }
// }
// 8.2 Exercise 2:
// Returned:
// {{
//   "data": {
//     "allBooks": [
//       {
//         "title": "Clean Code",
//         "published": 2008,
//         "genres": [
//           "refactoring"
//         ],
//         "author": "Robert Martin"
//       },
//       {
//         "title": "Agile software development",
//         "published": 2002,
//         "genres": [
//           "agile",
//           "patterns",
//           "design"
//         ],
//         "author": "Robert Martin"
//       },
//       {
//         "title": "Refactoring, edition 2",
//         "published": 2018,
//         "genres": [
//           "refactoring"
//         ],
//         "author": "Martin Fowler"
//       },
//       {
//         "title": "Refactoring to patterns",
//         "published": 2008,
//         "genres": [
//           "refactoring",
//           "patterns"
//         ],
//         "author": "Joshua Kerievsky"
//       },
//       {
//         "title": "Practical Object-Oriented Design, An Agile Primer Using Ruby",
//         "published": 2012,
//         "genres": [
//           "refactoring",
//           "design"
//         ],
//         "author": "Sandi Metz"
//       },
//       {
//         "title": "Crime and punishment",
//         "published": 1866,
//         "genres": [
//           "classic",
//           "crime"
//         ],
//         "author": "Fyodor Dostoevsky"
//       },
//       {
//         "title": "Demons",
//         "published": 1872,
//         "genres": [
//           "classic",
//           "revolution"
//         ],
//         "author": "Fyodor Dostoevsky"
//       }
//     ]
//   }
// }
// 8.3 Exercise 3:
// Returned:
// {
//   "data": {
//     "allAuthors": [
//       {
//         "name": "Robert Martin",
//         "bookCount": 2
//       },
//       {
//         "name": "Martin Fowler",
//         "bookCount": 1
//       },
//       {
//         "name": "Fyodor Dostoevsky",
//         "bookCount": 2
//       },
//       {
//         "name": "Joshua Kerievsky",
//         "bookCount": 1
//       },
//       {
//         "name": "Sandi Metz",
//         "bookCount": 1
//       }
//     ]
//   }
// }
// 8.4 Exercise 4:
// Returned:
// {{
//   "data": {
//     "allBooks": [
//       {
//         "title": "Clean Code"
//       },
//       {
//         "title": "Agile software development"
//       }
//     ]
//   }
// }