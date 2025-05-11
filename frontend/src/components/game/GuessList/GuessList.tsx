import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Game } from "@/db/entity/game/game.entity";
import GuessBox from "../GuessBox/GuessBox";

type GuessListProps = {
  guesses: string[];
  gameState: Game;
  isUserDrawing: boolean;
};

const GuessList = ({ guesses, gameState, isUserDrawing }: GuessListProps) => {
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to the bottom whenever the guesses array changes
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    }
  }, [guesses]);

  console.log("gameState", gameState);
  console.log("isUserDrawing", isUserDrawing);
  console.log("guesses", guesses);
  return (
    <Box
      height="100%"
      paddingBottom="2px"
      display="flex"
      flexDirection="column"
    >
      <Box>
        <Typography variant="caption" component="div">
          Guesses
        </Typography>
      </Box>
      <Paper
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: 1,
        }}
      >
        <Box
          ref={scrollableRef}
          display="flex"
          flexDirection="column"
          className="scrollable"
          flexGrow={1}
          sx={{
            overflowY: "scroll",
          }}
        >
          {guesses.map((guess, index) => (
            <Typography variant="caption" component="div" key={guess + index}>
              {guess}
            </Typography>
          ))}
        </Box>
        {gameState?.started && !isUserDrawing && (
          <Box marginTop="auto">
            <GuessBox gameState={gameState} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GuessList;
