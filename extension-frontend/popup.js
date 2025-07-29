class KrispCallGenerator {
    //static MAX_OTPS_TO_DISPLAY = 5;

    constructor() {
        this.pollingIntervals = new Map();
        this.countries = [];
        this.specialNumbers = {};
        this.allNumbers = [];
        this.isGenerating = false;
        this.isInitialized = false;
        this.otpInboxes = new Map();
        this.refreshIntervals = new Map();
        this.selectedCountryIndex = null;
        this.socket = null;
        this.otpStorage = new Map();
        this.resolveAllOtpsReceived = null;
        this.allOtpsProcessed = false;
        this.persistentOtpStorage = new Map();
        this.currentTab = "special";
        this.otpCache = new Map();
        this.otpProcessingQueue = new Map();
        this.filteredCountries = [];
    }

    async init() {
        try {
            await Promise.all([
                this.loadCountries(),
                // this.loadSpecialNumbers(),
                // this.loadFilteredCountries(),
            ]);

            this.setupCountrySearchBar();
            // this.setupSocketIO();
            this.cleanup(); // Clear any previous polling

            // Setup polling per special number
            this.allNumbers
                .filter(num => num.type === "special")
                .forEach(num => {
                    this.fetchAndDisplayAllOtps(num, num.id);
                    this.startPollingForNumber(num, num.id);
                });

            this.setupTabSwitching();
            this.renderRegularNumbers();
            this.isInitialized = true;
            this.setupFetchButton();
        } catch (error) {
            this.showError(`Initialization failed: ${error.message}`);
        }
    }

    setupTabSwitching() {
        const tabSpecial = document.getElementById("tab-special");
        const tabKrispCall = document.getElementById("tab-krispcall");
        const tabsToggle = document.getElementById("tabs-toggle");

        if (tabsToggle) {
            tabsToggle.style.display = "none";
        }

        const specialNumbersDiv = document.getElementById("special-numbers");
        const resultsDiv = document.getElementById("results");

        if (specialNumbersDiv) specialNumbersDiv.style.display = "none";
        if (resultsDiv) resultsDiv.style.display = "none";

        const addTabListener = (element, tabType) => {
            if (element) {
                element.addEventListener("click", () => {
                    this.switchToTab(tabType);
                });
            }
        };

        addTabListener(tabSpecial, "special");
        addTabListener(tabKrispCall, "regular");
    }

    switchToTab(tabType) {
        this.currentTab = tabType;
        const tabSpecial = document.getElementById("tab-special");
        const tabKrispCall = document.getElementById("tab-krispcall");
        const specialNumbersDiv = document.getElementById("special-numbers");
        const resultsDiv = document.getElementById("results");

        const isSpecialTab = tabType === "special";

        if (specialNumbersDiv) specialNumbersDiv.style.display = isSpecialTab ? "block" : "none";
        if (resultsDiv) resultsDiv.style.display = isSpecialTab ? "none" : "block";

        if (tabSpecial) tabSpecial.classList.toggle("active", isSpecialTab);
        if (tabKrispCall) tabKrispCall.classList.toggle("active", !isSpecialTab);

        // ✅ Manage polling based on tab
        if (isSpecialTab) {
            this.cleanup(); // Clear any previous polling

            // Setup polling per special number
            this.allNumbers
                .filter(num => num.type === "special")
                .forEach(num => {
                    this.fetchAndDisplayAllOtps(num, num.id);
                    this.startPollingForNumber(num, num.id);
                });
        } else {
            this.stopPollingForNumber(); // Stop polling when switching to "regular" tab
        }
    }


    async loadCountries() {
        try {
            const countries = await this.fetchCountriesFromAPI();
            if (!countries?.length) {
                throw new Error("Invalid or empty response from API");
            }
            this.countries = countries
                .map((country) => ({
                    name: country?.name?.common || "",
                    code: country?.cca2?.toLowerCase() || "",
                    flag: country?.flags?.png || "",
                    sp: country.sp || false,
                }))
                .filter((country) => country.name && country.code);
        } catch (error) {
            console.warn("Falling back to default country list:", error);
        }
    }

    async loadFilteredCountries() {
        try {
            const allSpecialRes = await fetch("https://freetoolsapi.krispcall.biz/all/number");
            const allSpecialData = await allSpecialRes.json();

            const specialCountryCodes = [
                ...new Set(
                    allSpecialData
                        .map(num => num.country_code?.toLowerCase())
                        .filter(Boolean)
                )
            ];

            const countriesRes = await fetch("countries.json");
            const countriesData = await countriesRes.json();
            const countries = countriesData.countries || countriesData;

            if (specialCountryCodes.length > 0) {
                this.filteredCountries = countries.filter(
                    (c) => c.cca2 && specialCountryCodes.includes(c.cca2.toLowerCase())
                );
            } else {
                this.filteredCountries = countries;
            }

        } catch (error) {
            console.log(error);
            console.error("Error loading filtered countries:", error);
            this.filteredCountries = [];
        }
    }

    async fetchCountriesFromAPI() {
        try {
            const response = await fetch("countries.json");
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const jsonData = await response.json();
            return jsonData.countries;
        } catch (error) {
            console.error("Error fetching countries:", error);
            return [];
        }
    }

    //   async loadSpecialNumbers() {
    //     try {
    //         const response = await fetch(`https://freetoolsapi.krispcall.biz/number/?country=${country}`);
    //         if (!response.ok) {
    //             throw new Error(`HTTP error: ${response.status}`);
    //         }
    //         const jsonData = await response.json();
    //         this.specialNumbers = jsonData.specialNumbers || {};
    //     } catch (error) {
    //         console.error("Error fetching special numbers:", error);
    //     }
    // }


    async setupCountrySearchBar() {
        const trigger = document.getElementById("country-dropdown-trigger");
        const dropdown = document.getElementById("country-dropdown");
        const searchInput = document.getElementById("dropdown-search");
        const optionsContainer = document.getElementById("country-options");
        const selected = document.getElementById("selected-country");

        const { code } = await chrome.storage.local.get('code');
        const defaultCountryCode = (code ? code.toUpperCase() : "US");


        const defaultCountry = this.countries.find(
            (c) => c.code.toUpperCase() === defaultCountryCode
        );
        if (defaultCountry) {
            selected.innerHTML = `
                  <img src="${defaultCountry.flag}" class="country-flag" />
                  ${defaultCountry.name} (${defaultCountry.code.toUpperCase()})
              `;
            this.selectedCountryIndex = this.countries.findIndex(
                (c) => c.code.toUpperCase() === defaultCountryCode
            );
            await this.generateNumbers();
        }

        const renderDropdown = (countryList) => {
            optionsContainer.innerHTML = "";

            if (!countryList.length) {
                optionsContainer.innerHTML = `<div class="dropdown-option">No country found</div>`;
                return;
            }

            const specialCountries = countryList.filter((c) => c.sp);
            const regularCountries = countryList
                .filter((c) => !c.sp)
                .sort((a, b) => a.name.localeCompare(b.name));

            const sortedCountries = [...specialCountries, ...regularCountries];

            sortedCountries.forEach((country) => {
                const option = document.createElement("div");
                option.className = "dropdown-option";
                option.innerHTML = `
                      <img src="${country.flag}" class="country-flag" />
                      ${country.name} (${country.code.toUpperCase()})
                  `;
                option.addEventListener("click", () => {
                    selected.innerHTML = `
                        <img src="${country.flag}" class="country-flag" />
                        ${country.name} (${country.code.toUpperCase()})
                      `;
                    this.selectedCountryIndex = this.countries.findIndex(
                        (c) => c.code === country.code
                    );
                    chrome.storage.local.set({ code: country.code });
                    dropdown.style.display = "none";
                    this.generateNumbers();
                });
                optionsContainer.appendChild(option);
            });
        };

        trigger.addEventListener("click", () => {
            dropdown.style.display =
                dropdown.style.display === "block" ? "none" : "block";
            searchInput.value = "";
            renderDropdown(this.countries);
            searchInput.focus();
        });

        searchInput.addEventListener("input", () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (!searchTerm) {
                renderDropdown(this.countries);
                return;
            }
            const matches = this.countries.filter((country) =>
                country.name.toLowerCase().includes(searchTerm)
            );
            renderDropdown(matches);
        });

        document.addEventListener("click", (e) => {
            if (
                !document.getElementById("country-search-container").contains(e.target)
            ) {
                dropdown.style.display = "none";
            }
        });
    }

    async generateNumbers() {
        if (this.isGenerating) {
            this.showWarning("Generation in progress...");
            return;
        }
        this.loadFilteredCountries();
        const { isValid, error } = this.validateInputs();
        if (!isValid) {
            this.showError(error);
            return;
        }

        this.isGenerating = true;
        try {
            this.allNumbers = [];

            this.otpCache.clear();
            for (const [number, otps] of this.persistentOtpStorage) {
                this.otpCache.set(number, [...otps]);
            }

            const { country } = this.getGenerationParameters();

            const apiNumbers = await this.fetchNumbersFromAPI(country.code);
            if (!apiNumbers?.length) {
                throw new Error("No phone numbers available");
            }

            const regularNumbers = apiNumbers.map((numberData) => ({
                number: numberData.phoneNumber || numberData.number || numberData,
                country: country.name,
                isPrivate: numberData.isPrivate || false,
                provider: numberData.provider || "KrispCall",
                expires: numberData.expires || null,
                id: this.generateId(),
                type: "regular",
            }));

            this.allNumbers.push(...regularNumbers);

            const specialNumbers = await this.generateSpecialNumbers(
                country.code,
                country.name
            );
            this.allNumbers.push(...specialNumbers);

            const tabsToggle = document.getElementById("tabs-toggle");
            if (tabsToggle) {
                tabsToggle.style.display = "flex";
            }

            this.renderNumbers();
            this.switchToTab("special");

            if (!this.allOtpsProcessed && this.allOtpsReceivedPromise) {
                await Promise.race([
                    this.allOtpsReceivedPromise,
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("OTP fetch timeout")), 5000)
                    ),
                ]).catch((err) => {
                    console.warn("OTP processing timeout or error:", err.message);
                    this.allOtpsProcessed = true;
                });
            }

            ///this.processQueuedOtps();
        } catch (error) {
            console.error("Generation error:", error);
        } finally {
            this.isGenerating = false;
        }
    }

    async generateSpecialNumbers(countryCode, countryName) {

        const specialNumbersRes = await fetch(`https://freetoolsapi.krispcall.biz/number/?country=${countryCode}`);
        const specialData = await specialNumbersRes.json();

        if (!Array.isArray(specialData) || specialData.length === 0) {
            console.log("No special numbers available for country:", countryCode);
            return [];
        }
        this.loadFilteredCountries();
        return specialData.map((num) => ({
            number: typeof num === "string" ? num : num.number || "Unknown Number",
            country: countryName,
            isPrivate: false,
            provider: "KrispCall Special",
            id: this.generateId(),
            type: 'special'
        }));

    }



    async fetchNumbersFromAPI(countryCode, showLoading = true) {
        const baseUrl = "https://freetoolsapi.krispcall.biz/number/api";
        const params = new URLSearchParams({ country: countryCode.toLowerCase() });
        const apiUrl = `${baseUrl}?${params.toString()}`;

        const loadingElement = document.getElementById("loading-spinner");
        if (loadingElement && showLoading) loadingElement.style.display = "block";

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "KrispCall-Generator/1.0",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    JSON.parse(errorText)?.message || `API request failed: ${response.status}`
                );
            }

            const data = await response.json();
            if (data.success === false) {
                throw new Error(data.message || "API error");
            }

            const numbers = data["Data"];
            if (!Array.isArray(numbers) || !numbers.length) {
                throw new Error("No phone numbers available");
            }

            return numbers;
        } catch (error) {
            console.error("Fetch numbers error:", error);
            throw error;
        } finally {
            if (loadingElement && showLoading) loadingElement.style.display = "none";
        }
    }

    renderNumbers() {
        this.renderRegularNumbers();
        this.renderSpecialNumbers();
    }

    renderRegularNumbers() {
        const container = this.getSafeElement("#numbers-container");
        const countElement = this.getSafeElement("#results-count");

        if (!container) {
            console.error("Regular numbers container not found");
            return;
        }

        const regularNumbers = this.allNumbers.filter(
            (num) => num.type === "regular"
        );

        container.innerHTML = "";
        if (countElement)
            countElement.textContent = `${regularNumbers.length} real numbers`;

        const reversedNumbers = [...regularNumbers].reverse();

        reversedNumbers.forEach((numberObj, index) => {
            const card = document.createElement("div");
            card.className = "number-card fade-in";
            card.style.animationDelay = `${index * 0.1}s`;
            card.setAttribute("data-type", "regular");

            const matchedCountry = this.countries.find(
                (c) =>
                    (c.code &&
                        numberObj.country &&
                        c.code.toLowerCase() === numberObj.country.toLowerCase()) ||
                    (c.name && numberObj.country && c.name === numberObj.country)
            );

            const countryFlag = matchedCountry
                ? `<img src="${matchedCountry.flag}" class="country-flag"  alt="${matchedCountry.code} flag" />`
                : "";

            card.innerHTML = numberObj.isPrivate
                ? `
                <div class="phone-row">
                  <div>
                    <div class="phone-number">Private Number</div>
                  </div>
                  <button class="copy-btn private-btn">Private</button>
                </div>
                <div class="inbox-section">
                  <a href="https://krispcall.com/manage" target="_blank" class="private-link">
                    🔒 Manage Private Numbers
                  </a>
                </div>`
                : `
                <div class="phone-row">
                  <div>
                  
                  <div class="same-row">
                     <div class="phone-number1">${countryFlag}${numberObj.number
                }</div>
                    ${numberObj.expires
                    ? `<div class="expires-info">Expires: ${new Date(
                        numberObj.expires
                    ).toLocaleDateString()}</div>`
                    : ""
                }
                        <div class="copy-icon number-copy" data-copy="${numberObj.number.replace(
                    /^\+\d+\s?/,
                    ""
                )}" data-message-id="copy-msg-${numberObj.id
                }" title="Copy Number">
                          <img src="icons/copy-icon.svg" class="copy-default" />
                          <img src="icons/hover-icon.svg" class="copy-hover" />
                          <img src="icons/click-icon.svg" class="copy-done" />
                          <span class="copy-text"></span>
                        </div>
                      </div>
                  
                  </div>
                  <div class="doubleBtn">
                    <a href="https://app.krispcall.com/register" target="_blank">
                      <button class="get-btn">Get</button>
                    </a>
                  </div>
                </div>
              `;

            container.appendChild(card);
        });
        this.setupCopyFunctionalities(container);
    }

    async renderSpecialNumbers() {
        const container = this.getSafeElement("#special-numbers-container");

        if (!container) {
            console.error("Special numbers container not found");
            return;
        }

        const specialNumbers = this.allNumbers.filter(num => num.type === "special");
        container.innerHTML = "";

        const realNumber = document.getElementById("real-num");

        if (specialNumbers.length === 0) {
            const noDataMessage = document.createElement("div");
            noDataMessage.className = "no-data-message";
            // If there are no special numbers, show the list of countries with special numbers
            // Always show if filteredCountries is available
            console.log("Filtered countries:", this.filteredCountries.length);
            if (this.filteredCountries.length > 0) {
                try {
                    const filteredCountries = this.filteredCountries || [];

                    noDataMessage.innerHTML = `
              <p class="no-special">SMS Inbox is not available for this country. You can get private numbers from KrispCall or choose one of the countries below.</p>
              <div class="special-countries-list">
                ${filteredCountries.map(country => `
                  <div class="no-special-country clickable-country" data-country-code="${country.cca2}">
                <img src="${country.flags?.png || country.flags?.svg}" class="country-flag"  alt="${country.cca2} flag" />
                <span class="no-data">${country.name.common} (${country.cca2.toUpperCase()})</span>
                  </div>`).join("")}
              </div>
            `;
                } catch (err) {
                    console.error("Error showing no-special-numbers countries:", err);
                    noDataMessage.textContent = "Failed to load country data.";
                }
            } else {
                noDataMessage.textContent = "SMS Inbox is not available for this country.";
            }
            try {
                const filteredCountries = this.filteredCountries || [];
                noDataMessage.innerHTML = `
              <p class="no-special">SMS Inbox is not available for this country. You can get private numbers from KrispCall or choose one of the countries below.</p>
              <div class="special-countries-list">
                ${filteredCountries.map(country => `
                  <div class="no-special-country clickable-country" data-country-code="${country.cca2}">
                    <img src="${country.flags?.png || country.flags?.svg}" class="country-flag"  alt="${country.cca2} flag" />
                    <span class="no-data">${country.name.common} (${country.cca2.toUpperCase()})</span>
                  </div>`).join("")}
              </div>
            `;
            } catch (err) {
                console.error("Error showing no-special-numbers countries:", err);
                noDataMessage.textContent = "Failed to load country data.";
            }

            container.appendChild(noDataMessage);

            document.querySelectorAll(".clickable-country").forEach(el => {
                el.addEventListener("click", () => {
                    const selectedCode = el.dataset.countryCode?.toUpperCase();
                    if (!selectedCode) return;

                    const country = this.countries.find(c => c.code.toUpperCase() === selectedCode);
                    if (!country) return;

                    const selected = document.getElementById("selected-country");
                    const dropdown = document.getElementById("country-dropdown");
                    const searchInput = document.getElementById("dropdown-search");

                    selected.innerHTML = `<img src="${country.flag}" class="country-flag" /> ${country.name} (${country.code.toUpperCase()})`;
                    this.selectedCountryIndex = this.countries.findIndex(c => c.code.toUpperCase() === selectedCode);
                    if (searchInput) searchInput.value = country.name;
                    if (dropdown) dropdown.style.display = "none";

                    if (typeof this.generateNumbers === "function") {
                        this.generateNumbers();
                    } else {
                        console.error("this.generateNumbers is not a function!");
                    }
                });
            });

            if (realNumber) realNumber.classList.add("show");
            return;
        } else {
            if (realNumber) realNumber.classList.remove("show");
        }

        const reversedSpecialNumbers = [...specialNumbers].reverse();

        reversedSpecialNumbers.forEach((numberObj, index) => {
            const card = document.createElement("div");
            card.className = "number-card fade-in";
            card.style.animationDelay = `${index * 0.1}s`;
            card.setAttribute("data-type", "special");

            const uniqueId = numberObj.id;

            const matchedCountry = this.filteredCountries.find(
                (c) => c.name.common === numberObj.country
            );

            const countryHTML = matchedCountry
                ? `<img src="${matchedCountry.flags.png || matchedCountry.flags.svg}" class="country-flag" alt="${matchedCountry.cca2} flag" />`
                : "";

            card.innerHTML = `
          <div class="phone-row">
            <div>
              <div class="same-row">
                <div class="phone-number1">
                  ${countryHTML}
                  ${numberObj.number}
                </div>
                <div class="copy-icon number-copy" data-copy="${numberObj.number.replace(/^\+\d+\s?/, "")}" data-message-id="copy-msg-${numberObj.id}" title="Copy Number">
                  <img src="icons/copy-icon.svg" class="copy-default" />
                  <img src="icons/hover-icon.svg" class="copy-hover" />
                  <img src="icons/click-icon.svg" class="copy-done" />
                  <span class="copy-text"></span>
                </div>
              </div>
            </div>
            <button class="generate-otp-btn" data-toggle="${uniqueId}" title="Show OTPs">
              Inbox
              <svg width="10" height="10" class="drop" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.83528 3.0739C8.04449 2.86469 8.38389 2.86469 8.5931 3.0739C8.8023 3.2831 8.8023 3.6225 8.5931 3.83171L5.37889 7.04591C5.16969 7.25512 4.83028 7.25512 4.62108 7.04591L1.40687 3.83171L1.37011 3.7909C1.19854 3.58049 1.21076 3.27001 1.40687 3.0739C1.60299 2.87778 1.91347 2.86556 2.12388 3.03713L2.16469 3.0739L4.99999 5.90919L7.83528 3.0739Z" fill="#4D4950"/>
              </svg>
            </button>
          </div>
          <div id="otp-${uniqueId}" class="options-panel">
            <div id="otp-inbox-${uniqueId}" class="otp-inbox">
              <div class="empty-inbox">No OTP Yet</div>
            </div>
          </div>
        `;

            container.appendChild(card);

            const otpButton = card.querySelector(".generate-otp-btn");
            const otpPanel = card.querySelector(`#otp-${uniqueId}`);

            otpButton.addEventListener("click", async () => {
                otpButton.classList.toggle("active");
                card.classList.toggle("active");
                otpPanel.classList.toggle("show");

                const normalizedNumber = numberObj.number.replace(/^\+|\s/g, "");

                if (otpPanel.classList.contains("show")) {
                    // Opened: fetch and start polling
                    await this.fetchAndDisplayAllOtps(numberObj, uniqueId);
                    this.startPollingForNumber(numberObj, uniqueId);
                } else {
                    // Closed: stop polling
                    this.stopPollingForNumber(uniqueId);
                }
            });

            // Load cached OTPs if available
            const normalizedNumber = numberObj.number.replace(/^\+|\s/g, "");
            if (this.otpCache.has(normalizedNumber)) {
                const cachedOtps = this.otpCache.get(normalizedNumber);
                cachedOtps.sort((a, b) => new Date(b.parsedTimestamp) - new Date(a.parsedTimestamp));
                cachedOtps
                    .slice(0, KrispCallGenerator.MAX_OTPS_TO_DISPLAY)
                    .forEach((otp) => {
                        this.addOtpToNumber(uniqueId, otp);
                    });
                this.otpCache.delete(normalizedNumber);
            }
        });

        this.setupCopyFunctionalities(container);
    }


    setupCopyFunctionalities(container) {
        const copyMessage = document.getElementById("copy-message");

        container.querySelectorAll(".copy-icon").forEach((icon) => {
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);
        });

        container.querySelectorAll(".copy-icon").forEach((icon) => {
            icon.addEventListener("click", (e) => {
                e.stopPropagation();
                const textToCopy = icon.getAttribute("data-copy");
                this.handleCopyClick(icon, textToCopy, copyMessage);
            });
        });
    }



    // Fetch and render all OTPs for a number
    async fetchAndDisplayAllOtps(numberObj, uniqueId) {
        const inboxContainer = this.getSafeElement(`#otp-inbox-${uniqueId}`);
        if (!inboxContainer) return;

        inboxContainer.dataset.loaded = "loading";
        inboxContainer.innerHTML = `<div class="otp-loading">Loading messages...</div>`;

        try {
            const apiUrl = `https://freetoolsapi.krispcall.biz/inbox/?number=${encodeURIComponent(numberObj.number)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const apiMessages = await response.json();

            inboxContainer.innerHTML = '';
            inboxContainer.dataset.loaded = "true";

            if (!Array.isArray(apiMessages) || apiMessages.length === 0) {
                inboxContainer.innerHTML = `<div class="empty-inbox">No OTP Yet</div>`;
                return;
            }

            const allOtpData = apiMessages.map(msg => ({
                text: msg.messages,
                code: this.extractOtpCode(msg.messages),
                parsedTimestamp: msg.time_stamp,
                fromNumber: msg.from_number
            })).sort((a, b) => new Date(b.parsedTimestamp) - new Date(a.parsedTimestamp));

            const normalizedNumber = numberObj.number.replace(/^[+\s]/g, "");
            this.persistentOtpStorage.set(normalizedNumber, allOtpData.slice(0, KrispCallGenerator.MAX_OTPS_TO_DISPLAY));

            allOtpData.forEach(otp => this.addOtpToNumber(uniqueId, otp, { prepend: false }));

        } catch (error) {
            console.error("Error fetching all OTPs:", error);
            inboxContainer.innerHTML = `<div class="otp-error">No Messages Available <div>`;
            delete inboxContainer.dataset.loaded;
        }
    }

    // Start polling for a specific number
    startPollingForNumber(numberObj, uniqueId) {
        if (this.pollingIntervals.has(uniqueId)) return;

        const intervalId = setInterval(async () => {
            try {
                const normalizedNumber = numberObj.number.replace(/^[+\s]/g, "");
                const storedOtps = this.persistentOtpStorage.get(normalizedNumber) || [];
                const lastTimestamp = storedOtps.length > 0 ? storedOtps[0].parsedTimestamp : new Date(0).toISOString();

                const apiUrl = `https://freetoolsapi.krispcall.biz/inbox/new/?number=${encodeURIComponent(numberObj.number)}&since=${encodeURIComponent(lastTimestamp)}`;

                const res = await fetch(apiUrl);
                if (res.status === 204 || !res.ok) return;

                const newApiMessages = await res.json();
                if (!Array.isArray(newApiMessages) || newApiMessages.length === 0) return;

                newApiMessages.sort((a, b) => new Date(b.time_stamp) - new Date(a.time_stamp));

                const updatedStored = [...newApiMessages.map(msg => ({
                    text: msg.messages,
                    code: this.extractOtpCode(msg.messages),
                    parsedTimestamp: msg.time_stamp,
                    fromNumber: msg.from_number
                })), ...storedOtps].slice();

                this.persistentOtpStorage.set(normalizedNumber, updatedStored);

                updatedStored.forEach((otp, i) => {
                    if (i < newApiMessages.length) {
                        this.addOtpToNumber(uniqueId, otp);
                    }
                });

            } catch (err) {
                // Silent fail on network errors
            }
        }, 7000);

        this.pollingIntervals.set(uniqueId, intervalId);
    }

    // Stop polling for a specific number
    stopPollingForNumber(uniqueId) {
        if (this.pollingIntervals.has(uniqueId)) {
            clearInterval(this.pollingIntervals.get(uniqueId));
            this.pollingIntervals.delete(uniqueId);
        }
    }

    // Cleanup all polling intervals
    cleanup() {

        this.pollingIntervals.forEach(interval => clearInterval(interval));
        this.pollingIntervals.clear();
    }

    // Add OTP to inbox visually
    addOtpToNumber(numberId, otp, { prepend = true } = {}) {
        const { text, code, parsedTimestamp } = otp;
        const otpInbox = this.getSafeElement(`#otp-inbox-${numberId}`);
        if (!otpInbox) return;

        const alreadyExists = Array.from(otpInbox.children).some((child) =>
            child.getAttribute("data-timestamp") === parsedTimestamp
        );
        if (alreadyExists) return;

        const emptyInbox = otpInbox.querySelector(".empty-inbox");
        if (emptyInbox) emptyInbox.remove();

        const timeAgo = (timestamp) => {
            const now = new Date();
            const past = new Date(timestamp);
            const diff = Math.floor((now - past) / 1000);
            if (diff < 5) return "just now";
            if (diff < 60) return `${diff}s ago`;
            const mins = Math.floor(diff / 60);
            if (mins < 60) return `${mins}m ago`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}h ago`;
            return past.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' +
                past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        };

        const otpMessage = document.createElement("div");
        otpMessage.className = "otp-message fade-in";
        otpMessage.setAttribute("data-timestamp", parsedTimestamp);
        otpMessage.innerHTML = `
        <div class="otp-element">
            <span class="otp-time" data-timestamp="${parsedTimestamp}">${timeAgo(parsedTimestamp)}</span>
            <div class="copy-icon otp-copy copy-icon number-copy" data-copy="${code}" title="Copy OTP">
                <img src="icons/copy-icon.svg" class="copy-default" />
                <img src="icons/hover-icon.svg" class="copy-hover" />
                <img src="icons/click-icon.svg" class="copy-done" />
                <span class="copy-text"></span>
            </div>
        </div>
        <div class="otp-text">${text}</div>
    `;

        if (prepend) {
            otpInbox.prepend(otpMessage);
        } else {
            otpInbox.appendChild(otpMessage);
        }

        while (otpInbox.children.length > KrispCallGenerator.MAX_OTPS_TO_DISPLAY) {
            otpInbox.removeChild(otpInbox.lastChild);
        }

        this.setupCopyFunctionality(otpInbox);
    }


    // Add copy functionality to new elements
    setupCopyFunctionality(container) {
        const buttons = container.querySelectorAll(".otp-copy");
        buttons.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const copyText = btn.dataset.copy;
                navigator.clipboard.writeText(copyText);
                btn.classList.add("copied");
                setTimeout(() => btn.classList.remove("copied"), 2000);
            };
        });
    }

    handleCopyClick(element, value, copyMessageElement) {
        navigator.clipboard
            .writeText(value)
            .then(() => {
                element.classList.add("copied");

                if (copyMessageElement) {
                    copyMessageElement.classList.add("show");
                    setTimeout(() => {
                        element.classList.remove("copied");
                        copyMessageElement.classList.remove("show");
                    }, 2000);
                }
            })
            .catch((err) => {
                console.error("Copy error:", err);
            });
    }

    extractOtpCode(text) {
        const matches = text.match(/\b\d{4,8}\b/g);
        return matches ? matches[0] : "N/A";
    }


    validateInputs() {
        if (
            this.selectedCountryIndex === null ||
            isNaN(this.selectedCountryIndex) ||
            this.selectedCountryIndex < 0 ||
            this.selectedCountryIndex >= this.countries.length
        ) {
            return { isValid: false, error: "Please select a valid country" };
        }
        return { isValid: true };
    }

    getGenerationParameters() {
        const country = this.countries[this.selectedCountryIndex];
        return { country };
    }

    setupFetchButton() {
        const fetchBtn = document.getElementById("fetchBtn");
        if (!fetchBtn) return;

        const svg = fetchBtn.querySelector("svg");
        let lastFetchTime = 0;
        const cooldown = 2000;

        fetchBtn.addEventListener("click", async () => {
            const now = Date.now();
            if (now - lastFetchTime < cooldown) {
                this.showCustomAlert("Please wait a moment before refreshing again.", "error", 3000);
                return;
            }

            lastFetchTime = now;
            const country = this.countries[this.selectedCountryIndex] || { code: "US" };

            fetchBtn.classList.add("disabled");
            svg.classList.add("rotating");

            try {
                const numbers = await this.fetchNumbersFromAPI(country.code, false);

                this.allNumbers = this.allNumbers.filter(num => num.type !== "regular");

                const regularNumbers = numbers.map(numberData => ({
                    number: numberData.phoneNumber || numberData.number || numberData,
                    country: country.name,
                    isPrivate: numberData.isPrivate || false,
                    provider: numberData.provider || "KrispCall",
                    expires: numberData.expires || null,
                    id: this.generateId(),
                    type: "regular",
                }));

                this.allNumbers.push(...regularNumbers);
                this.renderRegularNumbers();
            } catch (error) {
                this.showError("Unable to fetch numbers.");
            } finally {
                fetchBtn.classList.remove("disabled");
                svg.classList.remove("rotating");
            }
        });
    }


    copyToClipboard(text, button) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                const originalText = button.textContent;
                button.textContent = "Copied!";
                button.classList.add("copied");
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove("copied");
                }, 2000);
            })
            .catch((err) => {
                console.error("Clipboard error:", err);
                button.textContent = "Error";
                setTimeout(() => (button.textContent = "Copy"), 2000);
            });
    }

    setLoadingState(isLoading) {
        const button = this.getSafeElement("#generate");
        const buttonText = this.getSafeElement("#generate-text");

        if (button) button.disabled = isLoading;
        if (buttonText) buttonText.innerHTML = isLoading
            ? "Generating Number...</span>"
            : "Generate Number";
    }

    showError(message) {
        console.error("Error:", message);
        this.showCustomAlert(message, "error");
    }

    showWarning(message) {
        console.warn("Warning:", message);
        this.showCustomAlert(message, "warning");
    }

    showCustomAlert(message, type, duration) {
        const alertBox = document.createElement("div");
        alertBox.className = `custom-alert custom-alert-${type}`;
        alertBox.innerHTML = `
        <span>${message}</span>
        <button class="alert-close-btn">×</button>
        `;

        const closeBtn = alertBox.querySelector(".alert-close-btn");
        const closeAlert = () => alertBox.remove();

        if (closeBtn) closeBtn.addEventListener("click", closeAlert);

        document.body.appendChild(alertBox);

        if (typeof duration === "number" && duration >= 1000) {
            const autoClose = setTimeout(() => {
                closeAlert();
            }, duration);

            if (closeBtn) closeBtn.addEventListener("click", () => clearTimeout(autoClose));
        }
    }

    getSafeElement(selector) {
        return document.querySelector(selector);
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    cleanup() {
        this.refreshIntervals.forEach((interval) => clearInterval(interval));
        this.refreshIntervals.clear();
        if (this.socket) this.socket.disconnect();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const generator = new KrispCallGenerator();
    generator.init();
    window.krispCallGenerator = generator;
});

window.addEventListener("beforeunload", () => {
    if (window.krispCallGenerator) {
        window.krispCallGenerator.cleanup();
    }
});



