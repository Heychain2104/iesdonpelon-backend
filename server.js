import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// ====== CORS ======
app.use(
  cors({
    origin: "https://heychain2104.github.io/IESDonPelon/",
    credentials: true,
  })
);

app.use(express.json());

// ====== Sesión ======
app.use(
  session({
    secret: "super-secreto-ies-don-pelon",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ====== Discord Login ======
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL:
        "https://discord-authenticate.onrender.com/auth/discord/callback",
      scope: ["identify"],
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// ====== Conexión a MongoDB ======
const mongoURI = process.env.MONGO_URI; // pon tu connection string en .env
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.log("❌ Error conectando a MongoDB:", err));

// ====== Modelo de mensaje ======
const messageSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  message: String,
  date: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// ====== Rutas ======
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});

// Login Discord
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

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(`https://heychain2104.github.io/IESDonPelon/`);
  });
});

app.get("/error", (req, res) => {
  res.send("Error al iniciar sesión con Discord.");
});

// ====== API para mensajes ======

// Obtener todos los mensajes
app.get("/messages", async (req, res) => {
  const messages = await Message.find().sort({ date: -1 });
  res.json(messages);
});

// Crear mensaje nuevo
app.post("/messages", async (req, res) => {
  const { username, avatar, message } = req.body;
  if (!username || !message) return res.status(400).send("Faltan datos");

  const newMessage = new Message({ username, avatar, message });
  await newMessage.save();
  res.json(newMessage);
});

// ====== Servidor ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en puerto ${PORT}`)
);
