export interface MaintenanceRecord {
  _id?: string;
  date: string | Date;
  mileageAtService: number;
  partsReplaced?: string[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  mechanicOrShop?: string;
  notes?: string;
}

export interface TaxRecord {
  _id?: string;
  year: number;
  amount: number;
  paidDate: string | Date;
  receiptNumber?: string;
}

export interface FuelRecord {
  _id?: string;
  date: string | Date;
  mileageAtRefuel: number;
  volume: number;
  unitCost: number;
  totalCost: number;
  fuelType: string;
  station?: string;
  notes?: string;
}

export interface Vehicle {
  _id: string;
  modelType: string;
  plate: string;
  year: number;
  color: string;
  pictureUrl?: string;
  currentMileage: number;
  kilometerInterval: number;
  maintenanceHistory: MaintenanceRecord[];
  fuelHistory: FuelRecord[];
  taxes: TaxRecord[];
  hasAnnualRevision: boolean;
  annualRevisionDate?: string | Date;
  hasSoat: boolean;
  soatExpiryDate?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateVehicleDto = Omit<
  Vehicle,
  '_id' | 'maintenanceHistory' | 'fuelHistory' | 'taxes' | 'createdAt' | 'updatedAt'
>;
