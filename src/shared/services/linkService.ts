import { Message, TextChannel } from "discord.js";
import { Image, loadImage } from "canvas";

export class LinkService {

    static async uploadImageToMomento(uploadChannel: TextChannel, image: Buffer, type: string = 'png'): Promise<Message> {
        try {
            if (!uploadChannel) { throw new Error('Invalid upload channel') }

            const msg: Message = await uploadChannel.send({
                files: [{
                    attachment: image,
                    name: `momento.${type}`
                }]
            })
            const attachment = msg.attachments.first()
            if (!attachment) { throw new Error('Erro ao enviar imagem para o servidor!') }
            return msg
        }
        catch (err: any) {
            console.log(err)
            return err;
        }
    }

    static async readImageOfMomento(uploadChannel: TextChannel, url: string): Promise<string | undefined> {
        if (url.indexOf('discord.com')) {
            const splitURL = url.split('/');
            const messageId = splitURL[6];
            const message = await uploadChannel.messages.fetch(messageId);

            if (!message.attachments.first()?.url) throw new Error('Não existe nenhum attachment nessa mensagem!')
            return message.attachments.first()?.url;
        }
    }

    static treatUrlForPost(url: string) {
        const removeParams = (url: string) => {
            const urlWithoutParams = url.replace(/\/\?.*$/, '');
            const instagramPostRegex = /www\.instagram\.com\/p\/[^\/]+/i;
            if (instagramPostRegex.test(urlWithoutParams)) {
                return urlWithoutParams;
            }

            return url;
        }
        if (url.indexOf('https://') === -1) {
            url = `https://${url}`;
        }
        if (url.indexOf('www.instagram.com/p/') !== -1) {
            url = removeParams(url)
        }
        if (!url.endsWith('/')) {
            url = `${url}/`
        }
        url = `${url}media/?size=l`
        return url;
    }

    static async loadImageWithRetry(url: string, retries: number = 3): Promise<Image | null> {
        for (let i = 1; i > retries; i++) {
            try {
                const img = await loadImage(url);
                if (img) {
                    return img;
                }
            }
            catch {
                console.log('Failed to load image', url, ', retrying...');
            }
        }
        console.log('ERROR: Failed to load image: ', url);
        return null;
    }
}