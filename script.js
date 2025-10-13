class ColorTilesGame {
  constructor() {
    // 스테이지 설정 (8개로 확장, 모든 스테이지 50초 고정, 모바일 최적화)
    this.stageConfigs = [
      { boardSize: 8, numColors: 5, timeLimit: 50 },   // Stage 1
      { boardSize: 8, numColors: 6, timeLimit: 50 },   // Stage 2
      { boardSize: 8, numColors: 7, timeLimit: 50 },   // Stage 3
      { boardSize: 8, numColors: 8, timeLimit: 50 },   // Stage 4
      { boardSize: 9, numColors: 8, timeLimit: 50 },   // Stage 5
      { boardSize: 9, numColors: 9, timeLimit: 50 },   // Stage 6
      { boardSize: 10, numColors: 9, timeLimit: 50 },  // Stage 7
      { boardSize: 10, numColors: 10, timeLimit: 50 }  // Stage 8 (최대 10x10)
    ];
    
    this.currentStage = 1; // 기본값으로 1스테이지로 시작
    this.totalStages = 8;
    this.totalScore = 0;
    
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
    
    // 아이템 개수 (테스트용으로 모든 아이템 충분히 지급)
    // 아이템은 게임 전체에서 고정 수량으로 지급
    this.hammerCount = 10; // 테스트용으로 10개로 증가
    this.shuffleCount = 20; // 테스트용으로 20개로 증가
    this.timeCount = 20; // 테스트용으로 20개로 증가
    this.activeItem = null; // 현재 선택된 아이템
    
    this.colors = [
      'color-0', // 파스텔 핑크
      'color-1', // 파스텔 블루
      'color-2', // 파스텔 민트
      'color-3', // 파스텔 퍼플
      'color-4', // 파스텔 코랄
      'color-5', // 파스텔 옐로우
      'color-6', // 파스텔 라벤더
      'color-7', // 파스텔 그린
      'color-8', // 파스텔 오렌지
      'color-9'  // 파스텔 시안
    ];
    
    this.initializeEventListeners();
    this.initializeBoard();
    this.loadNickname();
    this.updateStageDisplay();
    this.updateItemDisplay();
    
    // 고유 플레이어 ID (로컬 1회 생성 후 유지)
    this.playerId = this.getOrCreatePlayerId();
    // 기본 리더보드 모드: 단판
    this.leaderboardMode = 'single';

    // 기존 사용자면 닉네임 입력을 읽기 전용으로 전환
    this.applyNicknameReadonlyState();
    // 보상광고 1회 제한(세션 기준)
    this.adRewardUsed = { hammer: false, shuffle: false, time: false };
  }
  
  initializeEventListeners() {
    this.nicknameSubmitBtn.addEventListener('click', () => this.submitNickname());
    this.nicknameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.submitNickname();
      }
    });
    this.startGameBtn.addEventListener('click', () => this.startGame());
    // reset 버튼은 삭제됨
    this.playAgainBtn.addEventListener('click', () => this.resetGame());
    this.nextStageBtn.addEventListener('click', async () => await this.nextStage());
    
    // 리더보드 탭 전환
    const tabs = document.querySelectorAll('.leaderboard-tabs .tab-btn');
    tabs.forEach((btn) => {
      btn.addEventListener('click', async () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.leaderboardMode = btn.dataset.mode; // 'single' | 'total'
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
          this.nickname = nickname;
          localStorage.setItem('colorTilesNickname', nickname);
          this.nicknameInput.readOnly = true;
          editBtn.textContent = '변경';
          await this.alertModal('완료', '닉네임이 변경되었습니다. 누적 데이터는 최신 닉네임으로 표시됩니다.');
        }
      });
    } else {
      console.error('닉네임 변경 버튼을 찾을 수 없음');
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
  
  initializeBoard() {
    this.gameBoard.innerHTML = '';
    this.board = [];
    
    // 게임 보드의 grid 크기 동적 설정
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
    this.gameBoard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
    
    // 전체 타일 수 계산 (약 62.5%의 타일 배치)
    const tilesPerColor = Math.floor(this.boardSize); // 각 색상당 타일 수
    const totalTiles = this.numColors * tilesPerColor;
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
        tilesToPlace.push(color);
      }
    }
    
    // 배열을 섞기 (Fisher-Yates shuffle)
    for (let i = tilesToPlace.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilesToPlace[i], tilesToPlace[j]] = [tilesToPlace[j], tilesToPlace[i]];
    }
    
    // 섞은 타일들을 랜덤 위치에 배치
    let tileIndex = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (tileIndex < totalTiles) {
          const randomRow = Math.floor(Math.random() * this.boardSize);
          const randomCol = Math.floor(Math.random() * this.boardSize);
          
          if (this.board[randomRow][randomCol].isEmpty) {
            this.board[randomRow][randomCol] = {
              color: tilesToPlace[tileIndex],
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
      } else {
        tile.classList.add(this.colors[cell.color]);
      }
    });
  }
  
  submitNickname() {
    const nickname = this.nicknameInput.value.trim();
    if (!nickname) {
      alert('닉네임을 입력해주세요!');
      return;
    }
    
    this.nickname = nickname;
    // localStorage에 닉네임 저장
    localStorage.setItem('colorTilesNickname', nickname);
    
    // 닉네임 모달 닫고 게임 방법 모달 열기
    this.nicknameModal.classList.add('hidden');
    this.instructionsModal.classList.remove('hidden');
  }
  
  loadNickname() {
    const saved = localStorage.getItem('colorTilesNickname');
    if (saved) {
      this.nickname = saved;
      this.nicknameInput.value = saved;
    }
  }
  
  startGame() {
    this.gameActive = true;
    this.score = 0;
    const stageConfig = this.stageConfigs[this.currentStage - 1];
    this.timeLeft = stageConfig.timeLimit;
    
    // 게임 시작 시에만 지급된 아이템으로 진행 (스테이지 간 리셋 없음)
    this.activeItem = null;
    
    this.updateDisplay();
    this.updateItemDisplay();
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
    // 아이템 재지급 (테스트용으로 모든 아이템 충분히 지급)
    this.hammerCount = 10; // 테스트용으로 10개로 증가
    this.shuffleCount = 20; // 테스트용으로 20개로 증가
    this.timeCount = 20; // 테스트용으로 20개로 증가
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
    this.scoreElement.textContent = this.score;
    this.timerElement.textContent = this.timeLeft;
    this.totalScoreElement.textContent = this.totalScore;
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
    
    // 총점에 현재 점수 추가 (스테이지 클리어 시에만)
    this.totalScore += this.score;
    
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
    
    if (allMatchedTiles.length > 0) {
      // 점수 추가
      this.score += allMatchedTiles.length;
      this.updateDisplay();
      
      // 매칭된 타일들을 즉시 isEmpty로 변경 (중복 클릭 방지)
      allMatchedTiles.forEach(({row: r, col: c}) => {
        this.board[r][c].isEmpty = true;
        this.board[r][c].color = null;
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
          // 망치가 없고 움직일 수도 없으면 게임 종료
          if (this.hammerCount === 0 && !this.hasValidMoves()) {
            await this.endGame('nomoves');
          }
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
    
    // 보드가 비어있으면 게임 종료
    if (this.isBoardEmpty()) {
      await this.endGame('clear');
    } else {
      // 망치가 없고 움직일 수도 없으면 게임 종료
      if (this.hammerCount === 0 && !this.hasValidMoves()) {
        await this.endGame('nomoves');
      }
    }
    
    return true;
  }
  
  // 리셋(셔플) 아이템 사용
  useShuffleItem() {
    if (!this.gameActive) return;
    if (this.shuffleCount === 0) return;
    
    // 현재 보드의 모든 타일 수집
    const tiles = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (!this.board[row][col].isEmpty) {
          tiles.push(this.board[row][col].color);
        }
      }
    }
    
    // 타일 섞기 (Fisher-Yates shuffle)
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    // 보드 초기화
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        this.board[row][col].isEmpty = true;
        this.board[row][col].color = null;
      }
    }
    
    // 섞은 타일들을 랜덤 위치에 재배치
    let tileIndex = 0;
    const positions = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        positions.push({ row, col });
      }
    }
    
    // 위치도 섞기
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // 타일 배치
    tiles.forEach((color, index) => {
      const pos = positions[index];
      this.board[pos.row][pos.col].color = color;
      this.board[pos.row][pos.col].isEmpty = false;
    });
    
    this.shuffleCount--;
    this.updateItemDisplay();
    this.renderBoard();
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
  
  // 리더보드 표시
  async displayLeaderboard() {
    const leaderboard = await this.getLeaderboard();
    const leaderboardList = document.getElementById('leaderboardList');
    
    // 누적/단판 모드별 데이터 구성
    let working = [...leaderboard];
    if (this.leaderboardMode === 'total') {
      const totals = new Map();
      const latestById = new Map(); // playerId별 최신 닉네임 결정(최근 timestamp 우선)
      working.forEach(e => {
        const key = e.playerId || 'legacy';
        totals.set(key, (totals.get(key) || 0) + (e.score || 0));
        // 최신 닉네임: timestamp가 큰 값을 선택
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
    
    // Top 3 렌더링
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