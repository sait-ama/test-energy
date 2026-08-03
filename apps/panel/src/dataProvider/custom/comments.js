import { httpClient } from './../httpClient';

export const getUserComments = ({ userId }) => {
    return httpClient(`/api/users/${userId}/comments/`).then(({ json }) => json);
};

export const getRootComment = ({ commentId }) => {
    return httpClient(`/api/activity/comments/${commentId}/?page=1&ordering=-id&count=20`).then(({ json }) => json);
};
