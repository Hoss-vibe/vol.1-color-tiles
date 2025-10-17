class ColorTilesGame {
  constructor() {
    // 스테이지 설정 (20개로 확장, 모든 스테이지 50초 고정, 8x8 고정)
    this.stageConfigs = [
      { boardSize: 8, numColors: 5, timeLimit: 50 },   // 1
      { boardSize: 8, numColors: 6, timeLimit: 50 },   // 2
      { boardSize: 8, numColors: 7, timeLimit: 50 },   // 3
      { boardSize: 8, numColors: 8, timeLimit: 50 },   // 4
      { boardSize: 8, numColors: 9, timeLimit: 50 },   // 5
      { boardSize: 8, numColors: 10, timeLimit: 50 },  // 6
      { boardSize: 8, numColors: 11, timeLimit: 50 },  // 7
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // 8
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // 9
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // 10
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // 11
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // 12
      { boardSize: 8, numColors: 13, timeLimit: 50 },  // 13
      { boardSize: 8, numColors: 13, timeLimit: 50 },  // 14
      { boardSize: 8, numColors: 13, timeLimit: 50, keyDoorPairs: 1 },  // 15 (열쇠/자물쇠 1쌍)
      { boardSize: 8, numColors: 13, timeLimit: 50, keyDoorPairs: 1 },  // 16
      { boardSize: 8, numColors: 13, timeLimit: 50, keyDoorPairs: 2 },  // 17 (열쇠/자물쇠 2쌍)
      { boardSize: 8, numColors: 13, timeLimit: 50, keyDoorPairs: 2 },  // 18
      { boardSize: 8, numColors: 13, timeLimit: 50, keyDoorPairs: 2 },  // 19
      { boardSize: 8, numColors: 13, timeLimit: 50, keyDoorPairs: 2 }   // 20
    ];
    
    this.currentStage = 1; // 기본값으로 1스테이지로 시작
    this.totalStages = 20;
    this.totalScore = 0;
    
    // 홈화면 관련
    this.homeScreen = document.getElementById('homeScreen');
    this.gameContainer = document.getElementById('gameContainer');
    // Memory Game elements
    this.memoryScreen = document.getElementById('memoryGame');
    this.memoryBoard = document.getElementById('memoryBoard');
    this.memoryMovesEl = document.getElementById('memoryMoves');
    this.memoryTimeEl = document.getElementById('memoryTime');
    
    // 게임 슬라이더 관련
    this.currentGameIndex = 0;
    this.games = ['colorTiles', 'memory'];
    this.sliderLeft = document.getElementById('sliderLeft');
    this.sliderRight = document.getElementById('sliderRight');
    this.gameCards = document.querySelectorAll('.game-card');
    this.stageData = null; // 스테이지별 데이터 (비동기 로드)
    
    // 더블 클릭 확대 방지
    document.addEventListener('dblclick', (e) => {
      e.preventDefault();
    });
    
    // 현재 스테이지 설정 적용 (기본값으로 1스테이지 설정)
    this.boardSize = this.stageConfigs[0].boardSize; // Stage 1: 8x8
    this.numColors = this.stageConfigs[0].numColors; // Stage 1: 5색
    
    this.gameBoard = document.getElementById('gameBoard');
    this.scoreElement = document.getElementById('score');
    this.timerElement = document.getElementById('timer');
    this.currentStageElement = document.getElementById('currentStage');
    this.totalStagesElement = document.getElementById('totalStages');
    this.totalScoreElement = document.getElementById('totalScore');
    this.nicknameModal = document.getElementById('nicknameModal');
    this.nicknameInput = document.getElementById('nicknameInput');
    this.nicknameSubmitBtn = document.getElementById('nicknameSubmitBtn');
    this.changeNicknameBtn = document.getElementById('changeNicknameBtn');
    this.nicknameDisplay = document.getElementById('nicknameDisplay');
    this.startGameBtn = document.getElementById('startGameBtn');
    // resetBtn 제거: 게임 종료 모달에서만 재시작
    this.playAgainBtn = document.getElementById('playAgainBtn');
    this.nextStageBtn = document.getElementById('nextStageBtn');
    this.instructionsModal = document.getElementById('instructionsModal');
    this.stageClearModal = document.getElementById('stageClearModal');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.gameOverTitle = document.getElementById('gameOverTitle');
    this.gameOverMessage = document.getElementById('gameOverMessage');
    this.finalScoreElement = document.getElementById('finalScore');
    this.stageClearScoreElement = document.getElementById('stageClearScore');
    this.stageClearTotalScoreElement = document.getElementById('stageClearTotalScore');
    
    // 아이템 요소
    this.hammerItem = document.getElementById('hammerItem');
    this.shuffleItem = document.getElementById('shuffleItem');
    this.timeItem = document.getElementById('timeItem');
    this.hammerCountElement = document.getElementById('hammerCount');
    this.shuffleCountElement = document.getElementById('shuffleCount');
    this.timeCountElement = document.getElementById('timeCount');
    
    this.board = [];
    this.score = 0;
    this.timeLeft = this.stageConfigs[0].timeLimit; // Stage 1: 50초
    this.gameActive = false;
    this.timerInterval = null;
    this.nickname = '';
    
    // 아이템 개수 (초기 지급: 각 5개)
    this.hammerCount = 5;
    this.shuffleCount = 5;
    this.timeCount = 5;
    this.activeItem = null; // 현재 선택된 아이템
    
    this.colors = [
      'color-0',  // 파스텔 핑크
      'color-1',  // 파스텔 블루
      'color-2',  // 파스텔 민트
      'color-3',  // 파스텔 퍼플
      'color-4',  // 파스텔 코랄
      'color-5',  // 파스텔 옐로우
      'color-6',  // 파스텔 라벤더
      'color-7',  // 진한 그린
      'color-8',  // 진한 오렌지
      'color-9',  // 진한 시안
      'color-10', // 파스텔 로즈
      'color-11', // 파스텔 라임
      'color-12'  // 파스텔 네이비
    ];
    
    // 특수 타일 (열쇠-문)
    this.specialTiles = {
      key: 'key-tile',      // 열쇠 타일
      door: 'door-tile'     // 문 타일
    };
    
    this.initializeEventListeners();
    this.initializeBoard();
    // 고유 플레이어 ID (로컬 1회 생성 후 유지)
    this.playerId = this.getOrCreatePlayerId();

    // 닉네임 및 초기 화면 로드
    this.loadNickname();
    this.updateStageDisplay();
    this.updateItemDisplay();
    // 기본 리더보드 모드: 단판
    this.leaderboardMode = 'single';

    // 기존 사용자면 닉네임 입력을 읽기 전용으로 전환
    this.applyNicknameReadonlyState();
    // 보상광고 1회 제한(세션 기준)
    this.adRewardUsed = { hammer: false, shuffle: false, time: false };
  }
  
  initializeEventListeners() {
    this.nicknameSubmitBtn.addEventListener('click', async () => await this.submitNickname());
    this.nicknameInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        await this.submitNickname();
      }
    });
    
    // 닉네임 변경 버튼
    if (this.changeNicknameBtn) {
      this.changeNicknameBtn.addEventListener('click', () => this.openChangeNicknameModal());
    }
    
    this.startGameBtn.addEventListener('click', () => this.startGame());
    // reset 버튼은 삭제됨
    this.playAgainBtn.addEventListener('click', () => {
      this.gameOverModal.classList.add('hidden');
      this.showHomeScreen();
    });
    this.nextStageBtn.addEventListener('click', async () => await this.nextStage());
    
    // 나가기 버튼 (스테이지 클리어 모달에서 홈으로)
    const exitToHomeBtn = document.getElementById('exitToHomeBtn');
    if (exitToHomeBtn) {
      exitToHomeBtn.addEventListener('click', () => {
        this.stageClearModal.classList.add('hidden');
        this.showHomeScreen();
      });
    }
    
    // 리더보드 탭 전환 (탭 변경 시 항상 상단(1등)부터 보이도록 스크롤/데이터 초기화)
    const tabs = document.querySelectorAll('.leaderboard-tabs .tab-btn');
    tabs.forEach((btn) => {
      btn.addEventListener('click', async () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.leaderboardMode = btn.dataset.mode; // 'single' | 'total'
        const list = document.getElementById('leaderboardList');
        if (list) list.scrollTop = 0; // 항상 상단으로
        await this.displayLeaderboard();
      });
    });
    
    // 아이템 클릭 이벤트
    this.hammerItem.addEventListener('click', () => this.selectItem('hammer'));
    this.shuffleItem.addEventListener('click', () => this.useShuffleItem());
    this.timeItem.addEventListener('click', () => this.useTimeItem());
    
    // 광고 보상 버튼
    const adButtons = [
      { id: 'hammerAdBtn', type: 'hammer' },
      { id: 'shuffleAdBtn', type: 'shuffle' },
      { id: 'timeAdBtn', type: 'time' }
    ];
    adButtons.forEach(({ id, type }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', async () => {
          if (this.adRewardUsed[type]) {
            await this.alertModal('알림', '이미 보상을 받으셨습니다.');
      return;
    }
          const ok = await this.confirmModal('광고 보기', '광고를 보면 해당 아이템을 +1 지급합니다. 진행할까요?');
          if (!ok) return;
          await new Promise(r => setTimeout(r, 2000));
          this.grantAdReward(type);
          await this.alertModal('완료', '아이템이 +1 지급되었습니다.');
        });
      }
    });
    
    this.gameBoard.addEventListener('click', (e) => {
      if (!this.gameActive) return;
      
      const tile = e.target;
      if (!tile.classList.contains('tile')) return;
      
      const row = parseInt(tile.dataset.row);
      const col = parseInt(tile.dataset.col);
      
      this.handleTileClick(row, col);
    });

    // 닉네임 변경 버튼 (PWA 환경에서도 확실히 동작)
    const editBtn = document.getElementById('nicknameEditBtn');
    if (editBtn) {
      console.log('닉네임 변경 버튼 이벤트 리스너 등록됨');
      editBtn.addEventListener('click', async () => {
        console.log('닉네임 변경 버튼 클릭됨');
        if (this.nicknameInput.readOnly) {
          const ok = await this.confirmModal('확인', '닉네임을 변경하면 누적 데이터가 최신 닉네임으로 표시됩니다. 계속하시겠습니까?');
          if (!ok) return;
          this.nicknameInput.readOnly = false;
          this.nicknameInput.focus();
          editBtn.textContent = '완료';
    } else {
          const nickname = this.nicknameInput.value.trim();
          if (!nickname) {
            await this.alertModal('알림', '닉네임을 입력해주세요!');
            return;
          }
          // 닉네임 중복 확인
          const unique = await this.isNicknameAvailable(nickname);
          if (!unique) {
            await this.alertModal('알림', '이미 사용 중인 닉네임입니다.');
            return;
          }
          this.nickname = nickname;
          if (!this.stageData) this.stageData = await this.loadStageData();
          this.stageData.nickname = nickname;
          await this.saveStageData();
          this.nicknameInput.readOnly = true;
          editBtn.textContent = '변경';
          await this.alertModal('완료', '닉네임이 변경되었습니다. 누적 데이터는 최신 닉네임으로 표시됩니다.');
        }
      });
    } else {
      console.error('닉네임 변경 버튼을 찾을 수 없음');
    }

    // 홈화면 순위표 버튼
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', async () => {
        await this.displayLeaderboard();
        // 홈에서 열 때는 제목을 '🏆 순위표'로 보여주고 최종점수는 숨김
        if (this.gameOverTitle) {
          this.gameOverTitle.textContent = '🏆 순위표';
          this.gameOverTitle.classList.remove('hidden');
        }
        const finalScoreTextEl = document.querySelector('.final-score-text');
        if (finalScoreTextEl) finalScoreTextEl.classList.add('hidden');
        if (this.gameOverMessage) this.gameOverMessage.textContent = '';
        this.gameOverModal.classList.remove('hidden');
      });
    }

    // 상단 뒤로가기 버튼: 타이머 정지 후 홈으로
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        this.stopTimer();
        this.showHomeScreen();
      });
    }

    // 게임 슬라이더 네비게이션
    if (this.sliderLeft) {
      this.sliderLeft.addEventListener('click', () => this.previousGame());
    }
    if (this.sliderRight) {
      this.sliderRight.addEventListener('click', () => this.nextGame());
    }

    // Memory Game 시작 버튼
    const playMemoryBtn = document.getElementById('playMemoryBtn');
    if (playMemoryBtn) {
      playMemoryBtn.addEventListener('click', () => this.showMemoryGame());
    }

    // Memory Game navigation
    const memoryBackBtn = document.getElementById('memoryBackBtn');
    if (memoryBackBtn) {
      memoryBackBtn.addEventListener('click', () => this.showHomeScreen());
    }

    const memoryRestartBtn = document.getElementById('memoryRestartBtn');
    if (memoryRestartBtn) {
      memoryRestartBtn.addEventListener('click', () => this.initMemoryGame());
    }

    // in-game nav removed
  }

  // ===== Memory Game (minimal) =====
  showMemoryGame() {
    if (!this.memoryScreen) return;
    this.homeScreen.classList.add('hidden');
    this.gameContainer.classList.add('hidden');
    this.memoryScreen.classList.remove('hidden');
    this.initMemoryGame();
  }

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
          this.alertModal('클리어!', `이동 ${state.moves}회, 시간 ${state.timer}s`);
        }
      } else {
        setTimeout(() => {
          state.flipped = [];
          this.renderMemoryBoard();
        }, 700);
      }
    }
  }

  // ===== 게임 슬라이더 =====
  updateGameSlider() {
    this.gameCards.forEach((card, index) => {
      if (index === this.currentGameIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  nextGame() {
    this.currentGameIndex = (this.currentGameIndex + 1) % this.games.length;
    this.updateGameSlider();
  }

  previousGame() {
    this.currentGameIndex = (this.currentGameIndex - 1 + this.games.length) % this.games.length;
    this.updateGameSlider();
  }

  switchToGame(gameType) {
    if (gameType === 'memory') {
      this.showMemoryGame();
    } else if (gameType === 'colorTiles') {
      this.showHomeScreen();
    }
  }
  // 커스텀 알럿/컨펌
  alertModal(title, message) {
    return new Promise((resolve) => {
      const modal = document.getElementById('alertModal');
      document.getElementById('alertTitle').textContent = title;
      document.getElementById('alertMessage').textContent = message;
      modal.classList.remove('hidden');
      const ok = document.getElementById('alertOkBtn');
      const close = () => { modal.classList.add('hidden'); ok.removeEventListener('click', close); resolve(true); };
      ok.addEventListener('click', close);
    });
  }

  confirmModal(title, message) {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirmModal');
      document.getElementById('confirmTitle').textContent = title;
      document.getElementById('confirmMessage').textContent = message;
      modal.classList.remove('hidden');
      const ok = document.getElementById('confirmOkBtn');
      const cancel = document.getElementById('confirmCancelBtn');
      const cleanup = () => {
        modal.classList.add('hidden');
        ok.removeEventListener('click', onOk);
        cancel.removeEventListener('click', onCancel);
      };
      const onOk = () => { cleanup(); resolve(true); };
      const onCancel = () => { cleanup(); resolve(false); };
      ok.addEventListener('click', onOk);
      cancel.addEventListener('click', onCancel);
    });
  }

  // 단일 버튼 확인 모달 (확인만 표시, 폰트 크기 통일용 클래스 적용)
  showOneButtonConfirm(title, message, okText = '확인') {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirmModal');
      const titleEl = document.getElementById('confirmTitle');
      const msgEl = document.getElementById('confirmMessage');
      const okBtn = document.getElementById('confirmOkBtn');
      const cancelBtn = document.getElementById('confirmCancelBtn');

      // 내용 설정
      titleEl.textContent = title;
      msgEl.textContent = message;

      // 폰트 크기 통일: 제목도 본문과 동일하게 처리하려면 클래스 추가
      titleEl.classList.add('same-size');
      msgEl.classList.add('same-size');

      // 취소 버튼 숨김, 확인 텍스트 설정
      if (cancelBtn) cancelBtn.classList.add('hidden');
      if (okBtn) okBtn.textContent = okText || '확인';

      modal.classList.remove('hidden');

      const cleanup = () => {
        modal.classList.add('hidden');
        // 원상복구
        titleEl.classList.remove('same-size');
        msgEl.classList.remove('same-size');
        if (cancelBtn) cancelBtn.classList.remove('hidden');
        if (okBtn) okBtn.textContent = '확인';
        okBtn.removeEventListener('click', onOk);
      };

      const onOk = () => { cleanup(); resolve(true); };
      okBtn.addEventListener('click', onOk);
    });
  }

  applyNicknameReadonlyState() {
    const saved = localStorage.getItem('colorTilesNickname');
    const editBtn = document.getElementById('nicknameEditBtn');
    
    // PWA 환경에서도 확실히 동작하도록 수정
    if (saved) {
      // 기본 readOnly + 편집 버튼 표시
      this.nicknameInput.readOnly = true;
      if (editBtn) {
        editBtn.classList.remove('hidden');
        console.log('닉네임 변경 버튼 표시됨');
      } else {
        console.error('닉네임 변경 버튼을 찾을 수 없음');
      }
    } else {
      this.nicknameInput.readOnly = false;
      if (editBtn) editBtn.classList.add('hidden');
    }
  }

  getOrCreatePlayerId() {
    const key = 'colorTilesPlayerId';
    let id = localStorage.getItem(key);
    if (!id) {
      // RFC4122는 아니지만 충돌 가능성 매우 낮은 간단한 UUID
      id = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  }

  // 스테이지 데이터 로드 (Firebase)
  async loadStageData() {
    try {
      if (!window.db) {
        console.error('Firebase가 로드되지 않았습니다.');
        return this.getInitialStageData();
      }

      // Firestore에서 사용자 데이터 가져오기
      const usersCollection = window.firebaseCollection(window.db, 'users');
      const q = window.firebaseQuery(usersCollection, window.firebaseWhere('playerId', '==', this.playerId));
      const querySnapshot = await window.firebaseGetDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          stages: userData.stages || this.getInitialStageData().stages,
          totalStars: userData.totalStars || 0,
          totalScore: userData.totalScore || 0,
          nickname: userData.nickname || '',
          docId: querySnapshot.docs[0].id
        };
      } else {
        // 신규 유저
        return this.getInitialStageData();
      }
    } catch (error) {
      console.error('Firebase 불러오기 실패:', error);
      return this.getInitialStageData();
    }
  }

  // 초기 스테이지 데이터 생성
  getInitialStageData() {
    const length = this.stageConfigs?.length || 8;
    return {
      stages: Array.from({ length }, (_, i) => ({
        stage: i + 1,
        stars: 0,
        score: 0,
        cleared: false,
        unlocked: i === 0 // Stage 1만 해제
      })),
      totalStars: 0,
      totalScore: 0,
      docId: null
    };
  }

  // 스테이지 데이터 저장 (Firebase)
  async saveStageData() {
    try {
      if (!window.db) {
        console.error('Firebase가 로드되지 않았습니다.');
      return;
    }

      const usersCollection = window.firebaseCollection(window.db, 'users');
      
      const userData = {
        playerId: this.playerId,
        nickname: this.nickname,
        stages: this.stageData.stages,
        totalStars: this.stageData.stages.reduce((sum, stage) => sum + stage.stars, 0),
        totalScore: this.stageData.stages.reduce((sum, stage) => sum + stage.score, 0),
        lastUpdated: new Date().toISOString()
      };

      if (this.stageData.docId) {
        // 기존 문서 업데이트
        const userDoc = window.firebaseDoc(window.db, 'users', this.stageData.docId);
        await window.firebaseUpdateDoc(userDoc, userData);
      } else {
        // 새 문서 생성
        const docRef = await window.firebaseAddDoc(usersCollection, userData);
        this.stageData.docId = docRef.id;
      }
    } catch (error) {
      console.error('Firebase 저장 실패:', error);
    }
  }

  // 홈화면 표시
  showHomeScreen() {
    this.homeScreen.classList.remove('hidden');
    this.gameContainer.classList.add('hidden');
    if (this.memoryScreen) this.memoryScreen.classList.add('hidden');
    // 스테이지 카드 수를 stageConfigs 길이에 맞게 동기화
    this.syncStageCardsWithConfigs();
    this.updateHomeScreen();
    this.updateGameSlider();
  }

  // 홈화면 업데이트
  updateHomeScreen() {
    // 카드 수량 동기화 보장
    this.syncStageCardsWithConfigs();
    // 총 별/총점 계산
    const totalStars = this.stageData.stages.reduce((sum, stage) => sum + stage.stars, 0);
    const totalStages = this.stageConfigs.length;
    const totalStarsMax = totalStages * 3;
    
    document.getElementById('totalStars').textContent = `⭐ ${totalStars}`;
    const maxEl = document.getElementById('totalStarsMax');
    if (maxEl) maxEl.textContent = totalStarsMax.toString();
    const nickEl = document.getElementById('nicknameDisplay');
    if (nickEl) nickEl.textContent = this.nickname || 'Player';

    // 스테이지 카드 업데이트
    document.querySelectorAll('.stage-card').forEach((card) => {
      const stageNum = parseInt(card.dataset.stage);
      const stageInfo = this.stageData.stages[stageNum - 1];

      // 잠금/해제 처리
      if (stageInfo.unlocked) {
        card.classList.remove('locked');
        card.style.cursor = 'pointer';
        
        // 별 표시
        const stars = card.querySelectorAll('.star');
        stars.forEach((star, index) => {
          if (index < stageInfo.stars) {
            star.textContent = '⭐';
            star.classList.remove('empty');
          } else {
            star.textContent = '☆';
            star.classList.add('empty');
          }
        });

        // 클릭 이벤트
        card.onclick = () => this.startStage(stageNum);
      } else {
        card.classList.add('locked');
        card.style.cursor = 'not-allowed';
        card.onclick = null;
      }
    });
  }

  // 현재 stageConfigs 길이에 맞게 스테이지 카드 DOM 생성/동기화
  syncStageCardsWithConfigs() {
    const totalStages = this.stageConfigs.length;
    // 우선 홈 화면의 스테이지 그리드 컨테이너 탐색
    let grid = document.querySelector('.stages-grid');
    if (!grid) return; // 컨테이너가 없으면 건너뜀

    const existing = grid.querySelectorAll('.stage-card');
    if (existing.length === totalStages) return; // 이미 맞으면 종료

    // 재구성
    grid.innerHTML = '';
    for (let i = 1; i <= totalStages; i++) {
      const card = document.createElement('div');
      card.className = 'stage-card locked';
      card.dataset.stage = String(i);

      // 번호
      const num = document.createElement('div');
      num.className = 'stage-number';
      num.textContent = String(i);
      card.appendChild(num);

      // 별 표시 영역 (3개)
      const starsWrap = document.createElement('div');
      starsWrap.className = 'stage-stars';
      for (let s = 0; s < 3; s++) {
        const star = document.createElement('span');
        star.className = 'star empty';
        star.textContent = '☆';
        starsWrap.appendChild(star);
      }
      card.appendChild(starsWrap);

      grid.appendChild(card);
    }
  }

  // 스테이지 시작
  startStage(stageNum) {
    this.currentStage = stageNum;
    this.totalScore = 0;
    
    // 스테이지 설정 적용
    const config = this.stageConfigs[stageNum - 1];
    this.boardSize = config.boardSize;
    this.numColors = config.numColors;
    this.timeLeft = config.timeLimit;
    
    // 화면 전환
    this.homeScreen.classList.add('hidden');
    this.gameContainer.classList.remove('hidden');
    
    // 게임 시작
    this.startGame();
  }

  // 시간 기반 별 계산
  getStarsByTime(timeLeft, timeLimit) {
    const ratio = timeLeft / timeLimit;
    if (ratio >= 0.6) return 3; // 60% 이상 (30초/50초)
    if (ratio >= 0.3) return 2; // 30% 이상 (15초/50초)
    return 1;
  }

  // 프로그레스바 업데이트
  updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const star1 = document.getElementById('star1');
    const star2 = document.getElementById('star2');
    const star3 = document.getElementById('star3');

    // 프로그레스바
    const percentage = (this.timeLeft / this.stageConfigs[this.currentStage - 1].timeLimit) * 100;
    progressFill.style.width = `${percentage}%`;

    // 별 표시
    const currentStars = this.getStarsByTime(this.timeLeft, this.stageConfigs[this.currentStage - 1].timeLimit);
    
    star1.classList.toggle('inactive', currentStars < 1);
    star2.classList.toggle('inactive', currentStars < 2);
    star3.classList.toggle('inactive', currentStars < 3);
  }
  
  initializeBoard() {
    this.gameBoard.innerHTML = '';
    this.board = [];
    
    // 게임 보드의 grid 크기 동적 설정
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
    this.gameBoard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
    
    // 전체 타일 수 계산 (약 60-70%의 타일 배치, 색상 수에 따라 조정)
    let tilesPerColor = Math.max(4, Math.floor(this.boardSize * 0.7)); // 각 색상당 타일 수
    // 홀수면 짝수로 변환 (매칭 가능하도록)
    if (tilesPerColor % 2 !== 0) {
      tilesPerColor = tilesPerColor - 1;
    }
    
    // 열쇠-문 쌍 수 계산
    const stageConfig = this.stageConfigs[this.currentStage - 1];
    const keyDoorPairs = stageConfig.keyDoorPairs || 0;
    const keyDoorTiles = keyDoorPairs * 2; // 열쇠 + 문
    
    const totalTiles = this.numColors * tilesPerColor + keyDoorTiles;
    const boardCells = this.boardSize * this.boardSize;
    const emptySpaces = boardCells - totalTiles;
    
    // 모든 셀을 빈 공간으로 초기화
    for (let row = 0; row < this.boardSize; row++) {
      this.board[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        this.board[row][col] = {
          color: null,
          isEmpty: true
        };
      }
    }
    
    // 각 색상별로 동일한 개수의 타일을 생성
    const tilesToPlace = [];
    
    for (let color = 0; color < this.numColors; color++) {
      for (let i = 0; i < tilesPerColor; i++) {
        tilesToPlace.push({ type: 'color', value: color });
      }
    }
    
    // 열쇠-문 타일 추가 (같은 색상으로)
    if (keyDoorPairs > 0) {
      for (let i = 0; i < keyDoorPairs; i++) {
        // 열쇠와 문을 같은 색상으로 설정 (쌍별로 구분)
        const pairColor = i === 0 ? 'gold' : 'silver'; // 첫 번째 쌍: 황금, 두 번째 쌍: 은색
        tilesToPlace.push({ type: 'key', value: 'key', color: pairColor });
        tilesToPlace.push({ type: 'door', value: 'door', color: pairColor });
      }
    }
    
    // 배열을 섞기 (Fisher-Yates shuffle)
    for (let i = tilesToPlace.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilesToPlace[i], tilesToPlace[j]] = [tilesToPlace[j], tilesToPlace[i]];
    }
    
    // 섞은 타일들을 랜덤 위치에 배치
    let tileIndex = 0;
    let keyPosition = null;
    let doorPosition = null;
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (tileIndex < totalTiles) {
          const randomRow = Math.floor(Math.random() * this.boardSize);
          const randomCol = Math.floor(Math.random() * this.boardSize);
          
          if (this.board[randomRow][randomCol].isEmpty) {
            const tile = tilesToPlace[tileIndex];
            
            // 열쇠-문 배치 시 서로 1칸 이내에 있지 않도록 체크
            if (tile.type === 'key' || tile.type === 'door') {
              let validPosition = true;
              
              if (tile.type === 'key') {
                // 문이 이미 배치된 경우 거리 체크
                if (doorPosition) {
                  const distance = Math.abs(randomRow - doorPosition.row) + Math.abs(randomCol - doorPosition.col);
                  if (distance <= 1) {
                    validPosition = false;
                  }
                }
                if (validPosition) {
                  keyPosition = { row: randomRow, col: randomCol };
                }
              } else if (tile.type === 'door') {
                // 열쇠가 이미 배치된 경우 거리 체크
                if (keyPosition) {
                  const distance = Math.abs(randomRow - keyPosition.row) + Math.abs(randomCol - keyPosition.col);
                  if (distance <= 1) {
                    validPosition = false;
                  }
                }
                if (validPosition) {
                  doorPosition = { row: randomRow, col: randomCol };
                }
              }
              
              if (!validPosition) {
                // 유효하지 않은 위치면 다시 시도
                col--;
                continue;
              }
            }
            
            this.board[randomRow][randomCol] = {
              color: tile.type === 'color' ? tile.value : tile.color,
              type: tile.type,
              value: tile.value,
              isEmpty: false
            };
            tileIndex++;
    } else {
            // 이미 타일이 있으면 다시 시도
            col--;
          }
        }
      }
    }
    
    // DOM 요소 생성
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.row = row;
        tile.dataset.col = col;
        
        this.gameBoard.appendChild(tile);
      }
    }
    
    this.renderBoard();
  }
  
  renderBoard() {
    const tiles = this.gameBoard.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
      const row = Math.floor(index / this.boardSize);
      const col = index % this.boardSize;
      const cell = this.board[row][col];
      
      tile.className = 'tile';
      if (cell.isEmpty) {
        tile.classList.add('empty');
      } else if (cell.type === 'key') {
        tile.classList.add('key-tile');
        // 색상별 클래스 추가
        if (cell.color === 'gold') {
          tile.classList.add('key-gold');
        } else if (cell.color === 'silver') {
          tile.classList.add('key-silver');
        }
        tile.textContent = '🔑';
      } else if (cell.type === 'door') {
        tile.classList.add('door-tile');
        // 색상별 클래스 추가
        if (cell.color === 'gold') {
          tile.classList.add('door-gold');
        } else if (cell.color === 'silver') {
          tile.classList.add('door-silver');
        }
        tile.textContent = '🔒';
      } else {
        tile.classList.add(this.colors[cell.color]);
        tile.textContent = ''; // 일반 타일은 텍스트 없음
      }
    });
  }
  
  async submitNickname() {
    const nickname = this.nicknameInput.value.trim();
    if (!nickname) {
      alert('닉네임을 입력해주세요!');
      return;
    }
    // 닉네임 중복 확인
    const unique = await this.isNicknameAvailable(nickname);
    if (!unique) {
      await this.alertModal('알림', '이미 사용 중인 닉네임입니다.');
      return;
    }
    
    this.nickname = nickname;
    // Firebase users 문서 갱신
    if (!this.stageData) {
      this.stageData = await this.loadStageData();
    }
    this.normalizeStageData();
    this.stageData.nickname = nickname;
    await this.saveStageData();
    
    // 스테이지 데이터 최신 로드
    this.stageData = await this.loadStageData();
    this.normalizeStageData();
    
    // 닉네임 모달 닫고 홈화면 표시
    this.nicknameModal.classList.add('hidden');
    this.showHomeScreen();
  }
  
  async loadNickname() {
    const saved = localStorage.getItem('colorTilesNickname');
    if (saved) {
      this.nickname = saved;
      this.nicknameInput.value = saved;
      // 닉네임 표시 업데이트
      if (this.nicknameDisplay) {
        this.nicknameDisplay.textContent = saved;
      }
      // 스테이지 데이터 로드
      this.stageData = await this.loadStageData();
      // 닉네임이 있으면 바로 홈화면으로
      this.nicknameModal.classList.add('hidden');
      this.showHomeScreen();
    }
  }
  
  openChangeNicknameModal() {
    // 확인 모달 띄우기
    this.confirmModal(
      '닉네임 변경',
      '닉네임을 변경하시겠습니까?\n변경 후에는 이전 닉네임의 기록은 사라집니다.'
    ).then((confirmed) => {
      if (confirmed) {
        // 닉네임 입력 모달 열기
        this.nicknameInput.value = '';
        this.nicknameInput.readOnly = false; // 입력 가능하도록 설정
        this.nicknameModal.classList.remove('hidden');
        this.homeScreen.classList.add('hidden');
      }
    });
  }
  
  startGame() {
    this.gameActive = true;
    this.score = 0;
    const stageConfig = this.stageConfigs[this.currentStage - 1];
    this.timeLeft = stageConfig.timeLimit;
    
    // 게임 시작 시에만 지급된 아이템으로 진행 (스테이지 간 리셋 없음)
    this.activeItem = null;
    
    // 보드 초기화
    this.initializeBoard();
    
    this.updateDisplay();
    this.updateItemDisplay();
    this.updateStageDisplay();
    this.updateProgressBar();
    this.instructionsModal.classList.add('hidden');
    this.startTimer();
  }
  
  resetGame() {
    this.gameActive = false;
    this.currentStage = 1;
    this.score = 0;
    this.totalScore = 0;
    this.boardSize = this.stageConfigs[0].boardSize;
    this.numColors = this.stageConfigs[0].numColors;
    this.timeLeft = this.stageConfigs[0].timeLimit;
    // 아이템은 리셋 시 재지급하지 않음 (진행 중 수량 유지)
    this.activeItem = null;
    this.stopTimer();
    this.updateDisplay();
    this.updateItemDisplay();
    this.updateStageDisplay();
    this.initializeBoard();
    this.gameOverModal.classList.add('hidden');
    this.stageClearModal.classList.add('hidden');
    this.nicknameModal.classList.remove('hidden');
  }
  
  startTimer() {
    this.timerInterval = setInterval(async () => {
      this.timeLeft--;
      this.updateDisplay();
      this.updateProgressBar(); // 프로그레스바 업데이트
      
      if (this.timeLeft <= 0) {
        await this.endGame('timeout');
      }
    }, 1000);
  }
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  updateDisplay() {
    if (this.scoreElement) this.scoreElement.textContent = this.score;
    // timer UI는 제거되었으므로 존재할 때만 갱신
    if (this.timerElement) this.timerElement.textContent = this.timeLeft;
    if (this.totalScoreElement) this.totalScoreElement.textContent = this.totalScore;
  }
  
  updateStageDisplay() {
    this.currentStageElement.textContent = this.currentStage;
    this.totalStagesElement.textContent = this.totalStages;
  }
  
  async nextStage() {
    if (this.currentStage >= this.totalStages) {
      // 모든 스테이지 클리어
      await this.endGame('allclear');
      return;
    }
    
    // 이전 타이머 정리
    this.stopTimer();
    
    this.currentStage++;
    const stageConfig = this.stageConfigs[this.currentStage - 1];
    this.boardSize = stageConfig.boardSize;
    this.numColors = stageConfig.numColors;
    this.timeLeft = stageConfig.timeLimit;
    this.score = 0;
    
    // 다음 스테이지에서도 아이템은 추가 지급/리셋 없음
    this.activeItem = null;
    
    this.stageClearModal.classList.add('hidden');
    this.updateStageDisplay();
    this.updateDisplay();
    this.updateItemDisplay();
    this.initializeBoard();
    this.startGame();
  }
  
  async clearStage() {
    this.gameActive = false;
    this.stopTimer();
    
    // 별점 계산 (시간 기반)
    const stars = this.getStarsByTime(this.timeLeft, this.stageConfigs[this.currentStage - 1].timeLimit);
    
    // 스테이지 데이터 업데이트
    const stageInfo = this.stageData.stages[this.currentStage - 1];
    stageInfo.cleared = true;
    if (this.score > stageInfo.score) {
      stageInfo.score = this.score;
    }
    if (stars > stageInfo.stars) {
      stageInfo.stars = stars;
    }
    
    // 다음 스테이지 해제
    if (this.currentStage < this.totalStages) {
      this.stageData.stages[this.currentStage].unlocked = true;
    }
    
    // 데이터 저장
    this.saveStageData();
    
    // 총점에 현재 점수 추가 (스테이지 클리어 시에만)
    this.totalScore += this.score;
    
    // 5의 배수 스테이지 클리어 보상: 각 아이템 +1 (5, 10, 15, 20 ...)
    if (this.currentStage % 5 === 0) {
      this.hammerCount += 1;
      this.shuffleCount += 1;
      this.timeCount += 1;
      this.updateItemDisplay();
      try {
        await this.alertModal('보상 지급', '축하합니다! 각 아이템이 +1 지급되었습니다.');
      } catch (e) { /* noop */ }
    }
    
    // 스테이지 클리어 모달 표시
    this.stageClearScoreElement.textContent = this.score;
    this.stageClearTotalScoreElement.textContent = this.totalScore;
    
    if (this.currentStage >= this.totalStages) {
      // 마지막 스테이지 클리어 - 게임 완료
      await this.endGame('allclear');
      } else {
      // 다음 스테이지로
      this.stageClearModal.classList.remove('hidden');
    }
  }
  
  async handleTileClick(row, col) {
    const cell = this.board[row][col];
    
    // 망치 아이템이 선택되어 있으면 망치 사용
    if (this.activeItem === 'hammer') {
      if (await this.useHammerItem(row, col)) {
        return; // 망치 사용 성공
      }
    }
    
    // 빈 공간이 아니면 잘못된 클릭
    if (!cell.isEmpty) {
      await this.handleWrongClick();
      return;
    }

    // 4방향으로 첫 번째 타일 찾기
    const foundTiles = [];
    const directions = [
      {row: -1, col: 0, name: 'up'},    // 위
      {row: 1, col: 0, name: 'down'},   // 아래
      {row: 0, col: -1, name: 'left'},  // 왼쪽
      {row: 0, col: 1, name: 'right'}   // 오른쪽
    ];
    
    // 각 방향에서 첫 번째 타일만 수집
    directions.forEach(dir => {
      const firstTile = this.findFirstTileInDirection(row, col, dir.row, dir.col);
      if (firstTile) {
        foundTiles.push(firstTile);
      }
    });
    
    // 같은 색상끼리 그룹화
    const colorGroups = {};
    foundTiles.forEach(tile => {
      const color = tile.color;
      if (!colorGroups[color]) {
        colorGroups[color] = [];
      }
      colorGroups[color].push(tile);
    });
    
    // 같은 색상이 2개 이상인 타일들만 선택
    const allMatchedTiles = [];
    Object.values(colorGroups).forEach(group => {
      if (group.length >= 2) {
        allMatchedTiles.push(...group);
      }
    });
    
    // 열쇠-문 매칭 확인
    const keyTiles = foundTiles.filter(tile => tile.type === 'key');
    const doorTiles = foundTiles.filter(tile => tile.type === 'door');
    
    if (keyTiles.length > 0 && doorTiles.length > 0) {
      // 열쇠-문 매칭 성공!
      allMatchedTiles.push(...keyTiles, ...doorTiles);
      this.score += 50; // 열쇠-문 매칭 보너스 점수
      this.timeLeft += 10; // 시간 추가
      this.showKeyDoorBonus(); // 특별 효과 표시
    }
    
    if (allMatchedTiles.length > 0) {
      // 점수 추가
      this.score += allMatchedTiles.length;
      this.updateDisplay();
      
      // 매칭된 타일들을 즉시 isEmpty로 변경 (중복 클릭 방지)
      allMatchedTiles.forEach(({row: r, col: c}) => {
        this.board[r][c].isEmpty = true;
        this.board[r][c].color = null;
        this.board[r][c].type = null;
        this.board[r][c].value = null;
        
        // DOM에서도 이모지 제거
        const tileIndex = r * this.boardSize + c;
        const tileElement = this.gameBoard.children[tileIndex];
        if (tileElement) {
          tileElement.textContent = '';
        }
      });
      
      // 매칭 애니메이션과 연결선 표시
      this.animateMatchedTilesWithConnections(allMatchedTiles, row, col);
      
      // 애니메이션이 끝난 후 화면 업데이트
      setTimeout(async () => {
        this.renderBoard();
        
        // 보드가 비어있으면 게임 종료
        if (this.isBoardEmpty()) {
          await this.endGame('clear');
      } else {
          // 유효한 움직임 없으면 일시정지 + 리셋 유도
          await this.ensureMovableOrPause();
        }
      }, 300); // 애니메이션 300ms
    } else {
      await this.handleWrongClick();
    }
  }
  
  findFirstTileInDirection(startRow, startCol, dirRow, dirCol) {
    let currentRow = startRow + dirRow;
    let currentCol = startCol + dirCol;
    
    // 해당 방향으로 캔버스 끝까지 스캔
    while (this.isValidPosition(currentRow, currentCol)) {
      const currentTile = this.board[currentRow][currentCol];
      
      // 빈 공간이면 다음 칸으로 계속 진행
      if (currentTile.isEmpty) {
        currentRow += dirRow;
        currentCol += dirCol;
        continue;
      }
      
      // 첫 번째 타일을 찾았으면 반환
      return {
        row: currentRow, 
        col: currentCol, 
        color: currentTile.color
      };
    }
    
    // 타일을 찾지 못하면 null 반환
    return null;
  }
  
  groupTilesByColor(tiles) {
    const colorGroups = {};
    
    tiles.forEach(tile => {
      const color = tile.color;
      if (!colorGroups[color]) {
        colorGroups[color] = [];
      }
      colorGroups[color].push(tile);
    });
    
    return Object.values(colorGroups);
  }
  
  hasSameColorAsNeighbors(row, col, startRow, startCol) {
    const currentColor = this.board[row][col].color;
    
    // 상하좌우 인접한 타일들 중에 같은 색깔이 있는지 확인
    const directions = [
      {row: -1, col: 0}, // 위
      {row: 1, col: 0},  // 아래
      {row: 0, col: -1}, // 왼쪽
      {row: 0, col: 1}   // 오른쪽
    ];
    
    for (const dir of directions) {
      const newRow = row + dir.row;
      const newCol = col + dir.col;
      
      if (this.isValidPosition(newRow, newCol)) {
        const neighbor = this.board[newRow][newCol];
        if (!neighbor.isEmpty && neighbor.color === currentColor) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }
  
  isBoardEmpty() {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (!this.board[row][col].isEmpty) {
          return false;
        }
      }
    }
    return true;
  }
  
  hasValidMoves() {
    // 모든 빈 공간을 확인
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col].isEmpty) {
          // 이 빈 공간에서 매칭 가능한지 확인
          const directions = [
            {row: -1, col: 0}, // 위
            {row: 1, col: 0},  // 아래
            {row: 0, col: -1}, // 왼쪽
            {row: 0, col: 1}   // 오른쪽
          ];
          
          const foundTiles = [];
          directions.forEach(dir => {
            const firstTile = this.findFirstTileInDirection(row, col, dir.row, dir.col);
            if (firstTile) {
              foundTiles.push(firstTile);
            }
          });
          
          // 같은 색상끼리 그룹화
          const colorGroups = {};
          foundTiles.forEach(tile => {
            if (!colorGroups[tile.color]) {
              colorGroups[tile.color] = [];
            }
            colorGroups[tile.color].push(tile);
          });
          
          // 같은 색상이 2개 이상인 그룹이 있으면 매칭 가능
          for (const color in colorGroups) {
            if (colorGroups[color].length >= 2) {
              return true; // 유효한 움직임이 있음
            }
          }
        }
      }
    }
    return false; // 더 이상 유효한 움직임 없음
  }
  
  animateMatchedTilesWithConnections(matchedTiles, clickedRow, clickedCol) {
    // 타일들이 깨지는 애니메이션 (8개 파티클 효과)
    matchedTiles.forEach(({row, col, color}) => {
      const tileIndex = row * this.boardSize + col;
      const tile = this.gameBoard.children[tileIndex];
      
      // 타일에 matched 클래스 추가
      tile.classList.add('matched');
      
      // 8개의 파티클 생성
      this.createParticles(tile, color);
      
      setTimeout(() => {
        tile.classList.remove('matched');
      }, 400);
    });
  }
  
  createParticles(tile, color) {
    // 타일 색상 가져오기
    const colorMap = {
      0: '#FFB3BA',
      1: '#BAE1FF',
      2: '#BAFFC9',
      3: '#D5AAFF',
      4: '#FFCAB0'
    };
    
    const particleColor = colorMap[color] || colorMap[0];
    
    // 8방향으로 파티클 생성
    const directions = [
      {x: -1, y: -1},  // 왼쪽 위
      {x: 0, y: -1},   // 위
      {x: 1, y: -1},   // 오른쪽 위
      {x: 1, y: 0},    // 오른쪽
      {x: 1, y: 1},    // 오른쪽 아래
      {x: 0, y: 1},    // 아래
      {x: -1, y: 1},   // 왼쪽 아래
      {x: -1, y: 0}    // 왼쪽
    ];
    
    directions.forEach((dir, index) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.position = 'absolute';
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.width = '10px';
      particle.style.height = '10px';
      particle.style.background = particleColor;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '10';
      particle.style.marginLeft = '-5px';
      particle.style.marginTop = '-5px';
      
      // 각 방향으로 날아가는 거리와 회전
      const distance = 40 + Math.random() * 15;
      const angle = Math.random() * 360;
      
      particle.style.setProperty('--tx', (dir.x * distance) + 'px');
      particle.style.setProperty('--ty', (dir.y * distance) + 'px');
      particle.style.setProperty('--rotate', angle + 'deg');
      particle.style.animation = `particleFly${index} 0.4s ease-out forwards`;
      
      tile.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 400);
    });
  }
  
  showConnectionLines(matchedTiles, clickedRow, clickedCol) {
    // 연결선을 위한 임시 요소 생성
    const connectionOverlay = document.createElement('div');
    connectionOverlay.className = 'connection-overlay';
    connectionOverlay.style.position = 'absolute';
    connectionOverlay.style.top = '0';
    connectionOverlay.style.left = '0';
    connectionOverlay.style.width = '100%';
    connectionOverlay.style.height = '100%';
    connectionOverlay.style.pointerEvents = 'none';
    connectionOverlay.style.zIndex = '10';
    
    this.gameBoard.style.position = 'relative';
    this.gameBoard.appendChild(connectionOverlay);
    
    // 클릭한 빈 공간의 중심점 계산
    const clickedTileIndex = clickedRow * this.boardSize + clickedCol;
    const clickedTile = this.gameBoard.children[clickedTileIndex];
    const clickedRect = clickedTile.getBoundingClientRect();
    const boardRect = this.gameBoard.getBoundingClientRect();
    const clickedCenterX = clickedRect.left + clickedRect.width / 2 - boardRect.left;
    const clickedCenterY = clickedRect.top + clickedRect.height / 2 - boardRect.top;
    
    // 클릭한 위치에서 각 매칭된 타일로 선 그리기
    matchedTiles.forEach(({row, col, color}) => {
      const tileIndex = row * this.boardSize + col;
      const tileElement = this.gameBoard.children[tileIndex];
      const tileRect = tileElement.getBoundingClientRect();
      
      const tileCenterX = tileRect.left + tileRect.width / 2 - boardRect.left;
      const tileCenterY = tileRect.top + tileRect.height / 2 - boardRect.top;
      
      // 연결선 생성
      const line = document.createElement('div');
      line.className = 'connection-line';
      
      const distance = Math.sqrt(Math.pow(tileCenterX - clickedCenterX, 2) + Math.pow(tileCenterY - clickedCenterY, 2));
      const angle = Math.atan2(tileCenterY - clickedCenterY, tileCenterX - clickedCenterX) * 180 / Math.PI;
      
      line.style.position = 'absolute';
      line.style.left = clickedCenterX + 'px';
      line.style.top = clickedCenterY + 'px';
      line.style.width = distance + 'px';
      line.style.height = '3px';
      line.style.borderTop = '3px dashed rgba(255, 0, 0, 0.8)';
      line.style.transformOrigin = '0 50%';
      line.style.transform = `rotate(${angle}deg)`;
      
      connectionOverlay.appendChild(line);
    });
    
    // 300ms 후 연결선 제거
    setTimeout(() => {
      if (connectionOverlay.parentNode) {
        connectionOverlay.parentNode.removeChild(connectionOverlay);
      }
    }, 300);
  }
  
  async handleWrongClick() {
    // 시간 3초 감점
    this.timeLeft = Math.max(0, this.timeLeft - 3);
    this.updateDisplay();
    
    // -3초 애니메이션 표시
    this.showTimePenalty();
    
    // 시간이 0이 되면 게임 종료
    if (this.timeLeft <= 0) {
      await this.endGame('timeout');
          return;
        }
    
    // 잘못된 클릭 애니메이션
    const tiles = this.gameBoard.querySelectorAll('.tile.empty');
    tiles.forEach(tile => {
      tile.classList.add('wrong-click');
      setTimeout(() => {
        tile.classList.remove('wrong-click');
      }, 500);
    });
  }
  
  showTimePenalty() {
    // 타이머 영역의 위치 가져오기
    const timerElement = document.querySelector('.timer');
    if (!timerElement) return;
    
    const timerRect = timerElement.getBoundingClientRect();
    
    // -3초 텍스트 요소 생성
    const penaltyText = document.createElement('div');
    penaltyText.className = 'time-penalty';
    penaltyText.textContent = '-3초';
    penaltyText.style.position = 'fixed';
    penaltyText.style.left = timerRect.left + timerRect.width / 2 + 'px';
    penaltyText.style.top = timerRect.top + 'px';
    penaltyText.style.transform = 'translateX(-50%)';
    penaltyText.style.fontSize = '1.5rem';
    penaltyText.style.fontWeight = '700';
    penaltyText.style.color = '#e53e3e';
    penaltyText.style.pointerEvents = 'none';
    penaltyText.style.zIndex = '1000';
    penaltyText.style.animation = 'penaltyFloat 1s ease-out forwards';
    
    document.body.appendChild(penaltyText);
    
    setTimeout(() => {
      if (penaltyText.parentNode) {
        penaltyText.parentNode.removeChild(penaltyText);
      }
    }, 1000);
  }
  
  async endGame(reason = 'timeout') {
    this.gameActive = false;
    this.stopTimer();
    
    // 'clear'인 경우 스테이지 클리어로 처리
    if (reason === 'clear') {
      await this.clearStage();
      return;
    }
    
    // 총점은 이미 clearStage()에서 추가됨 (중복 추가 방지)
    this.finalScoreElement.textContent = this.totalScore;
    
    // 리더보드에 점수 저장
    await this.saveToLeaderboard();
    
    // 리더보드 표시
    await this.displayLeaderboard();
    
    // 종료 사유에 따라 메시지 변경
    if (reason === 'timeout') {
      this.gameOverTitle.textContent = '시간 종료!';
      this.gameOverMessage.textContent = '시간이 모두 지나갔습니다.';
    } else if (reason === 'allclear') {
      this.gameOverTitle.textContent = '🏆 모든 스테이지 클리어!';
      this.gameOverMessage.textContent = '축하합니다! 모든 스테이지를 완료했습니다!';
    } else if (reason === 'nomoves') {
      this.gameOverTitle.textContent = '게임 종료!';
      this.gameOverMessage.textContent = '더 이상 움직일 수 없습니다.';
    }
    
    this.stageClearModal.classList.add('hidden');
    this.gameOverModal.classList.remove('hidden');
  }
  
  // 아이템 표시 업데이트
  updateItemDisplay() {
    this.hammerCountElement.textContent = this.hammerCount;
    this.shuffleCountElement.textContent = this.shuffleCount;
    this.timeCountElement.textContent = this.timeCount;
    
    // 개수가 0이면 시각적 소진 상태 표시(클릭은 보상버튼 위해 유지)
    this.hammerItem.classList.toggle('depleted', this.hammerCount === 0);
    this.shuffleItem.classList.toggle('depleted', this.shuffleCount === 0);
    this.timeItem.classList.toggle('depleted', this.timeCount === 0);
    
    // 개수가 0이면 배지 스타일 변경
    this.hammerCountElement.classList.toggle('zero', this.hammerCount === 0);
    this.shuffleCountElement.classList.toggle('zero', this.shuffleCount === 0);
    this.timeCountElement.classList.toggle('zero', this.timeCount === 0);
    
    // 광고 보상 버튼 표시
    const showBtn = (id, show) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !show);
    };
    showBtn('hammerAdBtn', this.hammerCount === 0 && !this.adRewardUsed?.hammer);
    showBtn('shuffleAdBtn', this.shuffleCount === 0 && !this.adRewardUsed?.shuffle);
    showBtn('timeAdBtn', this.timeCount === 0 && !this.adRewardUsed?.time);
    
    // active 상태 업데이트
    this.hammerItem.classList.toggle('active', this.activeItem === 'hammer');
    this.shuffleItem.classList.remove('active');
    this.timeItem.classList.remove('active');
  }

  grantAdReward(type) {
    if (type === 'hammer') { this.hammerCount += 1; this.adRewardUsed.hammer = true; }
    if (type === 'shuffle') { this.shuffleCount += 1; this.adRewardUsed.shuffle = true; }
    if (type === 'time') { this.timeCount += 1; this.adRewardUsed.time = true; }
    this.updateItemDisplay();
  }
  
  // 망치 아이템 선택
  selectItem(itemType) {
    if (!this.gameActive) return;
    if (itemType === 'hammer' && this.hammerCount === 0) return;
    
    if (this.activeItem === itemType) {
      // 이미 선택된 아이템을 다시 클릭하면 취소
      this.activeItem = null;
    } else {
      this.activeItem = itemType;
    }
    
    this.updateItemDisplay();
  }
  
  // 망치 아이템 사용 (타일 클릭 시)
  async useHammerItem(row, col) {
    if (this.hammerCount === 0) return false;
    if (this.board[row][col].isEmpty) return false; // 빈 칸은 제거 불가
    
    // 타일 제거
    this.score += 1;
    this.board[row][col].isEmpty = true;
    this.board[row][col].color = null;
    
    // 망치 개수 감소
    this.hammerCount--;
    this.activeItem = null;
    
    this.updateDisplay();
    this.updateItemDisplay();
    this.renderBoard();
    
    // 보드가 비어있으면 게임 종료, 아니면 유효 움직임 체크
    if (this.isBoardEmpty()) {
      await this.endGame('clear');
      } else {
      await this.ensureMovableOrPause();
    }
    
    return true;
  }
  
  // 리셋(셔플) 아이템 사용
  useShuffleItem() {
    if (!this.gameActive) return;
    if (this.shuffleCount === 0) return;
    
    // 현재 보드의 모든 타일 수집 (열쇠-문 제외)
    const tiles = [];
    const keyDoorPositions = [];
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cell = this.board[row][col];
        if (!cell.isEmpty) {
          if (cell.type === 'key' || cell.type === 'door') {
            // 열쇠-문은 위치만 저장하고 움직이지 않음
            keyDoorPositions.push({ row, col, cell });
          } else {
            // 일반 타일만 셔플 대상
            tiles.push(cell.color);
          }
        }
      }
    }
    
    // 타일 섞기 (Fisher-Yates shuffle)
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    // 보드 초기화 (열쇠-문 제외)
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cell = this.board[row][col];
        if (cell.type !== 'key' && cell.type !== 'door') {
          cell.isEmpty = true;
          cell.color = null;
          cell.type = null;
          cell.value = null;
        }
      }
    }
    
    // 섞은 타일들을 랜덤 위치에 재배치 (열쇠-문 위치 제외)
    let tileIndex = 0;
    const availablePositions = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cell = this.board[row][col];
        if (cell.type !== 'key' && cell.type !== 'door') {
          availablePositions.push({ row, col });
        }
      }
    }
    
    // 위치도 섞기
    for (let i = availablePositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // 타일 배치
    tiles.forEach((color, index) => {
      if (index < availablePositions.length) {
        const pos = availablePositions[index];
        this.board[pos.row][pos.col].color = color;
        this.board[pos.row][pos.col].isEmpty = false;
        this.board[pos.row][pos.col].type = 'color';
        this.board[pos.row][pos.col].value = color;
      }
    });
    
    this.shuffleCount--;
    this.updateItemDisplay();
    this.renderBoard();
  }

  // 유효한 움직임이 없으면 타이머를 잠시 멈추고, 리셋 여부를 묻는 모달을 띄운 뒤
  // 리셋을 선택하면 아이템 소모 없이 셔플을 수행하고 타이머를 재개한다.
  async ensureMovableOrPause() {
    if (this.noMovesPauseActive) return;
    // 2개 이상 타일이 남아있고, 유효한 움직임이 없을 때만 동작
    const remaining = this.countRemainingTiles();
    if (remaining >= 2 && !this.hasValidMoves()) {
      this.noMovesPauseActive = true;
      const wasRunning = Boolean(this.timerInterval);
      if (wasRunning) this.stopTimer();
      const ok = await this.showOneButtonConfirm('움직일 수 없습니다.', '타일이 셔플 됩니다.', '확인');
      if (ok) {
        this.reshufflePreservingSpecials(); // 아이템 소모 없이 셔플
      }
      // 타이머 재개
      if (wasRunning) this.startTimer();
      this.noMovesPauseActive = false;
    }
  }

  countRemainingTiles() {
    let cnt = 0;
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (!this.board[r][c].isEmpty) cnt++;
      }
    }
    return cnt;
  }

  // 아이템 소모 없이, 특수 타일은 위치 고정으로 셔플
  reshufflePreservingSpecials() {
    // 현재 보드의 모든 일반 타일 수집
    const originalColors = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cell = this.board[row][col];
        if (!cell.isEmpty && (cell.type !== 'key' && cell.type !== 'door')) {
          originalColors.push(cell.color);
        }
      }
    }

    // 일반 타일 자리를 비우는 헬퍼
    const clearNormalTiles = () => {
      for (let row = 0; row < this.boardSize; row++) {
        for (let col = 0; col < this.boardSize; col++) {
          const cell = this.board[row][col];
          if (cell.type !== 'key' && cell.type !== 'door') {
            cell.isEmpty = true;
            cell.color = null;
            cell.type = null;
            cell.value = null;
          }
        }
      }
    };

    // 비어있는(일반 타일이 들어갈 수 있는) 위치 목록 수집 헬퍼
    const collectAvailablePositions = () => {
      const positions = [];
      for (let row = 0; row < this.boardSize; row++) {
        for (let col = 0; col < this.boardSize; col++) {
          const cell = this.board[row][col];
          if (cell.type !== 'key' && cell.type !== 'door') {
            positions.push({ row, col });
          }
        }
      }
      return positions;
    };

    // 시도 반복: 유효 움직임이 생길 때까지 셔플
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // 섞을 색 배열 복사 후 셔플
      const tiles = [...originalColors];
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }

      clearNormalTiles();

      // 위치 수집 및 섞기
      const availablePositions = collectAvailablePositions();
      for (let i = availablePositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
      }

      // 배치
      tiles.forEach((color, index) => {
        if (index < availablePositions.length) {
          const pos = availablePositions[index];
          const cell = this.board[pos.row][pos.col];
          cell.color = color;
          cell.isEmpty = false;
          cell.type = 'color';
          cell.value = color;
        }
      });

      this.renderBoard();
      if (this.hasValidMoves()) return; // 성공 조건 달성
    }

    // 안전장치: 위 시도들로도 실패 시 강제 1수 보장 생성
    // 하나의 빈 칸(e)을 기준으로 위/아래(또는 좌/우)에 같은 색 두 타일을 배치
    // 빈 칸 후보 찾기
    const empties = [];
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = this.board[r][c];
        if (cell.isEmpty) empties.push({ r, c });
      }
    }

    if (empties.length > 0) {
      const e = empties[Math.floor(Math.random() * empties.length)];
      // 후보 색상
      const colorChoice = (originalColors.length > 0) ? originalColors[0] : 0;

      // 위/아래 우선 배치 시도
      const tryPlace = (r1, c1, r2, c2) => {
        const within = (r, c) => r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize;
        if (!within(r1, c1) || !within(r2, c2)) return false;
        const a = this.board[r1][c1];
        const b = this.board[r2][c2];
        if ((a.type === 'key' || a.type === 'door') || (b.type === 'key' || b.type === 'door')) return false;
        // 배치 강제
        a.isEmpty = false; a.type = 'color'; a.value = colorChoice; a.color = colorChoice;
        b.isEmpty = false; b.type = 'color'; b.value = colorChoice; b.color = colorChoice;
        return true;
      };

      if (!tryPlace(e.r - 1, e.c, e.r + 1, e.c)) {
        // 좌/우 시도
        tryPlace(e.r, e.c - 1, e.r, e.c + 1);
      }
      this.renderBoard();
    }
  }
  
  // 시계 아이템 사용
  useTimeItem() {
    if (!this.gameActive) return;
    if (this.timeCount === 0) return;
    
    this.timeLeft += 5;
    this.timeCount--;
    
    this.updateDisplay();
    this.updateItemDisplay();
    
    // +5초 애니메이션 표시
    this.showTimeBonus();
  }
  
  showTimeBonus() {
    const timerElement = document.querySelector('.timer');
    if (!timerElement) return;
    
    const timerRect = timerElement.getBoundingClientRect();
    
    const bonusText = document.createElement('div');
    bonusText.className = 'time-bonus';
    bonusText.textContent = '+5초';
    bonusText.style.position = 'fixed';
    bonusText.style.left = timerRect.left + timerRect.width / 2 + 'px';
    bonusText.style.top = timerRect.top + 'px';
    bonusText.style.transform = 'translateX(-50%)';
    bonusText.style.fontSize = '1.5rem';
    bonusText.style.fontWeight = '700';
    bonusText.style.color = '#38a169';
    bonusText.style.pointerEvents = 'none';
    bonusText.style.zIndex = '1000';
    bonusText.style.animation = 'bonusFloat 1s ease-out forwards';
    
    document.body.appendChild(bonusText);
    
    setTimeout(() => {
      if (bonusText.parentNode) {
        bonusText.parentNode.removeChild(bonusText);
      }
    }, 1000);
  }

  showKeyDoorBonus() {
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) return;
    
    const boardRect = gameBoard.getBoundingClientRect();
    
    const bonusText = document.createElement('div');
    bonusText.className = 'key-door-bonus';
    bonusText.textContent = '🔑🚪 +50점 +10초';
    bonusText.style.position = 'fixed';
    bonusText.style.left = boardRect.left + boardRect.width / 2 + 'px';
    bonusText.style.top = boardRect.top + boardRect.height / 2 + 'px';
    bonusText.style.transform = 'translate(-50%, -50%)';
    bonusText.style.fontSize = '1.8rem';
    bonusText.style.fontWeight = '700';
    bonusText.style.color = '#ffd700';
    bonusText.style.pointerEvents = 'none';
    bonusText.style.zIndex = '1000';
    bonusText.style.animation = 'keyDoorBonus 2s ease-out forwards';
    
    document.body.appendChild(bonusText);
    
    setTimeout(() => {
      if (bonusText.parentNode) {
        bonusText.parentNode.removeChild(bonusText);
      }
    }, 2000);
  }
  
  // 리더보드에 점수 저장 (Firebase)
  async saveToLeaderboard() {
    try {
      const leaderboardCollection = window.firebaseCollection(window.db, 'leaderboard');
      
      const newEntry = {
        nickname: this.nickname,
        score: this.totalScore,
        playerId: this.playerId,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };
      
      await window.firebaseAddDoc(leaderboardCollection, newEntry);
    } catch (error) {
      console.error('Firebase 저장 실패:', error);
    }
  }

  // LocalStorage 백업 로직 제거 (Firebase only)
  
  // 리더보드 불러오기 (Firebase 우선, LocalStorage 폴백)
  async getLeaderboard() {
    try {
      const leaderboardCollection = window.firebaseCollection(window.db, 'leaderboard');
      const q = window.firebaseQuery(
        leaderboardCollection, 
        window.firebaseOrderBy('score', 'desc'),
        window.firebaseLimit(1000)
      );
      
      const querySnapshot = await window.firebaseGetDocs(q);
      const leaderboard = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({
          id: doc.id,
          nickname: data.nickname,
          score: data.score,
          date: new Date(data.date).toLocaleDateString('ko-KR'),
          playerId: data.playerId,
          timestamp: data.timestamp
        });
      });
      
      return leaderboard;
    } catch (error) {
      console.error('Firebase 불러오기 실패:', error);
      return [];
    }
  }

  // users 컬렉션 기반 리더보드 데이터 (스테이지/누적)
  async getUsersLeaderboard(modeRaw) {
    try {
      const usersCol = window.firebaseCollection(window.db, 'users');
      const q = window.firebaseQuery(usersCol, window.firebaseLimit(1000));
      const snap = await window.firebaseGetDocs(q);
      const users = [];
      snap.forEach((doc) => {
        const d = doc.data() || {};
        const stages = Array.isArray(d.stages) ? d.stages : [];
        const totalStars = typeof d.totalStars === 'number' ? d.totalStars : stages.reduce((s, st) => s + (st?.stars || 0), 0);
        let bestStage = 0;
        let bestStageStars = 0;
        stages.forEach((st, idx) => {
          const stageNum = st?.stage || (idx + 1);
          if (st?.cleared) {
            if (stageNum > bestStage) {
              bestStage = stageNum;
              bestStageStars = st.stars || 0;
            } else if (stageNum === bestStage) {
              bestStageStars = Math.max(bestStageStars, st.stars || 0);
            }
          }
        });
        users.push({
          playerId: d.playerId,
          nickname: d.nickname || 'Player',
          totalStars,
          bestStage,
          bestStageStars,
          lastUpdated: d.lastUpdated || ''
        });
      });
      const mode = modeRaw === 'total' ? 'total' : 'stage';
      if (mode === 'total') {
        users.sort((a, b) => (b.totalStars - a.totalStars) || ((b.lastUpdated || '').localeCompare(a.lastUpdated || '')));
        return users.map(u => ({ playerId: u.playerId, nickname: u.nickname, totalStars: u.totalStars }));
      }
      users.sort((a, b) => (b.bestStage - a.bestStage) || (b.bestStageStars - a.bestStageStars) || ((b.lastUpdated || '').localeCompare(a.lastUpdated || '')));
      return users.map(u => ({ playerId: u.playerId, nickname: u.nickname, bestStage: u.bestStage, bestStageStars: u.bestStageStars }));
    } catch (e) {
      console.error('users 리더보드 불러오기 실패:', e);
      return [];
    }
  }

  // 닉네임 중복 확인 (같은 playerId는 허용)
  async isNicknameAvailable(nickname) {
    try {
      const usersCol = window.firebaseCollection(window.db, 'users');
      const q = window.firebaseQuery(usersCol, window.firebaseWhere('nickname', '==', nickname), window.firebaseLimit(1));
      const snap = await window.firebaseGetDocs(q);
      if (snap.empty) return true;
      const data = snap.docs[0].data() || {};
      return data.playerId === this.playerId;
    } catch (e) {
      console.warn('닉네임 중복 확인 실패:', e);
      return true;
    }
  }

  // stageData 배열 길이 보정
  normalizeStageData() {
    if (!this.stageData) return;
    const needed = this.stageConfigs.length;
    if (!Array.isArray(this.stageData.stages)) this.stageData.stages = [];
    while (this.stageData.stages.length < needed) {
      const idx = this.stageData.stages.length;
      this.stageData.stages.push({ stage: idx + 1, stars: 0, score: 0, cleared: false, unlocked: idx === 0 });
    }
  }
  
  // 리더보드 표시
  async displayLeaderboard() {
    const leaderboard = await this.getLeaderboard();
    const leaderboardList = document.getElementById('leaderboardList');
    
    // 새 users 기반 렌더링(우선 적용)
    try {
      const usersLB = await this.getUsersLeaderboard(this.leaderboardMode);
      if (Array.isArray(usersLB) && usersLB.length) {
        leaderboardList.innerHTML = '';
        const working = usersLB;
        // 홈/게임 종료 모두 전체 리스트 렌더링
        working.forEach((entry, idx) => {
          const actualRank = idx + 1;
          const item = document.createElement('div');
          item.className = 'leaderboard-item';
          if (this.leaderboardMode === 'total') {
            item.innerHTML = `
              <span class="rank">${actualRank}</span>
              <span class="nickname">${entry.nickname || 'Player'}</span>
          <span class="score">⭐ × ${(entry.totalStars || 0)}</span>
            `;
          } else {
            item.innerHTML = `
              <span class="rank">${actualRank}</span>
              <span class="nickname">${entry.nickname || 'Player'}</span>
          <span class="score">${entry.bestStage || 0} · ⭐${entry.bestStageStars || 0}</span>
            `;
          }
          leaderboardList.appendChild(item);
        });
        return;
      }
    } catch (e) {
      console.warn('users 기반 렌더링 실패, 기존 로직 사용');
    }

    // 누적/단판 모드별 데이터 구성
    let working = [...leaderboard];
    if (this.leaderboardMode === 'total') {
      const totals = new Map();
      const latestById = new Map(); // playerId별 최신 닉네임 결정(최근 timestamp 우선)
      working.forEach(e => {
        const key = e.playerId || 'legacy';
        totals.set(key, (totals.get(key) || 0) + (e.score || 0));
        const prev = latestById.get(key);
        if (!prev || (e.timestamp || 0) > (prev.ts || 0)) {
          latestById.set(key, { name: key === 'legacy' ? '과거 데이터 합계' : (e.nickname || 'Player'), ts: e.timestamp || 0 });
        }
      });
      working = Array.from(totals.entries()).map(([playerId, score]) => ({
        playerId,
        nickname: (latestById.get(playerId)?.name) || 'Player',
        score
      })).sort((a,b)=>b.score-a.score);
    }

    // 내 순위 찾기 (모드별로 기준이 다름)
    const myRank = working.findIndex(entry => 
      entry.playerId === this.playerId && (
        this.leaderboardMode === 'total' ? true : entry.score === this.totalScore
      )
    ) + 1;
    
    leaderboardList.innerHTML = '';
    
    // 새로운 구조: Top 3 + 점선 + 내 순위 (최대 4개)
    let top3Items = working.slice(0, 3);
    let myAreaItems = [];
    let showDivider = false;
    
    if (myRank > 3 && myRank !== 0) {
      // 내 순위가 4등 이하인 경우: 내 점수만 표시
      const myEntry = working.find(entry => 
        entry.playerId === this.playerId && (
          this.leaderboardMode === 'total' ? true : entry.score === this.totalScore
        )
      );
      if (myEntry) {
        myAreaItems = [myEntry];
        showDivider = true;
      }
    } else if (myRank <= 3 && myRank !== 0) {
      // 내가 Top 3 안에 있으면 4번째로 내 점수 한 번 더 표시
      const myEntry = working.find(entry => 
        entry.playerId === this.playerId && (
          this.leaderboardMode === 'total' ? true : entry.score === this.totalScore
        )
      );
      if (myEntry) {
        myAreaItems = [myEntry];
        showDivider = true;
      }
    }
    
    // 홈 진입: 전체 렌더링(스크롤 영역에서 모두 확인)
    if (!this.gameActive) {
      working.forEach((entry) => {
        const actualRank = working.indexOf(entry) + 1;
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
          <span class="rank">${actualRank}</span>
          <span class="nickname">${entry.nickname || 'Player'}</span>
          <span class="score">${(entry.score ?? 0).toLocaleString()}</span>
        `;
        leaderboardList.appendChild(item);
      });
      return;
    }

    // 게임 종료 컨텍스트: Top 3 + (구분선) + 내 영역
    top3Items.forEach((entry) => {
      const actualRank = working.indexOf(entry) + 1;
      const isMe = (actualRank === myRank);
      const medal = actualRank === 1 ? '👑' : actualRank === 2 ? '🥈' : actualRank === 3 ? '🥉' : actualRank.toString();
      
      const item = document.createElement('div');
      item.className = `leaderboard-item${isMe ? ' is-me' : ''}`;
      item.innerHTML = `
        <span class="rank">${medal}</span>
        <span class="nickname">${entry.nickname}${isMe ? ' ⭐' : ''}</span>
        <span class="score">${entry.score}점</span>
      `;
      leaderboardList.appendChild(item);
    });

    // 구분선 추가
    if (showDivider) {
      const divider = document.createElement('div');
      divider.className = 'leaderboard-divider';
      leaderboardList.appendChild(divider);
    }

    // 내 주변 렌더링
    myAreaItems.forEach((entry) => {
      const actualRank = working.indexOf(entry) + 1;
      const isMe = (actualRank === myRank);
      
      const item = document.createElement('div');
      item.className = `leaderboard-item${isMe ? ' is-me' : ''}`;
      item.innerHTML = `
        <span class="rank">${actualRank}</span>
        <span class="nickname">${entry.nickname}${isMe ? ' ⭐' : ''}</span>
        <span class="score">${entry.score}점</span>
      `;
      leaderboardList.appendChild(item);
    });
  }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
  new ColorTilesGame();
});