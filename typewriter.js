const phrases = ["Math is Easy", "Math is Fun", "Math is Interesting"];
let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
const typewriterText = document.getElementById("typewriter");

function typeLoop() {
  const currentPhrase = phrases[currentPhraseIndex];
  
  if (isDeleting) {
    typewriterText.textContent = currentPhrase.substring(0, currentCharIndex--);
  } else {
    typewriterText.textContent = currentPhrase.substring(0, currentCharIndex++);
  }

  if (!isDeleting && currentCharIndex === currentPhrase.length) {
    setTimeout(() => isDeleting = true, 1000); // Pause before deleting
  } else if (isDeleting && currentCharIndex === 0) {
    isDeleting = false;
    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
  }

  setTimeout(typeLoop, isDeleting ? 50 : 100);
}

document.addEventListener("DOMContentLoaded", typeLoop);

