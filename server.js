const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config(); // lê variáveis de ambiente do .env

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());

// Limite de requisições para evitar brute force
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20,
  message: "Muitas requisições, tente novamente mais tarde",
});
app.use(limiter);

// --- Conexão MongoDB ---
const mongoUrl = process.env.MONGO_URL; // variável de ambiente
const dbName = process.env.DB_NAME;

const client = new MongoClient(mongoUrl);
let textosCollection;

async function conectarMongo() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB Atlas");

    const db = client.db(dbName);
    textosCollection = db.collection("textos");
  } catch (err) {
    console.error("Erro ao conectar no Mongo:", err);
  }
}

conectarMongo();

// --- Rotas HTML ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "menu.html"));
});

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "menu.html"));
});

app.get("/contato", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contato.html"));
});

app.get("/autor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "autor.html"));
});

// --- Texto com senha ---
app.post("/verificar-texto", async (req, res) => {
  if (!textosCollection) return res.status(500).json({ erro: "Banco não conectado" });

  try {
    const nome = String(req.body.nome || "").trim();
    const senha = String(req.body.senha || "").trim();

    if (!nome || !senha) return res.status(400).json({ erro: "Nome e senha são obrigatórios" });

    const texto = await textosCollection.findOne({ nome, senha });

    if (!texto) return res.status(401).json({ erro: "Senha incorreta ou texto não encontrado" });

    res.json({ conteudo: texto.conteudo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno ao buscar o texto" });
  }
});

// --- Texto sem senha ---
app.get("/texto-livre/:nome", async (req, res) => {
  if (!textosCollection) return res.status(500).json({ erro: "Banco não conectado" });

  try {
    const nome = String(req.params.nome || "").trim();
    if (!nome) return res.status(400).json({ erro: "Nome do texto obrigatório" });

    const texto = await textosCollection.findOne({ nome });

    if (!texto) return res.status(404).json({ erro: "Texto não encontrado" });

    res.json({ conteudo: texto.conteudo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno ao buscar o texto" });
  }
});

// --- Iniciar servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
