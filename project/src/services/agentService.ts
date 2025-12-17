import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Adjust if your backend URL is different

export const agentService = {
    async query(query: string) {
        try {
            const response = await axios.post(`${API_URL}/agents/query`, { query });
            return response.data.response;
        } catch (error) {
            console.error('Agent query error:', error);
            throw error;
        }
    }
};
