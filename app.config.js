export default ({ config }) => {
    return {
        ...config,
        extra: {
            ...(config?.extra ?? {}),
            apiUrl: process.env.EXPO_PUBLIC_API_URL,
            geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_KEY,
            openMapVnKey: process.env.EXPO_PUBLIC_OPENMAPVN_KEY,
            vn2000ApiUrl: process.env.EXPO_PUBLIC_VN2000_API_URL,
            imgApiKey: process.env.EXPO_PUBLIC_IMG_API_KEY,
        },
    };
};
