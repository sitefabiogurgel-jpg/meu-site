const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config(); // <- lê variáveis do .env

const app = express();
app.use(express.json());

//  CONEXÃO MONGODB
const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoDB = process.env.MONGO_DB;
const mongoHost = process.env.MONGO_HOST;

const mongoUrl = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoHost}/?retryWrites=true&w=majority`;


const client = new MongoClient(mongoUrl);
let textosCollection;

async function conectarMongo() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB Atlas");

    const db = client.db(mongoDB);
    textosCollection = db.collection("textos");
  } catch (err) {
    console.error("Erro ao conectar no Mongo:", err);
  }
}

conectarMongo();

//  ROTAS HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Menu/index.html"));
});

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "Menu/index.html"));
});

app.get("/contato", (req, res) => {
  res.sendFile(path.join(__dirname, "public/contato.html"));
});

app.get("/autor", (req, res) => {
  res.sendFile(path.join(__dirname, "public/autor.html"));
});

//  TEXTO COM SENHA
app.post("/verificar-texto", async (req, res) => {
  const { nome, senha } = req.body;

  console.log("Verificando:", nome, senha);

  const texto = await textosCollection.findOne({
    nome: nome,
    senha: senha
  });

  if (!texto) {
    return res.status(401).json({ erro: "Senha incorreta" });
  }

  res.json({ conteudo: texto.conteudo });
});

//  TEXTO SEM SENHA
app.get("/texto-livre/:nome", async (req, res) => {
  const { nome } = req.params;

  console.log("Texto livre:", nome);

  const texto = await textosCollection.findOne({ nome });

  if (!texto) {
    return res.status(404).json({ erro: "Texto não encontrado" });
  }

  res.json({ conteudo: texto.conteudo });
});

//  INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
