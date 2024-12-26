"use client";
import Canvas from "@/components/game/Canvas/Canvas";
import { SocketProvider } from "@/providers/SocketProvider";
import { Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createSocket } from "@/socket";
import Box from "@mui/material/Box";
import { NoActiveGame } from "@/components/game/NoActiveGame/NoActiveGame";

const GamePage = () => {
  return (
    <Box
      display="flex"
      marginTop="64px"
      height="calc(100vh - 64px)"
      overflow="hidden"
    >
      <Box
        width={300}
        height="100%"
        padding={3}
        borderRight="1px solid"
        borderColor="grey.300"
      >
        <div>Left col</div>
      </Box>
      <Box
        flex={1}
        display={"flex"}
        flexDirection={"column"}
        padding={3}
        sx={{ backgroundColor: "grey.100" }}
      >
        <NoActiveGame />
        {/* <SocketProvider socket={socket}>
          <Canvas />
        </SocketProvider> */}
      </Box>
      <Box
        width={300}
        height="100%"
        padding={3}
        borderLeft="1px solid"
        borderColor="grey.300"
      >
        <div>right col</div>
      </Box>
    </Box>
  );
};

export default GamePage;
