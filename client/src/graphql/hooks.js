import { useMutation, useQuery } from "@apollo/client";
import { getAccessToken } from "../auth";
import { ADD_MESSAGE_MUTATION, MESSAGES_QUERY } from "./queries";

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
        update: (cache, result) => {
          // update cache with the created message
          const {
            data: { message },
          } = result;
          // pass the query to update
          cache.updateQuery({ query: MESSAGES_QUERY }, (oldData) => {
            // update adding the new message.
            const newData = {
              messages: [...oldData.messages, message],
            };
            return newData;
          });
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
  return {
    messages: data?.messages ?? [],
  };
}
