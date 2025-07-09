const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");

const POYNT_BASE_URL = "https://services.poynt.net";
// const POYNT_BASE_URL ="https://services-emu.poynt.net"
const POYNT_TOKEN_URL = `${POYNT_BASE_URL}/token`;

async function getMerchantAccessToken() {
  try {
    let privateKey = process.env.POYNT_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
    const applicationId = process.env.POYNT_APPLICATION_ID?.trim();
    const businessId = process.env.POYNT_BUSINESS_ID?.trim();

    if (!privateKey || !applicationId || !businessId) {
      throw new Error("Missing required environment variables");
    }

    const correctedAppId = applicationId.startsWith('urn:aid:') ? applicationId : `urn:aid:${applicationId}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: correctedAppId,
      sub: businessId,
      aud: POYNT_BASE_URL,
      iat: currentTime,
      exp: currentTime + 3600,
    };

    let jwtToken = jwt.sign(jwtPayload, privateKey, { algorithm: "RS256" });

    const params = new URLSearchParams();
    params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
    params.append("assertion", jwtToken);

    const tokenResponse = await axios.post(
      POYNT_TOKEN_URL,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    return tokenResponse.data.access_token;
  } catch (error) {
    throw error;
  }
}

exports.chargeCard = async (req, res) => {
  const { nonce, amount, currency } = req.body;

  if (!nonce || !amount || !currency) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: nonce, amount, or currency"
    });
  }

  try {
    const accessToken = await getMerchantAccessToken();
    const businessId = process.env.POYNT_BUSINESS_ID?.trim();
    
    const tokenizeUrl = `${POYNT_BASE_URL}/businesses/${businessId}/cards/tokenize`;
    const tokenResponse = await axios.post(
      tokenizeUrl,
      { nonce },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (tokenResponse.data.status === 'INVALID') {
      throw new Error("Card tokenization failed - invalid card");
    }

    const chargeUrl = `${POYNT_BASE_URL}/businesses/${businessId}/cards/tokenize/charge`;
    const chargePayload = {
      action: "SALE",
      context: {
        businessId: businessId,
        storeId: businessId,
        storeDeviceId: `urn:tid:${businessId}`,
      },
      amounts: {
        transactionAmount: Math.round(parseFloat(amount) * 100),
        orderAmount: Math.round(parseFloat(amount) * 100),
        currency: currency === "$" ? "USD" : currency,
      },
      fundingSource: {
        cardToken: tokenResponse.data.paymentToken || tokenResponse.data.token,
      },
      emailReceipt: true,
      receiptEmailAddress: req.body.email || "test@example.com"
    };

    const chargeResponse = await axios.post(
      chargeUrl,
      chargePayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ 
      success: true, 
      data: chargeResponse.data,
      transactionId: chargeResponse.data.id,
      status: chargeResponse.data.status,
      environment: "PRODUCTION"
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: "Payment failed",
      details: error.response?.data || error.message,
      environment: "PRODUCTION"
    });
  }
};


exports.testProductionJWT = async (req, res) => {
  try {
    const accessToken = await getMerchantAccessToken();
    res.json({ 
      success: true, 
      hasToken: !!accessToken,
      environment: "PRODUCTION",
      message: "Production environment ready for testing"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      environment: "PRODUCTION"
    });
  }
};
