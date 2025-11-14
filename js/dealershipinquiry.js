const countryDropdown = document.getElementById("country");
const stateDropdown = document.getElementById("state");

// Fetch countries and states from API
fetch("https://countriesnow.space/api/v0.1/countries/states")
    .then(response => response.json())
    .then(data => {
        countryDropdown.innerHTML = '<option value="">Select Country</option>';
        data.data.forEach(country => {
            const opt = document.createElement("option");
            opt.value = country.name;
            opt.textContent = country.name;
            countryDropdown.appendChild(opt);
        });
    })
    .catch(err => {
        console.error("Error fetching countries:", err);
        countryDropdown.innerHTML = '<option value="">Error loading countries</option>';
    });

// Populate states dynamically when a country is selected
countryDropdown.addEventListener("change", function () {
    const selectedCountry = this.value;
    stateDropdown.innerHTML = '<option value="">Loading states...</option>';

    fetch("https://countriesnow.space/api/v0.1/countries/states")
        .then(response => response.json())
        .then(data => {
            const country = data.data.find(c => c.name === selectedCountry);
            if (country && country.states.length > 0) {
                stateDropdown.innerHTML = '<option value="">Select State</option>';
                country.states.forEach(state => {
                    const opt = document.createElement("option");
                    opt.value = state.name;
                    opt.textContent = state.name;
                    stateDropdown.appendChild(opt);
                });
            } else {
                stateDropdown.innerHTML = '<option value="">No states found</option>';
            }
        })
        .catch(err => {
            console.error("Error fetching states:", err);
            stateDropdown.innerHTML = '<option value="">Error loading states</option>';
        });
});
