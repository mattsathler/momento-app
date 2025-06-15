import { Client, Message } from "discord.js";
import { concatMap, filter, Subject } from "rxjs";
import { MongoService } from "../services/mongoService";

type ActiveKey = string;

export type QueueItem = {
  client: Client;
  message: Message;
  mongo: MongoService;
  request: any;
};

export abstract class GenericQueueProcessor<T> {
  private requestSubject = new Subject<T>();
  private activeKeys: ActiveKey[] = [];

  constructor(queue: string, allowDuplicated: boolean = false) {
    this.initQueueProcessor(queue, allowDuplicated);
  }

  public enqueue(item: T) {
    this.requestSubject.next(item);
  }

  protected abstract getKey(item: T): ActiveKey;

  protected abstract processRequest(item: T, context?: {
    client: Client, mongoService: MongoService
  }): Promise<void>;

  private initQueueProcessor(queue: string, allowDuplicated: boolean) {
    console.log("Starting queue for", queue);
    this.requestSubject
      .pipe(
        filter((item) => {
          const key = this.getKey(item);
          const isActive = this.activeKeys.includes(key);
          if (isActive && !allowDuplicated) {
            return false;
          }

          if (!allowDuplicated) {
            this.activeKeys.push(key);
          }

          return true;
        }),
        concatMap(async (item) => {
          try {
            await this.processRequest(item);
          } finally {
            const key = this.getKey(item);
            if (!allowDuplicated) {
              this.activeKeys = this.activeKeys.filter((k) => k !== key);
            }
          }
        })
      )
      .subscribe({
        error: (err) =>
          console.error("Erro no processamento da fila genérica:", err),
      });
  }
}
