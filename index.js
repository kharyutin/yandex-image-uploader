import express from "express";
import axios from "axios";
import FormData from "form-data";

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

    // 🔥 формируем multipart
    const form = new FormData();
    form.append("file", image.data, {
      filename: "image.jpg"
    });

    // 🔥 v4 upload
    const response = await axios.post(
      "https://api.direct.yandex.com/live/v4/json/",
      {
        method: "UploadImage",
        token: token,
        param: {
          ImageData: Buffer.from(image.data).toString("base64")
        }
      },
      {
        headers: {
          "Client-Login": login,
          "Accept-Language": "ru"
        }
      }
    );

    console.log("YANDEX RESPONSE:", response.data);

    if (!response.data || !response.data.data) {
      return res.json({ error: response.data });
    }

    res.json({
      hash: response.data.data.ImageHash
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
