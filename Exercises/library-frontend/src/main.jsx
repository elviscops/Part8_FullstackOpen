import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink,
  createHttpLink
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import {setContext} from '@apollo/client/link/context'

const link = new HttpLink({ uri: "http://localhost:4000" });



const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('user-token')
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : null,
        }
    }
})

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
  link: authLink.concat(link)
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
  </React.StrictMode>
);