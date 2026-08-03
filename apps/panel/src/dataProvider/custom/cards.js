import { httpClient } from '../httpClient';

export const notifyDeleteCard = (id) => {
    return httpClient(`/api/v2/panel/models/cards/${id}/notify-delete/`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};
export const deleteCard = ({ id, reason }) => {
    return httpClient(`/api/v2/inventory/delete-card/`, {
        method: 'POST',
        body: JSON.stringify({ card_id: id }),
    });
};
