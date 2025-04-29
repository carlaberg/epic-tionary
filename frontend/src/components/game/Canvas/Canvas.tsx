"use client";
import { useSocket } from "@/providers/SocketProvider";
import React, { useRef, useState, useEffect } from "react";
import { Painter } from "./Painter";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Game } from "@/db/entity/game/game.entity";

interface CanvasProps {
  isUserDrawing: boolean;
  game: Game;
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

  function onStartDrawing(drawMeta: { x: number; y: number }) {
    if (!contextRef.current) return;
    painterRef.current?.startDrawing(drawMeta);
    setIsDrawing(true);
  }

  function onDraw(drawMeta: { x: number; y: number }) {
    if (!contextRef.current || !isDrawingRef.current) return;
    painterRef.current?.draw(drawMeta);
  }

  function onStopDrawing() {
    if (!contextRef.current) return;
    painterRef.current?.stopDrawing();
    setIsDrawing(false);
  }

  function onClearCanvas() {
    painterRef.current?.clearCanvas();
  }

  function onNewRound() {
    painterRef.current?.clearCanvas();
  }

  useEffect(() => {
    if (!socket) return;
    socket.connect();

    socket.on("startDrawing", onStartDrawing);
    socket.on("draw", onDraw);
    socket.on("stopDrawing", onStopDrawing);
    socket.on("clearCanvas", onClearCanvas);
    socket.on("newRound", onNewRound);

    return () => {
      socket.off("startDrawing", onStartDrawing);
      socket.off("draw", onDraw);
      socket.off("stopDrawing", onStopDrawing);
      socket.off("clearCanvas", onClearCanvas);
      socket.off("newRound", onNewRound);

      socket.disconnect();
    };
  }, [context]);

  const handleStartDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const { x, y } = getPointerPos(event, canvasRef);
    painterRef.current?.startDrawing({ x, y });
    setIsDrawing(true);
    socket?.emit("startDrawing", { gameId: game.id, x, y });
  };

  const handleDraw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isUserDrawing) return;

    event.preventDefault();
    const { x, y } = getPointerPos(event, canvasRef);
    painterRef.current?.draw({ x, y });
    socket?.emit("draw", { gameId: game.id, x, y });
  };

  const handleStopDrawing = () => {
    if (!isDrawing) return;
    painterRef.current?.stopDrawing();
    setIsDrawing(false);
    socket?.emit("stopDrawing", game.id);
  };

  const handleClearCanvas = () => {
    painterRef.current?.clearCanvas();
    socket?.emit("clearCanvas", game.id);
  };

  return (
    <Box width="100%">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={200}
        style={{ background: "white" }}
        // Mouse events
        onMouseDown={handleStartDrawing}
        onMouseMove={handleDraw}
        onMouseUp={handleStopDrawing}
        onMouseLeave={handleStopDrawing}
        // Touch events
        onTouchStart={handleStartDrawing}
        onTouchMove={handleDraw}
        onTouchEnd={handleStopDrawing}
        onTouchCancel={handleStopDrawing}
      />
      {isUserDrawing && (
        <button onClick={handleClearCanvas}>Clear Canvas</button>
      )}
    </Box>
  );
};

export default Canvas;

const getPointerPos = (
  event: React.MouseEvent | React.TouchEvent,
  canvasRef: React.RefObject<HTMLCanvasElement>
): { x: number; y: number } => {
  const offsetX =
    "nativeEvent" in event
      ? event.nativeEvent instanceof MouseEvent
        ? event.nativeEvent.offsetX
        : event.nativeEvent.touches[0].clientX -
          (canvasRef.current?.getBoundingClientRect().left || 0)
      : 0;

  const offsetY =
    "nativeEvent" in event
      ? event.nativeEvent instanceof MouseEvent
        ? event.nativeEvent.offsetY
        : event.nativeEvent.touches[0].clientY -
          (canvasRef.current?.getBoundingClientRect().top || 0)
      : 0;

  return { x: offsetX, y: offsetY };
};
