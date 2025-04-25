import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRef } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem/ListItem";

type GuessListProps = {
  guesses: string[];
};

const GuessList = ({ guesses }: GuessListProps) => {
  const listRef = useRef<HTMLUListElement>(null);

  return (
    <Box>
      <Typography variant="h6" component="div">
        Guesses
      </Typography>
      <List ref={listRef} sx={{ height: "300px", overflowY: "scroll" }}>
        {guesses.map((guess, index) => (
          <ListItem key={guess + index} disablePadding>
            {guess}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default GuessList;
