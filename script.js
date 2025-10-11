class ColorTilesGame {
  constructor() {
    this.boardSize = 10;
    this.numColors = 3;
    this.gameBoard = document.getElementById('gameBoard');
    this.scoreElement = document.getElementById('score');
    this.timerElement = document.getElementById('timer');
    this.startGameBtn = document.getElementById('startGameBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.playAgainBtn = document.getElementById('playAgainBtn');
    this.instructionsModal = document.getElementById('instructionsModal');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.finalScoreElement = document.getElementById('finalScore');
    
    this.board = [];
    this.score = 0;
    this.gameActive = false;
    
    this.colors = [
      'color-0', // 빨간색
      'color-1', // 파란색
      'color-2'  // 초록색
    ];
    
    this.initializeEventListeners();
    this.initializeBoard();
  }
  
  initializeEventListeners() {
    this.startGameBtn.addEventListener('click', () => this.startGame());
    this.resetBtn.addEventListener('click', () => this.resetGame());
    this.playAgainBtn.addEventListener('click', () => this.resetGame());
    
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
    
    // 전체 타일 수 계산 (8x8 = 64개)
    const totalTiles = 64;
    const boardCells = this.boardSize * this.boardSize; // 20x20 = 400개
    const emptySpaces = boardCells - totalTiles; // 336개의 빈 공간
    
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
    
    // 64개의 타일을 랜덤 위치에 배치
    let tilesPlaced = 0;
    while (tilesPlaced < totalTiles) {
      const row = Math.floor(Math.random() * this.boardSize);
      const col = Math.floor(Math.random() * this.boardSize);
      
      if (this.board[row][col].isEmpty) {
        this.board[row][col] = {
          color: Math.floor(Math.random() * this.numColors),
          isEmpty: false
        };
        tilesPlaced++;
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
  
  startGame() {
    this.gameActive = true;
    this.score = 0;
    this.updateDisplay();
    this.instructionsModal.classList.add('hidden');
  }
  
  resetGame() {
    this.gameActive = false;
    this.score = 0;
    this.updateDisplay();
    this.initializeBoard();
    this.gameOverModal.classList.add('hidden');
    this.instructionsModal.classList.remove('hidden');
  }
  
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      
      if (this.timeLeft <= 0) {
        this.endGame();
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
      // 타일들을 제거하고 점수 추가
      allMatchedTiles.forEach(({row: r, col: c}) => {
        this.board[r][c].isEmpty = true;
        this.board[r][c].color = null;
      });
      
      this.score += allMatchedTiles.length;
      this.updateDisplay();
      this.renderBoard();
      
      // 매칭 애니메이션과 연결선 표시
      this.animateMatchedTilesWithConnections(allMatchedTiles, row, col);
      
      // 보드가 비어있으면 게임 종료
      if (this.isBoardEmpty()) {
        this.endGame();
      }
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
  
  animateMatchedTilesWithConnections(matchedTiles, clickedRow, clickedCol) {
    // 먼저 연결선을 표시
    this.showConnectionLines(matchedTiles, clickedRow, clickedCol);
    
    // 잠시 후 타일들이 사라지는 애니메이션
    setTimeout(() => {
      matchedTiles.forEach(({row, col}) => {
        const tileIndex = row * this.boardSize + col;
        const tile = this.gameBoard.children[tileIndex];
        tile.classList.add('matched');
        
        setTimeout(() => {
          tile.classList.remove('matched');
        }, 300);
      });
    }, 500);
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
    
    // 500ms 후 연결선 제거
    setTimeout(() => {
      if (connectionOverlay.parentNode) {
        connectionOverlay.parentNode.removeChild(connectionOverlay);
      }
    }, 500);
  }
  
  handleWrongClick() {
    // 잘못된 클릭 애니메이션
    const tiles = this.gameBoard.querySelectorAll('.tile.empty');
    tiles.forEach(tile => {
      tile.classList.add('wrong-click');
      setTimeout(() => {
        tile.classList.remove('wrong-click');
      }, 500);
    });
  }
  
  endGame() {
    this.gameActive = false;
    this.finalScoreElement.textContent = this.score;
    this.gameOverModal.classList.remove('hidden');
  }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
  new ColorTilesGame();
});