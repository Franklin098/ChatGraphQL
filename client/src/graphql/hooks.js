import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { getAccessToken } from "../auth";
import {
  ADD_MESSAGE_MUTATION,
  MESSAGES_QUERY,
  MESSAGE_ADDED_SUBSCRIPTION,
} from "./queries";

export function useAddMessage() {
  const [mutate] = useMutation(ADD_MESSAGE_MUTATION);
  return {
    addMessage: async (text) => {
      const {
        data: { message },
      } = await mutate({
        variables: { input: { text } },
        context: {
          headers: { Authorization: "Bearer " + getAccessToken() },
        },
      });
      return message;
    },
  };
}

export function useMessages() {
  const { data } = useQuery(MESSAGES_QUERY, {
    context: {
      headers: { Authorization: "Bearer " + getAccessToken() },
    },
  });

  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    // we get notified of new messages
    onSubscriptionData: ({ client, subscriptionData }) => {
      console.log("subscription data: ", subscriptionData);
      const message = subscriptionData.data.message;

      // update local cache
      client.cache.updateQuery({ query: MESSAGES_QUERY }, (oldData) => {
        // append the new message to the list of messages
        const newData = {
          messages: [...oldData.messages, message],
        };
        return newData;
      });
    },
  });

  return {
    messages: data?.messages ?? [],
  };
}
