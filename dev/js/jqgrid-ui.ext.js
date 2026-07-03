/**
 * @file jqGrid UI Extension API
 * @description
 *  - jqGrid 공통 확장 유틸
 *  - 고정형 레이아웃에서 그리드 width/height 자동 조절
 *  - popup(popover, dialog) 내부 그리드 자동 리사이즈 지원
 *
 * @author 반미선
 *
 * @created 2026-01-15
 *
 * @lastModified 2026-01-30
 * @lastModifiedBy 반미선
 *
 * @changeLog
 *  - 2026-01-15 | 반미선 | 최초 작성
 *  - 2026-01-30 | 반미선 | 팝업 선택자 옵션으로 분리
 *
 * @usage
 *  - gridComplete 시 $(this).gridResize() 호출
 *  - jqGrid option:
 *      _resizeParent       : 그리드를 감싸는 부모 selector
 *      _resizeInPopover    : popup 내부 그리드 여부
 *      _popupSelectors     : 팝업 탐색 선택자 배열 (우선순위 순)
 *      _autoHeight         : row 수 기반 height 자동 조절
 *      _maxAutoHeight      : 자동 height 최대값(px)
 */

$.extend(true, $.jgrid.defaults, {
  _resizeParent: '.tbl_wrap',
  _resizeInPopover: false,
  _popupSelectors: ['dialog', '[popover]', '.pop_wrap'], // 팝업 탐색 우선순위
  _autoHeight: false,
  _maxAutoHeight: null,
});

$.jgrid.extend({
  gridResize: function() {
    return this.each(function() {
      const $grid = $(this);
      const $uiGrid = $grid.closest('.ui-jqgrid');
      
      /* ======================
       * 1. HEIGHT RESIZE
       * ====================== */
      if ($grid.jqGrid('getGridParam', '_autoHeight')) {
        const rowCount = $grid.jqGrid('getGridParam', 'reccount');
        if (rowCount === 0) {
          $grid.jqGrid('setGridHeight', 'auto');
          return;
        }
        
        const $firstRow = $uiGrid.find('tr.jqgrow:first');
        if ($firstRow.length) {
          const rowHeight = $firstRow.outerHeight(true);
          let totalHeight = rowCount * rowHeight;

          const maxHeight = $grid.jqGrid('getGridParam', '_maxAutoHeight');
          if (maxHeight && totalHeight > maxHeight) {
            totalHeight = maxHeight;
          }

          $grid.jqGrid('setGridHeight', totalHeight);
        }
      }
      
      /* ======================
       * 2. WIDTH RESIZE
       * ====================== */
      const parentSel = $grid.jqGrid('getGridParam', '_resizeParent');
      if (parentSel) {
        const parent = $uiGrid.closest(parentSel)[0];
        if (parent) {
          const width = parent.getBoundingClientRect().width;
          if (width > 0) {
            $grid.jqGrid('setGridWidth', Math.floor(width), true);
          }
        }
      }
      
      /* ======================
       * 3. POPUP AUTO RESIZE
       * ====================== */
      if ($grid.jqGrid('getGridParam', '_resizeInPopover')) {
        $grid.autoPopupResize();
      }
    });
  },

  autoPopupResize: function() {
    return this.each(function() {
      const $grid = $(this);

      if (!$grid.jqGrid('getGridParam', '_resizeInPopover')) return;
      if ($grid.data('_popupResizeBound')) return;
      $grid.data('_popupResizeBound', true);

      // 옵션에서 팝업 선택자 가져오기
      const selectors = $grid.jqGrid('getGridParam', '_popupSelectors');
      let popup = null;
      
      // 우선순위대로 팝업 탐색
      for (const selector of selectors) {
        popup = $(this).closest(selector)[0];
        if (popup) break;
      }
      
      if (!popup) return;

      const resize = () => {
        requestAnimationFrame(() => { $grid.gridResize(); });
      };

      // dialog 타입
      if (popup.tagName === 'DIALOG') {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'open') {
              if (popup.hasAttribute('open')) { resize(); }
            }
          });
        });
        
        observer.observe(popup, { attributes: true });
        if (popup.hasAttribute('open')) { resize(); }
      }
      // popover 타입
      else if (popup.hasAttribute('popover')) {
        popup.addEventListener('toggle', function(e) {
          if (e.newState === 'open') { resize(); }
        });
        if (popup.matches(':popover-open')) { resize(); }
      }
      // legacy 타입
      else {
        const observer = new MutationObserver(() => {
          const isVisible = window.getComputedStyle(popup).display !== 'none' &&
                           window.getComputedStyle(popup).visibility !== 'hidden';
          if (isVisible) { resize(); }
        });
        
        observer.observe(popup, {
          attributes: true,
          attributeFilter: ['style', 'class']
        });

        const isVisible = window.getComputedStyle(popup).display !== 'none' &&
                         window.getComputedStyle(popup).visibility !== 'hidden';
        if (isVisible) { resize(); }
      }
    });
  },
});