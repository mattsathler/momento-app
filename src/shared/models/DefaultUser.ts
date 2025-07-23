import { Permission } from "./Permission";
import { User } from "./user";

export const DefaultUser: User = {
    userId: '',
    guildId: '',
    permission: Permission.user,
    username: 'usuario',
    name: 'Nome',
    surname: 'Sobrenome',
    bio: 'Esse é o seu momento!',
    pronouns: null,
    references: {
        channelId: '',
        statsId: '',
        collageId: '',
        notificationId: '',
    },
    styles: {
        collage: 1,
        theme: 'light',
        fonts: {
            primary: 'sfpro',
            secondary: 'sfpro'
        }
    },
    imagesUrl: {
        profilePicture: 'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
        profileCover: '',
        collage: [
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
        ],
        highlights: [
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1395762289898029178',
        ]
    },
    stats: {
        followers: 0,
        isVerified: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notifications: true,
        influencyLevel: 1,
        lastOnline: new Date()
    }
}