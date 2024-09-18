import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useUser } from "@/providers/UserProvider";

export default function UserDetails() {
  const userContext = useUser();
  const user = userContext.state.user;

  return (
    <Paper variant="outlined" sx={{ padding: 2, marginBottom: 3 }}>
      <Typography>
        <strong>Username: </strong>
        {user.username}
      </Typography>
      <Typography>
        <strong>Email: </strong>
        {user.email}
      </Typography>
    </Paper>
  );
}
