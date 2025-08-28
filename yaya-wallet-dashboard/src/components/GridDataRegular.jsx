import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import {
  DataGrid,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from "@mui/x-data-grid";

function CustomToolbar() {
  return (
    <GridToolbarContainer style={{ display: 'flex', alignItems: 'center' }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <div style={{ marginLeft: 'auto' }}>
        <GridToolbarQuickFilter  />
      </div>
    </GridToolbarContainer>
  );
}

export default function GridDataRegular({ rows, columns, className, ...rest }) {
  const columnsWithHeaderAlign = columns.map((column) => ({
    ...column,
    headerAlign: "center",
    align: "center",  // Ensures cell content is also centered
  }));

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
      className={className}  // <-- forward className from props
        autoHeight
        rows={rows}
        columns={columnsWithHeaderAlign}
        components={{ Toolbar: CustomToolbar }}
        disableDensitySelector
        componentsProps={{
          filterPanel: {
            disableAddFilterButton: true,
            disableRemoveAllButton: true,
          },
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        slots={{ toolbar: CustomToolbar, loadingOverlay: LinearProgress }}
        initialState={{
          pagination: {
            pageSize: 10,
          },
        }}
        rowsPerPageOptions={[5, 10, 25]}
        {...rest}
      />
    </Box>
  );
}
