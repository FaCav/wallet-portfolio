const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { symbol } = event.queryStringParameters;
    const coinMarketCapApiKey = '9506d3c4-9710-407b-80a4-53483ed84705'; // Replace with your API key

    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=USD`;

    const response = await fetch(url, {
        headers: {
            'X-CMC_PRO_API_KEY': coinMarketCapApiKey,
            'Accept': 'application/json'
        }
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
};
