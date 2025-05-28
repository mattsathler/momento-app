import { MongoService } from "../services/mongoService";

export interface HandlerContext {
    services?: {
        mongo?: MongoService;
    };
}