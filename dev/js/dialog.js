/**
 * ============================================================================
 * PopupManager - Dialog 팝업 닫기 공통 모듈
 * ============================================================================
 * 
 * @description
 * dialog 요소의 닫기 기능을 통합 관리하는 공통 모듈입니다.
 * 닫기 버튼 클릭, ESC 키, 프로그래밍 방식 닫기를 지원하며,
 * 팝업별로 beforeClose/afterClose 콜백을 설정할 수 있습니다.
 * 
 * @author []
 * @since 2024-02-02
 * @version 1.1.0 (Refactored)
 * 
 * ============================================================================
 * 필수 HTML 구조
 * ============================================================================
 * <dialog id="myDialog" class="dialog">
 *   <div class="dialog__header">
 *     <h2>팝업 제목</h2>
 *     <button class="btn_cancel">닫기</button>
 *   </div>
 *   <div class="dialog__body">
 *     <!-- 팝업 내용 -->
 *   </div>
 *   <div class="dialog__footer">
 *    <button type="button" class="btn btn--secondary">취소</button>
      <button type="submit" class="btn btn--primary">저장</button>
 *   </div>
 * </dialog>
 * 
 * ============================================================================
 * 기본 사용법
 * ============================================================================
 * 
 * 1. 팝업 열기
 *    PopupManager.showModal('myDialog');
 * 
 * 2. 팝업 닫기 (프로그래밍 방식)
 *    PopupManager.close('myDialog');
 *    또는
 *    const dialog = document.querySelector('dialog[open]');
 *    PopupManager.close(dialog);
 * 
 * 3. 닫기 버튼으로 닫기
 *   .dialog__header-close, .dialog__footer .btn--cancel 버튼 클릭 시 자동으로 닫힘
 * 
 * 4. ESC 키로 닫기
 *    팝업이 열려있을 때 ESC 키를 누르면 자동으로 닫힘
 * 
 * ============================================================================
 * 콜백 설정
 * ============================================================================
 * 
 * 방법 1: setCallback으로 미리 설정 (권장 - 닫기 버튼에도 적용됨)
 * -------
 * PopupManager.setCallback('myDialog', {
 *   beforeClose: function(dialog) {
 *     console.log('닫기 전 실행');
 *     return confirm('정말 닫으시겠습니까?'); // false 반환 시 닫기 취소
 *   },
 *   afterClose: function(dialog) {
 *     console.log('닫은 후 실행');
 *     dialog.querySelector('form').reset();
 *   }
 * });
 * 
 * 방법 2: close 호출 시 직접 전달 (특정 상황에서만 사용)
 * -------
 * document.getElementById('closeBtn').addEventListener('click', function() {
 *   PopupManager.close('myDialog', {
 *     beforeClose: function(dialog) {
 *       console.log('저장 버튼으로 닫기');
 *       return true;
 *     },
 *     afterClose: function(dialog) {
 *       alert('저장되었습니다!');
 *     }
 *   });
 * });
 * 
 * ============================================================================
 * 설정 변경
 * ============================================================================
 * 
 * 1. 닫기 버튼 선택자 변경
 *    PopupManager.closeBtnSelectors = '.close-btn, .btn-close';
 * 
 * 2. ESC 키 비활성화
 *    PopupManager.enableEscKey = false;
 * 
 * ============================================================================
 * API 메서드
 * ============================================================================
 * 
 * PopupManager.showModal(dialogId)
 *   - 팝업을 엽니다 (Modal 모드)
 *   - @param {string|HTMLElement} dialogId - 팝업 ID 또는 dialog 요소
 * 
 * PopupManager.close(dialogId, options)
 *   - 팝업을 닫습니다
 *   - @param {string|HTMLElement} dialogId - 팝업 ID 또는 dialog 요소
 *   - @param {Object} options - beforeClose, afterClose 콜백
 *   - @return {boolean} 성공 여부
 * 
 * PopupManager.setCallback(dialogId, options)
 *   - 팝업별 콜백을 설정합니다
 *   - @param {string} dialogId - 팝업 ID
 *   - @param {Object} options - beforeClose, afterClose 콜백
 * 
 * PopupManager.removeCallback(dialogId)
 *   - 설정된 콜백을 제거합니다
 *   - @param {string} dialogId - 팝업 ID
 * 
 * PopupManager.closeBtnSelectors
 *   - 닫기 버튼 CSS 선택자 (기본값: '.dialog__header-close, .dialog__footer .btn--cancel')
 * 
 * PopupManager.enableEscKey
 *   - ESC 키 활성화 여부 (기본값: true)
 * 
 * ============================================================================
 * 실전 예시
 * ============================================================================
 * 
 * // 예시 1: 입력 폼 팝업 (저장 확인)
 * PopupManager.setCallback('editForm', {
 *   beforeClose: function(dialog) {
 *     const input = dialog.querySelector('input');
 *     if (input && input.value) {
 *       return confirm('저장하지 않고 닫으시겠습니까?');
 *     }
 *     return true;
 *   },
 *   afterClose: function(dialog) {
 *     dialog.querySelector('form').reset();
 *   }
 * });
 * 
 * // 예시 2: 삭제 확인 후 새로고침
 * PopupManager.setCallback('deleteConfirm', {
 *   afterClose: function(dialog) {
 *     if (dialog.dataset.confirmed === 'true') {
 *       location.reload();
 *     }
 *   }
 * });
 * 
 * // 예시 3: 저장 버튼 클릭 시 (admin_code 샘플 참고)
 * $('#p_codeAdmin').on('click', 'button[type="submit"]', function() {
 *   // 저장 로직 실행...
 *   
 *   PopupManager.close('p_codeAdmin', {
 *     beforeClose: function(dialog) {
 *       console.log(dialog.id + ' : 서브밋 전 실행');
 *       return true;
 *     },
 *     afterClose: function(dialog) {
 *       console.log(dialog.id + ' : 서브밋 후 실행');
 *     }
 *   });
 * });
 * 
 * ============================================================================
 * 주의사항
 * ============================================================================
 * - dialog 요소만 지원합니다
 * - beforeClose에서 false를 반환하면 팝업이 닫히지 않습니다
 * - setCallback으로 설정한 콜백은 닫기 버튼, ESC 키에도 적용됩니다
 * - close()로 전달한 콜백은 해당 호출에만 적용되며, 설정된 콜백과 병합됩니다
 * - config 변경 후에는 반드시 PopupManager.refresh()를 호출하세요
 * 
 * ============================================================================
 */

