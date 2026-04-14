export const parseApiError = (error: unknown) => {
  const fallback = "Something went wrong. Please try again.";
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const maybeAxios = error as {
    response?: { data?: { error?: string; fields?: Record<string, string> } };
  };

  const payload = maybeAxios.response?.data;
  if (!payload) {
    return fallback;
  }

  if (payload.error === "validation failed" && payload.fields) {
    return Object.entries(payload.fields)
      .map(([field, message]) => `${field}: ${message}`)
      .join(", ");
  }

  return payload.error ?? fallback;
};
