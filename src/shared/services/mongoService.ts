import mongo from "mongoose"
require("../schemas/Schemas");

export class MongoService {
    constructor() {
        this.connect()
    }

    async connect(): Promise<Boolean> {
        try {
            console.log("Connecting to MongoDB...")
            if (!process.env.MONGO_URI) {
                throw new Error("MONGO_URI not declared in .env!");
            }
            await mongo.connect(process.env.MONGO_URI)
            return true;
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    //CRUD
    async get(collection: string, query: {}): Promise<any[]> {
        return mongo.model(collection).find(query)
    }

    async getOne(collection: string, query: {}): Promise<any> {
        return await mongo.model(collection).findOne(query).lean();
    }

    async post(collection: string, query: {}): Promise<any> {
        return await mongo.model(collection).create(query);
    }

    async patch(collection: string, query: {}, update: {}): Promise<any> {
        return await mongo.model(collection).findOneAndUpdate(query, update, { returnOriginal: false });
    }

    async delete(collection: string, query: {}): Promise<any> {
        if (!mongo.connection || !mongo.connection.db) {
            return;
        }
        return mongo.connection.db.collection(collection).deleteMany(query)
    }

    async count(collection: string, query: {}): Promise<any> {
        return mongo.model(collection).countDocuments(query)
    }
}