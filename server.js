const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ======================
   VARIÁVEIS MONGODB
====================== */

const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST; // dbgurgel.xxxxx.mongodb.net
const mongoDB   = process.env.MONGO_DB;   // fqgurgeldb

const mongoUrl =
  `mongodb+srv://${mongoUser}:${mongoPass}@${mongoHost}/${mongoDB}?retryWrites=true&w=majority`;

const client = new MongoClient(mongoUrl);

let textosCollection;

/* ======================
   CONEXÃO MONGODB
====================== */

async function conectarMongo() {
  try {
    await client.connect();
    const db = client.db(mongoDB);
    textosCollection = db.collection("textos");

    console.log("✅ MongoDB conectado no banco:", mongoDB);
  } catch (err) {
    console.error("❌ Erro ao conectar no MongoDB:", err);
  }
}

conectarMongo();

/* ======================
   ROTAS HTML
====================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/contato", (req, res) => {
  res.sendFile(path.join(__dirname, "public/contato.html"));
});

app.get("/autor", (req, res) => {
  res.sendFile(path.join(__dirname, "public/autor.html"));
});

/* ======================
   ROTAS API
====================== */

// 🔓 TEXTO LIVRE → senha vazia ""
app.get("/textos/:id", async (req, res) => {
  const { nome } = req.params;

  try {
    const texto = await textosCollection.findOne({
      nome,
      senha: ""
    });

    if (!texto) {
      return res.status(404).json({ erro: "Texto livre não encontrado" });
    }

    res.json({ conteudo: texto.conteudo });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

// 🔐 TEXTO PRIVADO → senha obrigatória
app.post("/textos", async (req, res) => {
  const { id, senha } = req.body;

  try {
    const texto = await textosCollection.findOne({
      nome,
      senha
    });

    if (!texto) {
      return res.status(401).json({ erro: "Nome ou senha incorretos" });
    }

    res.json({ conteudo: texto.conteudo });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

app.get("/api/textos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const texto = await textosCollection.findOne({ id });

    if (!texto) {
      return res.status(404).json({ erro: "Texto não encontrado" });
    }

    res.json(texto);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar texto" });
  }
});


/* ======================
   INICIAR SERVIDOR
====================== */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// fallback
app.use((req, res) => {
  res.redirect("/");
});

