import mongoose from 'mongoose';

const LocalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    } // [longitude, latitude]
  },
  descricao: String,
  endereco: String,
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

// Índice essencial para consultas espaciais
LocalSchema.index({ location: '2dsphere' });

export default mongoose.model('Local', LocalSchema);
