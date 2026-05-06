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

    // 🔥 СКАЧИВАЕМ КАРТИНКУ ЧЕРЕЗ fetch (НЕ axios)
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

    // 🔥 ОТПРАВКА В ЯНДЕКС (axios остаётся)
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
          Authorization: "Bearer " + token,
          "Client-Login": login,
          "Accept-Language": "ru"
        }
      }
    );

    res.json({
      hash: response.data.result.AddResults[0].ImageHash
    });

  } catch (e) {
    console.log("ERROR:", e.message);

    res.json({
      error: e.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(3000);
