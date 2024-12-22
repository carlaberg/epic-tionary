import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

type MessageModalProps = {
  open: boolean;
  handleClose: () => void;
  title: string;
  message: string;
  actions?: React.ReactNode;
  variables?: Record<any, any>;
};

const MessageModal = ({
  open,
  handleClose,
  title,
  message,
  actions,
  variables,
}: MessageModalProps) => {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ whiteSpace: "pre-line" }}>
          {replaceValues(message, variables)}
        </DialogContentText>
      </DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

const replaceValues = (message: string, variables?: Record<any, any>) => {
  if (!variables) return message;
  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, value),
    message
  );
};

export default MessageModal;
