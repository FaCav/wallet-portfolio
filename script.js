async function fetchWalletData() {
    const walletAddress = document.getElementById("walletAddress").value;
    const etherscanApiKey = 'UIPWN6MEKBY2PNNN2TGKMMR6AJFF4Z7WZ6';

    if (!walletAddress) {
        document.getElementById("results").innerText = "Please enter a wallet address.";
        return;
    }

    document.getElementById("results").innerHTML = "Loading...";

    try {
        // Fetch ETH balance
        const ethResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${etherscanApiKey}`);
        const ethData = await ethResponse.json();
        console.log("ETH Data:", ethData); // Debugging

        let ethBalance = 0;
        if (ethData.status === "1") {
            ethBalance = ethData.result / 1e18; // Convert from wei to ETH
        } else {
            throw new Error("Failed to fetch ETH balance");
        }

        // Fetch ERC-20 token transactions
        const tokenResponse = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`);
        const tokenData = await tokenResponse.json();
        console.log("Token Data:", tokenData); // Debugging

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
                            tokenAddress: tx.contractAddress
                        };
                    }
                    tokenBalances[tokenSymbol].balance += tokenValue;
                }
            });
        } else {
            throw new Error("Failed to fetch ERC-20 token transactions");
        }

        // Fetch token prices and calculate total values
        let totalValue = ethBalance; // Start with ETH balance
        let tokenHTML = "";

        for (const [symbol, info] of Object.entries(tokenBalances)) {
            try {
                const corsProxy = 'https://cors-anywhere.herokuapp.com/';
                const tokenPriceResponse = await fetch(`${corsProxy}https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${info.tokenAddress}&vs_currencies=usd`);
                const priceData = await tokenPriceResponse.json();
                console.log("Price Data:", priceData); // Debugging

                const tokenPrice = priceData[info.tokenAddress.toLowerCase()] ? priceData[info.tokenAddress.toLowerCase()].usd : 0;
                const tokenValue = info.balance * tokenPrice;
                totalValue += tokenValue;

                tokenHTML += `<li>${info.balance.toFixed(4)} ${symbol} ($${tokenPrice.toFixed(2)} each) - Total: $${tokenValue.toFixed(2)}</li>`;
            } catch (priceError) {
                console.error("Error fetching price data for token:", symbol, priceError);
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
