import { getCurrentUser } from "@/actions/user";
import { Typography } from "@mui/material";
import Paper from "@mui/material/Paper";

export default async function UserDetails() {
  const user = await getCurrentUser();
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
