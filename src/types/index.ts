export interface User {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface ImageMetadata {
    id: string;
    filename: string;
    url: string;
    size: number;
    content_type: string;
    folder: string;
    tags: string[];
    is_public: boolean;
    created_at: string;
    // Optional fields from API
    width?: number;
    height?: number;
    format?: string;
    description?: string;
    updated_at?: string;
    user_id?: string;
}
