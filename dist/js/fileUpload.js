/**
 * FileUpload 컴포넌트
 * 
 * @example 기본 사용
 * const uploader = new FileUpload('#dropzone', {
 *   accept: ['.pdf', '.doc', '.xls', '.txt'],
 *   maxSize: 10,
 *   multiple: true,
 *   onAdd: (files) => console.log(files),
 *   onRemove: (file) => console.log(file),
 *   onError: (err) => console.warn(err),
 * });
 * 
 * @example 파일 목록 가져오기
 * uploader.getFiles();
 * 
 * @example 초기화
 * uploader.clear();
 */

class FileUpload {
  /**
   * @param {string|Element} el - 드롭존 요소 또는 선택자
   * @param {object} options
   * @param {string[]} [options.accept]      - 허용 확장자 ex) ['.pdf', '.docx']
   * @param {number}   [options.maxSize=10]  - 최대 파일 크기 (MB)
   * @param {number}   [options.maxCount]    - 최대 파일 개수
   * @param {boolean}  [options.multiple=true]
   * @param {Function} [options.onAdd]       - 파일 추가 콜백 (files: File[])
   * @param {Function} [options.onRemove]    - 파일 제거 콜백 (file: File)
   * @param {Function} [options.onError]     - 에러 콜백 ({ type, message, file })
   */
  constructor(el, options = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) throw new Error(`FileUpload: 요소를 찾을 수 없습니다 (${el})`);

    this.options = {
      accept: [],
      maxSize: 100,
      maxCount: null,
      multiple: true,
      initialFiles: [],      // [{ id, name, size, url }]
      onAdd: null,
      onRemove: null,
      onRemoveExisting: null, // 기존 파일 삭제 시 콜백 (서버 삭제 API 호출용)
      onError: null,
      ...options,
    };

    this.files = [];         // 신규 첨부 (File 객체)
    this.existingFiles = [...this.options.initialFiles]; // 기존 첨부 (메타데이터)
    this._init();
  }

  _init() {
    this._render();
    this._bindEvents();
    this.existingFiles.forEach(f => this._renderItem(f, true)); // 기존 파일 먼저 렌더
  }

  _render() {
    const { accept, multiple } = this.options;
    const acceptAttr = accept.length ? accept.join(',') : '';
    const desc = [
      accept.length ? accept.map(e => e.replace('.', '').toUpperCase()).join(', ') : '',
      this.options.maxSize ? `최대 ${this.options.maxSize}MB` : '',
    ].filter(Boolean).join(' · ');

    this.el.innerHTML = `
      <ul class="file-upload__list" role="list"></ul>
      <div class="file-upload__dropzone" role="button" tabindex="0" aria-label="파일 선택 또는 드래그">
        <input type="file" class="file-upload__input" ${multiple ? 'multiple' : ''} ${acceptAttr ? `accept="${acceptAttr}"` : ''} tabindex="-1" aria-hidden="true">
        <i class="file-upload__icon" aria-hidden="true"></i>
        <div>
          <p class="file-upload__label"><strong>파일을 선택</strong>하거나 드래그하여 업로드</p>
          ${desc ? `<p class="file-upload__desc">${desc}</p>` : ''}
        </div>
      </div>
    `;

    this.$list = this.el.querySelector('.file-upload__list');
    this.$dropzone = this.el.querySelector('.file-upload__dropzone');
    this.$input = this.el.querySelector('.file-upload__input');
  }

  _bindEvents() {
    // 클릭
    this.$dropzone.addEventListener('click', (e) => {
      if (!e.target.closest('.file-upload__list')) this.$input.click();
    });

    // 키보드
    this.$dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.$input.click();
      }
    });

    // input change
    this.$input.addEventListener('change', (e) => {
      this._handleFiles([...e.target.files]);
      e.target.value = '';
    });

    // drag & drop
    this.$dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.$dropzone.classList.add('is-dragover');
    });

    this.$dropzone.addEventListener('dragleave', (e) => {
      if (!this.$dropzone.contains(e.relatedTarget)) {
        this.$dropzone.classList.remove('is-dragover');
      }
    });

    this.$dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.$dropzone.classList.remove('is-dragover');
      this._handleFiles([...e.dataTransfer.files]);
    });
  }

  _handleFiles(incoming) {
    const { accept, maxSize, maxCount, multiple } = this.options;
    const added = [];

    if (!multiple) incoming = incoming.slice(0, 1);

    for (const file of incoming) {
      // 개수 제한
      if (maxCount && this.files.length >= maxCount) {
        this._error({ type: 'maxCount', message: `최대 ${maxCount}개까지 첨부할 수 있습니다.`, file });
        break;
      }

      // 확장자 검사
      if (accept.length) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!accept.includes(ext)) {
          this._error({ type: 'accept', message: `허용되지 않는 파일 형식입니다. (${ext})`, file });
          continue;
        }
      }

      // 크기 검사
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        this._error({ type: 'maxSize', message: `파일 크기가 ${maxSize}MB를 초과합니다.`, file });
        continue;
      }

      // 중복 검사
      if (this.files.some(f => f.name === file.name && f.size === file.size)) {
        this._error({ type: 'duplicate', message: `이미 추가된 파일입니다. (${file.name})`, file });
        continue;
      }

      this.files.push(file);
      added.push(file);
      this._renderItem(file);
    }

    if (added.length && this.options.onAdd) {
      this.options.onAdd(added);
    }
  }

  _renderItem(file, isExisting = false) {
    const li = document.createElement('li');
    li.className = 'file-upload__item';
    if (isExisting) li.classList.add('file-upload__item--existing');
    li.dataset.name = file.name;
    if (isExisting) li.dataset.id = file.id;

    const downloadAttr = isExisting
      ? `href="${file.url}" target="_blank"`
      : `href="#" download`;

    li.innerHTML = `
      <span class="file-upload__item-icon" aria-hidden="true"></span>
      <span class="file-upload__item-name">${file.name}</span>
      <a ${downloadAttr} class="file-upload__item-download" aria-label="다운로드">다운로드</a>
      <button type="button" class="file-upload__item-remove" aria-label="${file.name} 삭제">&times;</button>
    `;

    li.querySelector('.file-upload__item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      isExisting ? this._removeExisting(file, li) : this._removeFile(file, li);
    });

    this.$list.appendChild(li);
  }

  _removeExisting(file, li) {
    this.existingFiles = this.existingFiles.filter(f => f.id !== file.id);
    li.remove();
    if (this.options.onRemoveExisting) this.options.onRemoveExisting(file); // 서버 삭제 요청은 여기서 처리
  }

  _removeFile(file, li) {
    this.files = this.files.filter(f => f !== file);
    li.remove();
    if (this.options.onRemove) this.options.onRemove(file);
  }

  _error(err) {
    if (this.options.onError) this.options.onError(err);
    else console.warn(`[FileUpload] ${err.message}`);
  }

  /** 현재 파일 목록 반환 */
  getFiles() {
  return [...this.files]; // 신규 첨부만
}

  getExistingFiles() {
    return [...this.existingFiles]; // 남아있는 기존 첨부
  }

  /** 전체 초기화 */
  clear() {
    this.files = [];
    this.$list.innerHTML = '';
  }

  /** 컴포넌트 제거 */
  destroy() {
    this.el.innerHTML = '';
  }
}
