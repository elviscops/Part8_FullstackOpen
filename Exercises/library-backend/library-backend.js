const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require('uuid')
const Book = require('./models/book')
const Author = require('./models/author')

const mongoose = require('mongoose')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = `
    type Book {
        title: String!
        published: Int!
        author: Author!
        genres: [String!]!
        id: ID!
    }

    type Author {
        name: String!
        born: Int
        bookCount: Int!
        id: ID!
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genres: String): [Book!]!
        allAuthors: [Author!]!
    }

    
    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ): Book!
        editAuthor(name: String!, setBornTo: Int!): Author
    }
    
`

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),//books.length,
        authorCount: async () => Author.collection.countDocuments(),//authors.length,
        allBooks: async (root, args) => {
            // if (args.author) {
            //     return books.filter(book => book.author === args.author)
            // } else if (args.genres) {
            //     return books.filter(book => book.genres.includes(args.genres))
            // } else if (args.genres && args.author) {
            //     return books.filter(book => book.author === args.author && book.genres.includes(args.genres))
            // } else {
            //     return books
            // }
            return Book.find({}).populate('author')
        },   
        allAuthors: async () => {
            return Author.find({})
        }
        
        // authors.map(author => {
        //     return {
        //         name: author.name,
        //         born: author.born,
        //         bookCount: books.filter(book => book.author === author.name).length
        //     }
        // })
        ,
    },
    Mutation: {
        addBook: (root, args) => {
            const book = {...args, id: uuid()}
            if (!authors.find(a => a.name === args.author)) {
                authors = authors.concat({ name: args.author, id: uuid() })
            }
            books = books.concat(book)
            return book
        },
        editAuthor: (root, args) => {
            const author = authors.find(a => a.name === args.name)
            if (!author) null

            const updatedAuthor = {...author,born: args.setBornTo}
            authors = authors.map(a => a.name === args.name ? updatedAuthor: a)
            return updatedAuthor
        }
    }
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
// 8.5 Exercise
// Returned
// {
//   "data": {
//     "allBooks": [
//       {
//         "title": "Clean Code",
//         "author": "Robert Martin"
//       },
//       {
//         "title": "Agile software development",
//         "author": "Robert Martin"
//       }
//     ]
//   }
// }
// Exercise 8.6
// {
//   "data": {
//     "allAuthors": [
//       {
//         "name": "Robert Martin",
//         "born": 1952,
//         "bookCount": 2
//       },
//       {
//         "name": "Martin Fowler",
//         "born": 1963,
//         "bookCount": 1
//       },
//       {
//         "name": "Fyodor Dostoevsky",
//         "born": 1821,
//         "bookCount": 2
//       },
//       {
//         "name": "Joshua Kerievsky",
//         "born": null,
//         "bookCount": 1
//       },
//       {
//         "name": "Sandi Metz",
//         "born": null,
//         "bookCount": 1
//       },
//       {
//         "name": "Reijo Mäki",
//         "born": null,
//         "bookCount": 1
//       }
//     ]
//   }
// }

// Exercise 8.7
// {
//   "data": {
//     "allAuthors": [
//       {
//         "name": "Robert Martin",
//         "born": 1952,
//         "bookCount": 2
//       },
//       {
//         "name": "Martin Fowler",
//         "born": 1963,
//         "bookCount": 1
//       },
//       {
//         "name": "Fyodor Dostoevsky",
//         "born": 1821,
//         "bookCount": 2
//       },
//       {
//         "name": "Joshua Kerievsky",
//         "born": null,
//         "bookCount": 1
//       },
//       {
//         "name": "Sandi Metz",
//         "born": null,
//         "bookCount": 1
//       },
//       {
//         "name": "Reijo Mäki",
//         "born": 1958,
//         "bookCount": 1
//       }
//     ]
//   }
// }
