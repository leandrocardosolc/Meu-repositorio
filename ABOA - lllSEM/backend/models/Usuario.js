import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senhaHash: { type: String, required: true },
    tipo: {
      type: String,
      enum: ["restaurante", "admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Usuario", UsuarioSchema);
