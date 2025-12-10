document.addEventListener("DOMContentLoaded", function () {
  // -----------------------------
  // Contact Modal + Form Handling
  // -----------------------------
  document.addEventListener("click", function (e) {
    // --- Open Modal ---
    if (e.target && e.target.id === "openModalBtn") {
      const modal = document.getElementById("contactModal");
      if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // scroll disable
      }
    }

    // --- Close Modal via X ---
    if (e.target && e.target.classList.contains("close")) {
      const modal = e.target.closest(".modal");
      if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // scroll enable
      }
    }

    // --- Mobile Dropdown Toggle ---
    if (e.target && e.target.closest(".has-dropdown > a")) {
      const parent = e.target.closest(".has-dropdown");
      if (window.innerWidth <= 768) {
        e.preventDefault();
        parent.classList.toggle("active");
      }
    }
  });

  // --- Close Modal by clicking outside ---
  window.addEventListener("click", function (e) {
    const modal = document.getElementById("contactModal");
    if (modal && e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }

    const awardsModal = document.getElementById("awardsModal");
    if (awardsModal && e.target === awardsModal) {
      awardsModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // --- Close Modal by pressing ESC ---
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modal = document.getElementById("contactModal");
      const awardsModal = document.getElementById("awardsModal");

      if (modal && modal.style.display === "block") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }

      if (awardsModal && awardsModal.style.display === "block") {
        awardsModal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    }
  });

  // -----------------------------
  // Contact Form Submission
  // -----------------------------
    document.addEventListener("submit", function (e) {
        const form = e.target;
        if (form && form.closest("#contactModal")) {
            e.preventDefault();

            const data = new FormData(form);

            fetch(form.action, {
                method: "POST",
                body: data,
                credentials: "same-origin"
            })
                .then(response => response.text())
                .then(text => {
                    // Show success or error
                    alert(text);

                    if (text.toLowerCase().includes("thank")) {
                        // Close modal and reset
                        const modal = document.getElementById("contactModal");
                        if (modal) {
                            modal.style.display = "none";
                            document.body.style.overflow = "auto";
                        }
                        form.reset();
                    }
                })
                .catch(error => {
                    alert("Something went wrong. Please try again later.");
                    console.error(error);
                });
        }
    });
});

document.getElementById("contactForm").addEventListener("submit", async function (e) {
    const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // Stop default submit behavior

        const form = e.target;
        const formData = new FormData(form);

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        const contactResult = document.getElementById("contactResult");
        if (contactResult) {
            contactResult.style.display = "block";
            if (result.success) {
                contactResult.innerHTML = "✅ Email sent successfully!";
                form.reset();
            } else {
                contactResult.innerHTML = "❌ Failed: " + result.message;
            }
        }
    });
}

});
