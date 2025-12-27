import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink,
  createHttpLink,
  ApolloLink,
  split
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import {setContext, SetContextLink} from '@apollo/client/link/context';

import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({ uri: "http://localhost:4000" });

const authLink = new SetContextLink((operation, previousContext) => {
    const token = localStorage.getItem('user-token');
    const headers = previousContext?.headers || {};
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : null,
        },
    };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000'
    // ,
    // connectionParams: () => {
    //   const token = localStorage.getItem('user-token');
    //   return {
    //     authorization: token ? `Bearer ${token}` : null,
    //   };
    // },
  })
);

const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
  link: splitLink
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
  </React.StrictMode>
);