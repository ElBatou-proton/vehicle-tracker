const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Vehicle = require("../models/vehicle.model");

// Multer storage setup for vehicle picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, "vehicle-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// POST /upload-image - Upload vehicle photo
router.post("/upload-image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    const host = req.get("host");
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ pictureUrl: fileUrl, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ updatedAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single vehicle
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create vehicle
router.post("/", async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    const saved = await vehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update vehicle
router.put("/:id", async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE vehicle
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({ message: "Vehicle deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/maintenance - Log maintenance record & update currentMileage
router.post("/:id/maintenance", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const maintenanceData = req.body;
    vehicle.maintenanceHistory.push(maintenanceData);

    if (
      maintenanceData.mileageAtService &&
      maintenanceData.mileageAtService > vehicle.currentMileage
    ) {
      vehicle.currentMileage = maintenanceData.mileageAtService;
    }

    const saved = await vehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /:id/maintenance/:maintenanceId - Update a maintenance record
router.put("/:id/maintenance/:maintenanceId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const item = vehicle.maintenanceHistory.id(req.params.maintenanceId);
    if (!item) return res.status(404).json({ error: "Maintenance record not found" });

    item.set(req.body);
    if (req.body.mileageAtService && req.body.mileageAtService > vehicle.currentMileage) {
      vehicle.currentMileage = req.body.mileageAtService;
    }

    const saved = await vehicle.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /:id/maintenance/:maintenanceId - Remove a maintenance record
router.delete("/:id/maintenance/:maintenanceId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    vehicle.maintenanceHistory.pull(req.params.maintenanceId);
    const saved = await vehicle.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /:id/taxes - Log tax payment record
router.post("/:id/taxes", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    vehicle.taxes.push(req.body);
    const saved = await vehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /:id/taxes/:taxId - Update a tax record
router.put("/:id/taxes/:taxId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const item = vehicle.taxes.id(req.params.taxId);
    if (!item) return res.status(404).json({ error: "Tax record not found" });

    item.set(req.body);
    const saved = await vehicle.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /:id/taxes/:taxId - Remove a tax record
router.delete("/:id/taxes/:taxId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    vehicle.taxes.pull(req.params.taxId);
    const saved = await vehicle.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /:id/fuel - Log refuel entry & update mileage if higher
router.post("/:id/fuel", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const fuelData = req.body;
    vehicle.fuelHistory.push(fuelData);

    if (
      fuelData.mileageAtRefuel &&
      fuelData.mileageAtRefuel > vehicle.currentMileage
    ) {
      vehicle.currentMileage = fuelData.mileageAtRefuel;
    }

    const saved = await vehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /:id/fuel/:fuelId - Update a fuel record
router.put("/:id/fuel/:fuelId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const item = vehicle.fuelHistory.id(req.params.fuelId);
    if (!item) return res.status(404).json({ error: "Fuel record not found" });

    item.set(req.body);
    if (req.body.mileageAtRefuel && req.body.mileageAtRefuel > vehicle.currentMileage) {
      vehicle.currentMileage = req.body.mileageAtRefuel;
    }

    const saved = await vehicle.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /:id/fuel/:fuelId - Remove a fuel record
router.delete("/:id/fuel/:fuelId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    vehicle.fuelHistory.pull(req.params.fuelId);
    const saved = await vehicle.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /:id/fuel - Query fuel records with optional date range & total summary
router.get("/:id/fuel", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const { startDate, endDate } = req.query;
    let list = vehicle.fuelHistory || [];

    if (startDate) {
      const start = new Date(startDate);
      list = list.filter((f) => new Date(f.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter((f) => new Date(f.date) <= end);
    }

    const totalCost = list.reduce((sum, f) => sum + (f.totalCost || 0), 0);
    const totalVolume = list.reduce((sum, f) => sum + (f.volume || 0), 0);

    res.json({
      records: list,
      totalCost,
      totalVolume,
      count: list.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
