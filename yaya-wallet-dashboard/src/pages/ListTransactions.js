
// src/pages/ListTransactions.jsx
import React, { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { IconButton, Chip, TextField, Button, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";

import PageTitle from "../components/PageTitle";
import Loading from "../components/Loading";
import GridDataRegular from "../components/GridDataRegular";

import {
  useGetUserTransactionsQuery,
  useSearchTransactionsMutation
} from "../features/api/apiSlice";

export default function ListTransactions({ currentUser }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Normal listing
  const { data: listResult, isLoading, isFetching, isError, refetch } =
    useGetUserTransactionsQuery({ page });

  // Search mutation
  const [searchTransactions, { data: searchResult, isLoading: isSearchLoading }] =
    useSearchTransactionsMutation();

  // Decide which rows to show
  const shownData = useMemo(() => {
    if (isSearching) return searchResult ?? { items: [], meta: { lastPage: 1 } };
    return listResult ?? { items: [], meta: { lastPage: 1 } };
  }, [isSearching, searchResult, listResult]);

  const rows = shownData.items ?? [];
  const meta = shownData.meta ?? { lastPage: 1, total: rows.length, perPage: 15 };

  console.log("Transactions data:", rows);

  // Grid columns
  const columns = [
    {
      field: "id",
      headerName: "No.",
      filterable: false,
      align: "right",
      flex: 0.3,

      renderCell: (params) => params.rowIndex + 1,
    },
    {
      field: "sender",
      headerName: "Sender",
      filterable: false,
      align: "left",
      flex: 1.5,
      renderCell: (params) => (
        <div className="pl-5">
          {params.row.sender}
          <div style={{ fontSize: 12, color: "#666" }}>{params.row.senderAccount}</div>
        </div>
      ),
    },
    {
      field: "receiver",
      headerName: "Receiver",
      filterable: false,
      align: "left",
      flex: 1.5,
      renderCell: (params) => (
        <div className="pl-5">
          {params.row.receiver}
          <div style={{ fontSize: 12, color: "#666" }}>{params.row.receiverAccount}</div>
        </div>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      filterable: false,
      align: "center",
      flex: 1.2,
      renderCell: (params) => {
        const amt = Number(params.row.amount ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return <span>{amt} {params.row.currency}</span>;
      },
    },
    {
      field: "currency",
      headerName: "Currency",
      filterable: false,
      align: "center",
      flex: 0.7,
    },
    {
      field: "cause",
      headerName: "Cause",
      filterable: false,
      align: "left",
      flex: 1.5,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      filterable: false,
      flex: 1,
      renderCell: (params) =>
        params?.row?.createdAt
          ? dayjs(params.row.createdAt).format("YYYY-MM-DD HH:mm")
          : "-",
      align: "center",
    },
    {
      field: "type",
      headerName: "Type",
      align: "center",
      flex: 0.9,
      renderCell: (params) => {
        const me = currentUser ?? null;
        const isIncoming =
          params.row.is_topup ||
          (me && (params.row.receiverAccount === me || params.row.receiver === me)) ||
          (!me && params.row.sender === params.row.receiver);

        return (
          <Chip
            label={isIncoming ? "Incoming" : "Outgoing"}
            color={isIncoming ? "success" : "error"}
            size="small"
          />
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      align: "left",
      flex: 0.7,
      renderCell: (params) => (
        <IconButton onClick={() => navigate(`/transactions/${params?.row?.id}`)}>
          <InfoIcon />
        </IconButton>
      ),
    },
  ];

  // Search
  async function handleSearch(e) {
    e?.preventDefault?.();
    if (!query || !query.trim()) {
      setIsSearching(false);
      refetch();
      return;
    }
    setIsSearching(true);
    try {
      await searchTransactions({ query: query.trim(), page: 1 }).unwrap();
      setPage(1);
    } catch (err) {
      console.error("search error", err);
    }
  }

  function handleClearSearch() {
    setQuery("");
    setIsSearching(false);
    refetch();
  }

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading transactions.</div>;

  return (
    <Stack>
      <PageTitle title="Transactions" />
      <Grid container spacing={3} paddingTop={2} paddingLeft={3}>
        <Grid item xs={12} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1 }}>
            <TextField
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by sender/receiver name, account, cause or id..."
              size="small"
            />
            <Button variant="contained" onClick={handleSearch} disabled={isSearchLoading}>Search</Button>
            <Button onClick={handleClearSearch}>Clear</Button>
          </form>
        </Grid>



        <GridDataRegular
          rows={rows}
          isLoading={isFetching || isSearchLoading}
          columns={columns.map((col) => ({ ...col, headerAlign: "center" }))}
          // optional pagination props if supported
          page={page}
          rowCount={meta.total}
          onPageChange={(p) => setPage(p)}
        />
      </Grid>
    </Stack>
  );
}
