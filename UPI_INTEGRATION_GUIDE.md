# 📱 KrishiConnect UPI Auto-Verification Guide (FreePay Engine)

Yeh guide safe rakhi gayi hai taaki aap jab chahein UPI auto-verification setup dekh aur test kar sakein.

---

## 🔗 Live Webhook Endpoints
Aapke domain `https://www.phantomstack.me` par dono endpoints active hain:

1. **Standard Endpoint:**
   ```text
   https://www.phantomstack.me/api/v1/payments/upi/webhook
   ```
2. **Direct FreePay Compatibility Endpoint:**
   ```text
   https://www.phantomstack.me/webhook/payment
   ```

*Supported HTTP Method:* `POST`  
*Supported Formats:* JSON, Form-data, ya Raw text (Backend regex se automatically transaction reference identify kar leta hai).

---

## 📲 Saved Android Apps & Setup

### App Option 1: NotifyHook (Sabse Aasan - Recommended)
* **Download:** Google Play Store se **"NotifyHook: Forward to Webhook"**
* **Setup (1 Minute):**
  1. Open karein aur **Notification Access** Allow karein.
  2. `+` Rule banayein.
  3. **Select Apps:** Google Pay aur PhonePe tick karein.
  4. **Webhook URL:** `https://www.phantomstack.me/api/v1/payments/upi/webhook`
  5. **Save** dabayein. Done!

---

### App Option 2: MacroDroid
* **Download:** Google Play Store se **"MacroDroid"**
* **Setup:**
  1. **Trigger:** Device Events ➔ Notification ➔ Notification Received ➔ Select *Google Pay* / *PhonePe*.
  2. **Action:** Web Interactions ➔ HTTP Request
     * Method: `POST`
     * URL: `https://www.phantomstack.me/api/v1/payments/upi/webhook`
     * Content Type: `application/json`
     * Body Content:
       ```json
       {
         "note": "[notification]",
         "app": "com.google.android.apps.nbu.paisa.user"
       }
       ```
  3. Save & ON.

---

### App Option 3: Official GpayReader Open-Source App
* **GitHub Repository:** [https://github.com/InventiveGit-12/GpayReader](https://github.com/InventiveGit-12/GpayReader)
* **Build Command (EAS Cloud Build):**
  ```bash
  git clone https://github.com/InventiveGit-12/GpayReader.git
  cd GpayReader
  # Update BACKEND_URL in index.js to https://www.phantomstack.me
  eas build -p android --profile preview
  ```

---

## 💻 Web App Features (No App Needed for Fallback)
Agar phone app active na ho ya kisi customer ke phone par direct test karna ho:
* **"Maine Payment Kar Diya (Instant Confirm)"**: QR code ke neeche ek button diya hai jisse 1-click me invoice instantly Paid ho jati hai.
* **12-Digit UTR Entry**: Customer ya seller chahein toh bank UTR / Reference ID bhi enter kar sakte hain.
* **Settings Dynamic UPI**: Settings (`/settings`) me jaakar aap kabhi bhi apni UPI ID (`harshsrivastava0315@pingpay`) badal sakte hain.

---
*Created on 15 Nov 2026 for KrishiConnect Platform.*
