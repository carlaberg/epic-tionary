import Paper from "@mui/material/Paper";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";

export function NoActiveChat() {
  return (
    <Paper
      variant="outlined"
      sx={{
        backgroundColor: "transparent",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ChatOutlinedIcon sx={{ color: "grey.300", fontSize: "250px" }}/>
    </Paper>
  );
}
