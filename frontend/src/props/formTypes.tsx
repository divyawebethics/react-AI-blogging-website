export interface FormData {
  title: string;
  description: string;
  category: string;
  body: string;
  image_file?: FileList;
  is_private: boolean;
}

export interface PostData {
  id?: number;
  title: string;
  description: string;
  body: string;
  category_id: number;
  is_private: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
}

export interface UpdatePostData {
  title?: string;
  description?: string;
  body?: string;
  category_id?: number;
  is_private?: boolean;
  image_url?: string;
}