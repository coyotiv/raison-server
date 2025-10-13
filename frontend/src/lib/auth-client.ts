import { apiKeyClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "~/lib/request";

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/api/auth`,
  plugins: [organizationClient(), apiKeyClient()],
  fetchOptions: {
    credentials: "include",
  },
});
