document.addEventListener('DOMContentLoaded', () => {
  const isWelcomePage = document.getElementById('welcome-page');
  if (isWelcomePage) {
    const welcomeMusic = document.getElementById('welcome-music');
    welcomeMusic.loop = true;

    // Try autoplay
    welcomeMusic.play().catch(() => {
      // Fallback: wait for click
      document.addEventListener('click', () => {
        welcomeMusic.play();
      }, { once: true });
    });

    // Handle "Enter" button
    const enterBtn = document.getElementById('enter-btn');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        welcomeMusic.pause();
        welcomeMusic.currentTime = 0;
        window.location.href = 'timer.html';
      });
    }
  }



  // ✅ All your other shared JS code continues below...


  // Typing effect
  const greetingText = "WELCOME";
  const greetingElement = document.getElementById('greeting-text');
  if (greetingElement) {
    let charIndex = 0;
    function typeGreeting() {
      if (charIndex < greetingText.length) {
        greetingElement.textContent += greetingText.charAt(charIndex);
        charIndex++;
        setTimeout(typeGreeting, 120);
      }
    }
    greetingElement.textContent = '';
    typeGreeting();
  }

  // Mascot wave toggling
  const mascot = document.getElementById('mascot');
  if (mascot) {
    const images = [
      'assets/mascot-hi.jpeg',
      'assets/mascot2.jpeg'
    ];
    images.forEach(src => new Image().src = src);
    let currentIndex = 0;
    setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      mascot.src = images[currentIndex];
    }, 1000);
  }

  // Timer logic
  const timerElement = document.getElementById('timer');
  const sessionLabel = document.getElementById('session-label');
  const sessionCountElement = document.getElementById('session-count');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const motivationBox = document.getElementById('motivation-box');
  const catMascot = document.getElementById("cat-mascot");
  const emotionMascot = document.getElementById("emotion-mascot");

  const quitModal = document.getElementById("quit-modal");
  const confirmQuit = document.getElementById("confirm-quit");
  const cancelQuit = document.getElementById("cancel-quit");
  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverMessage = document.getElementById("game-over-message");
  const timerContainer = document.querySelector(".timer-container");

  let WORK_DURATION = 25 * 60;
  const SHORT_BREAK_DURATION = 5 * 60;
  const LONG_BREAK_DURATION = 15 * 60;

  let pauseTriggered = false;

  const focusDurationSelect = document.getElementById('focus-duration');
  if (focusDurationSelect) {
    focusDurationSelect.addEventListener('change', () => {
      const selectedMinutes = parseInt(focusDurationSelect.value);
      WORK_DURATION = selectedMinutes * 60;
      if (sessionType === 'work' && !isRunning) {
        timer = WORK_DURATION;
        updateDisplay();
      }
    });
  }

  let timer = WORK_DURATION;
  let isRunning = false;
  let timerInterval = null;
  let sessionType = 'work';
  let sessionCount = 1;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateDisplay() {
    timerElement.textContent = formatTime(timer);
    sessionLabel.textContent = sessionType === 'work' ? 'Work' :
                               sessionType === 'short_break' ? 'Short Break' : 'Long Break';
    sessionCountElement.textContent = `Session: ${sessionCount} `;
  }

  function switchSession() {
    if (sessionType === 'work') {
      if (sessionCount < 4) {
        sessionType = 'short_break';
        timer = SHORT_BREAK_DURATION;
      } else {
        sessionType = 'long_break';
        timer = LONG_BREAK_DURATION;
      }
    } else {
      sessionType = 'work';
      sessionCount = sessionType === 'long_break' ? 1 : sessionCount + 1;
      timer = WORK_DURATION;
    }
    updateDisplay();
    updateMascots();
  }

  function startTimer() {
    if (isRunning) return;
    startBtn.textContent = 'Start';
    if (timer <= 0) switchSession();
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    catMascot.style.display = 'block';
    emotionMascot.style.display = 'none';

    timerInterval = setInterval(() => {
      timer--;
      updateDisplay();

      if (timer > 0 && timer % 60 === 0 && Math.floor(timer / 60) % 5 === 0) {
        const blip = new Audio('assets/blip.mp3');
        blip.play();
        const messages = [
          "You're doing great!",
          "Keep pushing!",
          "5 minutes down, you got this!",
          "Focus mode: activated.",
          "Stay sharp, stay strong!"
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        typeMessage(message, motivationBox);
      }

      if (timer <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        switchSession();
        startTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = 'Resume';
    catMascot.style.display = 'none';
    emotionMascot.src = 'assets/mascot-annoyed.png';
    emotionMascot.style.display = 'block';
    pauseTriggered = true;

    // Show quit popup
    quitModal.classList.remove("hidden");
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timer = sessionType === 'work' ? WORK_DURATION :
            sessionType === 'short_break' ? SHORT_BREAK_DURATION : LONG_BREAK_DURATION;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    pauseTriggered = false;
  }

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);

  cancelQuit.addEventListener("click", () => {
    quitModal.classList.add("hidden");
  });

  confirmQuit.addEventListener("click", () => {
    quitModal.classList.add("hidden");
    timerContainer.classList.add("hidden");
    clearInterval(timerInterval);
    isRunning = false;
    showGameOverScreen();
  });

  function showGameOverScreen() {
    const messages = [
      "You quit. Weakness is a choice. 💀",
      "Discipline > Motivation. Guess you had neither. 💀",
      "Dreams don’t work unless you do. So, guess your dreams are dead. 💀",
      "You had one job. Now you have one regret. 💀",
      "Pain is temporary. Quitting is forever. Enjoy your forever. 💀",
      "Quitting? Classic loser move. 💀",
      "You gave up? Imagine telling that to your future self. 💀",
      "Losers quit when they're tired. You must be exhausted. 💀",
      "You stopped because it was hard. That’s why you’ll stay average. 💀"
    ];
  
    const message = messages[Math.floor(Math.random() * messages.length)];
  
    gameOverScreen.classList.remove("hidden");
    gameOverMessage.textContent = '';
    
    let i = 0;
  const typeSound = new Audio('assets/blip.mp3');
  typeSound.loop = true;
  typeSound.volume = 0.3; // Optional: lower the volume
  typeSound.play();

  const typingInterval = setInterval(() => {
    if (i < message.length) {
      gameOverMessage.textContent += message.charAt(i);
      i++;
    } else {
      clearInterval(typingInterval);
      typeSound.pause();             // ⛔ Stop the sound
      typeSound.currentTime = 0;     // ⏪ Reset to beginning
    }
  }, 60);
    
  }
  

  updateDisplay();

  const catStates = ["assets/cat-resting.png", "assets/cat-tailup.png"];
  let catIndex = 0;
  function toggleCatState() {
    catIndex = 1 - catIndex;
    if (catMascot) catMascot.src = catStates[catIndex];
  }
  setInterval(toggleCatState, 1000);

  function typeMessage(message, element, delay = 50) {
    element.textContent = '';
    let index = 0;
    element.style.display = 'block';
  
    const typeSound = new Audio('assets/blip.mp3');
    typeSound.loop = true;
    typeSound.volume = 0.3;  // Optional: lower volume if needed
    typeSound.play();
  
    const interval = setInterval(() => {
      if (index < message.length) {
        element.textContent += message.charAt(index);
        index++;
      } else {
        clearInterval(interval);
        typeSound.pause();
        typeSound.currentTime = 0;
        setTimeout(() => {
          element.style.display = 'none';
        }, 10000);
      }
    }, delay);
  }
  

  function updateMascots() {
    if (!catMascot || !emotionMascot) return;
    if (sessionType === 'work') {
      catMascot.style.display = 'block';
      emotionMascot.style.display = 'none';
    } else {
      catMascot.style.display = 'none';
      const emotions = ["assets/mascot-annoyed.png", "assets/mascot-crying.png"];
      emotionMascot.src = emotions[Math.floor(Math.random() * emotions.length)];
      emotionMascot.style.display = 'block';
    }
  }
});
