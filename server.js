import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://heychain2104.github.io",
    credentials: true,
  })
);

app.use(
  session({
    secret: "super-secreto-ies-don-pelon",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "https://iesdonpelon-backend.onrender.com/auth/discord/callback",
      scope: ["identify"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});

app.get("/auth/discord", passport.authenticate("discord"));

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/error" }),
  (req, res) => {
    const user = req.user;
    const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

    res.redirect(
      `https://heychain2104.github.io/IESDonPelon/?username=${user.username}&avatar=${avatarURL}`
    );
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("https://heychain2104.github.io/IESDonPelon/");
  });
});

app.get("/error", (req, res) => {
  res.send("Error al iniciar sesión con Discord.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en puerto ${PORT}`)
);
