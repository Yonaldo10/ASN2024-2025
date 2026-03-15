const slides = document.querySelector('.slides');
const dots = document.querySelectorAll('.dot');
let currentIndex = 0;
let slideInterval;

function showSlide(index) {
  if(index < 0) index = dots.length - 1;
  if(index >= dots.length) index = 0;

  slides.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach(dot => dot.style.opacity = '0.4');
  dots[index].style.opacity = '0.9';
  currentIndex = index;
}

function startSlideShow() {
  slideInterval = setInterval(() => {
    showSlide(currentIndex + 1);
  }, 7000);
}

function resetSlideShow() {
  clearInterval(slideInterval);
  startSlideShow();
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    showSlide(parseInt(dot.dataset.index));
    resetSlideShow(); // reset timer au clic sur une pastille
  });
});

showSlide(0);
startSlideShow();
