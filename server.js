const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔗 Mongo
const mongoUrl = process.env.MONGO_URL; 
// exemplo:
// mongodb+srv://USER:SENHA@dbgurgel.mongodb.net/fqgurgeldb?retryWrites=true&w=majority

const client = new MongoClient(mongoUrl);
let textosCollection;

async function conectarMongo() {
  try {
    await client.connect();
    const db = client.db("fqgurgeldb");
    textosCollection = db.collection("textos");
    console.log("✅ Mongo conectado");
  } catch (err) {
    console.error("❌ Erro Mongo:", err);
  }
}

conectarMongo();

/* ======================
   ROTAS HTML
====================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/autor", (req, res) => {
  res.sendFile(path.join(__dirname, "public/autor.html"));
});

app.get("/contato", (req, res) => {
  res.sendFile(path.join(__dirname, "public/contato.html"));
});

/* página individual de texto */
app.get("/texto/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "public/texto.html"));
});


/* ======================
   API DE TEXTOS
====================== */

// 👉 TENTA ABRIR TEXTO
// - 200 → texto livre
// - 401 → pedir senha
app.get("/texto/:id", async (req, res) => {
  try {
    const texto = await textosCollection.findOne({ id: req.params.id });

    if (!texto) {
      return res.status(404).json({ erro: "Texto não encontrado" });
    }

    if (texto.senha) {
      return res.status(401).json({ erro: "Texto protegido" });
    }

    res.json({ conteudo: texto.conteudo });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

// 👉 VERIFICAR SENHA
app.post("/texto", async (req, res) => {
  try {
    const { id, senha } = req.body;

    const texto = await textosCollection.findOne({ id });

    if (!texto) {
      return res.status(404).json({ erro: "Texto não encontrado" });
    }

    if (!texto.senha || texto.senha !== senha) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    res.json({ conteudo: texto.conteudo });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

/* ======================
   START
====================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// fallback
app.use((req, res) => {
  res.redirect("/");
});
