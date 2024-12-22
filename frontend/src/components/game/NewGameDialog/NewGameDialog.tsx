import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "next/link";

interface NewGameDialogProps {
  open: boolean;
  onClose?: () => void;
  gameId: string | undefined;
}

export default function NewGameDialog({
  open,
  onClose,
  gameId,
}: NewGameDialogProps) {
  return (
    <Dialog onClose={onClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Game link</DialogTitle>

      <DialogContent>
        <DialogContentText>
          <Link href={`/game/${gameId}`}>
            {`${process.env.NEXT_PUBLIC_BASE_URL}/game/${gameId}`}
          </Link>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
