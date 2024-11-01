let allTokens = [];
let currentNetwork = 'ethereum';

async function fetchWalletData() {
    const walletAddress = document.getElementById("walletAddress").value;
    const etherscanApiKey = 'YOUR_ETHERSCAN_API_KEY';

    if (!walletAddress) {
        document.getElementById("results").innerText = "Please enter a wallet address.";
        return;
    }

    document.getElementById("results").innerHTML = "Loading...";

    try {
        // Fetch ETH balance
        const ethResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${etherscanApiKey}`);
        const ethData = await ethResponse.json();

        let ethBalance = 0;
        if (ethData.status === "1") {
            ethBalance = ethData.result / 1e18; // Convert from wei to ETH
        }

        // Fetch ERC-20 token transactions
        const tokenResponse = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`);
        const tokenData = await tokenResponse.json();

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

        // Store all tokens for filtering
        allTokens = tokenBalances;

        // Fetch token prices and calculate total values
        let totalValue = ethBalance; // Start with ETH balance
        let tokenHTML = "";

        for (const [symbol, info] of Object.entries(allTokens)) {
            const corsProxy = 'https://thingproxy.freeboard.io/fetch/';
            const tokenPriceResponse = await fetch(`${corsProxy}https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${info.tokenAddress}&vs_currencies=usd`);
            const priceData = await tokenPriceResponse.json();

            const tokenPrice = priceData[info.tokenAddress.toLowerCase()] ? priceData[info.tokenAddress.toLowerCase()].usd : 0;
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

function filterTokens(network) {
    currentNetwork = network; // Update current network
    const filteredTokens = Object.entries(allTokens).filter(([symbol, info]) => info.network === currentNetwork);
    
    // Filter and display tokens only if the total value is greater than $10
    const filteredHTML = filteredTokens.map(([symbol, info]) => {
        const tokenValue = info.balance * (priceData[info.tokenAddress.toLowerCase()] ? priceData[info.tokenAddress.toLowerCase()].usd : 0);
        return tokenValue > 10 ? `<li>${info.balance.toFixed(4)} ${symbol} - Total: $${tokenValue.toFixed(2)}</li>` : '';
    }).join('');
    
    document.getElementById("results").innerHTML = `<h3>Filtered Tokens on ${network.charAt(0).toUpperCase() + network.slice(1)}:</h3><ul>${filteredHTML}</ul>`;
}
