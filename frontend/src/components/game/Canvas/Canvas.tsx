"use client";
import { useSocket } from "@/providers/SocketProvider";
import React, { useRef, useState, useEffect } from "react";
import { Painter } from "./Painter";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Game } from "@/db/entity/game/game.entity";
import { DrawPayload } from "../../../../../shared/types/socket-io.types";

interface CanvasProps {
  isUserDrawing: boolean;
  game: Game;
}

interface DrawMeta {
  x: number;
  y: number;
}

const Canvas = ({ isUserDrawing, game }: CanvasProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const canvasWidth = isDesktop ? 800 : window.innerWidth;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const socketContext = useSocket();
  const socket = socketContext.state.socket;

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const isUserDrawingRef = useRef(isUserDrawing);
  const painterRef = useRef<Painter | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      setContext(ctx);
      painterRef.current = new Painter(ctx);
    }
  }, [canvasRef.current]);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  // Drawing methods
  function startDrawing(drawMeta: DrawMeta) {
    if (!contextRef.current) return;
    painterRef.current?.startDrawing(drawMeta);
    setIsDrawing(true);
  }

  function draw(drawMeta: DrawMeta) {
    if (!contextRef.current || !isDrawingRef.current) return;
    painterRef.current?.draw(drawMeta);
  }

  function stopDrawing() {
    if (!contextRef.current || !isDrawingRef.current) return;
    painterRef.current?.stopDrawing();
    setIsDrawing(false);
  }

  // Socket.io event handlers
  function startDrawingSocketEventHandler(payload: DrawPayload) {
    startDrawing(payload);
  }

  function drawSocketEventHandler(payload: DrawPayload) {
    draw(payload);
  }

  function stopDrawingSocketEventHandler() {
    stopDrawing();
  }

  function clearCanvasSocketEventHandler() {
    painterRef.current?.clearCanvas();
  }

  function newRoundSocketEventHandler() {
    painterRef.current?.clearCanvas();
  }

  useEffect(() => {
    if (!socket) return;
    socket.connect();

    socket.on("startDrawing", startDrawingSocketEventHandler);
    socket.on("draw", drawSocketEventHandler);
    socket.on("stopDrawing", stopDrawingSocketEventHandler);
    socket.on("clearCanvas", clearCanvasSocketEventHandler);
    socket.on("newRound", newRoundSocketEventHandler);

    return () => {
      socket.off("startDrawing", startDrawingSocketEventHandler);
      socket.off("draw", drawSocketEventHandler);
      socket.off("stopDrawing", stopDrawingSocketEventHandler);
      socket.off("clearCanvas", clearCanvasSocketEventHandler);
      socket.off("newRound", newRoundSocketEventHandler);

      socket.disconnect();
    };
  }, [context]);

  // Touch event handlers
  const handleTouchStartDrawing = (event: TouchEvent) => {
    event.preventDefault();

    const { x, y } = getPointerPosFromTouch(event, canvasRef);
    console.log("Touch start", { x, y });
    startDrawing({ x, y });
    socket?.emit("startDrawing", { gameId: game.id, x, y });
  };

  const handleTouchDraw = (event: TouchEvent) => {
    event.preventDefault();
    const { x, y } = getPointerPosFromTouch(event, canvasRef);
    console.log("Touch move", { x, y });
    draw({ x, y });
    socket?.emit("draw", { gameId: game.id, x, y });
  };

  const handleTouchStopDrawing = () => {
    stopDrawing();
    socket?.emit("stopDrawing", game.id);
  };

  const handleClearCanvas = () => {
    painterRef.current?.clearCanvas();
    socket?.emit("clearCanvas", game.id);
  };

  useEffect(() => {
    // Prevent swipe-down refresh on iOS
    // Need to pass passive: false to preventDefault
    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.addEventListener("touchstart", handleTouchStartDrawing, {
      passive: false,
    });
    canvas.addEventListener("touchmove", handleTouchDraw, { passive: false });
    canvas.addEventListener("touchend", handleTouchStopDrawing, {
      passive: false,
    });
    canvas.addEventListener("touchcancel", handleTouchStopDrawing, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStartDrawing);
      canvas.removeEventListener("touchmove", handleTouchDraw);
      canvas.removeEventListener("touchend", handleTouchStopDrawing);
      canvas.removeEventListener("touchcancel", handleTouchStopDrawing);
    };
  }, [canvasRef]);

  return (
    <Box width="100%">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={200}
        style={{ background: "white" }}
        // Mouse events
        onMouseDown={(event) => {
          const { x, y } = getPointerPosFromMouse(event, canvasRef);
          startDrawing({ x, y });
          socket?.emit("startDrawing", { gameId: game.id, x, y });
        }}
        onMouseMove={(event) => {
          const { x, y } = getPointerPosFromMouse(event, canvasRef);
          draw({ x, y });
          socket?.emit("draw", { gameId: game.id, x, y });
        }}
        onMouseUp={() => {
          stopDrawing();
          socket?.emit("stopDrawing", game.id);
        }}
        onMouseLeave={() => {
          stopDrawing();
          socket?.emit("stopDrawing", game.id);
        }}
      />
      {isUserDrawing && (
        <button onClick={handleClearCanvas}>Clear Canvas</button>
      )}
    </Box>
  );
};

export default Canvas;

const getPointerPosFromMouse = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
): { x: number; y: number } => {
  const canvasRect = canvasRef.current?.getBoundingClientRect();
  return {
    x: event.clientX - (canvasRect?.left || 0),
    y: event.clientY - (canvasRect?.top || 0),
  };
};

const getPointerPosFromTouch = (
  event: TouchEvent,
  canvasRef: React.RefObject<HTMLCanvasElement>
): { x: number; y: number } => {
  const canvasRect = canvasRef.current?.getBoundingClientRect();
  return {
    x: event.touches[0].clientX - (canvasRect?.left || 0),
    y: event.touches[0].clientY - (canvasRect?.top || 0),
  };
};
