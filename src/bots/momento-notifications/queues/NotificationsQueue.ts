import { GenericQueueProcessor, QueueItem } from "../../../shared/queue/GenericQueueProcessor";
import { NotificationService } from "../services/NotificationService";
import { errorHandler } from "../../../shared/handlers/errorHandler";

export class NotificationsQueue extends GenericQueueProcessor<QueueItem> {
  protected getKey(item: QueueItem): string {
    return item.request.target_user_id;
  }

  protected onDuplicate(item: QueueItem): void {
    item.message.react("🔂").catch(console.error);
  }

  protected async processRequest(item: QueueItem): Promise<void> {
    const service = new NotificationService();

    try {
      await service.sendNotification(item.request);
      await item.message.react("☑️").catch(console.error);
    } catch (e: any) {
      await item.message
        .startThread({
          name: e.message,
          autoArchiveDuration: 60,
          reason: e.message,
        })
        .then((thread) => {
          thread.send({
            embeds: [
              errorHandler({
                code: e.code,
                message: e.message,
              }),
            ],
          });
        })
        .catch(console.error);

      await item.message.react("❌").catch(console.error);
    }
  }
}
