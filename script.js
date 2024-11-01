async function fetchWalletData() {
    const walletAddress = document.getElementById("walletAddress").value;
    const coinMarketCapApiKey = '9506d3c4-9710-407b-80a4-53483ed84705'; // Replace with your CoinMarketCap API key

    if (!walletAddress) {
        document.getElementById("results").innerText = "Please enter a wallet address.";
        return;
    }

    document.getElementById("results").innerHTML = "Loading...";

    try {
        // Fetch ETH balance from Etherscan
        const etherscanApiKey = 'UIPWN6MEKBY2PNNN2TGKMMR6AJFF4Z7WZ6'; // Replace with your Etherscan API key
        const ethResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${etherscanApiKey}`);
        const ethData = await ethResponse.json();

        let ethBalance = 0;
        if (ethData.status === "1") {
            ethBalance = ethData.result / 1e18; // Convert from wei to ETH
        }

        // Fetch token balances from Etherscan
        const tokenResponse = await fetch(`https://api.etherscan.io/api?module=account&action=tokenlist&address=${walletAddress}&apikey=${etherscanApiKey}`);
        const tokenData = await tokenResponse.json();

        let tokenBalances = {};
        if (tokenData.status === "1") {
            tokenData.result.forEach(token => {
                const tokenSymbol = token.symbol;
                const tokenBalance = parseFloat(token.balance) / Math.pow(10, token.decimals);
                
                if (tokenBalance > 0) {
                    tokenBalances[tokenSymbol] = {
                        balance: tokenBalance,
                        tokenAddress: token.contractAddress
                    };
                }
            });
        }

        // Calculate total value for ETH and tokens
        let totalValue = ethBalance; // Start with ETH balance
        let tokenHTML = "";

        for (const [symbol, info] of Object.entries(tokenBalances)) {
            // Fetch token price from CoinMarketCap
            const tokenPriceResponse = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&CMC_PRO_API_KEY=${coinMarketCapApiKey}`);
            const priceData = await tokenPriceResponse.json();

            const tokenPrice = priceData.data[symbol] ? priceData.data[symbol].quote.USD.price : 0; // Get the token price in USD
            const tokenValue = info.balance * tokenPrice;

            // Only include tokens with a total value greater than $10
            if (tokenValue > 10) {
                totalValue += tokenValue;
                tokenHTML += `<li>${info.balance.toFixed(4)} ${symbol} - Price: $${tokenPrice.toFixed(2)} - Total: $${tokenValue.toFixed(2)}</li>`;
            }
        }

        // Display results
        let resultHTML = `<h2>Wallet: ${walletAddress}</h2>`;
        resultHTML += `<p><strong>ETH Balance:</strong> ${ethBalance.toFixed(4)} ETH</p>`;
        resultHTML += `<p><strong>Total Wallet Value:</strong> $${totalValue.toFixed(2)}</p>`;
        resultHTML += `<h3>Tokens:</h3><ul>${tokenHTML}</ul>`;

        document.getElementById("results").innerHTML = resultHTML;

    } catch (error) {
        document.getElementById("results").innerHTML = "Error fetching data. Please try again.";
        console.error("Error:", error);
    }
}
