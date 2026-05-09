import axios, { AxiosInstance } from "axios"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const instance: AxiosInstance = axios.create({
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    headers: {
        "Content-Type": "application/json",
    },
    params: {
        key: GEMINI_API_KEY,
    },
})

export default instance
