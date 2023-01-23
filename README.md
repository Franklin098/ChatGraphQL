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
