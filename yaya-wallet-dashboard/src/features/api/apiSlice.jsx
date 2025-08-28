// src/features/api/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PROXY_BASE = process.env.REACT_APP_PROXY_BASE ?? ""; // blank -> relative paths (CRA proxy)
const baseQuery = fetchBaseQuery({ baseUrl: PROXY_BASE });

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery,
  tagTypes: ["TRANSACTION"],
  endpoints: (builder) => ({
    // GET: /api/transactions?p=1
    getUserTransactions: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: `/api/transactions?p=${page}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log("Raw GET transactions response:", response);

        const items = (response?.data ?? []).map((tx) => ({
          id: tx.id,
          sender: tx.sender?.name ?? tx.sender?.account ?? "-",
          senderAccount: tx.sender?.account ?? null,
          receiver: tx.receiver?.name ?? tx.receiver?.account ?? "-",
          receiverAccount: tx.receiver?.account ?? null,
          amount: tx.amount ?? 0,
          amount_with_currency: tx.amount_with_currency ?? `${tx.amount ?? 0} ${tx.currency ?? ""}`,
          currency: tx.currency ?? "",
          cause: tx.cause ?? "",
          createdAt: tx.created_at_time ? new Date(tx.created_at_time * 1000).toISOString() : null,
          is_topup: !!tx.is_topup,
          is_outgoing_transfer: !!tx.is_outgoing_transfer,
          raw: tx,
        }));

        return {
          items,
          meta: {
            lastPage: response?.lastPage ?? 1,
            total: response?.total ?? items.length,
            perPage: response?.perPage ?? items.length,
          },
        };
      },
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((t) => ({ type: "TRANSACTION", id: t.id })),
              { type: "TRANSACTION", id: "LIST" },
            ]
          : [{ type: "TRANSACTION", id: "LIST" }],
    }),

    // POST: /api/transactions/search?p=1
    searchTransactions: builder.mutation({
      query: ({ query, page = 1 }) => ({
        url: `/api/transactions/search?p=${page}`,
        method: "POST",
        body: { query },
      }),
      transformResponse: (response) => {
        console.log("Raw POST search response:", response);

        const items = (response?.data ?? []).map((tx) => ({
          id: tx.id,
          sender: tx.sender?.name ?? tx.sender?.account ?? "-",
          senderAccount: tx.sender?.account ?? null,
          receiver: tx.receiver?.name ?? tx.receiver?.account ?? "-",
          receiverAccount: tx.receiver?.account ?? null,
          amount: tx.amount ?? 0,
          amount_with_currency: tx.amount_with_currency ?? `${tx.amount ?? 0} ${tx.currency ?? ""}`,
          currency: tx.currency ?? "",
          cause: tx.cause ?? "",
          createdAt: tx.created_at_time ? new Date(tx.created_at_time * 1000).toISOString() : null,
          is_topup: !!tx.is_topup,
          is_outgoing_transfer: !!tx.is_outgoing_transfer,
          raw: tx,
        }));

        return {
          items,
          meta: {
            lastPage: response?.lastPage ?? 1,
            total: response?.total ?? items.length,
            perPage: response?.perPage ?? items.length,
          },
        };
      },
      invalidatesTags: [{ type: "TRANSACTION", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUserTransactionsQuery,
  useSearchTransactionsMutation,
} = apiSlice;
