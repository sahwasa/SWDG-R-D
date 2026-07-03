/**
 * ============================================================================
 * AJAX 로딩 오버레이 (글로벌 클릭 방지)
 * ============================================================================
 * 
 * 용도:
 * - AJAX 호출 중 사용자의 중복 클릭 및 다른 액션을 방지
 * - 투명한 전체 화면 오버레이를 사용하여 UI 깜박임 없이 처리
 * 
 * 동작 원리:
 * 1. AJAX 요청이 시작되면 투명한 div를 화면 전체에 표시
 * 2. 여러 요청이 동시에 진행될 경우 카운터로 관리 (첫 요청 시작 시 표시, 모든 요청 완료 시 숨김)
 * 3. 요청이 완료되면 자동으로 오버레이 제거
 * 
 * 지원:
 * - jQuery AJAX ($.ajax, $.get, $.post 등)
 * - Fetch API
 * 
 * 사용법:
 * - 이 파일을 포함하면 자동으로 활성화됨
 * - 별도의 설정이나 호출 불필요
 * ============================================================================
 */

// 페이지 로드 시 오버레이 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => LoadingOverlay.init());
} else {
  LoadingOverlay.init();
}

// 글로벌 로딩 오버레이 관리 객체
const LoadingOverlay = {
  element: null,          // 오버레이 DOM 요소
  activeRequests: 0,      // 현재 진행 중인 AJAX 요청 수

  /**
   * 오버레이 초기화
   * - 페이지 로드 시 한 번만 실행
   * - 투명한 전체 화면 div 생성 및 body에 추가
   */
  init() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.id = 'ajax-loading-overlay';
      this.element.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        z-index: 9999;
        cursor: wait;
        display: none;
      `;
      document.body.appendChild(this.element);
    }
  },

  /**
   * 오버레이 표시
   * - AJAX 요청 시작 시 자동 호출
   * - 요청 카운터 증가, 첫 번째 요청일 경우에만 오버레이 표시
   */
  show() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.element.style.display = 'block';
    }
  },

  /**
   * 오버레이 숨김
   * - AJAX 요청 완료 시 자동 호출
   * - 요청 카운터 감소, 모든 요청이 완료되면 오버레이 숨김
   */
  hide() {
    this.activeRequests--;
    if (this.activeRequests === 0) {
      this.element.style.display = 'none';
    }
  }
};

// ============================================================================
// jQuery AJAX 글로벌 이벤트 연동 (jQuery 사용 시)
// ============================================================================
// - ajaxStart: 첫 번째 AJAX 요청 시작 시 오버레이 표시
// - ajaxComplete: 각 AJAX 요청 완료 시 오버레이 숨김 (카운터 관리)
$(document).ajaxStart(function() {
  LoadingOverlay.show();
}).ajaxComplete(function() {
  LoadingOverlay.hide();
});

// ============================================================================
// Fetch API 래퍼 (바닐라 JS 사용 시)
// ============================================================================
// - 기본 fetch 함수를 래핑하여 자동으로 오버레이 표시/숨김
// - Promise의 finally를 사용하여 성공/실패 여부와 관계없이 오버레이 제거
const originalFetch = window.fetch;
window.fetch = function(...args) {
  LoadingOverlay.show();
  return originalFetch.apply(this, args)
    .finally(() => {
      LoadingOverlay.hide();
    });
};

/**
 * ============================================================================
 * 참고사항
 * ============================================================================
 * 
 * 1. z-index 조정이 필요한 경우:
 *    - 모달이나 다른 요소가 오버레이 위에 표시되어야 한다면
 *    - LoadingOverlay.element.style.zIndex 값을 적절히 조정
 * 
 * 2. 특정 AJAX 요청에서 오버레이를 사용하지 않으려면:
 *    - jQuery: $.ajax({ global: false, ... })
 *    - Fetch: originalFetch.call(window, ...) 직접 호출
 * 
 * 3. 커스터마이징:
 *    - 로딩 스피너 추가: init()에서 spinner 요소 추가
 *    - 배경색 변경: background 스타일 수정 (예: rgba(0,0,0,0.1))
 * ============================================================================
 */