import api from './axios';

export const getShopMenu = async (shopId) => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await api.get(`/menu/${shopId}`, config);
    return data;
};

export const addMenuItem = async (menuData) => {
    const { data } = await api.post('/menu', menuData);
    return data;
};

export const updateMenuItem = async (id, menuData) => {
    const { data } = await api.put(`/menu/${id}`, menuData);
    return data;
};

export const deleteMenuItem = async (id) => {
    const { data } = await api.delete(`/menu/${id}`);
    return data;
};
