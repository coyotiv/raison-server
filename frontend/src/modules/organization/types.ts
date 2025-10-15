export interface Organization {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKey {
  _id: string;
  userId: string;
  name: string;
  key: string;
  enabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitMax: number;
  rateLimitTimeWindow: number;
  requestCount: number;
  lastRequest: Date | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

export interface Member {
  id: string;
}
