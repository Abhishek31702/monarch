document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".s-home__slide");
  const homeSection = document.querySelector("#home");
  const nextBtn = document.querySelector(".s-home__arrow-next");
  const prevBtn = document.querySelector(".s-home__arrow-prev");

  let currentIndex = 0;

  // Function to update slide + background
  function updateSlide() {
    // Hide all slides
    slides.forEach(slide => (slide.style.display = "none"));

    // Show current slide
    slides[currentIndex].style.display = "block";

    // Change background
    const bgImage = slides[currentIndex].getAttribute("data-bg");
    homeSection.style.backgroundImage = `url('${bgImage}')`;
  }

  // Initialize first slide
  updateSlide();

  // Next button
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
  });

  // Previous button
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide();
  });
});
