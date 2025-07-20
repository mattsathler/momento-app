import { ProfileUpdaterService } from "../../services/ProfileUpdaterService";
import { errorHandler } from "../../../../shared/handlers/errorHandler";
import { GenericQueueProcessor, QueueItem } from "../../../../shared/queue/GenericQueueProcessor";

export class ProfileUpdateQueue extends GenericQueueProcessor<QueueItem> {
  protected getKey(item: QueueItem): string {
    return `${item.request.guild_id}:${item.request.target_user_id}`;
  }

  protected onDuplicate(item: QueueItem): void {
    item.message?.react("🔂").catch(console.error);
  }

  protected async processRequest(item: QueueItem): Promise<void> {
    const service = new ProfileUpdaterService();

    try {
      await service.requestUpdateProfilePictures(
        item.client,
        item.mongo,
        item.request
      );
      await item.message?.react("☑️").catch(console.error);
    } catch (e: any) {
      await item.message?.startThread({
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

      await item.message?.react("❌").catch(console.error);
    }
  }
}
