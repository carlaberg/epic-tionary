import Paper from "@mui/material/Paper";
import BrushIcon from "@mui/icons-material/Brush";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import NewGameDialog from "../NewGameDialog/NewGameDialog";
import { createGame } from "@/actions/game";
import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function NoActiveGame() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState<string | undefined>(undefined);
  const theme = useTheme();

  const handleNewGameClick = async () => {
    if (!isSignedIn) {
      // Trigger Clerk's sign-in modal
      if (typeof window !== "undefined") {
        const redirectUrl = encodeURIComponent(`${window.location.origin}/`);
        router.push(
          `${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL}/sign-in?redirect_url=${redirectUrl}`
        );
      }
      return;
    }

    // If the user is signed in, proceed to create a new game
    setLoading(true);
    const game = await createGame();
    setLoading(false);
    setGameId(game.id);
    setOpen(true);
  };

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
        padding: { xs: 2, md: 5 },
      }}
    >
      <BrushIcon
        sx={(theme) => ({
          color: "grey.300",
          fontSize: "60px",
          [theme.breakpoints.up("md")]: {
            fontSize: "100px",
          },
          transform: "translate(15px, 15px)",
          marginBottom: 1,
        })}
      />
      <Typography
        sx={(theme) => ({
          color: "grey.300",
          fontSize: "44px",
          [theme.breakpoints.up("md")]: {
            fontSize: "70px",
          },
          fontWeight: "bold",
          marginBottom: 2,
        })}
      >
        Epictionary
      </Typography>
      <Button variant="contained" onClick={handleNewGameClick}>
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
