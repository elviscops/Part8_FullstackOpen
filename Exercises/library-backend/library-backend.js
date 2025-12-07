const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

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
        me: User
    }
    
    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }

    type Token {
        value: String!
    }
    
    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ): Book!
        editAuthor(name: String!, setBornTo: Int!): Author

        createUser(
            username: String!
            favoriteGenre: String!
        ): User
        login(
            username: String!
            password: String!
        ): Token
    }
    
`

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            const query = {}
            if (args.author) {
                const author = await Author.findOne({ name: args.author })
                if (author) {
                    query.author = author._id
                } else {
                    return []
                }
            }
            if (args.genres) {
                query.genres = { $in: [args.genres] }
            }   
            let bookList = await Book.find(query).populate('author',{ name: 1, born: 1, id: 1 })

            return bookList
        },   
        allAuthors: async () => {
            return Author.find({})
        },
        me: async (root, args, context) => {
            return context.currentUser
        }   
    },
    Author: {
        bookCount: async (root) => {
            const count = await Book.countDocuments({ author: root._id })
            return count
        }
    },
    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser
            console.log('current user in AddBook:', currentUser)

            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    }
                })
            }
            let author;

            try {
                author = await Author.findOne({ name: args.author });

                if (!author) author = new Author({ name: args.author });
                await author.save();

                const book = new Book({ ...args, author });
                await book.save();

                return book;
            } catch (error) {
                let errorMessage = "Saving book failed";

                if (error instanceof mongoose.Error.ValidationError) {
                console.log(error.message);

                if (error.errors.hasOwnProperty("name")) {
                    errorMessage = "Saving book failed. Author name is not valid";
                } else if (error.errors.hasOwnProperty("title")) {
                    errorMessage = "Saving book failed. Book title is not valid";
                }
                throw new GraphQLError(errorMessage, {
                    extensions: {
                    code: "BAD_USER_INPUT",
                    },
                });
                } else {
                console.log(error);
                throw new GraphQLError(errorMessage);
                }
            }
        },
        editAuthor: async (root, args) => {
            const author = await Author.findOne({ name: args.name })
            if (!author) {
                return null
            }

            author.born = args.setBornTo

            try {
                await author.save()
            } catch (error) {
                throw new GraphQLError('Editing author failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                        error
                    }
                })
            }
            return author
        }
,        createUser: async (root, args) => {
            const user = new User({ ...args })

            try {
                await user.save()
            } catch (error) {
                throw new GraphQLError('Creating the user failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.username,
                        error
                    }
                })
            }

            return user
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== 'secret') {
                throw new GraphQLError('Wrong credentials', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id
            }

            const jwtSecret = process.env.JWT_SECRET
            if (!jwtSecret) {
                throw new GraphQLError('JWT_SECRET is not set on the server', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' }
                })
            }

            return { value: jwt.sign(userForToken, jwtSecret) }

        }
    }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
    context: async ({ req,res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7)
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      console.log('current user:', currentUser)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
 