/* ========================================================================
 * 0. 초기화 및 실행 (Initialization & Execution)
 * ======================================================================== */

class PopupManager {
  /* ========================================================================
   * 1. 1. 상수 및 상태 선언 (Declarations)
   * ======================================================================== */
  
  // Public Config (직접 접근 가능)
  static closeBtnSelectors = '.dialog__header-close, .dialog__footer .btn--cancel,.popover__header-close';
  static enableEscKey = true;

  // Private State
  static #callbacks = new Map(); // 팝업 ID별 콜백 저장소

  /* ========================================================================
   * 2. 내부 헬퍼 메서드 (Private Helper Methods)
   * ======================================================================== */

  /**
   * 실제 팝업 닫기 로직을 처리하는 내부 메서드
   * @param {HTMLElement} dialogElement - dialog 요소
   * @param {Object} options - 일회성 옵션 (beforeClose, afterClose)
   * @return {boolean} - 닫기 성공 여부
   */

  static #closePopup(dialogElement, options) {
    if (!dialogElement || dialogElement.tagName !== 'DIALOG') {
      console.warn('[PopupManager] 유효하지 않은 dialog 요소입니다.');
      return false;
    }

    // 1. 옵션 병합 (저장된 콜백 + 호출 시 전달된 일회성 콜백)
    const savedCallbacks = this.#callbacks.get(dialogElement.id);
    const mergedOptions = { ...savedCallbacks, ...(options || {}) };

    // 2. beforeClose 콜백 실행
    if (typeof mergedOptions.beforeClose === 'function') {
      const shouldClose = mergedOptions.beforeClose(dialogElement);
      if (shouldClose === false) return false;
    }

    // 3. 네이티브 close 메서드 호출
    dialogElement.close();

    // 4. afterClose 콜백 실행
    if (typeof mergedOptions.afterClose === 'function') {
      mergedOptions.afterClose(dialogElement);
    }

    // 5. trigger .is-active 제거
    const trigger = this.#triggerMap.get(dialogElement.id);
    if (trigger) {
      trigger.classList.remove('is-active');
      this.#triggerMap.delete(dialogElement.id);
    }

