import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
var client = jwksClient({
  jwksUri: "https://clerk.epictionary.carlaberg.se/.well-known/jwks.json",
});

function validateToken(token: string, publicKey: string) {
  if (!token || !publicKey) {
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      jwt.verify(
        token,
        getKey,
        { algorithms: ["RS256"] },
        function (err, decoded) {
          resolve(decoded);
        }
      );
    } catch (error) {
        console.log("error", error);
      reject(undefined);
    }
  });
}

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key?.getPublicKey() || key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function authMiddleware(socket: any, next: any) {
  const token = socket.handshake.auth.token;
  const publicKey = process.env.CLERK_JWT_PUBLIC_KEY as string;

  const user = await validateToken(token, publicKey);

  if (!user) {
    next(new Error("Authentication error"));
  }

  socket.handshake.auth.user = (user as any)?.sub;
  next();
}
