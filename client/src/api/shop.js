import api from './axios';

export const getAllShops = async () => {
    const { data } = await api.get('/shops');
    return data;
};

export const getAllShopsAdmin = async () => {
    const { data } = await api.get('/shops/all');
    return data;
};

export const createShop = async (shopData) => {
    const { data } = await api.post('/shops', shopData);
    return data;
};

export const updateShop = async (id, shopData) => {
    const { data } = await api.put(`/shops/${id}`, shopData);
    return data;
};

export const deleteShop = async (id) => {
    const { data } = await api.delete(`/shops/${id}`);
    return data;
};
