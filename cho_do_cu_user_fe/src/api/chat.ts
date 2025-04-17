import {apiAxios} from "@/api/callApi";

export const requestCreateConversation = (participantId: string, latestMentionedPostId: string | null) => {
    return apiAxios({
        method: 'post',
        url: 'chat/create-conversation',
        data: {participantId, latestMentionedPostId},
    })
}
