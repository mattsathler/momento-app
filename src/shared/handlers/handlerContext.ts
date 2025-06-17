import { MongoService } from "../services/MongoService";

export interface HandlerContext {
    services?: {
        mongo?: MongoService;
        service?: any;
    };
}