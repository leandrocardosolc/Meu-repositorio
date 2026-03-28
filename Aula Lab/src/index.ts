import express from "express";
import dotenv from "dotenv";
import { Database } from "infrasctructure/config/Database";

dotenv.config();

async function startApp() {
    await Database.init();
    console.log("Banco de dados inicializado com sucesso!");

    const app = express();
    app.use(express.json());

    const userRoutes = await import("@presentation/routes/userRoutes");
    const authRouters = await import("@presentation/routes/authRoutes");

    app.use("/api", userRoutes.default);

    app.use("/auth",authRouters.default)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Application is running on port ${PORT}`));
}

startApp();

/*
const app = express();
app.use(express.json());
app.use("/api", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Application is running on port ${PORT}`));
*/