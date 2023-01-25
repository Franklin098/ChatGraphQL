import { Message } from "./db.js";
import { PubSub } from "graphql-subscriptions";

const pubSub = new PubSub();

function rejectIf(condition) {
  if (condition) {
    throw new Error("Unauthorized");
  }
}

export const resolvers = {
  Query: {
    messages: (_root, _args, { userId }) => {
      rejectIf(!userId);
      return Message.findAll();
    },
  },

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
      subscribe: (_root, _args, context) => {
        const { userId } = context;
        rejectIf(!userId);
        return pubSub.asyncIterator("MESSAGE_ADDED");
      },
    },
  },
};
