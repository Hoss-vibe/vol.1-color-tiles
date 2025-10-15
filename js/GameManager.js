class GameManager {
  constructor() {
    this.currentGameIndex = 0;
    this.games = ['colorTiles', 'memory'];
    this.gameInstances = {};
    
    // DOM 요소들
    this.homeScreen = document.getElementById('homeScreen');
    this.gameContainer = document.getElementById('gameContainer');
    this.memoryScreen = document.getElementById('memoryGame');
    this.sliderLeft = document.getElementById('sliderLeft');
    this.sliderRight = document.getElementById('sliderRight');
    this.gameCards = document.querySelectorAll('.game-card');
    
    this.initializeEventListeners();
    this.initializeGames();
  }

  // 게임 인스턴스 초기화
  initializeGames() {
    // ColorTilesGame은 별도로 초기화됨 (기존 로직 유지)
    this.gameInstances.memory = new MemoryGame();
  }

  // 이벤트 리스너 초기화
  initializeEventListeners() {
    // 슬라이더 네비게이션
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
      memoryRestartBtn.addEventListener('click', () => this.restartMemoryGame());
    }
  }

  // 홈화면 표시
  showHomeScreen() {
    this.homeScreen.classList.remove('hidden');
    this.gameContainer.classList.add('hidden');
    if (this.memoryScreen) this.memoryScreen.classList.add('hidden');
    this.updateGameSlider();
  }

  // 게임 슬라이더 업데이트
  updateGameSlider() {
    this.gameCards.forEach((card, index) => {
      if (index === this.currentGameIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // 다음 게임
  nextGame() {
    this.currentGameIndex = (this.currentGameIndex + 1) % this.games.length;
    this.updateGameSlider();
  }

  // 이전 게임
  previousGame() {
    this.currentGameIndex = (this.currentGameIndex - 1 + this.games.length) % this.games.length;
    this.updateGameSlider();
  }

  // 메모리 게임 표시
  showMemoryGame() {
    if (this.gameInstances.memory) {
      this.homeScreen.classList.add('hidden');
      this.gameContainer.classList.add('hidden');
      this.gameInstances.memory.showMemoryGame();
    }
  }

  // 메모리 게임 재시작
  restartMemoryGame() {
    if (this.gameInstances.memory) {
      this.gameInstances.memory.initMemoryGame();
    }
  }

  // 게임 전환 (현재는 사용하지 않음)
  switchToGame(gameType) {
    if (gameType === 'memory') {
      this.showMemoryGame();
    } else if (gameType === 'colorTiles') {
      this.showHomeScreen();
    }
  }
}

// ES6 모듈로 내보내기
export { GameManager };
