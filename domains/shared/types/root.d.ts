
export {};
declare global {
    export type ApiTimestamp = string;

    /**
     * Meta data cho success response
     */
    export interface ApiMeta {
        timestamp: ApiTimestamp;
        // Có thể extend thêm: pagination, version, traceId, etc.
        [key: string]: unknown;
    }

    /**
     * Success Response - Backend trả về khi thành công
     */
    export interface ApiSuccessResponse<T = unknown> {
        success: true;
        data: T;
        meta: ApiMeta;
    }

    /**
     * Error Response - Backend trả về khi lỗi
     */
    export interface ApiError {
        code: string; // AUTH_FAILED, VALIDATION_ERROR, NOT_FOUND, etc.
        message: string;
    }

    export interface ApiErrorResponse {
        success: false;
        error: ApiError;
    }

    /**
     * Union type - Tất cả API responses (success hoặc error)
     * Sử dụng khi gọi API để handle cả 2 cases
     */
    export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

    // Type guards để check response type
    export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
        return response.success === true;
    };

    export const isApiError = (response: ApiResponse): response is ApiErrorResponse => {
        return response.success === false;
    };
    /**
     * Generic API function return type
     * Đảm bảo type safety cho cả success và error
     */
    export type ApiResult<T> = {
        isSuccess: boolean;
        data?: T;
        error?: ApiError;
        meta?: ApiMeta;
    };

    /**
     * Request payload types (generic)
     */
    export interface ApiRequest {
        [key: string]: unknown;
    }


}