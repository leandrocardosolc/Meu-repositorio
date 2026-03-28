import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import estabelecimentoRoutes from "./routes/estabelecimentoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cardapioRoutes from "./routes/cardapioRoutes.js";
import locaisRoutes from "./routes/locaisRoutes.js";
import rotaRoutes from "./routes/rotaRoutes.js";



dotenv.config();
const app = express();

// conexão Mongo
connectDB();

// middlewares globais
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// arquivos estáticos (fotos)
app.use("/uploads", express.static("uploads"));

// rotas
app.use("/api/auth", authRoutes);
app.use("/api/estabelecimentos", estabelecimentoRoutes);
app.use("/api/cardapio", cardapioRoutes);
app.use("/api/locais", locaisRoutes);
app.use("/api/rota", rotaRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Backend rodando na porta ${process.env.PORT} ✔`)
);