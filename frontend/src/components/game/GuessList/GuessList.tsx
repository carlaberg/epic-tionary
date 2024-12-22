import { useSocket } from "@/providers/SocketProvider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { GuessPayload } from "../../../../../shared/types/socket-io.types";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem/ListItem";

type GuessListProps = {
  initialGuesses: string[];
};

const GuessList = ({ initialGuesses }: GuessListProps) => {
  const [guesses, setGuesses] = useState(initialGuesses);
  const socket = useSocket().state.socket;
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setGuesses(initialGuesses);
  }, [initialGuesses]);

  useEffect(() => {
    if (!socket) return;
    const handleGuess = (payload: GuessPayload) => {
      setGuesses((prevGuesses) => [...prevGuesses, payload.guess]);
    };

    socket.on("guess", handleGuess);

    return () => {
      socket.off("guess", handleGuess);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [guesses]);

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
