import Paper from "@mui/material/Paper";
import BrushIcon from "@mui/icons-material/Brush";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import NewGameDialog from "../NewGameDialog/NewGameDialog";
import { createGame } from "@/actions/game";
import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function NoActiveGame() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState<string | undefined>(undefined);
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        backgroundColor: "transparent",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
      }}
    >
      <BrushIcon
        sx={{
          color: "grey.300",
          fontSize: "100px",
          transform: "translate(15px, 15px)",
        }}
      />
      <Typography
        sx={{
          color: "grey.300",
          fontSize: "70px",
          fontWeight: "bold",
          marginBottom: 2,
        }}
      >
        Epictionary
      </Typography>
      <Button
        variant="contained"
        onClick={async () => {
          setLoading(true);
          const game = await createGame();
          setLoading(false);
          setGameId(game.id);
          setOpen(true);
        }}
      >
        New Game
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            bgcolor={theme.palette.primary.main}
            borderRadius="inherit"
          >
            <CircularProgress size={18} color="inherit" />
          </Box>
        )}
      </Button>
      <NewGameDialog open={open} gameId={gameId} />
    </Paper>
  );
}
