async function fetchWalletData() {
    const walletAddress = document.getElementById("walletAddress").value;
    const etherscanApiKey = 'BUUSIYDAAS1AV785RPHFY1F378I59MBGKJ';

    // Validate wallet address
    if (!walletAddress) {
        document.getElementById("results").innerText = "Please enter a wallet address.";
        return;
    }

    // Fetch Ethereum balance
    try {
        const response = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${etherscanApiKey}`);
        const data = await response.json();

        if (data.status === "1") {
            const ethBalance = data.result / 1e18; // Convert from wei to ETH
            document.getElementById("results").innerHTML = `ETH Balance: ${ethBalance.toFixed(4)} ETH`;
        } else {
            document.getElementById("results").innerHTML = "Invalid wallet address or data unavailable.";
        }
    } catch (error) {
        document.getElementById("results").innerHTML = "Error fetching data. Please try again.";
    }
}
