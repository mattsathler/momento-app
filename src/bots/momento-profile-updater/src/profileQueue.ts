import { Client, Message } from "discord.js";
import { ProfileUpdateRequest } from "../models/ProfileUpdateRequest";
import { profileUpdaterService } from "../services/profileUpdaterService";
import { MongoService } from "../../../shared/services/mongoService";
import { errorHandler } from "../../../shared/handlers/errorHandler";

let isProcessing = false;

export async function addToQueue(queue: ProfileUpdateRequest[], client: Client, message: Message, mongoService: MongoService): Promise<void> {
    const service: profileUpdaterService = new profileUpdaterService();

    console.log(queue.length);
    queue.push(service.extractProfileUpdateRequest(message));
    await processQueue(queue, client, message, mongoService);
}

async function processQueue(queue: ProfileUpdateRequest[], client: Client, message: Message, mongoService: MongoService) {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    const service: profileUpdaterService = new profileUpdaterService();
    const request = queue.shift();
    if (request) {
        try {
            await service.requestUpdateProfilePictures(client, mongoService, request)
        } catch (e: any) {
            try {
                const thread = await message.startThread({
                    name: "500",
                    reason: "500",
                });
                await thread.send({
                    embeds: [errorHandler({
                        code: 500,
                        message: e?.message || "Não foi possível atualizar o perfil desse usuário",
                    })]
                });
            }
            catch { }
        }
    }

    isProcessing = false;
    setTimeout(processQueue, 100);
}
