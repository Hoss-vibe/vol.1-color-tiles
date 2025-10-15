class MemoryGame {
  constructor() {
    this.memoryScreen = document.getElementById('memoryGame');
    this.memoryBoard = document.getElementById('memoryBoard');
    this.memoryMovesEl = document.getElementById('memoryMoves');
    this.memoryTimeEl = document.getElementById('memoryTime');
    this.memoryState = null;
  }

  // 메모리 게임 표시
  showMemoryGame() {
    if (!this.memoryScreen) return;
    this.memoryScreen.classList.remove('hidden');
    this.initMemoryGame();
  }

  // 메모리 게임 숨기기
  hideMemoryGame() {
    if (this.memoryScreen) {
      this.memoryScreen.classList.add('hidden');
    }
    if (this.memoryState && this.memoryState.timerId) {
      clearInterval(this.memoryState.timerId);
    }
  }

  // 메모리 게임 초기화
  initMemoryGame() {
    if (!this.memoryBoard) return;
    // 4x4 = 8쌍 이모지
    const icons = ['🍎','🍌','🍇','🍉','🍓','🥝','🍑','🍍'];
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, matched: false }));

    this.memoryState = {
      deck,
      flipped: [], // indices
      moves: 0,
      matchedCount: 0,
      timer: 0,
      timerId: null,
    };

    // 타이머 시작
    if (this.memoryState.timerId) clearInterval(this.memoryState.timerId);
    this.memoryState.timer = 0;
    this.memoryState.timerId = setInterval(() => {
      this.memoryState.timer += 1;
      if (this.memoryTimeEl) this.memoryTimeEl.textContent = String(this.memoryState.timer);
    }, 1000);

    if (this.memoryMovesEl) this.memoryMovesEl.textContent = '0';

    // 렌더
    this.renderMemoryBoard();
  }

  // 메모리 보드 렌더링
  renderMemoryBoard() {
    if (!this.memoryBoard) return;
    this.memoryBoard.innerHTML = '';
    this.memoryState.deck.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card' + (card.matched ? ' matched' : '');
      const inner = document.createElement('div');
      inner.className = 'memory-card-inner';
      const front = document.createElement('div');
      front.className = 'memory-face memory-front';
      front.textContent = '🂠';
      const back = document.createElement('div');
      back.className = 'memory-face memory-back';
      back.textContent = card.icon;
      inner.appendChild(front);
      inner.appendChild(back);
      cardEl.appendChild(inner);
      
      // flipped 표시
      const isFlipped = this.memoryState.flipped.includes(index) || card.matched;
      if (isFlipped) cardEl.classList.add('flipped');

      cardEl.addEventListener('click', () => this.onMemoryCardClick(index));
      this.memoryBoard.appendChild(cardEl);
    });
  }

  // 메모리 카드 클릭 처리
  onMemoryCardClick(index) {
    const state = this.memoryState;
    if (!state) return;
    if (state.flipped.length === 2) return; // 비교 중
    if (state.flipped.includes(index)) return; // 이미 뒤집음
    if (state.deck[index].matched) return;

    state.flipped.push(index);
    this.renderMemoryBoard();

    if (state.flipped.length === 2) {
      state.moves += 1;
      if (this.memoryMovesEl) this.memoryMovesEl.textContent = String(state.moves);
      const [a, b] = state.flipped;
      const match = state.deck[a].icon === state.deck[b].icon;
      if (match) {
        state.deck[a].matched = true;
        state.deck[b].matched = true;
        state.matchedCount += 1;
        state.flipped = [];
        this.renderMemoryBoard();
        if (state.matchedCount === state.deck.length / 2) {
          clearInterval(state.timerId);
          this.showGameComplete();
        }
      } else {
        setTimeout(() => {
          state.flipped = [];
          this.renderMemoryBoard();
        }, 700);
      }
    }
  }

  // 게임 완료 표시
  showGameComplete() {
    const state = this.memoryState;
    if (!state) return;
    
    // 커스텀 알럿 모달 사용
    this.showAlert('클리어!', `이동 ${state.moves}회, 시간 ${state.timer}s`);
  }

  // 알럿 모달 표시
  showAlert(title, message) {
    const modal = document.getElementById('alertModal');
    if (modal) {
      document.getElementById('alertTitle').textContent = title;
      document.getElementById('alertMessage').textContent = message;
      modal.classList.remove('hidden');
      
      const okBtn = document.getElementById('alertOkBtn');
      if (okBtn) {
        const closeHandler = () => {
          modal.classList.add('hidden');
          okBtn.removeEventListener('click', closeHandler);
        };
        okBtn.addEventListener('click', closeHandler);
      }
    }
  }
}

// ES6 모듈로 내보내기
export { MemoryGame };
