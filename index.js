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
    const responseImage = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!responseImage.ok) {
      throw new Error("Ошибка загрузки изображения: " + responseImage.status);
    }

    const arrayBuffer = await responseImage.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // 🔥 отправка в Яндекс
    const response = await axios.post(
      "https://api.direct.yandex.com/json/v5/adimages",
      {
        method: "add",
        params: {
          Images: [{ ImageData: base64 }]
        }
      },
      {
        headers: {
          Authorization: "Bearer " + token,
          "Client-Login": login,
          "Accept-Language": "ru"
        }
      }
    );

    // 🔥 ВАЖНО: лог ответа
    console.log("YANDEX RESPONSE:", JSON.stringify(response.data));

    // 🔥 защита от ошибки
    if (!response.data.result || !response.data.result.AddResults) {
      return res.json({
        error: response.data
      });
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
