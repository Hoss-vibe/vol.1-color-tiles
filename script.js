class ColorTilesGame {
  constructor() {
    // 스테이지 설정
    this.stageConfigs = [
      { boardSize: 8, numColors: 5, timeLimit: 50 }, // Stage 1
      { boardSize: 8, numColors: 6, timeLimit: 45 }, // Stage 2
      { boardSize: 10, numColors: 6, timeLimit: 40 }, // Stage 3
      { boardSize: 10, numColors: 7, timeLimit: 35 }  // Stage 4
    ];
    
    this.currentStage = 1;
    this.totalStages = 4;
    this.totalScore = 0;
    
    // 현재 스테이지 설정 적용
    this.boardSize = this.stageConfigs[0].boardSize;
    this.numColors = this.stageConfigs[0].numColors;
    
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
    this.resetBtn = document.getElementById('resetBtn');
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
    
    this.board = [];
    this.score = 0;
    this.timeLeft = 50;
    this.gameActive = false;
    this.timerInterval = null;
    this.nickname = '';
    
    this.colors = [
      'color-0', // 파스텔 핑크
      'color-1', // 파스텔 블루
      'color-2', // 파스텔 민트
      'color-3', // 파스텔 퍼플
      'color-4', // 파스텔 코랄
      'color-5', // 파스텔 옐로우
      'color-6'  // 파스텔 라벤더
    ];
    
    this.initializeEventListeners();
    this.initializeBoard();
    this.loadNickname();
    this.updateStageDisplay();
  }
  
  initializeEventListeners() {
    this.nicknameSubmitBtn.addEventListener('click', () => this.submitNickname());
    this.nicknameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.submitNickname();
      }
    });
    this.startGameBtn.addEventListener('click', () => this.startGame());
    this.resetBtn.addEventListener('click', () => this.resetGame());
    this.playAgainBtn.addEventListener('click', () => this.resetGame());
    this.nextStageBtn.addEventListener('click', () => this.nextStage());
    
    this.gameBoard.addEventListener('click', (e) => {
      if (!this.gameActive) return;
      
      const tile = e.target;
      if (!tile.classList.contains('tile')) return;
      
      const row = parseInt(tile.dataset.row);
      const col = parseInt(tile.dataset.col);
      
      this.handleTileClick(row, col);
    });
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
    this.updateDisplay();
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
    this.stopTimer();
    this.updateDisplay();
    this.updateStageDisplay();
    this.initializeBoard();
    this.gameOverModal.classList.add('hidden');
    this.stageClearModal.classList.add('hidden');
    this.nicknameModal.classList.remove('hidden');
  }
  
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      
      if (this.timeLeft <= 0) {
        this.endGame('timeout');
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
  
  nextStage() {
    if (this.currentStage >= this.totalStages) {
      // 모든 스테이지 클리어
      this.endGame('allclear');
      return;
    }
    
    this.currentStage++;
    const stageConfig = this.stageConfigs[this.currentStage - 1];
    this.boardSize = stageConfig.boardSize;
    this.numColors = stageConfig.numColors;
    this.timeLeft = stageConfig.timeLimit;
    this.score = 0;
    
    this.stageClearModal.classList.add('hidden');
    this.updateStageDisplay();
    this.updateDisplay();
    this.initializeBoard();
    this.startGame();
  }
  
  clearStage() {
    this.gameActive = false;
    this.stopTimer();
    
    // 총점에 현재 점수 추가
    this.totalScore += this.score;
    
    // 스테이지 클리어 모달 표시
    this.stageClearScoreElement.textContent = this.score;
    this.stageClearTotalScoreElement.textContent = this.totalScore;
    
    if (this.currentStage >= this.totalStages) {
      // 마지막 스테이지 클리어 - 게임 완료
      this.endGame('allclear');
    } else {
      // 다음 스테이지로
      this.stageClearModal.classList.remove('hidden');
    }
  }
  
  handleTileClick(row, col) {
    const cell = this.board[row][col];
    
    // 빈 공간이 아니면 잘못된 클릭
    if (!cell.isEmpty) {
      this.handleWrongClick();
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
      setTimeout(() => {
        this.renderBoard();
        
        // 보드가 비어있으면 게임 종료
        if (this.isBoardEmpty()) {
          this.endGame('clear');
        } else {
          // 더 이상 움직일 수 없는지 확인
          if (!this.hasValidMoves()) {
            this.endGame('nomoves');
          }
        }
      }, 300); // 애니메이션 300ms
    } else {
      this.handleWrongClick();
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
  
  handleWrongClick() {
    // 시간 3초 감점
    this.timeLeft = Math.max(0, this.timeLeft - 3);
    this.updateDisplay();
    
    // -3초 애니메이션 표시
    this.showTimePenalty();
    
    // 시간이 0이 되면 게임 종료
    if (this.timeLeft <= 0) {
      this.endGame('timeout');
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
  
  endGame(reason = 'timeout') {
    this.gameActive = false;
    this.stopTimer();
    
    // 'clear'인 경우 스테이지 클리어로 처리
    if (reason === 'clear') {
      this.clearStage();
      return;
    }
    
    // 총점에 현재 점수 추가
    this.totalScore += this.score;
    this.finalScoreElement.textContent = this.totalScore;
    
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
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
  new ColorTilesGame();
});