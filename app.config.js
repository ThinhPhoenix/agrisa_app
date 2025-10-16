
export default ({ config }) => {
  return {
    ...config,
    extra: {
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL
    },
  };
};
