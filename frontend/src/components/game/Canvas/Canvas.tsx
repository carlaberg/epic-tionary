"use client";
import { useSocket } from "@/providers/SocketProvider";
import React, { useRef, useState, useEffect } from "react";
import { Painter } from "./Painter";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

interface CanvasProps {
  isUserDrawing: boolean;
}

const Canvas = ({ isUserDrawing }: CanvasProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const canvasWidth = isDesktop ? 800 : window.innerWidth;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const socketContext = useSocket();
  const socket = socketContext.state.socket;

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!socket) return;
    socket.connect();

    socket.on("startDrawing", (drawMeta: { x: number; y: number }) => {
      if (!contextRef.current) return;
      painterRef.current?.startDrawing(drawMeta);
      setIsDrawing(true);
    });

    socket.on("draw", (drawMeta: { x: number; y: number }) => {
      if (!contextRef.current || !isDrawingRef.current) return;
      painterRef.current?.draw(drawMeta);
    });

    socket.on("stopDrawing", () => {
      if (!contextRef.current) return;
      painterRef.current?.stopDrawing();
      setIsDrawing(false);
    });

    socket.on("clearCanvas", () => {
      painterRef.current?.clearCanvas();
    });

    socket.on("newRound", () => {
      painterRef.current?.clearCanvas();
    });

    return () => {
      // TODO: Clean up socket listeners properly
      socket.off("startDrawing");
      socket.off("draw");
      socket.off("stopDrawing");
      socket.off("clearCanvas");
      socket.off("newRound");
      socket.disconnect();
    };
  }, [context]);

  const handleStartDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const { x, y } = getPointerPos(event, canvasRef);
    painterRef.current?.startDrawing({ x, y });
    setIsDrawing(true);
    socket?.emit("startDrawing", { x, y });
  };

  const handleDraw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isUserDrawing) return;

    event.preventDefault();
    const { x, y } = getPointerPos(event, canvasRef);
    painterRef.current?.draw({ x, y });
    socket?.emit("draw", { x, y });
  };

  const handleStopDrawing = () => {
    if (!isDrawing) return;
    painterRef.current?.stopDrawing();
    socket?.emit("stopDrawing");
  };

  const handleClearCanvas = () => {
    painterRef.current?.clearCanvas();
    socket?.emit("clearCanvas");
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
