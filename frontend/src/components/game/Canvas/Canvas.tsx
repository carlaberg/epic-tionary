"use client";
import { useSocket } from "@/providers/SocketProvider";
import React, { useRef, useState, useEffect } from "react";
import { Painter } from "./Painter";

interface CanvasProps {
  isUserDrawing: boolean;
}

const Canvas = ({ isUserDrawing }: CanvasProps) => {
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

    return () => {
      socket.off("startDrawing");
      socket.off("draw");
      socket.off("stopDrawing");
      socket.off("clearCanvas");
      socket.disconnect();
    };
  }, [context]);

  const handleStartDrawing = (event: React.MouseEvent) => {
    painterRef.current?.startDrawing({
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
    setIsDrawing(true);
    if (socket) {
      socket.emit("startDrawing", {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      });
    }
  };

  const handleDraw = (event: React.MouseEvent) => {
    if (!isDrawing || !isUserDrawing) return;
    painterRef.current?.draw({
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });

    if (socket) {
      socket.emit("draw", {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      });
    }
  };

  const handleStopDrawing = () => {
    painterRef.current?.stopDrawing();
    if (socket) {
      socket.emit("stopDrawing");
    }
  };

  const handleClearCanvas = () => {
    painterRef.current?.clearCanvas();
    if (socket) {
      socket.emit("clearCanvas");
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        style={{ border: "1px solid black" }}
        onMouseDown={handleStartDrawing}
        onMouseMove={handleDraw}
        onMouseUp={handleStopDrawing}
        onMouseLeave={handleStopDrawing}
      />
      {isUserDrawing && (
        <button onClick={handleClearCanvas}>Clear Canvas</button>
      )}
    </div>
  );
};

export default Canvas;
