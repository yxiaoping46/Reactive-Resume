import { t } from "@lingui/macro";
import type { ErrorMessage } from "@reactive-resume/utils";
import { deepSearchAndParseDates } from "@reactive-resume/utils";
import axios from "axios";
import { redirect } from "react-router";
import { useSupabase } from "@/client/providers/supabase.provider";

import { USER_KEY } from "../constants/query-keys";
import { toast } from "../hooks/use-toast";
import { translateError } from "../services/errors/translate-error";
import { queryClient } from "./query-client";

const instance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Add Supabase auth token to requests
instance.interceptors.request.use(async (config) => {
  const supabase = useSupabase();
  const { data: { session } } = await supabase.supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Transform dates in responses
instance.interceptors.response.use(
  (response) => {
    const transformedResponse = deepSearchAndParseDates(response.data, ["createdAt", "updatedAt"]);
    return { ...response, data: transformedResponse };
  },
  (error) => {
    const message = error.response?.data.message as ErrorMessage;
    const description = translateError(message);

    if (description) {
      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description,
      });
    }

    // Handle auth errors
    if (error.response?.status === 401) {
      queryClient.invalidateQueries({ queryKey: USER_KEY });
      redirect("/auth/login");
    }

    return Promise.reject(new Error(message));
  },
);

export { instance as axios };
