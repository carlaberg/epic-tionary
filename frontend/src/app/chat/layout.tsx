import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <CssBaseline />
      {children}
    </div>
  );
}
