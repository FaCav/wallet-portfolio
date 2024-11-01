async function fetchWalletData() {
    const walletAddress = document.getElementById("walletAddress").value;
    const etherscanApiKey = 'BUUSIYDAAS1AV785RPHFY1F378I59MBGKJ';

    if (!walletAddress) {
        document.getElementById("results").innerText = "Please enter a wallet address.";
        return;
    }

    // Clear previous results
    document.getElementById("results").innerHTML = "Loading...";

    try {
        // Fetch ETH balance
        const ethResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${etherscanApiKey}`);
        const ethData = await ethResponse.json();

        let ethBalance = "Unavailable";
        if (ethData.status === "1") {
            ethBalance = (ethData.result / 1e18).toFixed(4) + " ETH"; // Convert from wei to ETH
        }

        // Fetch ERC-20 token balances
        const tokenResponse = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`);
        const tokenData = await tokenResponse.json();

        // Process token balances
        let tokenBalances = {};
        if (tokenData.status === "1") {
            tokenData.result.forEach(tx => {
                const tokenSymbol = tx.tokenSymbol;
                const tokenDecimal = tx.tokenDecimal;
                const tokenValue = parseFloat(tx.value) / Math.pow(10, tokenDecimal);

                if (!tokenBalances[tokenSymbol]) {
                    tokenBalances[tokenSymbol] = tokenValue;
                } else {
                    tokenBalances[tokenSymbol] += tokenValue;
                }
            });
        }

        // Display results
        let resultHTML = `<h2>Wallet: ${walletAddress}</h2>`;
        resultHTML += `<p><strong>ETH Balance:</strong> ${ethBalance}</p>`;

        resultHTML += `<h3>ERC-20 Tokens:</h3>`;
        if (Object.keys(tokenBalances).length > 0) {
            resultHTML += "<ul>";
            for (const [symbol, balance] of Object.entries(tokenBalances)) {
                resultHTML += `<li>${balance.toFixed(4)} ${symbol}</li>`;
            }
            resultHTML += "</ul>";
        } else {
            resultHTML += `<p>No ERC-20 tokens found for this address.</p>`;
        }

        document.getElementById("results").innerHTML = resultHTML;

    } catch (error) {
        document.getElementById("results").innerHTML = "Error fetching data. Please try again.";
        console.error("Error:", error);
    }
}
