export interface FormData {
  title: string;
  description: string;
  category: string;
  body: string;
  image?: FileList; 
  is_private: boolean;
}