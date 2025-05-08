import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

type GuessListProps = {
  guesses: string[];
};

const GuessList = ({ guesses }: GuessListProps) => {
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Typography variant="caption" component="div">
        Guesses
      </Typography>
      <Paper
        sx={{
          height: "200px",
          overflowY: "scroll",
          padding: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          flexGrow: 1,
        }}
      >
        {guesses.map((guess, index) => (
          <Typography variant="caption" component="div" key={guess + index}>
            {guess}
          </Typography>
        ))}
      </Paper>
    </Box>
  );
};

export default GuessList;
