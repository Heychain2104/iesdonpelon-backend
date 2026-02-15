import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getAccessToken() {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  const data = await response.json();
  return data.access_token;
}

app.get("/clips", async (req, res) => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      "https://api.twitch.tv/helix/clips?broadcaster_id=1414652349&first=6",
      {
        headers: {
          "Client-ID": CLIENT_ID,
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo clips" });
  }
});

app.listen(3000, () => {
  console.log("Servidor funcionando");
});
