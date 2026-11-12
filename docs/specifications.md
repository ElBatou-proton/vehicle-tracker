# Project Specification: Local Vehicle Activity & Maintenance Tracker (MEAN Stack + Docker)

## 1. Project Overview

A full-stack local web application built with:

- **Frontend:** Angular (Latest Stable, Standalone Components, Signals) styled with Tailwind CSS.
- **Backend:** Node.js & Express.js REST API.
- **Database:** MongoDB running locally via **Docker**.
- **Environment:** Designed for local execution (no internet or cloud dependencies, no complex authentication needed).

---

## 2. Docker Setup for MongoDB

Create a file named `docker-compose.yml` in the root of your project workspace to spin up MongoDB and an optional visual database manager (Mongo Express).

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:latest
    container_name: vehicle_mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db

  mongo-express:
    image: mongo-express:latest
    container_name: vehicle_mongo_express
    restart: always
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password123
      ME_CONFIG_MONGODB_SERVER: mongodb

volumes:
  mongodb_data:

networks:
  default:
    name: vehicle_network
```

- To run the database: Run docker compose up -d in your terminal.

- Database UI: You can inspect your collections at http://localhost:8081.

## 3. Data Models & Schemas (backend/models/vehicle.model.js)

Mongoose schemas mirroring your tracking requirements:

```javascript
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
  { timestamps: true },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
```

## 4. Application Architecture & Folder Structure

```
vehicle-tracker/
├── docker-compose.yml
├── backend/
│   ├── server.js              # Express entry point & MongoDB connection
│   ├── models/
│   │   └── vehicle.model.js   # Mongoose schema
│   └── routes/
│       └── vehicles.js        # REST endpoints (CRUD + sub-documents)
└── frontend/ (Angular App)
    ├── src/
    │   ├── app/
    │   │   ├── components/    # List, Detail, Forms
    │   │   ├── services/      # HttpClient service to talk to Express API
    │   │   ├── models/        # TypeScript interfaces matching backend
    │   │   ...
```

## 5. Core Backend API Routes (backend/routes/vehicles.js)

- `GET /api/vehicles` - Retrieve all vehicles.

- `POST /api/vehicles` - Register a new vehicle.

- `PUT /api/vehicles/:id` - Update vehicle specs/mileage.

- `DELETE /api/vehicles/:id` - Remove a vehicle.

- `POST /api/vehicles/:id/maintenance` - Push a new record into maintenanceHistory and update current mileage.

- `POST /api/vehicles/:id/taxes` - Push a new tax entry into taxes.

## 6. Frontend Requirements (Angular + Tailwind)

- State Management: Use Angular Signals (signal, computed) coupled with an Angular HttpClient service targeting http://localhost:5000/api/vehicles.

- Views:
  1. Dashboard (/): Grid view of vehicles. Cards show status color-coding for oil change countdown (lastMaintenance + interval - currentMileage), SOAT validity, and Revision status.

  2. Vehicle Details (/vehicle/:id): Deep-dive view showing total maintenance history log, cost summaries, tax payment timelines, and quick action buttons to log new maintenance or tax items.

3. Forms: Reactive Forms for adding vehicles, logging parts/labor costs, and updating tracking details.

## 7. Instructions for Local Agent Setup

1. Spin up Docker containers via docker compose up -d.

2. Initialize the Node/Express backend (server.js with mongoose.connect('mongodb://admin:password123@localhost:27017/vehicle_tracker?authSource=admin')).

3. Generate the Angular standalone client workspace with Tailwind CSS.

4. Wire up Angular services to perform HTTP operations against the Express backend.
