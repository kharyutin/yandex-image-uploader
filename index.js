import express from "express";
import axios from "axios";

const app = express();

const TOKEN = process.env.TOKEN;
const LOGIN = process.env.LOGIN;

app.get("/upload", async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.json({ error: "No URL" });
    }

    const image = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64 = Buffer.from(image.data).toString("base64");

    const response = await axios.post(
      "https://api.direct.yandex.com/json/v5/images",
      {
        method: "add",
        params: {
          Images: [{ ImageData: base64 }]
        }
      },
      {
        headers: {
          Authorization: "Bearer " + TOKEN,
          "Client-Login": LOGIN,
          "Accept-Language": "ru"
        }
      }
    );

    res.json({
      hash: response.data.result.AddResults[0].ImageHash
    });

  } catch (e) {
    res.json({
      error: e.response?.data || e.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(3000);
