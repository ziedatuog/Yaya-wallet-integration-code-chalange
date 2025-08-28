import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchButton({ searchFunc }) {
  return (
    <div style={{ display: "inline" }}>
      <TextField
        // fullWidth={false}
        required={false}
        label={"Type here..."}
      
        SelectProps={{ native: true }}
        variant="outlined"
        size="small"
        style={{
          background: "white",
          
        }}
        // sx={{ mr: 1 }}
        onChange={(e) => {
          // setSearchKey(e.target.value);
          searchFunc(e.target.value);
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      ></TextField>
      
    </div>
  );
}
