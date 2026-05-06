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

    // 🔥 скачивание картинки
    const image = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    const base64 = Buffer.from(image.data).toString("base64");

    // 🔥 отправка в Яндекс
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
        validateStatus: () => true,
        responseType: "text"
      }
    );

    // 🔥 ЛОГ
    console.log("STATUS:", response.status);
    console.log("RAW RESPONSE:", response.data);

    // 🔥 если JSON — парсим
    let parsed;
    try {
      parsed = JSON.parse(response.data);
    } catch {
      return res.json({
        error: response.data
      });
    }

    if (!parsed.result || !parsed.result.AddResults) {
      return res.json({
        error: parsed
      });
    }

    res.json({
      hash: parsed.result.AddResults[0].ImageHash
    });

  } catch (e) {
    console.log("ERROR FULL:", e.response?.data || e.message);

    res.json({
      error: e.response?.data || e.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(3000);
