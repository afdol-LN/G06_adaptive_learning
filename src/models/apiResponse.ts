export interface ApiResponse<T>{
    isError : boolean;
    data : T | null;
    errorMessage: string;
}
