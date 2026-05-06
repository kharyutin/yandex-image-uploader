import express from "express";
import axios from "axios";

const app = express();

app.get("/upload", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const token = req.query.token;
    const login = req.query.login;

    if (!imageUrl || !token || !login) {
      return res.json({ error: "Missing params" });
    }

    // 🔥 скачиваем картинку
    const image = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const base64 = Buffer.from(image.data).toString("base64");

    // 🔥 ВАЖНО — правильный v4 endpoint
    const response = await axios.post(
      "https://api.direct.yandex.com/json/v5/images",
      {
        method: "add",
        params: {
          Images: [{
            ImageData: base64
          }]
        }
      },
      {
        headers: {
          Authorization: "Bearer " + token,
          "Client-Login": login,
          "Accept-Language": "ru"
        },
        validateStatus: () => true
      }
    );

    console.log("YANDEX RESPONSE:", response.data);

    if (!response.data.result) {
      return res.json({ error: response.data });
    }

    res.json({
      hash: response.data.result.AddResults[0].ImageHash
    });

  } catch (e) {
    console.log("ERROR:", e.response?.data || e.message);

    res.json({
      error: e.response?.data || e.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(3000);
