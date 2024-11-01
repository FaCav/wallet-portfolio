const coinMarketCapApiKey = '9506d3c4-9710-407b-80a4-53483ed84705'; // Replace with your actual API key
async function fetchWalletData() {
    const walletAddress = document.getElementById("walletAddress").value;
    const etherscanApiKey = 'UIPWN6MEKBY2PNNN2TGKMMR6AJFF4Z7WZ6'; // Your Etherscan API key

    if (!walletAddress) {
        document.getElementById("results").innerText = "Please enter a wallet address.";
        return;
    }

    document.getElementById("results").innerHTML = "Loading...";

    try {
        // Fetch ETH balance
        const ethResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${etherscanApiKey}`);
        const ethData = await ethResponse.json();
        console.log("ETH Data:", ethData); // Log ETH data

        let ethBalance = 0;
        if (ethData.status === "1") {
            ethBalance = ethData.result / 1e18; // Convert from wei to ETH
        }

        // Fetch ERC-20 token transactions
        const tokenResponse = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`);
        const tokenData = await tokenResponse.json();
        console.log("Token Data:", tokenData); // Log token data

        let tokenBalances = {};
        if (tokenData.status === "1") {
            tokenData.result.forEach(tx => {
                const tokenSymbol = tx.tokenSymbol;
                const tokenDecimal = tx.tokenDecimal;
                const tokenValue = parseFloat(tx.value) / Math.pow(10, tokenDecimal);

                if (!tokenSymbol.includes("LP") && !tokenSymbol.includes("UNI-V2")) {
                    if (!tokenBalances[tokenSymbol]) {
                        tokenBalances[tokenSymbol] = {
                            balance: 0,
                            tokenAddress: tx.contractAddress,
                            network: 'ethereum' // Assuming tokens are on Ethereum
                        };
                    }
                    tokenBalances[tokenSymbol].balance += tokenValue;
                }
            });
        }

        // Log token balances
        console.log("Token Balances:", tokenBalances);

        // Store all tokens for filtering
        allTokens = tokenBalances;

        // Fetch token prices and calculate total values
        let totalValue = ethBalance; // Start with ETH balance
        let tokenHTML = "";

        for (const [symbol, info] of Object.entries(allTokens)) {
            const tokenPriceResponse = await fetch(`/.netlify/getTokenPrice?symbol=${symbol}&convert=USD`); {
                headers: {
                    'X-CMC_PRO_API_KEY': coinMarketCapApiKey, // Use your CoinMarketCap API key
                    'Accept': 'application/json'
                }
            });
            const priceData = await tokenPriceResponse.json();
            console.log("Price Data for", symbol, ":", priceData); // Log price data

            const tokenPrice = priceData.data[symbol] ? priceData.data[symbol].quote.USD.price : 0;
            const tokenValue = info.balance * tokenPrice;

            // Only include tokens with a total value greater than $10
            if (tokenValue > 10) {
                totalValue += tokenValue;
                tokenHTML += `<li>${info.balance.toFixed(4)} ${symbol} ($${tokenPrice.toFixed(2)} each) - Total: $${tokenValue.toFixed(2)}</li>`;
            }
        }

        // Display results
        let resultHTML = `<h2>Wallet: ${walletAddress}</h2>`;
        resultHTML += `<p><strong>ETH Balance:</strong> ${ethBalance.toFixed(4)} ETH</p>`;
        resultHTML += `<p><strong>Total Wallet Value:</strong> $${totalValue.toFixed(2)}</p>`;
        resultHTML += `<h3>ERC-20 Tokens:</h3><ul>${tokenHTML}</ul>`;

        document.getElementById("results").innerHTML = resultHTML;

    } catch (error) {
        document.getElementById("results").innerHTML = "Error fetching data. Please try again.";
        console.error("Error:", error);
    }
}

