"use client";
import { useSocket } from "@/providers/SocketProvider";
import React, { useRef, useState, useEffect } from "react";
import { Painter } from "./Painter";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Game } from "@/db/entity/game/game.entity";
import { DrawPayload } from "../../../../../shared/types/socket-io.types";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Button from "@mui/material/Button";

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
  const canvasHeight = canvasWidth * (2 / 3);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const socketContext = useSocket();
  const socket = socketContext.state.socket;
  const socketRef = useRef(socket);

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

  useEffect(() => {
    isUserDrawingRef.current = isUserDrawing;
  }, [isUserDrawing]);

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
    socketRef.current = socket;

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
  }, [socket]);

  // Touch event handlers
  const handleTouchStartDrawing = (event: TouchEvent) => {
    if (!isUserDrawingRef.current) return;
    event.preventDefault();

    const { x, y } = getPointerPosFromTouch(event, canvasRef);
    startDrawing({ x, y });
    socketRef.current?.emit("startDrawing", { gameId: game.id, x, y });
  };

  const handleTouchDraw = (event: TouchEvent) => {
    if (!isUserDrawingRef.current) return;
    event.preventDefault();
    const { x, y } = getPointerPosFromTouch(event, canvasRef);
    draw({ x, y });
    socketRef.current?.emit("draw", { gameId: game.id, x, y });
  };

  const handleTouchStopDrawing = () => {
    stopDrawing();
    socketRef.current?.emit("stopDrawing", game.id);
  };

  const handleClearCanvas = () => {
    painterRef.current?.clearCanvas();
    socketRef.current?.emit("clearCanvas", game.id);
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
    <Box width="100%" position={"relative"}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ background: "white" }}
        // Mouse events
        onMouseDown={(event) => {
          if (!isUserDrawingRef.current) return;
          const { x, y } = getPointerPosFromMouse(event, canvasRef);
          startDrawing({ x, y });
          socket?.emit("startDrawing", { gameId: game.id, x, y });
        }}
        onMouseMove={(event) => {
          if (!isUserDrawingRef.current) return;
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
        <Button
          onClick={handleClearCanvas}
          sx={{
            borderRadius: "50%",
            minWidth: "40px",
            width: "40px",
            height: "40px",
            position: "absolute",
            top: `${canvasHeight}px`,
            left: "0",
            transform: "translate(8px, calc(-100% - 8px))",
          }}
          variant="contained"
        >
          <DeleteOutlineOutlinedIcon />
        </Button>
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
