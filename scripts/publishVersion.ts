import { AxiosService } from "src/shared/services/AxiosService";
import { getUpdateInfo } from "src/shared/services/ChangelogService";
import fs from "fs";
import path from "path";

async function publishVersion() {
    const packagePath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    const json = getUpdateInfo(pkg.version)
    
    const axiosService: AxiosService = new AxiosService();
    await axiosService.postWebhook(process.env.HUB_UPDATE_CHANNEL_WEBHOOK!, json)
}

publishVersion();