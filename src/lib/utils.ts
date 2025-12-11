/**
 * @file utils.ts
 * @description 프로젝트 전반에서 사용되는 유틸리티 함수들을 모아둔 파일입니다.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn 함수
 * Tailwind CSS 클래스를 조건부로 병합하고 충돌을 해결하는 헬퍼 함수입니다.
 * clsx로 조건부 클래스 결합 후, tailwind-merge로 중복 스타일 제거
 * @param inputs - 결합할 클래스 값들
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
