const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;
const PAYU_MODE = process.env.PAYU_MODE || "test"; // "test" or "live"

const PAYU_BASE_URL =
  PAYU_MODE === "live"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";

const sha512 = (input) =>
  crypto.createHash("sha512").update(input).digest("hex");

// Build a callback URL the WebView (running on the same device the client is on)
// can reach. We intentionally derive from req — that's the host the client just
// used, so the WebView running on the same device can use it too.
const buildCallbackUrl = (req, type) => {
  const proto = req.get("x-forwarded-proto") || req.protocol;
  const host = req.get("host");
  return `${proto}://${host}/api/payment/payu/callback?type=${type}`;
};

// POST /api/payment/payu/initiate
// Body: { amount, productinfo, firstname, email, phone }
// Returns: form params + action URL so the client can POST to PayU
router.post("/payu/initiate", (req, res) => {
  try {
    const { amount, productinfo, firstname, email, phone } = req.body;

    if (!amount || !productinfo || !firstname || !email || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "amount, productinfo, firstname, email, phone are all required",
      });
    }

    if (!PAYU_KEY || !PAYU_SALT) {
      return res
        .status(500)
        .json({ success: false, message: "PayU credentials not configured" });
    }

    const txnid = "txn_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    const amountStr = Number(amount).toFixed(2);

    const surl = buildCallbackUrl(req, "success");
    const furl = buildCallbackUrl(req, "failure");

    const hashString = `${PAYU_KEY}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = sha512(hashString);

    res.json({
      success: true,
      action: PAYU_BASE_URL,
      params: {
        key: PAYU_KEY,
        txnid,
        amount: amountStr,
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
        service_provider: "payu_paisa",
      },
    });
  } catch (err) {
    console.error("PayU initiate error:", err);
    res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
});

// POST /api/payment/payu/callback
// PayU posts the payment result here (surl / furl). We render a tiny HTML
// page that forwards the full body to the React Native WebView via
// window.ReactNativeWebView.postMessage. The RN side then calls
// /payu/verify with this same body to confirm the hash server-side.
//
// Must accept x-www-form-urlencoded — PayU sends form-encoded bodies.
router.post(
  "/payu/callback",
  express.urlencoded({ extended: true }),
  (req, res) => {
    const type = (req.query.type || "failure").toString();
    const payload = { type, ...req.body };
    const json = JSON.stringify(payload).replace(/</g, "\\u003c");

    res.set("Content-Type", "text/html");
    res.send(`<!doctype html>
<html><body>
<script>
  (function () {
    var data = ${json};
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  })();
</script>
<p>Processing payment result…</p>
</body></html>`);
  }
);

// POST /api/payment/payu/verify
// Body: full PayU response payload (txnid, amount, productinfo, firstname,
// email, status, hash, mihpayid, ...)
// Recomputes response hash to confirm authenticity.
router.post("/payu/verify", (req, res) => {
  try {
    const {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash: receivedHash,
      mihpayid,
    } = req.body;

    if (!txnid || !amount || !status || !receivedHash) {
      return res.status(400).json({
        success: false,
        message: "Missing required PayU response fields",
      });
    }

    const hashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
    const expectedHash = sha512(hashString);

    if (expectedHash !== receivedHash) {
      console.warn("PayU hash mismatch", { txnid, status });
      return res.json({
        success: false,
        message: "Payment verification failed (hash mismatch)",
      });
    }

    if (status === "success") {
      return res.json({
        success: true,
        message: "Payment verified successfully",
        txnid,
        mihpayid,
      });
    }

    return res.json({
      success: false,
      message: `Payment ${status}`,
      txnid,
      status,
    });
  } catch (err) {
    console.error("PayU verify error:", err);
    res.status(500).json({ success: false, message: "Verification error" });
  }
});

module.exports = router;
