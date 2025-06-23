import { Permission } from "./Permission";
import { User } from "./user";

export const DefaultUser: User = {
    userId: '',
    guildId: '',
    permission: Permission.user,
    username: 'testuser',
    name: 'Momento',
    surname: 'Teste',
    bio: 'Esse é o seu momento!',
    references: {
        channelId: '',
        statsId: '',
        collageId: '',
        notificationId: '',
    },
    styles: {
        collage: 1,
        theme: 'light',
    },
    imagesUrl: {
        profilePicture: 'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
        profileCover: '',
        collage: [
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
        ],
        highlights: [
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
            'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180',
        ]
    },
    stats: {
        followers: 0,
        isVerified: false,
        notifications: true,
        influencyLevel: 1,
        lastOnline: new Date()
    }
}