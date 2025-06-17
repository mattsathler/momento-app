import {
  GenericQueueProcessor,
  QueueItem,
} from "../../../../shared/queue/GenericQueueProcessor";
import { errorHandler } from "../../../../shared/handlers/errorHandler";
import { AnalyticsService } from "../../services/AnalyticsService";
import { Post } from "../../../../shared/models/Post";
import { Client } from "discord.js";
import { MongoService } from "../../../../shared/services/MongoService";
import { LinkService } from "../../../../shared/services/linkService";

export class AnalyticsQueue extends GenericQueueProcessor<QueueItem> {

  protected getKey(item: QueueItem): string {
    return item.request.post.references.messageId;
  }

  protected onDuplicate(item: QueueItem): void {
    item.message?.react("🔂").catch(console.error);
  }

  protected async processRequest(
    item: QueueItem,
    context?: {
      client: Client;
      mongoService: MongoService;
      service: AnalyticsService;
    }
  ): Promise<void> {

    if (!context?.service) throw new Error("Invalid analytics service");
    try {
      const post = item.request.post as Post;
      if (!post.references.messageId) return;
      const imageUrl = await context.service.analyticPost(
        item.client,
        item.mongo,
        item.request.author,
        item.request.post,
        item.request.uploadChannel
      );
      if (!imageUrl) { throw new Error("Invalid Analytics!") }
      const image = await LinkService.readImageOfMomento(item.request.uploadChannel, imageUrl);
      if (!image) { throw new Error("Invalid Analytics!") }
      await context.service.sendAnalyticsNotification(item.request.author, image);
      await context.service.requestUpdateProfile(item.request.author);
      return;
    } catch (e: any) {
      if (!item.message) return;
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
