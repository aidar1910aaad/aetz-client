import { Schema, model, models } from 'mongoose';

const materialSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
  },
  unit: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category', // Предполагаем, что у вас есть модель Category
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Material = models.Material || model('Material', materialSchema);
