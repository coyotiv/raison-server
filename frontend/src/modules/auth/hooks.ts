import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import type {
  ForgotPasswordSchemaType,
  LoginSchemaType,
  RegisterSchemaType,
  ResetPasswordSchemaType,
  VerifyEmailSchemaType,
} from "~/modules/auth/schema";

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5173";

export const SESSION_QUERY_KEY = ["session"];
export const LOGIN_MUTATION_KEY = ["login"];
export const REGISTER_MUTATION_KEY = ["register"];
export const FORGOT_PASSWORD_MUTATION_KEY = ["forgot-password"];
export const RESET_PASSWORD_MUTATION_KEY = ["reset-password"];
export const VERIFY_EMAIL_MUTATION_KEY = ["verify-email"];
export const GOOGLE_SIGNIN_MUTATION_KEY = ["google-signin"];
export const LOGOUT_MUTATION_KEY = ["logout"];

export const useSessionQuery = () => {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const res = await authClient.getSession();
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
  });
};

export const useLoginMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: LOGIN_MUTATION_KEY,
    mutationFn: async (payload: LoginSchemaType) => {
      const res = await authClient.signIn.email(payload);

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res;
    },
    onSuccess() {
      navigate("/");
    },
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: REGISTER_MUTATION_KEY,
    mutationFn: async (payload: RegisterSchemaType) => {
      const res = await authClient.signUp.email({
        email: payload.email,
        password: payload.password,
        name: payload.name,
      });

      if (res.error) {
        if (res.error.status === 404 && !res.error.statusText) {
          throw new Error("Cannot connect to the server. Please try again later.");
        }

        throw new Error(res.error.message);
      }

      return res;
    },
    onSuccess: () => {
      navigate("/auth/verify-email");
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationKey: FORGOT_PASSWORD_MUTATION_KEY,
    mutationFn: async (payload: ForgotPasswordSchemaType) => {
      const res = await authClient.forgetPassword({
        email: payload.email,
        redirectTo: "/auth/reset-password",
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res;
    },
  });
};

export const useResetPasswordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: RESET_PASSWORD_MUTATION_KEY,
    mutationFn: async (payload: ResetPasswordSchemaType & { token: string }) => {
      const res = await authClient.resetPassword({
        newPassword: payload.password,
        token: payload.token,
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res;
    },
    onSuccess: () => {
      navigate("/auth/login");
    },
  });
};

export const useVerifyEmailMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: VERIFY_EMAIL_MUTATION_KEY,
    mutationFn: async (payload: VerifyEmailSchemaType) => {
      const res = await authClient.verifyEmail({
        query: {
          token: payload.token,
        },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res;
    },
    onSuccess: () => {
      navigate("/");
    },
  });
};

export const useGoogleSignIn = () => {
  return useMutation({
    mutationKey: GOOGLE_SIGNIN_MUTATION_KEY,
    mutationFn: async () => {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: BASE_URL,
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res;
    },
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: LOGOUT_MUTATION_KEY,
    mutationFn: async () => {
      const res = await authClient.signOut();

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res;
    },
    onSuccess: () => {
      navigate("/auth/login");
    },
  });
};