    return true;
  }

  /**
   * 닫기 버튼 클릭 핸들러 (Event Delegation)
   * 문서 전체의 클릭 이벤트를 감지하여 닫기 버튼인 경우 처리
   */
  static #handleCloseClick = (e) => {
    // 1. 닫기 버튼인지 확인
    const closeBtn = e.target.closest(this.closeBtnSelectors);
    if (!closeBtn) return;

    // 2. 닫기 버튼이 속한 dialog 찾기
    const dialog = closeBtn.closest('dialog');
    
    // 3. 열려있는 dialog인 경우에만 처리
    if (dialog && dialog.hasAttribute('open')) {
      e.preventDefault();
      this.#closePopup(dialog, null);
    }
  }

  /**
   * ESC 키 핸들러
   */
  static #handleEscKey = (e) => {
    if (e.key !== 'Escape') return;

    // 현재 열려있는 모든 dialog 탐색
    const openDialogs = document.querySelectorAll('dialog[open]');
    if (openDialogs.length === 0) return;

    // 최상위(가장 마지막에 열린) 팝업부터 닫거나, 모두 닫기
    openDialogs.forEach(dialog => {
      this.#closePopup(dialog, null);
    });
  }

  /* ========================================================================
   * 3. 공개 API (Public API)
   * ======================================================================== */

  /**
   * 팝업 열기 (외부 호출용)
   * @param {string|HTMLElement} dialogId - 팝업 ID 또는 DOM 요소
   */
  static showModal(dialogId) {
    const dialog = typeof dialogId === 'string'
      ? document.getElementById(dialogId)
      : dialogId;

    if (!dialog || dialog.tagName !== 'DIALOG') {
      console.warn('[PopupManager] 유효하지 않은 dialog 요소입니다.');
      return;
    }

    dialog.showModal();
  }

  static #triggerMap = new Map();
  static show(dialogId, triggerEl, e) {
    // 상위 요소(tr 등)의 onclick으로 버블링되는 것을 방지
    if (e) {
      e.stopPropagation();
    }

    const dialog = typeof dialogId === 'string'
      ? document.getElementById(dialogId)
      : dialogId;

    if (!dialog || dialog.tagName !== 'DIALOG') {
      console.warn('[PopupManager] 유효하지 않은 dialog 요소입니다.');
      return;
    }   

    if (triggerEl) {
      // 열려있는 popover 닫기 + is-active 제거
      document.querySelectorAll('dialog.popover[open]').forEach(d => {
        this.#closePopup(d, null);
      });
      triggerEl.classList.add('is-active');
      this.#triggerMap.set(dialog.id, triggerEl); // 트리거 저장
      const rect = triggerEl.getBoundingClientRect();

      dialog.style.left = 'auto';
      dialog.style.right = (window.innerWidth - rect.left) + 9  + 'px';
      dialog.style.top = rect.top + window.scrollY + 3 + 'px';
    }
    
    dialog.show();
  }

  /**
   * 팝업 닫기 (외부 호출용)
   * @param {string|HTMLElement} dialogId - 팝업 ID 또는 DOM 요소
   * @param {Object} [options] - 일회성 콜백 옵션 { beforeClose, afterClose }
   */
  static close(dialogId, options) {
    const dialog = typeof dialogId === 'string' 
      ? document.getElementById(dialogId) 
      : dialogId;
    
    return this.#closePopup(dialog, options);
  }

  /**
   * 팝업별 콜백 설정 (영구적)
   * @param {string} dialogId - 팝업 ID
   * @param {Object} options - 콜백 객체 { beforeClose, afterClose }
   */
  static setCallback(dialogId, options) {
    if (!dialogId) return;
    this.#callbacks.set(dialogId, options);
  }

  /**
   * 설정된 콜백 제거
   * @param {string} dialogId - 팝업 ID
   */
  static removeCallback(dialogId) {
    this.#callbacks.delete(dialogId);
  }

  /**
   * 초기화 실행
   */
  static init() {
    // 1. 전역 객체 노출
    window.PopupManager = PopupManager;

    // 2. 이벤트 바인딩 (Event Delegation)
    document.addEventListener('click', this.#handleCloseClick);

    if (this.enableEscKey) {
      document.addEventListener('keydown', this.#handleEscKey);
    }

    console.log('[PopupManager] Initialized (Event Delegation Mode)');
  }
}

// 초기화
PopupManager.init();