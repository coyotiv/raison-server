export type PromptStatus = "production" | "draft" | "pending";

export interface Prompt {
  _id: string;
  name: string;
  systemPrompt: string;
  tags: string[];
  version: string;
  status: PromptStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Agent {
  _id: string;
  name: string;
  description: string;
  prompts: Prompt[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
