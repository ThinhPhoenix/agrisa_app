import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation } from "@tanstack/react-query"
import { SignInPayload, SignUpPayload } from "../models/auth.models";
import { AuthServices } from "../service/auth.service";
import { router } from "expo-router";


export const useAuth = () => {

    const signUpMutation = useMutation({
        mutationKey: [QueryKey.AUTH.SIGN_UP],
        mutationFn: async (payload: SignUpPayload) => {
            await AuthServices.signup(payload);
        },
        onSuccess: (data) => {
            router.push('/auth/signin');
            console.error(data);
        },
        onError: (error) => {
            console.error(error);
        }
    });

    const signInMutation = useMutation({
        mutationKey: [QueryKey.AUTH.SIGN_IN],
        mutationFn: async (payload: SignInPayload) => {
            return AuthServices.signin(payload);
        },
        onSuccess: (data) => {
            console.error(data);
        },
        onError: (error) => {
            console.error(error);
        }
    });

    return {
        signUpMutation,
        signInMutation
    }
}