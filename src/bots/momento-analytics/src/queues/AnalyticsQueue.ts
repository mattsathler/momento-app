import { GenericQueueProcessor, QueueItem } from "../../../../shared/queue/GenericQueueProcessor";
import { errorHandler } from "../../../../shared/handlers/errorHandler";
import { AnalyticsService } from "../../services/analyticsService";
import { Client, TextChannel } from "discord.js";
import { MongoService } from "../../../../shared/services/mongoService";
import { Post } from "../../../../shared/models/Post";
import { User } from "../../../../shared/models/User";

export class AnalyticsQueue extends GenericQueueProcessor<QueueItem> {
  protected getKey(item: QueueItem): string {
    return item.request.target_user_id;
  }

  protected onDuplicate(item: QueueItem): void {
    item.message.react("🔂").catch(console.error);
  }

  protected async processRequest(item: QueueItem, context?: {
    client: Client, mongoService: MongoService, author: User, post: Post, uploadChannel: TextChannel
  }): Promise<void> {
if (!context) return;
    const service = new AnalyticsService();
    const request = service.createAnalyticsRequestObject(item.request);
    try {
      await service.analyticPost(request, context);
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
