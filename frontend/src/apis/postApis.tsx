import { API_URL } from "./categoryApis";

export interface PostData {
  id?: number;
  title: string;
  description: string;
  category_id: number;
  body: string;
  image?: File;
  is_private: boolean;
  image_url?: string; 
}

export const fetchPosts = async () => {
  const res = await fetch(`${API_URL}/posts/`);
  return res.json();
};

export const fetchPost = async (id: number) => {
  const res = await fetch(`${API_URL}/posts/${id}`);
  return res.json();
};
export const createPost = async (data: PostData) => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("body", data.body);
    formData.append("category_id", String(data.category_id));
    formData.append("is_private", String(data.is_private));
    
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    const res = await fetch(`${API_URL}/posts/create-post`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
};

export const updatePost = async (id: number, data: Partial<PostData>) => {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.body) formData.append("body", data.body);
  if (data.category_id !== undefined)
    formData.append("category_id", String(data.category_id));
  if (data.is_private !== undefined)
    formData.append("is_private", String(data.is_private));
  if (data.image) {
    formData.append("image", data.image); 
  }

  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend error:", errorText);
    throw new Error("Failed to update post");
  }

  return res.json();
};

export const deletePost = async (id: number) => {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
