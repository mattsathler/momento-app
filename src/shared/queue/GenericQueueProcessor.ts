import { concatMap, filter, Subject } from "rxjs";

type ActiveKey = string;

export abstract class GenericQueueProcessor<T> {
  private requestSubject = new Subject<T>();
  private activeKeys: ActiveKey[] = [];

  constructor() {
    this.initQueueProcessor();
  }

  public enqueue(item: T) {
    this.requestSubject.next(item);
  }

  protected abstract getKey(item: T): ActiveKey;

  protected abstract onDuplicate(item: T): void;

  protected abstract processRequest(item: T): Promise<void>;

  private initQueueProcessor() {
    this.requestSubject
      .pipe(
        filter((item) => {
          const key = this.getKey(item);
          const isActive = this.activeKeys.includes(key);
          if (isActive) {
            this.onDuplicate(item);
            return false;
          }

          this.activeKeys.push(key);
          return true;
        }),
        concatMap(async (item) => {
          try {
            await this.processRequest(item);
          } finally {
            const key = this.getKey(item);
            this.activeKeys = this.activeKeys.filter((k) => k !== key);
          }
        })
      )
      .subscribe({
        error: (err) =>
          console.error("Erro no processamento da fila genérica:", err),
      });
  }
}
