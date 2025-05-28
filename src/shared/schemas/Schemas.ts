import { ServerSchema } from "./ServerSchema";
import { ThemesSchema } from "./ThemesSchema";
import { UserSchema } from "./UserSchema";
import { CollagesSchema } from "./CollagesSchema";
import { PostsSchema } from "./PostsSchema";
import { LogsSchema } from "./LogsSchema";

const mongo = require('mongoose');

const server = mongo.model('servers', new mongo.Schema(ServerSchema))
const user = mongo.model('users', new mongo.Schema(UserSchema))
const themes = mongo.model('themes', new mongo.Schema(ThemesSchema))
const collages = mongo.model('collages', new mongo.Schema(CollagesSchema))
const posts = mongo.model('posts', new mongo.Schema(PostsSchema))
const logs = mongo.model('logs', new mongo.Schema(LogsSchema))

module.exports = user, server, themes, collages, posts, logs;