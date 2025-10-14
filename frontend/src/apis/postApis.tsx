import { API_URL } from "./categoryApis";
import type { PostData, UpdatePostData } from "../props/formTypes";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const transformImageUrl = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${BASE_URL}${imageUrl}`;
};

export const fetchPost = async (id: number): Promise<PostData> => {
  const res = await axios.get(`${API_URL}/posts/${id}`);
  const post = res.data;
  return {
    ...post,
    image_url: transformImageUrl(post.image_url)
  };
};

export const createPost = async (formData: FormData) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_URL}/posts/`, formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
};

export const fetchPosts = async (): Promise<PostData[]> => {
  const res = await axios.get(`${API_URL}/posts/`);
  const posts = res.data;
  return posts.map((post: PostData) => ({
    ...post,
    image_url: transformImageUrl(post.image_url)
  }));
};

export const updatePost = async (id: number, data: FormData | UpdatePostData) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
  };

  try {
    const response = await axios.put(`${API_URL}/posts/${id}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (id: number) => {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${API_URL}/posts/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
};