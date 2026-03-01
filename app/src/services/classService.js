import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/classes';

export const classService = {
  async getAll(userId) {
    const res = await axios.get(`${API_URL}/${userId}`);
    return res.data;
  },
  async create(name, userId) {
    return await axios.post(API_URL, { name, userId });
  },
  async update(id, name) {
    return await axios.put(`${API_URL}/${id}`, { name });
  },
  async delete(id) {
    return await axios.delete(`${API_URL}/${id}`);
  }
};