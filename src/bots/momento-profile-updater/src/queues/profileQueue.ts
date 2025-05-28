import { Client, Message } from "discord.js";
import { ProfileUpdateRequest } from "../../models/ProfileUpdateRequest";
import { profileUpdaterService } from "../../services/profileUpdaterService";
import { MongoService } from "../../../../shared/services/mongoService";
import { errorHandler } from "../../../../shared/handlers/errorHandler";
import { concatMap, filter, Subject } from "rxjs";

type QueueItem = {
    client: Client;
    message: Message;
    mongo: MongoService;
    request: ProfileUpdateRequest
};

const requestSubject = new Subject<QueueItem>();
let activeUsersId: {
    userId: string, message: Message
}[] = []

export function initQueueProcessor() {
    requestSubject
        .pipe(
            filter((item) => {
                const userId = item.request.target_user_id;

                const isActive = activeUsersId.some(u => u.userId === userId);
                if (isActive) {
                    item.message.react('🔂').catch(console.error);
                    return false;
                }

                activeUsersId.push({ userId, message: item.message });
                return true;
            }),
            concatMap(async (item) => {
                await processRequest(item.client, item.mongo, item.request);
            })
        )
        .subscribe({
            complete: () => { },
            error: (err) => console.error("Erro no processamento reativo da fila:", err),
        });
}

export function enqueue(item: QueueItem) {
    requestSubject.next(item);
}

export async function processRequest(client: Client, mongo: MongoService, request: ProfileUpdateRequest) {
    const service: profileUpdaterService = new profileUpdaterService();
    try {
        await service.requestUpdateProfilePictures(client, mongo, request);
        await request.message.react("☑️").catch(console.error);
    } catch (e: any) {
        await request.message.startThread({
            name: e.message,
            autoArchiveDuration: 60,
            reason: e.message,
        }).then((thread) => {
            thread.send({
                embeds: [errorHandler({
                    code: e.code,
                    message: e.message,
                })]
            });
        }).catch(console.error);

        await request.message.react("❌").catch(console.error);
    } finally {
        activeUsersId = activeUsersId.filter(user => user.userId !== request.target_user_id);
    }
    return;
}