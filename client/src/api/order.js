import api from './axios';

export const getShopOrders = async (shopId) => {
    const { data } = await api.get(`/orders/shop/${shopId}`);
    return data;
};

export const getShopHistory = async (shopId) => {
    const { data } = await api.get(`/orders/shop/${shopId}/history`);
    return data;
};

export const updateOrderStatus = async (id, status) => {
    const { data } = await api.put(`/orders/${id}/status`, { status });
    return data;
};

export const getMyOrders = async () => {
    const { data } = await api.get('/orders/myorders');
    return data;
};

export const getAdminAnalytics = async () => {
    const { data } = await api.get('/orders/analytics/admin');
    return data;
};

export const getShopAnalytics = async (shopId) => {
    const { data } = await api.get(`/orders/analytics/shop/${shopId}`);
    return data;
};
