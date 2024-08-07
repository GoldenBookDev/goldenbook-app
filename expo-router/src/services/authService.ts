import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export const signUp = async (email: string, password: string) => {
  return axios.post(`${API_URL}/signup`, { email, password });
};

export const signIn = async (email: string, password: string) => {
  return axios.post(`${API_URL}/signin`, { email, password });
};

export const sendEmailVerification = async (email: string) => {
  return axios.post(`${API_URL}/verify-email`, { email });
};

export const signOutUser = async () => {
  return axios.post(`${API_URL}/signout`);
};
