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

    // 🔥 правильное скачивание через axios
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
      "https://api.direct.yandex.com/json/v5/adimages",
      {
        method: "add",
        params: {
         AdImages: [{
  ImageData: base64,
Name: "img_" + Math.floor(Math.random() * 1000000)
}]
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

    console.log("YANDEX RESPONSE:", JSON.stringify(response.data));

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
