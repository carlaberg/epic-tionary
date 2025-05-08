import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import BrushIcon from "@mui/icons-material/Brush";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function Header() {
  return (
    <Box sx={{ flexGrow: 1, marginBottom: 1 }}>
      <AppBar position="fixed" sx={{ top: 0, left: 0 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <BrushIcon
              sx={{
                fontSize: "1rem",
              }}
            />
            <Typography marginLeft={0.5}>Epictionary</Typography>
          </Box>

          <Box>
            <SignedOut>
              <SignInButton>
                <Button variant="outlined" color="inherit" size="small">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  sx={{ marginLeft: 1 }}
                >
                  Sign up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
