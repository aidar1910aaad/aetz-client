import { Schema, model, models } from 'mongoose';

const busbarSettingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  groupId: {
    type: Number,
    required: true,
  },
  data: {
    type: Object, // Храним данные о расходе для элементов и амперажей
    required: true,
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

export const BusbarSetting = models.BusbarSetting || model('BusbarSetting', busbarSettingSchema);
