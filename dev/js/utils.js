// 패스워드보기 토글
// 사용법: initPwToggle('.pw_Open') 또는 기본값으로 initPwToggle()
export function initPwToggle(selector = '.pw_Open') {
  document.querySelectorAll(selector).forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      const label = this.closest('label');
      const target = label?.previousElementSibling;

      if (!target || target.tagName !== 'INPUT') return;

      target.type = this.checked ? 'text' : 'password';
    });
  });
} 