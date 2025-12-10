// customerinquiry.js - Complete implementation matching dealership form

document.addEventListener('DOMContentLoaded', function () {
    console.log('customerinquiry.js loaded');

    const form = document.querySelector('.inquiry-form[action="SaveCustomerInquiry.aspx"]');
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');
    const countryDropdown = document.getElementById('country');
    const stateDropdown = document.getElementById('state');
    const phoneInput = document.getElementById('phone');

    // Check if customer inquiry form exists on page
    if (!form || !countryDropdown || !stateDropdown) {
        console.log('Customer inquiry form not found on this page - skipping initialization');
        return;
    }

    let countriesData = [];
    let isSubmitting = false; // Add submission flag to prevent duplicates

    // Load countries
    loadCountries();

    // Phone number formatting (XXX-XXX-XXXX)
    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 6) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else {
                value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
            }
        }
        e.target.value = value;
    });

    function loadCountries() {
        countryDropdown.innerHTML = '<option value="">Loading countries...</option>';

        fetch("https://countriesnow.space/api/v0.1/countries/states")
            .then(response => response.json())
            .then(data => {
                countriesData = data.data;
                countryDropdown.innerHTML = '<option value="">Select Country</option>';

                const sortedCountries = data.data.sort((a, b) => a.name.localeCompare(b.name));

                sortedCountries.forEach(country => {
                    const opt = document.createElement("option");
                    opt.value = country.name;
                    opt.textContent = country.name;
                    countryDropdown.appendChild(opt);
                });
            })
            .catch(err => {
                console.error("Error fetching countries:", err);
                countryDropdown.innerHTML = '<option value="">Error loading countries</option>';
                showError('Failed to load countries. Please refresh the page.');
            });
    }

    // Populate states based on selected country
    countryDropdown.addEventListener("change", function () {
        const selectedCountry = this.value;
        if (!selectedCountry) {
            stateDropdown.innerHTML = '<option value="">Select a country first</option>';
            return;
        }

        const country = countriesData.find(c => c.name === selectedCountry);
        stateDropdown.innerHTML = '<option value="">Loading states...</option>';

        if (country && country.states.length > 0) {
            stateDropdown.innerHTML = '<option value="">Select State</option>';

            const sortedStates = country.states.sort((a, b) => a.name.localeCompare(b.name));

            sortedStates.forEach(state => {
                const opt = document.createElement("option");
                opt.value = state.name;
                opt.textContent = state.name;
                stateDropdown.appendChild(opt);
            });
        } else {
            stateDropdown.innerHTML = '<option value="">No states available</option>';
        }
    });

    // Form submit - WITH DUPLICATE PREVENTION
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Prevent multiple submissions
        if (isSubmitting) {
            console.log('Already submitting, ignoring duplicate submission');
            return;
        }

        console.log('Form submit triggered');

        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';

        if (!validateForm()) {
            showError('Please fill all required fields correctly.');
            return;
        }

        // Validate phone number
        const phone = phoneInput.value.replace(/\D/g, '');
        if (phone.length < 10) {
            showError('Please enter a valid 10-digit phone number.');
            phoneInput.focus();
            return;
        }

        // Validate email
        const emailInput = document.getElementById('email');
        if (!isValidEmail(emailInput.value)) {
            showError('Please enter a valid email address.');
            emailInput.focus();
            return;
        }

        // Validate at least one product is selected (optional - remove if not needed)
        const videoProducts = form.querySelectorAll('input[name="videoProducts"]:checked');
        const broadcastProducts = form.querySelectorAll('input[name="broadcastProducts"]:checked');

        // Uncomment below if you want to require at least one product selection
        // if (videoProducts.length === 0 && broadcastProducts.length === 0) {
        //     showError('Please select at least one product (Video or Broadcast).');
        //     return;
        // }

        console.log('All validation passed, submitting form...');
        submitForm();
    });

    function validateForm() {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                return; // Skip checkboxes for now, handled separately
            }

            if (!input.value.trim()) {
                input.classList.add('error-field');
                isValid = false;
            } else {
                input.classList.remove('error-field');
            }
        });

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function submitForm() {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        isSubmitting = true; // Set flag
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        console.log('Sending data to SaveCustomerInquiry.aspx');

        fetch('SaveCustomerInquiry.aspx', {
            method: 'POST',
            body: formData
        })
            .then(res => {
                console.log('Response received:', res.status);
                return res.text();
            })
            .then(result => {
                console.log('Response text:', result);
                result = result.trim();

                if (result === 'SUCCESS') {
                    showSuccess('Form submitted successfully! We will contact you soon.');
                    form.reset();
                    stateDropdown.innerHTML = '<option value="">Select a country first</option>';
                } else if (result.startsWith('ERROR:')) {
                    showError(result.replace('ERROR:', '').trim());
                } else if (result.includes('SUCCESS')) {
                    // Sometimes the response might have extra whitespace or HTML
                    showSuccess('Form submitted successfully! We will contact you soon.');
                    form.reset();
                    stateDropdown.innerHTML = '<option value="">Select a country first</option>';
                } else {
                    console.error('Unexpected response:', result);
                    showError('An error occurred. Please try again. Response: ' + result.substring(0, 100));
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                showError('Network error. Please try again.');
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                isSubmitting = false; // Reset flag
            });
    }

    function showSuccess(message) {
        successMsg.textContent = message;
        successMsg.style.display = 'block';
        setTimeout(() => successMsg.style.display = 'none', 5000);
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        setTimeout(() => errorMsg.style.display = 'none', 5000);
    }

    // Remove error highlight on input
    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', function () {
            this.classList.remove('error-field');
        });
        field.addEventListener('change', function () {
            this.classList.remove('error-field');
        });
    });

});