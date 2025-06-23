import { IContext } from "../Interfaces/IContext";
import { ILog } from "../Interfaces/ILog";

export class LogService {
    constructor() {}
    static log(ctx: IContext, log: ILog): void {
        ctx.mongoService.post('logs', log);
    }
}