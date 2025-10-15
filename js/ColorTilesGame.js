class ColorTilesGame {
  constructor() {
    // 스테이지 설정 (13개로 확장, 모든 스테이지 50초 고정, 8x8 고정)
    this.stageConfigs = [
      { boardSize: 8, numColors: 5, timeLimit: 50 },   // Stage 1
      { boardSize: 8, numColors: 6, timeLimit: 50 },   // Stage 2
      { boardSize: 8, numColors: 7, timeLimit: 50 },   // Stage 3
      { boardSize: 8, numColors: 8, timeLimit: 50 },   // Stage 4
      { boardSize: 8, numColors: 9, timeLimit: 50 },   // Stage 5
      { boardSize: 8, numColors: 10, timeLimit: 50 },  // Stage 6
      { boardSize: 8, numColors: 11, timeLimit: 50 },  // Stage 7
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // Stage 8
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // Stage 9
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // Stage 10
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // Stage 11
      { boardSize: 8, numColors: 12, timeLimit: 50 },  // Stage 12
      { boardSize: 8, numColors: 13, timeLimit: 50 }   // Stage 13 (신규 색상 포함)
    ];
    
    this.currentStage = 1; // 기본값으로 1스테이지로 시작
    this.totalStages = 13;
    this.totalScore = 0;
    
    // 홈화면 관련
    this.homeScreen = document.getElementById('homeScreen');
    this.gameContainer = document.getElementById('gameContainer');
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
    
    // 아이템 개수 (테스트용: 모두 20개)
    this.hammerCount = 20;
    this.shuffleCount = 20;
    this.timeCount = 20;
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
            await this.alertModal('알림', '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
            return;
          }
          this.nickname = nickname;
          localStorage.setItem('colorTilesNickname', nickname);
          this.nicknameInput.readOnly = true;
          editBtn.textContent = '변경';
          await this.saveToFirebase();
          await this.alertModal('완료', '닉네임이 변경되었습니다.');
        }
      });
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

    // in-game nav removed
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

  // 닉네임 중복 확인
  async isNicknameAvailable(nickname) {
    try {
      if (!window.db) return true;
      
      const usersCollection = window.firebaseCollection(window.db, 'users');
      const q = window.firebaseQuery(
        usersCollection,
        window.firebaseWhere('nickname', '==', nickname)
      );
      const querySnapshot = await window.firebaseGetDocs(q);
      
      return querySnapshot.empty;
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      return true; // 오류 시 사용 가능으로 처리
    }
  }

  // 닉네임 제출
  async submitNickname() {
    const nickname = this.nicknameInput.value.trim();
    if (!nickname) {
      await this.alertModal('알림', '닉네임을 입력해주세요!');
      return;
    }
    
    // 닉네임 중복 확인
    const unique = await this.isNicknameAvailable(nickname);
    if (!unique) {
      await this.alertModal('알림', '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      return;
    }
    
    this.nickname = nickname;
    localStorage.setItem('colorTilesNickname', nickname);
    
    // Firebase에 저장
    await this.saveToFirebase();
    
    // 닉네임 표시 업데이트
    if (this.nicknameDisplay) {
      this.nicknameDisplay.textContent = nickname;
    }
    
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
      // Firebase에서 데이터 로드
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

  // Firebase에 데이터 저장
  async saveToFirebase() {
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
    this.updateHomeScreen();
  }

  // 홈화면 업데이트
  updateHomeScreen() {
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
    const stars = this.getStarsByTime(this.timeLeft, this.stageConfigs[this.currentStage - 1].timeLimit);
    
    if (stars >= 1) {
      star1.classList.remove('inactive');
    } else {
      star1.classList.add('inactive');
    }
    
    if (stars >= 2) {
      star2.classList.remove('inactive');
    } else {
      star2.classList.add('inactive');
    }
    
    if (stars >= 3) {
      star3.classList.remove('inactive');
    } else {
      star3.classList.add('inactive');
    }
  }

  // 스테이지 데이터 로드
  async loadStageData() {
    try {
      if (!window.db) {
        console.error('Firebase가 로드되지 않았습니다.');
        return this.getDefaultStageData();
      }

      const usersCollection = window.firebaseCollection(window.db, 'users');
      const q = window.firebaseQuery(
        usersCollection,
        window.firebaseWhere('playerId', '==', this.playerId)
      );
      const querySnapshot = await window.firebaseGetDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return {
          docId: userDoc.id,
          stages: userData.stages || this.getDefaultStageData().stages
        };
      } else {
        return this.getDefaultStageData();
      }
    } catch (error) {
      console.error('Firebase 로드 실패:', error);
      return this.getDefaultStageData();
    }
  }

  // 기본 스테이지 데이터
  getDefaultStageData() {
    const stages = [];
    for (let i = 1; i <= this.totalStages; i++) {
      stages.push({
        stage: i,
        unlocked: i === 1, // 첫 번째 스테이지만 해제
        stars: 0,
        score: 0,
        bestTime: null
      });
    }
    return { stages };
  }

  // 스테이지 클리어 처리
  async stageClear() {
    this.gameActive = false;
    this.stopTimer();
    
    const stars = this.getStarsByTime(this.timeLeft, this.stageConfigs[this.currentStage - 1].timeLimit);
    const stageInfo = this.stageData.stages[this.currentStage - 1];
    
    // 별 업데이트 (더 높은 별만 저장)
    if (stars > stageInfo.stars) {
      stageInfo.stars = stars;
    }
    
    // 점수 업데이트
    stageInfo.score = Math.max(stageInfo.score, this.score);
    
    // 다음 스테이지 해제
    if (this.currentStage < this.totalStages) {
      this.stageData.stages[this.currentStage].unlocked = true;
    }
    
    // Firebase에 저장
    await this.saveToFirebase();
    
    // 클리어 모달 표시
    this.stageClearScoreElement.textContent = this.score;
    this.stageClearTotalScoreElement.textContent = this.totalScore;
    this.stageClearModal.classList.remove('hidden');
  }

  // 다음 스테이지
  async nextStage() {
    this.stageClearModal.classList.add('hidden');
    
    if (this.currentStage < this.totalStages) {
      this.currentStage++;
      this.startStage(this.currentStage);
    } else {
      // 모든 스테이지 클리어
      this.showHomeScreen();
    }
  }

  // 게임 오버 처리
  gameOver() {
    this.gameActive = false;
    this.stopTimer();
    
    this.finalScoreElement.textContent = this.totalScore;
    this.gameOverTitle.textContent = '게임 종료!';
    this.gameOverMessage.textContent = '시간이 다 되었습니다!';
    
    // 리더보드 표시
    this.displayLeaderboard();
    
    this.gameOverModal.classList.remove('hidden');
  }

  // 리더보드 표시
  async displayLeaderboard() {
    try {
      if (!window.db) {
        console.error('Firebase가 로드되지 않았습니다.');
        return;
      }

      const usersCollection = window.firebaseCollection(window.db, 'users');
      let q;
      
      if (this.leaderboardMode === 'single') {
        // 단판 점수 기준
        q = window.firebaseQuery(
          usersCollection,
          window.firebaseOrderBy('totalScore', 'desc'),
          window.firebaseLimit(10)
        );
      } else {
        // 누적 점수 기준
        q = window.firebaseQuery(
          usersCollection,
          window.firebaseOrderBy('totalStars', 'desc'),
          window.firebaseLimit(10)
        );
      }
      
      const querySnapshot = await window.firebaseGetDocs(q);
      const leaderboardList = document.getElementById('leaderboardList');
      
      if (querySnapshot.empty) {
        leaderboardList.innerHTML = '<div class="leaderboard-item">아직 기록이 없습니다.</div>';
        return;
      }
      
      let html = '';
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const rank = index + 1;
        const score = this.leaderboardMode === 'single' ? data.totalScore : data.totalStars;
        const scoreLabel = this.leaderboardMode === 'single' ? '점' : '별';
        
        html += `
          <div class="leaderboard-item">
            <div class="rank">${rank}</div>
            <div class="nickname">${data.nickname}</div>
            <div class="score">${score}${scoreLabel}</div>
          </div>
        `;
      });
      
      leaderboardList.innerHTML = html;
    } catch (error) {
      console.error('리더보드 로드 실패:', error);
    }
  }

  // 아이템 선택
  selectItem(itemType) {
    if (this.activeItem === itemType) {
      this.activeItem = null;
      this.hammerItem.classList.remove('active');
      this.shuffleItem.classList.remove('active');
      this.timeItem.classList.remove('active');
    } else {
      this.activeItem = itemType;
      this.hammerItem.classList.remove('active');
      this.shuffleItem.classList.remove('active');
      this.timeItem.classList.remove('active');
      
      if (itemType === 'hammer') this.hammerItem.classList.add('active');
      if (itemType === 'shuffle') this.shuffleItem.classList.add('active');
      if (itemType === 'time') this.timeItem.classList.add('active');
    }
  }

  // 셔플 아이템 사용
  useShuffleItem() {
    if (this.shuffleCount <= 0) {
      this.alertModal('알림', '셔플 아이템이 부족합니다!');
      return;
    }
    
    this.shuffleCount--;
    this.updateItemDisplay();
    
    // 보드 셔플
    this.shuffleBoard();
    this.renderBoard();
  }

  // 시간 아이템 사용
  useTimeItem() {
    if (this.timeCount <= 0) {
      this.alertModal('알림', '시간 아이템이 부족합니다!');
      return;
    }
    
    this.timeCount--;
    this.updateItemDisplay();
    
    // 시간 추가 (10초)
    this.timeLeft += 10;
    this.updateTimer();
  }

  // 보드 셔플
  shuffleBoard() {
    const flatBoard = this.board.flat();
    for (let i = flatBoard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flatBoard[i], flatBoard[j]] = [flatBoard[j], flatBoard[i]];
    }
    
    let index = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        this.board[row][col] = flatBoard[index++];
      }
    }
  }

  // 아이템 표시 업데이트
  updateItemDisplay() {
    this.hammerCountElement.textContent = this.hammerCount;
    this.shuffleCountElement.textContent = this.shuffleCount;
    this.timeCountElement.textContent = this.timeCount;
    
    // 아이템이 0개일 때 비활성화
    this.hammerItem.classList.toggle('depleted', this.hammerCount === 0);
    this.shuffleItem.classList.toggle('depleted', this.shuffleCount === 0);
    this.timeItem.classList.toggle('depleted', this.timeCount === 0);
    
    // 광고 보상 버튼 표시/숨김
    const hammerAdBtn = document.getElementById('hammerAdBtn');
    const shuffleAdBtn = document.getElementById('shuffleAdBtn');
    const timeAdBtn = document.getElementById('timeAdBtn');
    
    if (hammerAdBtn) hammerAdBtn.classList.toggle('hidden', this.hammerCount > 0);
    if (shuffleAdBtn) shuffleAdBtn.classList.toggle('hidden', this.shuffleCount > 0);
    if (timeAdBtn) timeAdBtn.classList.toggle('hidden', this.timeCount > 0);
  }

  // 광고 보상 지급
  grantAdReward(itemType) {
    if (itemType === 'hammer') {
      this.hammerCount++;
      this.adRewardUsed.hammer = true;
    } else if (itemType === 'shuffle') {
      this.shuffleCount++;
      this.adRewardUsed.shuffle = true;
    } else if (itemType === 'time') {
      this.timeCount++;
      this.adRewardUsed.time = true;
    }
    
    this.updateItemDisplay();
  }

  // 닉네임 읽기 전용 상태 적용
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
      id = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(key, id);
    }
    return id;
  }

  // 스테이지 표시 업데이트
  updateStageDisplay() {
    this.currentStageElement.textContent = this.currentStage;
    this.totalStagesElement.textContent = this.totalStages;
  }

  // 게임 시작
  startGame() {
    this.gameActive = true;
    this.score = 0;
    const stageConfig = this.stageConfigs[this.currentStage - 1];
    this.timeLeft = stageConfig.timeLimit;
    
    this.initializeBoard();
    this.renderBoard();
    this.updateScore();
    this.updateTimer();
    this.startTimer();
    this.updateProgressBar();
  }

  // 보드 초기화
  initializeBoard() {
    this.board = [];
    for (let row = 0; row < this.boardSize; row++) {
      this.board[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        this.board[row][col] = Math.floor(Math.random() * this.numColors);
      }
    }
  }

  // 보드 렌더링
  renderBoard() {
    this.gameBoard.innerHTML = '';
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const tile = document.createElement('div');
        tile.className = `tile ${this.colors[this.board[row][col]]}`;
        tile.dataset.row = row;
        tile.dataset.col = col;
        this.gameBoard.appendChild(tile);
      }
    }
  }

  // 타일 클릭 처리
  handleTileClick(row, col) {
    if (this.activeItem === 'hammer') {
      this.useHammerItem(row, col);
      return;
    }
    
    const color = this.board[row][col];
    const matches = this.findMatches(row, col, color);
    
    if (matches.length >= 2) {
      this.processMatches(matches);
    } else {
      // 틀린 클릭 - 시간 감점
      this.timeLeft = Math.max(0, this.timeLeft - 3);
      this.updateTimer();
      
      // 틀린 클릭 애니메이션
      const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      tile.classList.add('wrong-click');
      setTimeout(() => tile.classList.remove('wrong-click'), 500);
      
      // 시간 감점 표시
      this.showTimePenalty();
    }
  }

  // 망치 아이템 사용
  useHammerItem(row, col) {
    if (this.hammerCount <= 0) {
      this.alertModal('알림', '망치 아이템이 부족합니다!');
      return;
    }
    
    this.hammerCount--;
    this.updateItemDisplay();
    
    // 해당 타일 제거
    this.board[row][col] = -1; // 빈 타일로 표시
    this.score += 1;
    this.updateScore();
    
    // 보드 다시 렌더링
    this.renderBoard();
    
    // 아이템 선택 해제
    this.activeItem = null;
    this.hammerItem.classList.remove('active');
  }

  // 매칭된 타일 찾기
  findMatches(row, col, color) {
    const matches = [{row, col}];
    const visited = new Set();
    const queue = [{row, col}];
    visited.add(`${row},${col}`);
    
    const directions = [[-1,0], [1,0], [0,-1], [0,1]];
    
    while (queue.length > 0) {
      const {row: r, col: c} = queue.shift();
      
      for (const [dr, dc] of directions) {
        const newRow = r + dr;
        const newCol = c + dc;
        const key = `${newRow},${newCol}`;
        
        if (newRow >= 0 && newRow < this.boardSize && 
            newCol >= 0 && newCol < this.boardSize &&
            !visited.has(key) &&
            this.board[newRow][newCol] === color) {
          
          visited.add(key);
          matches.push({row: newRow, col: newCol});
          queue.push({row: newRow, col: newCol});
        }
      }
    }
    
    return matches;
  }

  // 매칭 처리
  processMatches(matches) {
    // 매칭된 타일들 제거
    matches.forEach(({row, col}) => {
      this.board[row][col] = -1; // 빈 타일로 표시
    });
    
    // 점수 추가
    this.score += matches.length;
    this.updateScore();
    
    // 매칭 애니메이션
    matches.forEach(({row, col}) => {
      const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (tile) {
        tile.classList.add('matched');
        this.createParticles(tile);
        setTimeout(() => tile.remove(), 400);
      }
    });
    
    // 보드 다시 렌더링
    setTimeout(() => {
      this.renderBoard();
      this.checkGameEnd();
    }, 500);
  }

  // 파티클 생성
  createParticles(tile) {
    const rect = tile.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.position = 'fixed';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.background = tile.style.background || '#ff6b6b';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      
      // 8방향으로 파티클 날리기
      const angle = (i * 45) * Math.PI / 180;
      const distance = 30 + Math.random() * 20;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      particle.style.setProperty('--rotate', (i * 45) + 'deg');
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 500);
    }
  }

  // 게임 종료 확인
  checkGameEnd() {
    // 모든 타일이 매칭되었는지 확인
    let hasMatches = false;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] !== -1) {
          const color = this.board[row][col];
          const matches = this.findMatches(row, col, color);
          if (matches.length >= 2) {
            hasMatches = true;
            break;
          }
        }
      }
      if (hasMatches) break;
    }
    
    if (!hasMatches) {
      // 더 이상 매칭할 수 없음
      this.stageClear();
    }
  }

  // 점수 업데이트
  updateScore() {
    this.scoreElement.textContent = this.score;
    this.totalScore += this.score;
    this.totalScoreElement.textContent = this.totalScore;
  }

  // 타이머 시작
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimer();
      this.updateProgressBar();
      
      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  // 타이머 정지
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // 타이머 업데이트
  updateTimer() {
    this.timerElement.textContent = this.timeLeft;
  }

  // 시간 감점 표시
  showTimePenalty() {
    const penalty = document.createElement('div');
    penalty.textContent = '-3초';
    penalty.className = 'time-penalty';
    penalty.style.position = 'fixed';
    penalty.style.left = '50%';
    penalty.style.top = '50%';
    penalty.style.transform = 'translateX(-50%)';
    penalty.style.color = '#e53e3e';
    penalty.style.fontSize = '2rem';
    penalty.style.fontWeight = 'bold';
    penalty.style.pointerEvents = 'none';
    penalty.style.zIndex = '1000';
    penalty.style.animation = 'penaltyFloat 1s ease-out forwards';
    
    document.body.appendChild(penalty);
    
    setTimeout(() => {
      if (penalty.parentNode) {
        penalty.parentNode.removeChild(penalty);
      }
    }, 1000);
  }
}

// ES6 모듈로 내보내기
export { ColorTilesGame };
