import { payment } from "./IPayment";

export interface IServer {
    id: string,
    channelsId: channelsId,
    analytics: analyticsConfig,
    emojisId: emojis,
    trendWebhooks?: String[]
}

export interface channelsId {
    themeCatalogue: string,
}

export interface analyticsConfig {
    likesToTrend: number,
    momentosToVerify: number,
    followersToVerify: number,
    trendsToVerify: number,
    momentosTimeout: number,
    followersMultiplier: number,
}

export interface subscription {
    subscriptionDay: Date,
    subscriptionType: number,
    payments: payment[],
}

export interface emojis {
    like: string,
    comment: string,
    share: string,
    report: string,
}
