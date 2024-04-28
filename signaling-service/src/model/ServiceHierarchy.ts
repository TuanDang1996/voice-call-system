import mongoose, { Document, Schema } from "mongoose";
import { TServiceHierarchy } from "@/types/ServiceHirarchy";

interface ServiceHierarchyDocument extends TServiceHierarchy, Document {}

const serviceHierarchySchema = new Schema<ServiceHierarchyDocument>({
  "name": String,
  "audio_url": String,
  "parent_id": String,
  "type": String,
  "created_date": { type: Date, default: Date.now },
});

const ServiceHierarchy = mongoose.model<ServiceHierarchyDocument>(
  "ServiceHierarchy",
    serviceHierarchySchema
);

export default ServiceHierarchy;
