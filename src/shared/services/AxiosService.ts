import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Embed } from 'discord.js';

export class AxiosService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = Axios.create({
            timeout: 5000, // Timeout padrão de 5 segundos
        });
    }

    /**
     * Envia uma requisição POST para um webhook.
     * @param url URL do webhook.
     * @param data Corpo da requisição.
     * @param config Configurações adicionais do Axios (headers, etc).
     */
    async postWebhook(url: string, data: any, config?: AxiosRequestConfig): Promise<void> {
        try {
            await this.axiosInstance.post(url, data, config);
        } catch (error: any) {
            console.error('Resposta do servidor:', error);
        }
    }
}
