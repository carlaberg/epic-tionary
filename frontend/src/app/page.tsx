"use client";
import Box from "@mui/material/Box";
import { NoActiveGame } from "@/components/game/NoActiveGame/NoActiveGame";

const GamePage = () => {
  return (
    <Box
      display="flex"
      marginTop={{ xs: "56px", md: "64px" }}
      height={{
        xs: `${window.innerHeight - 56}px`,
        md: `${window.innerHeight - 64}px`,
      }}
      overflow="hidden"
    >
      <Box
        flex={1}
        display={"flex"}
        flexDirection={"column"}
        padding={{ xs: 2, md: 3 }}
        sx={{ backgroundColor: "grey.100" }}
      >
        <NoActiveGame />
      </Box>
    </Box>
  );
};

export default GamePage;
