const { GraphQLError } = require('graphql')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const { v1: uuid } = require('uuid')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();



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
            return Author.find({}).populate('books')
        },
        me: async (root, args, context) => {
            return context.currentUser
        }   
    },
    Author: {
        bookCount: async (root) => {
            const authorFound = await Author.findOne({ name: root.name })
            const booksFound = await Book.find({ author: authorFound.id })
            //const count = await Book.countDocuments({ author: root._id })
            const count = booksFound.length
            return count
        }
    },
    Mutation: {
        addBook: async (root, args, context) => {

            const authorExists = await Author.findOne({ name: args.author })
            const currentUser = context.currentUser
            // console.log('current user in AddBook:', currentUser)

            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    }
                })
            }
            let author;

            if (!authorExists) {
                author = new Author({ name: args.author })
                try {
                    await author.save()
                } catch (error) {
                    let errorMessage = "Saving author failed";

                    if (error instanceof mongoose.Error.ValidationError) {
                        console.log(error.message);

                        if (error.errors.hasOwnProperty("name")) {
                            errorMessage = "Saving author failed. Author name is not valid";
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
            } else {
                author = authorExists
            }

            const authorFound = await Author.findOne({ name: args.author });
            const book = new Book({ ...args, author: authorFound.id });
            let newBook;
            

            try {
                await book.save();

                authorFound.books = authorFound.books.concat(book.id);
                await authorFound.save();
                newBook = await Book.findById(book.id).populate('author',{ name: 1, born: 1, id: 1 });                
            } catch (error) {
                console.log(error);
            }

            await pubsub.publish('BOOK_ADDED', { bookAdded: newBook });
            return newBook;

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
    },    
    Subscription: {
            bookAdded: {
                subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
            }
        }
}
module.exports = resolvers  