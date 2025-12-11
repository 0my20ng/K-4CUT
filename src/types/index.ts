/**
 * @file index.ts (types)
 * @description 애플리케이션 전반에서 사용되는 TypeScript, 인터페이스 정의 파일입니다.
 */

// 사용자 정보 인터페이스
export interface User {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
}

// 인증 응답 데이터 인터페이스
export interface AuthResponse {
    access_token: string;  // 액세스 토큰
    refresh_token: string; // 리프레시 토큰
    token_type: string;    // 토큰 타입 (Bearer 등)
}

// 이미지 메타데이터 인터페이스
export interface ImageMetadata {
    id: string;             // 이미지 ID
    filename: string;       // 파일명
    url: string;            // 이미지 접근 URL
    size: number;           // 파일 크기 (bytes)
    content_type: string;   // MIME 타입
    folder: string;         // 저장 폴더
    tags: string[];         // 태그 목록
    is_public: boolean;     // 공개 여부
    created_at: string;     // 생성 일시
    // API에서 오는 선택적 필드들
    width?: number;
    height?: number;
    format?: string;
    description?: string;
    updated_at?: string;
    user_id?: string;
}
