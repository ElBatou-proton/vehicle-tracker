const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  mileageAtService: { type: Number, required: true },
  partsReplaced: [String],
  laborCost: { type: Number, default: 0 },
  partsCost: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  mechanicOrShop: String,
  notes: String,
});

const taxSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  paidDate: { type: Date, required: true },
  receiptNumber: String,
});

const vehicleSchema = new mongoose.Schema(
  {
    modelType: { type: String, required: true }, // e.g., "Toyota Hilux 2022"
    plate: { type: String, required: true, unique: true }, // e.g., "ABC-123"
    year: { type: Number, required: true },
    color: { type: String, required: true },
    pictureUrl: { type: String },
    currentMileage: { type: Number, required: true },

    // Maintenance tracking
    kilometerInterval: { type: Number, required: true }, // e.g., 5000 km target interval
    maintenanceHistory: [maintenanceSchema],

    // Compliance & Legal
    taxes: [taxSchema],
    hasAnnualRevision: { type: Boolean, default: false },
    annualRevisionDate: Date,
    hasSoat: { type: Boolean, default: false },
    soatExpiryDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);

