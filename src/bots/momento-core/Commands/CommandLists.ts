import { ICommand } from "../Interfaces/ICommand";
import { perfil } from "./TextCommands/perfil/perfil"
import { capa } from "./TextCommands/capa/capa"
import { sample } from "./TextCommands/sample/sample"
import { momento } from "./TextCommands/momento/momento"
import { registerUser } from "./InteractionsCommands/Submit/registerUser"
import { editUser } from "./InteractionsCommands/Submit/editUser"
import { collage } from "./TextCommands/collage/collage"
import { highlight } from "./TextCommands/highlight/highlight";
import { openThemeModal } from "./InteractionsCommands/Buttons/openThemeModal/openThemeModal";
import { registerTheme } from "./InteractionsCommands/Submit/registerTheme";
import { styleUser } from "./InteractionsCommands/Submit/styleUser";
import { openPostModal } from "../App/Post/openPostModal";
import { createPost } from "../App/Post/createPost";
import { deletePost } from "../App/Post/deletePost";
import { backButton } from "../Utils/BackButton";
import { openOptionsMenu } from "../App/Post/openOptionsMenu";
import { silencePost } from "../App/Post/silencePost";
import { openAskUser } from "../App/Ask/openAskUser";
import { askUser } from "../App/Ask/askUser";
import { openAnswerModal } from "../App/Ask/openAnswerModal";
import { answerQuestion } from "../App/Ask/answerQuestion";
import { deleteMessage } from "./InteractionsCommands/Buttons/deleteMessage/deleteMessage";
import { openRegisterModal } from "../App/Profile/openRegisterModal/openRegisterModal";
import { openEditProfileModal } from "../App/Profile/configProfile/editProfile/openEditProfileModal";
import { openStyleProfileModal } from "../App/Profile/configProfile/styleProfile/openStyleProfile";
import { redeemUser } from "../App/Profile/redeemUser/redeemUser";
import { openProfileConfigurations } from "../App/Profile/configProfile/openProfileConfiguration";
import { useTheme } from "../App/Profile/Themes/useTheme";
import { deleteTheme } from "../App/Profile/Themes/deleteTheme";
import { likePost } from "../App/Post/likePost";
import { followUser } from "../App/Profile/followUser/followUser";
import { unfollowUser } from "../App/Profile/unfollowUser/unfollowUser";
import { openCollageModal } from "../App/Collage/openCollageModal";
import { createCollage } from "../App/Collage/createCollage";
import { unlikePost } from "../App/Post/unlikePost";
import { createRegister } from "./TextCommands/createregister/createRegister";
import { openConfigurePostsModal } from "../App/Server/openConfigurePostsModal";
import { editPosts } from "../App/Server/configurePosts";
import { toggleNotifications } from "../App/Profile/configProfile/toggleNotifications/toggleNotifications";
import { addFollowers } from "./TextCommands/addfollowers/addfollowers";
import { openConfigureTrendsWebhooksModal } from "../App/Server/openTrendWebhooksModal";
import { createImportFollowersMessage } from "../App/Profile/configProfile/importFollowers/createImportFollowersMessage";
import { repostPost } from "../App/Post/repostPost";
import { verify } from "./TextCommands/verify/verify";
import { reloadPosts } from "./TextCommands/reloadposts/reloadposts";

export const textList: { [key: string]: ICommand } = {
    momento: momento,
    register: createRegister,
    sample: sample,
    perfil: perfil,
    capa: capa,
    collage: collage,
    highlight: highlight,
    destaque: highlight,
    addfollowers: addFollowers,
    verify: verify,
    reload: reloadPosts
}

export const submitList: { [key: string]: ICommand } = {
    registerUser: registerUser,
    editUser: editUser,
    registerTheme: registerTheme,
    styleUser: styleUser,
    createPost: createPost,
}

export const interactionList: { [key: string]: ICommand } = {
    //GLOBAL =======================
    deleteMessage: deleteMessage,

    //PROFILE =======================
    openRegisterModal: openRegisterModal,
    openEditProfileModal: openEditProfileModal,
    openStyleProfileModal: openStyleProfileModal,
    openThemeModal: openThemeModal,
    openCollageModal: openCollageModal,
    redeemUser: redeemUser,
    openProfileConfigurations: openProfileConfigurations,
    useTheme: useTheme,
    deleteTheme: deleteTheme,
    createCollage: createCollage,
    toggleNotifications: toggleNotifications,

    //IMPORT FOLLOWERS =================
    createImportFollowersMessage: createImportFollowersMessage,
    
    //POST =======================
    openPostModal: openPostModal,
    openOptionsMenu: openOptionsMenu,
    deletePost: deletePost,
    backButton: backButton,
    silencePost: silencePost,
    
    //ASK =======================
    openAskUser: openAskUser,
    askUser: askUser,
    openAnswerModal: openAnswerModal,
    answerQuestion: answerQuestion,
    
    //SERVER =====================
    openConfigurePostsModal: openConfigurePostsModal,
    openConfigureTrendsWebhooksModal: openConfigureTrendsWebhooksModal,
    configurePosts: editPosts,
}   

export const reactionList: { [key: string]: ICommand } = {
    '❤️': likePost,
    '🫂': followUser,
    '🔁': repostPost
}

export const reactionRemoveList: { [key: string]: ICommand } = {
    '🫂': unfollowUser,
    '❤️': unlikePost
}