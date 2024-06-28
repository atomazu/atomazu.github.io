function handleScrollAnimation() {
  const elements = document.querySelectorAll('.fade-scroll:not(.fade-in)');
  
  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    
    if (elementTop < window.innerHeight && elementBottom > 0) {
      console.log('Element entering viewport:', element);
      void element.offsetWidth;
      element.classList.add('fade-in');
      console.log('Added fade-in class:', element);
    }
  });
}

window.addEventListener('scroll', handleScrollAnimation);
window.addEventListener('load', () => {
  console.log('Page loaded, running handleScrollAnimation');
  handleScrollAnimation();
});