// server.js - Backend Discord OAuth2 para IES Don Pelon

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Carga variables de entorno desde .env

const app = express();

// ⚡ Configuración de CORS (para que tu frontend en GitHub Pages pueda usar el backend)
app.use(
  cors({
    origin: "https://TU_USUARIO.github.io", // Cambia por tu URL de GitHub Pages
    credentials: true,
  })
);

// ⚡ Configuración de sesión
app.use(
  session({
    secret: "algo-muy-secreto", // Cambia esto a algo más seguro
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ⚡ Configuración de Discord OAuth2
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      // Aquí puedes guardar el usuario en tu DB si quieres
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// 🔹 Rutas

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡Backend de IES Don Pelon funcionando!");
});

// Login con Discord
app.get("/auth/discord", passport.authenticate("discord"));

// Callback de Discord
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/error" }),
  (req, res) => {
    // Login exitoso → redirige a tu web de GitHub Pages
    res.redirect("https://heychain2104.github.io/IESDonPelon?code=success");
  }
);

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("https://heychain2104.github.io/index.html");
  });
});

// Ruta de error
app.get("/error", (req, res) => {
  res.send("Error al iniciar sesión con Discord.");
});

// 🔹 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en https://localhost:${PORT}`));
