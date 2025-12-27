const { ApolloServer } = require('@apollo/server')
//const { startStandaloneServer } = require('@apollo/server/standalone')
const jwt = require('jsonwebtoken')
const { expressMiddleware } = require('@as-integrations/express5');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {ApolloServerPluginDrainHttpServer} = require('@apollo/server/plugin/drainHttpServer');
const {makeExecutableSchema} = require('@graphql-tools/schema');
const http = require('http');
const {WebSocketServer} = require('ws');
const {useServer} = require('graphql-ws/lib/use/ws');

const User = require('./models/user')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

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

  mongoose.set('debug', true);


const server = new ApolloServer({
    typeDefs,
    resolvers,
})

// startStandaloneServer(server, {
//   listen: { port: 4000 },
//     context: async ({ req,res }) => {
//     const auth = req ? req.headers.authorization : null
//     if (auth && auth.startsWith('Bearer ')) {
//       const token = auth.substring(7)
//       const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
//       const currentUser = await User.findById(decodedToken.id)
//       console.log('current user:', currentUser)
//       return { currentUser }
//     }
//   }
// }).then(({ url }) => {
//   console.log(`Server ready at ${url}`)
// })
 
const start = async () => {

  const app = express();
  const httpServer = http.createServer(app);
    const wsServer = new WebSocketServer({
    server: httpServer,
     path: '/',
    });
    const schema = makeExecutableSchema({typeDefs, resolvers});
    const serverCleanup = useServer({ schema }, wsServer);

    const server = new ApolloServer({
    schema,
        plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
            return {
                async drainServer() {
                await serverCleanup.dispose();
                },
            };
            },
        },
        ],
    });

  await server.start();

  app.use(
    '/',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.substring(7)
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id)
          //console.log('current user:', currentUser)
          return { currentUser }
        }
      },
    }),
  );

  httpServer.listen({ port: 4000 }, () => {
    console.log(`Server is now running on http://localhost:4000`);
  });
};

start();