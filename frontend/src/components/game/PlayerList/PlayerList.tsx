import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { PlayerState } from "../GameContainer/GameContainer";
import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";

interface PlayerListProps {
  players: PlayerState[];
}

const PlayerList = ({ players }: PlayerListProps) => {
  return (
    <Box height="100%" width="100%">
      <Typography variant="caption" component="div">
        Players
      </Typography>

      <List
        className="scrollable"
        sx={{
          width: "100%",
          height: "100%",
          maxWidth: 360,
          bgcolor: "none",
          paddingTop: 0,
          paddingBottom: "calc(16px - 2px)",
          overflowY: "scroll",
        }}
      >
        {players.map((player) => (
          <>
            <Paper sx={{ marginBottom: 0.5 }} key={player.name}>
              <ListItem
                alignItems="flex-start"
                sx={{ paddingY: 0, paddingX: 1 }}
              >
                <ListItemAvatar>
                  <Avatar alt={player.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondaryTypographyProps={{
                    sx: { lineHeight: 1.3 },
                    variant: "caption",
                    component: "span",
                  }}
                  secondary={
                    <>
                      {`${player.score} Pts.`}
                      <br />
                      Status: {player.networkStatus}
                    </>
                  }
                />
              </ListItem>
            </Paper>
            <Paper sx={{ marginBottom: 0.5 }} key={player.name}>
              <ListItem
                alignItems="flex-start"
                sx={{ paddingY: 0, paddingX: 1 }}
              >
                <ListItemAvatar>
                  <Avatar alt={player.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondaryTypographyProps={{
                    sx: { lineHeight: 1.3 },
                    variant: "caption",
                    component: "span",
                  }}
                  secondary={
                    <>
                      {`${player.score} Pts.`}
                      <br />
                      Status: {player.networkStatus}
                    </>
                  }
                />
              </ListItem>
            </Paper>
            <Paper sx={{ marginBottom: 0.5 }} key={player.name}>
              <ListItem
                alignItems="flex-start"
                sx={{ paddingY: 0, paddingX: 1 }}
              >
                <ListItemAvatar>
                  <Avatar alt={player.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondaryTypographyProps={{
                    sx: { lineHeight: 1.3 },
                    variant: "caption",
                    component: "span",
                  }}
                  secondary={
                    <>
                      {`${player.score} Pts.`}
                      <br />
                      Status: {player.networkStatus}
                    </>
                  }
                />
              </ListItem>
            </Paper>
            <Paper sx={{ marginBottom: 0.5 }} key={player.name}>
              <ListItem
                alignItems="flex-start"
                sx={{ paddingY: 0, paddingX: 1 }}
              >
                <ListItemAvatar>
                  <Avatar alt={player.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondaryTypographyProps={{
                    sx: { lineHeight: 1.3 },
                    variant: "caption",
                    component: "span",
                  }}
                  secondary={
                    <>
                      {`${player.score} Pts.`}
                      <br />
                      Status: {player.networkStatus}
                    </>
                  }
                />
              </ListItem>
            </Paper>
            <Paper sx={{ marginBottom: 0.5 }} key={player.name}>
              <ListItem
                alignItems="flex-start"
                sx={{ paddingY: 0, paddingX: 1 }}
              >
                <ListItemAvatar>
                  <Avatar alt={player.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondaryTypographyProps={{
                    sx: { lineHeight: 1.3 },
                    variant: "caption",
                    component: "span",
                  }}
                  secondary={
                    <>
                      {`${player.score} Pts.`}
                      <br />
                      Status: {player.networkStatus}
                    </>
                  }
                />
              </ListItem>
            </Paper>
            <Paper sx={{ marginBottom: 0.5 }} key={player.name}>
              <ListItem
                alignItems="flex-start"
                sx={{ paddingY: 0, paddingX: 1 }}
              >
                <ListItemAvatar>
                  <Avatar alt={player.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondaryTypographyProps={{
                    sx: { lineHeight: 1.3 },
                    variant: "caption",
                    component: "span",
                  }}
                  secondary={
                    <>
                      {`${player.score} Pts.`}
                      <br />
                      Status: {player.networkStatus}
                    </>
                  }
                />
              </ListItem>
            </Paper>
            <Paper sx={{ marginBottom: 0.5 }} key={player.name}>
              <ListItem
                alignItems="flex-start"
                sx={{ paddingY: 0, paddingX: 1 }}
              >
                <ListItemAvatar>
                  <Avatar alt={player.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondaryTypographyProps={{
                    sx: { lineHeight: 1.3 },
                    variant: "caption",
                    component: "span",
                  }}
                  secondary={
                    <>
                      {`${player.score} Pts.`}
                      <br />
                      Status: {player.networkStatus}
                    </>
                  }
                />
              </ListItem>
            </Paper>
          </>
        ))}
      </List>
    </Box>
  );
};
export default PlayerList;
