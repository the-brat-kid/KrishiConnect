# 📱 KrishiConnect UPI Auto-Verification Guide (FreePay Engine)

Yeh guide safe rakhi gayi hai taaki aap jab chahein UPI auto-verification setup dekh aur test kar sakein.

---

## ⚡ Abhi Auto-Verification Kyu Nahi Ho Raha Tha? (Root Cause Solved)

Do main reasons the jiske wajah se verify nahi ho raha tha:

1. **Vercel vs Local Backend:**
   * `https://www.phantomstack.me` sirf **Next.js frontend** hai jo Vercel par host hai.
   * Aapka database aur Python FastAPI backend aapke laptop par chal raha hai.
   * Phone se jab NotifyHook `phantomstack.me` par request bhej raha tha, Vercel `404 Not Found` de raha tha kyunki Vercel ke paas backend nahi tha.

2. **Google Pay Personal Notification Text:**
   * Google Pay (Personal app) ke notification me `krishi_inv_...` transaction note print nahi hota. GPay notification me sirf **Amount** (jaise `Received ₹500.00 from Harsh`) aata hai.
   * Humne backend ko **intelligent amount-matching** se upgrade kar diya hai! Ab agar notification me sirf amount (`₹500` ya `500.00`) bhi aayega, backend recent pending invoice se match karke instantly **PAID** mark kar dega!

---

## 🔗 Live Active Tunnel URL (Aapke Laptop Se Seedha Connected)

Aapka FastAPI backend aur Cloudflare tunnel live active hai:

### **Live Webhook URL for NotifyHook / MacroDroid:**
```text
https://melissa-considerations-pencil-ever.trycloudflare.com/api/v1/payments/upi/webhook
```

*(Yeh URL public HTTPS hai aur kisi bhi mobile network / 4G / 5G / WiFi se turant accessible hai!)*

---

## 📲 Setup in NotifyHook (1 Minute)

1. **NotifyHook** app open karein.
2. Rule add karein:
   * **App:** Google Pay (`com.google.android.apps.nbu.paisa.user`) aur PhonePe
   * **Webhook URL:**
     ```text
     https://melissa-considerations-pencil-ever.trycloudflare.com/api/v1/payments/upi/webhook
     ```
   * **Method:** `POST`
   * **Content Type:** `application/json`
   * **Body / Payload:**
     ```json
     {
       "note": "{notification_text}",
       "app": "com.google.android.apps.nbu.paisa.user"
     }
     ```
3. Save karein!

---

## 🚀 How to Test in 3 Steps:

1. Apne laptop me browser par invoice open karein (jaise invoice total ₹500 hai).
2. Apne mobile se QR code scan karke ₹500 send karein (harshsrivastava0315@pingpay par).
3. Jaise hi aapke mobile par notification aayega (`Received ₹500.00`), NotifyHook webhook fire karega:
   * Backend amount match karega (`₹500.00`).
   * Invoice status instantly `paid` ho jayega.
   * Laptop screen par QR code gayab ho kar **Green Success Tick 🎉** aur **"Payment Verified via UPI!"** show hoga!

---

## 💻 Backup Fallback Options (Always Available):

* **"Maine Payment Kar Diya (Instant Confirm)"**: QR code ke neeche button par click karke bhi buyer/seller 1 second me payment confirm kar sakta hai.
* **12-Digit UTR Entry**: PhonePe / GPay ka 12-digit UPI Ref/UTR number dalne ka option bhi diya hua hai.
* **Settings Dynamic UPI**: Settings (`/settings`) me jaakar aap kabhi bhi apni UPI ID (`harshsrivastava0315@pingpay`) badal sakte hain.
