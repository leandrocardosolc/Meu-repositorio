import mongoose from "mongoose";

const ItemCardapioSchema = new mongoose.Schema({
  restauranteId: {
    type: String,
    required: true,
  },

  nome: {
    type: String,
    required: true,
  },

  descricao: {
    type: String,
    default: "",
  },

  preco: {
    type: Number,
    required: true,
  },

  fotoUrl: {
    type: String,
    default: null,
  },

  // ---------------------------------------------
  // DISPONIBILIDADE
  // ---------------------------------------------
  disponivel: {
    type: Boolean,
    default: true,
  },

  // ---------------------------------------------
  // PROMOÇÃO
  // ---------------------------------------------
  emPromocao: {
    type: Boolean,
    default: false,
  },

  precoPromocional: {
    type: Number,
    default: null,
  },

  textoPromocao: {
    type: String,
    default: "",
  },

  // ---------------------------------------------
  // TIPO DO ITEM (NOVIDADE)
  // ---------------------------------------------
  tipo: {
    type: String,
    enum: ["principal", "sobremesa", "bebida", "acompanhamento"],
    default: "principal",
    required: true,
  }
});

export default mongoose.model("ItemCardapio", ItemCardapioSchema);
