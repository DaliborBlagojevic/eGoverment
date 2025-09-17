// models/login.ts
export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
    expires_in: number;   
    token_type: string;   
};
