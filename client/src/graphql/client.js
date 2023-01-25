import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient as createWSClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";

const GRAPHQL_URL = "http://localhost:9000/graphql";

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

const wsLink = new GraphQLWsLink(
  createWSClient({ url: "ws://localhost:9000/graphql" })
);

function isSubscription({ query }) {
  // check if the GraphQL is a subscription to decide if use the WS or HTTP link
  const definition = getMainDefinition(query);
  return (
    definition.kind === Kind.OPERATION_DEFINITION &&
    definition.operation === OperationTypeNode.SUBSCRIPTION
  );
}

export const client = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink), // works like and if
  cache: new InMemoryCache(),
});

export default client;
