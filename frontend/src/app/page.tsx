"use client";
import Box from "@mui/material/Box";
import { NoActiveGame } from "@/components/game/NoActiveGame/NoActiveGame";

const GamePage = () => {
  return (
    <Box
      display="flex"
      marginTop={{ xs: "56px", md: "64px" }}
      height={{ xs: "calc(100vh - 56px)", md: "calc(100vh - 64px)" }}
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
