# Chat GraphQL

FullStack Web App.

The main purpose is to implement and explore graphQL subscriptions features.

We can use the local cache that GraphQL provides to append the new messages that the users just sent. But we want to also receive real time updates, for that we need to use subscriptions.

### 1. Add your Subscription Schema

Server > schema.graphql:

```
type Subscription {
  messageAdded: Message
}
```

Our server now must support WS protocols, which stands for "Web Sockets".

With normal HTTP request, every connection between the client and the server is closed when the response is received. If we want to fetch more data we need to do a hole new connection.

With Web Sockets the client and the server starts a connection that stays open, the server may not have no data to send, but as soon as there is new data the server sends the data in the same channel.

### 2. Configure Server to handle Web Sockets

There are 2 packages to handle GraphQL over web sockets.

- subscriptions-transport-ws (no longer maintained)
- graph-ws [GraphQL Over Websocket] (new package)

We need to also install the ws package which supports the low level web socket.

```
npm install graphql-ws ws @graphql-tools/schema

```

Server > server.js

```
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import { expressjwt } from "express-jwt";
import { readFile } from "fs/promises";
import jwt from "jsonwebtoken";
import { User } from "./db.js";
import { resolvers } from "./resolvers.js";
import { createServer as createHttpServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer as useWsServer } from "graphql-ws/lib/use/ws";

const PORT = 9000;

const app = express();

// ...
// ... other code here ..
// ...

// handle both Http and WS servers
const httpServer = createHttpServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

const typeDefs = await readFile("./schema.graphql", "utf8");

// create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// user WebSockets
useWsServer({ schema }, wsServer);

const apolloServer = new ApolloServer({
  schema,
  context: getContext,
});
await apolloServer.start();
apolloServer.applyMiddleware({ app, path: "/graphql" });

// update
httpServer.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});

```

### 3. Add the Resolver for the subscription schema.

Subscriptions must return a **subscribe()** function and return an **Async Iterator**.

We can use the `graphql-subscriptions` package which handles this using a PubSub approach.

`npm i graphql-subscriptions`

In Server > resolver.js

```
import { Message } from "./db.js";
import { PubSub } from "graphql-subscriptions";

const pubSub = new PubSub();

export const resolvers = {

  Mutation: {
    addMessage: async (_root, { input }, { userId }) => {
      rejectIf(!userId);

      const message = await Message.create({ from: userId, text: input.text });

      // when someone in the chat publish a new message, then notify to all users in the channel.
      pubSub.publish("MESSAGE_ADDED", { messageAdded: message });

      return message;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_ADDED"),
    },
  },
};


```

Testing using Apollo Server SandBox

![](./images/image1.png)
