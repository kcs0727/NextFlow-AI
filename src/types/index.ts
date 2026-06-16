export interface SelectedLength {
  length: number;
  text: string;
}

export interface Creation {
  id: string;
  userId: string;
  prompt: string;
  content: string;
  type: string;
  publish: boolean;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}
