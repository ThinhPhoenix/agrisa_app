
export default ({ config }) => {
  return {
    ...config,
    extra: {
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL,
      geminiApiKey:
        process.env.EXPO_PUBLIC_GEMINI_KEY,
    },
  };
};
