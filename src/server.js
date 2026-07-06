import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import prisma from "./config/prisma.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    await prisma.$connect();

    res.json({
      status: "Guardian Auth API",
      version: "1.0",
      database: "Conectada",
    });
  } catch (error) {
    res.status(500).json({
      status: "Guardian Auth API",
      version: "1.0",
      database: "Error",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});