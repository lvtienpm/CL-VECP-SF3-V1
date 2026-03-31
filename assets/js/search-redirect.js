document.addEventListener("DOMContentLoaded", () => {
    console.log("Search redirect script loaded.");

    // Helper function to perform search redirect
    const performSearch = (query) => {
        if (query && query.trim() !== "") {
            const safeQuery = encodeURIComponent(query.trim());
            const targetUrl = `search.html?q=${safeQuery}`;
            console.log("Redirecting to:", targetUrl);
            window.location.href = targetUrl;
        } else {
            console.warn("Empty search query. No redirect.");
        }
    };

    // Handle click on search icons/buttons (Event Delegation)
    document.addEventListener("click", (event) => {
        // Target search buttons or elements acting as search triggers
        const searchBtn = event.target.closest(".search-full .btn, .search-box .btn, .search-full button, .search-box button");
        
        if (searchBtn) {
            // Check if this button is part of an input-group
            const inputGroup = searchBtn.closest(".input-group");
            if (inputGroup) {
                const searchInput = inputGroup.querySelector("input");
                if (searchInput) {
                    event.preventDefault();
                    console.log("Search button clicked. Query:", searchInput.value);
                    performSearch(searchInput.value);
                }
            }
        }
    });

    // Handle "Enter" keypress on search inputs
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const target = event.target;
            // Check if the focused element or its parent is a search trigger
            if (target && (target.classList.contains("search-type") || 
                           target.closest(".search-box") || 
                           target.closest(".search-full") ||
                           target.type === "search")) {
                
                // Only trigger if it's an input field
                if (target.tagName === "INPUT") {
                    event.preventDefault();
                    console.log("Enter key pressed. Query:", target.value);
                    performSearch(target.value);
                }
            }
        }
    });

    // Handle initial load for the Search Results Page (search.html)
    if (window.location.pathname.includes("search.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const activeQuery = urlParams.get('q');
        
        if (activeQuery) {
            console.log("Pre-filling search for query:", activeQuery);
            const searchFieldSelectors = [
                ".search-box input",
                ".search-type",
                "input[type='search']",
                ".search-full input"
            ];
            
            const resultsPageInputs = document.querySelectorAll(searchFieldSelectors.join(", "));
            resultsPageInputs.forEach(input => {
                input.value = activeQuery;
            });
        }
    }
});
