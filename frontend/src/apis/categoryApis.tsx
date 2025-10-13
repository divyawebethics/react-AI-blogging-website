import axios from 'axios'

export const API_URL = "http://localhost:8080";

export const fetchCategories = async () =>{
    try{
        const response = await axios.get(`${API_URL}/categories`);
        return response.data

    }catch (err) {
    console.error("Network error:", err);
    alert("Failed to connect to server");
    }
}

export const  createCategory = async(name:string) => {
    const response = await axios.post(`${API_URL}/categories/`, {name});
    return response.data;
}

export const updateCategory = async(id:number, name: string) => {
    const response = await axios.put(`${API_URL}/categories/${id}`,{name})
    return response.data;
}

export const deleteCategory = async(id:number) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`)
    return response.data
}