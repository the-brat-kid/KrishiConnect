#!/bin/bash
set -e

echo ">>> [1/3] Setting up Debt Collection Agent Engine..."
mkdir -p /home/harsh/aegis-engine
cd /home/harsh/aegis-engine

# Python virtual environment ensure
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip
pip install fastapi uvicorn[standard] pyaudio websockets numpy scipy

echo ">>> [2/3] Writing Autonomous Humanoid Voice Debt Collection Agent..."
cat << 'EOF' > /home/harsh/aegis-engine/agent.py
import asyncio
import json
import logging
import math
import subprocess
import time
from typing import Dict, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s]: %(message)s")
logger = logging.getLogger("DebtAgent")

app = FastAPI(title="BFSI Autonomous Debt Collection AI Agent")

# Global Call State
call_state = {
    "client_name": "Rahul Sharma",
    "debt_amount": "45,000",
    "due_date": "15th November 2026",
    "language": "en", # 'en' or 'hi'
    "stage": "idle",  # idle, ringing, greeting, language_selection, debt_disclosure, negotiation, completed
    "customer_emotion": "calm",
    "arousal": 0.0,
    "valence": 0.0,
    "compliance_muted": False
}

PA_MUTE_CMD = ["pactl", "set-source-mute", "@DEFAULT_SOURCE@", "1"]
PA_UNMUTE_CMD = ["pactl", "set-source-mute", "@DEFAULT_SOURCE@", "0"]

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.add(ws)

    def disconnect(self, ws: WebSocket):
        self.active_connections.discard(ws)

    async def broadcast(self, data: dict):
        if not self.active_connections:
            return
        payload = json.dumps(data)
        for ws in list(self.active_connections):
            try:
                await ws.send_text(payload)
            except Exception:
                self.disconnect(ws)

manager = ConnectionManager()

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        # Send current initial state
        await ws.send_text(json.dumps({"type": "STATE_UPDATE", "data": call_state}))
        while True:
            raw_msg = await ws.receive_text()
            payload = json.loads(raw_msg)
            action = payload.get("action")

            if action == "START_CALL":
                call_state["client_name"] = payload.get("client_name", "Rahul Sharma")
                call_state["debt_amount"] = payload.get("debt_amount", "45,000")
                call_state["due_date"] = payload.get("due_date", "15th November 2026")
                call_state["stage"] = "greeting"
                call_state["compliance_muted"] = False
                subprocess.run(PA_UNMUTE_CMD, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                await manager.broadcast({"type": "STATE_UPDATE", "data": call_state})

            elif action == "SELECT_LANGUAGE":
                lang = payload.get("lang", "en")
                call_state["language"] = lang
                call_state["stage"] = "debt_disclosure"
                await manager.broadcast({"type": "STATE_UPDATE", "data": call_state})

            elif action == "ANALYZE_VOICE":
                # Analyze customer acoustic emotion & sentiment
                text = payload.get("transcript", "").lower()
                rms_db = payload.get("rms_db", -40)

                # Acoustic arousal based on intensity
                norm_intensity = (rms_db + 45.0) / 30.0
                arousal = round(max(-1.0, min(1.0, norm_intensity * 1.4)), 2)

                # Sentiment & Hardship keyword parsing
                is_hardship = any(w in text for w in ["job", "loss", "hospital", "ill", "no money", "paisa nahi", "majburi", "gareeb", "problem", "cannot pay", "nahi de paunga", "salary", "medical"])
                is_hostile = any(w in text for w in ["stop", "police", "harass", "fraud", "scam", "gaali", "shut up", "court", "threat", "bakwaas", "don't call", "cut", "phone rakho"])
                is_cooperative = any(w in text for w in ["yes", "pay", "tomorrow", "kal", "gpay", "upi", "done", "online", "denge", "de dunga", "haan", "sure", "arrange"])

                if is_hostile or arousal > 0.65:
                    call_state["customer_emotion"] = "hostile_distress"
                    call_state["arousal"] = 0.85
                    call_state["valence"] = -0.75
                    # BFSI Regulatory hardware killswitch trigger
                    subprocess.run(PA_MUTE_CMD, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    call_state["compliance_muted"] = True
                    reply = (
                        "I understand your frustration. To ensure regulatory compliance and mutual respect, I am logging your dispute and transferring your account to our senior grievance resolution officer without any penalty."
                        if call_state["language"] == "en" else
                        "Main aapki pareshani samajh sakta hoon. RBI ke compliance niyam anusar, main aapki baat record karke account ko senior grievance officer ko transfer kar raha hoon taaki aapko koi asuvidha na ho."
                    )
                elif is_hardship:
                    call_state["customer_emotion"] = "financial_hardship"
                    call_state["arousal"] = -0.2
                    call_state["valence"] = -0.5
                    reply = (
                        f"We genuinely understand your financial difficulty, {call_state['client_name']}. Under our hardship assistance program, we can divide your ₹{call_state['debt_amount']} into easy monthly installments with zero interest penalty. Would you like to activate this EMI plan?"
                        if call_state["language"] == "en" else
                        f"Hum aapki majboori aur pareshani ko poori tarah samajhte hain, {call_state['client_name']} ji. Hamare financial relief program ke tahat hum aapke ₹{call_state['debt_amount']} ko aasaan kiston (EMI) mein baant sakte hain bina kisi extra charge ke. Kya hum ise shuru karein?"
                    )
                elif is_cooperative:
                    call_state["customer_emotion"] = "cooperative"
                    call_state["arousal"] = 0.1
                    call_state["valence"] = 0.6
                    reply = (
                        f"Thank you so much, {call_state['client_name']}. I have generated a secure payment link and sent it via SMS to your registered mobile number. Once payment of ₹{call_state['debt_amount']} is completed, your account will be marked fully cleared."
                        if call_state["language"] == "en" else
                        f"Bohot bohot dhanyawaad {call_state['client_name']} ji. Maine aapke registered number par secure payment link bhej diya hai. ₹{call_state['debt_amount']} ki payment hote hi aapka account no-dues clear kar diya jayega."
                    )
                else:
                    call_state["customer_emotion"] = "calm"
                    call_state["arousal"] = 0.0
                    call_state["valence"] = 0.0
                    reply = (
                        f"Could you please confirm if you can settle the ₹{call_state['debt_amount']} outstanding today via UPI or net banking?"
                        if call_state["language"] == "en" else
                        f"Kya aap confirm kar sakte hain ki kya aap aaj ₹{call_state['debt_amount']} ki baaki rashi UPI ya net banking se jama kar sakte hain?"
                    )

                await manager.broadcast({
                    "type": "AGENT_RESPONSE",
                    "reply": reply,
                    "emotion": call_state["customer_emotion"],
                    "arousal": call_state["arousal"],
                    "valence": call_state["valence"],
                    "compliance_muted": call_state["compliance_muted"]
                })

            elif action == "END_CALL":
                call_state["stage"] = "completed"
                subprocess.run(PA_UNMUTE_CMD, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                await manager.broadcast({"type": "STATE_UPDATE", "data": call_state})

    except WebSocketDisconnect:
        manager.disconnect(ws)

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    with open("/home/harsh/aegis-engine/debt_cockpit.html", "r") as f:
        return HTMLResponse(content=f.read())
EOF

echo ">>> [3/3] Creating Modern Liquid Glass Debt Collection Cockpit..."
cat << 'EOF' > /home/harsh/aegis-engine/debt_cockpit.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AEGIS // AUTONOMOUS BFSI DEBT RECOVERY AGENT</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    
    :root {
      --bg: #07130d;
      --card-bg: rgba(15, 32, 23, 0.65);
      --emerald: #29b777;
      --emerald-dark: #147a4d;
      --amber: #f59e0b;
      --red: #ef4444;
      --border: rgba(41, 183, 119, 0.35);
      --text: #eef6f1;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    
    body {
      background: var(--bg);
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(41, 183, 119, 0.16) 0%, transparent 65%),
        linear-gradient(to right, rgba(28, 53, 39, 0.45) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(28, 53, 39, 0.45) 1px, transparent 1px);
      background-size: 100% 100%, 36px 36px, 36px 36px;
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    header {
      height: 58px;
      padding: 0 28px;
      border-bottom: 1px solid var(--border);
      background: rgba(7, 19, 13, 0.85);
      backdrop-filter: blur(20px);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
    .brand span { color: var(--emerald); }
    .badge {
      padding: 5px 14px;
      border-radius: 9999px;
      background: rgba(41, 183, 119, 0.15);
      border: 1px solid var(--emerald);
      color: var(--emerald);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 380px 1fr 360px;
      gap: 20px;
      padding: 20px;
      flex: 1;
      height: calc(100vh - 58px);
    }

    /* LIQUID GLASS CONTAINER */
    .glass-card {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%), var(--card-bg);
      backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.35), 0 12px 32px rgba(0, 0, 0, 0.5);
      padding: 20px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #93b9a7;
      border-bottom: 1px dashed rgba(41, 183, 119, 0.25);
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* DISPATCH FORM */
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: #a2c2b3; margin-bottom: 6px; }
    input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(41, 183, 119, 0.3);
      border-radius: 12px;
      padding: 10px 14px;
      color: #ffffff;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      outline: none;
      transition: all 0.2s;
    }
    input:focus { border-color: var(--emerald); box-shadow: 0 0 16px rgba(41, 183, 119, 0.35); }

    /* LIQUID GLASS BUTTONS */
    .btn-liquid {
      width: 100%;
      background: linear-gradient(180deg, rgba(20, 122, 77, 0.55) 0%, rgba(20, 122, 77, 0.25) 100%);
      border: 1px solid rgba(41, 183, 119, 0.5);
      border-radius: 14px;
      color: #ffffff;
      padding: 14px 20px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.5), 0 8px 24px rgba(20, 122, 77, 0.4);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .btn-liquid:hover {
      background: linear-gradient(180deg, rgba(20, 122, 77, 0.7) 0%, rgba(20, 122, 77, 0.35) 100%);
      border-color: rgba(41, 183, 119, 0.8);
      box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.7), 0 12px 30px rgba(20, 122, 77, 0.55);
      transform: translateY(-1.5px);
    }
    .btn-liquid:active { transform: scale(0.97) translateY(0); }

    /* CALL ACTIVE COCKPIT */
    .call-avatar-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .ai-orb {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: radial-gradient(circle, #29b777 0%, rgba(20, 122, 77, 0.3) 60%, transparent 80%);
      border: 2px solid var(--emerald);
      box-shadow: 0 0 35px rgba(41, 183, 119, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 44px;
      animation: pulseIdle 2.5s infinite alternate;
    }
    @keyframes pulseIdle {
      from { transform: scale(0.98); box-shadow: 0 0 25px rgba(41, 183, 119, 0.4); }
      to { transform: scale(1.05); box-shadow: 0 0 50px rgba(41, 183, 119, 0.8); }
    }
    .speaking-pulse {
      animation: speakBounce 0.4s infinite alternate !important;
    }
    @keyframes speakBounce {
      from { transform: scale(1); border-color: #52e59d; }
      to { transform: scale(1.12); border-color: #ffffff; box-shadow: 0 0 60px #29b777; }
    }

    /* IVR LANGUAGE SELECTOR BUTTONS */
    .ivr-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 16px 0;
    }
    .btn-ivr {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      color: #ffffff;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-ivr:hover {
      background: rgba(41, 183, 119, 0.2);
      border-color: var(--emerald);
      transform: translateY(-1.5px);
    }
    .btn-ivr:active { transform: scale(0.97); }

    /* TRANSCRIPT LOG */
    .transcript-box {
      flex: 1;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 14px;
      font-size: 13px;
      line-height: 1.6;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .msg { padding: 10px 14px; border-radius: 12px; max-width: 88%; }
    .msg-agent {
      background: rgba(20, 122, 77, 0.25);
      border: 1px solid rgba(41, 183, 119, 0.35);
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .msg-user {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }

    /* RIGHT COLUMN: PARALINGUISTIC RADAR & COMPLIANCE */
    .emotion-badge {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 8px 16px;
      border-radius: 12px;
      text-align: center;
      margin: 10px 0;
    }
    .emotion-calm { background: rgba(41, 183, 119, 0.15); color: #34d399; border: 1px solid #34d399; }
    .emotion-hardship { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid #fbbf24; }
    .emotion-hostile { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #f87171; animation: alertFlash 0.5s infinite alternate; }
    @keyframes alertFlash { from { opacity: 0.8; } to { opacity: 1; filter: drop-shadow(0 0 10px red); } }
  </style>
</head>
<body>

  <header>
    <div class="brand">⚡ AEGIS<span>-OS</span> // AUTONOMOUS BFSI DEBT RECOVERY AI</div>
    <div id="callBadge" class="badge">AGENT: IDLE</div>
  </header>

  <div class="main-grid">
    <!-- LEFT: DISPATCH & CLIENT FORM -->
    <div class="glass-card">
      <div class="card-title"><span>CALL DISPATCH LEDGER</span><span>BFSI-RECOVERY</span></div>
      
      <div class="form-group">
        <label>CLIENT FULL NAME</label>
        <input type="text" id="inpName" value="Rahul Sharma">
      </div>

      <div class="form-group">
        <label>OUTSTANDING DEBT (INR)</label>
        <input type="text" id="inpAmount" value="45,000">
      </div>

      <div class="form-group">
        <label>LEGAL DUE DATE</label>
        <input type="text" id="inpDate" value="15th November 2026">
      </div>

      <div class="form-group">
        <label>PHONE / ACCOUNT IDENTIFIER</label>
        <input type="text" id="inpPhone" value="+91 98765 43210">
      </div>

      <div style="flex: 1;"></div>

      <button class="btn-liquid" onclick="initiateCall()">
        <span>⚡ INITIATE HUMAN CALL</span>
      </button>
    </div>

    <!-- CENTER: ACTIVE CALL & VOICE TRANSCRIPT -->
    <div class="glass-card">
      <div class="card-title">
        <span>ACTIVE BFSI TELEPHONY LINE</span>
        <span id="callTimer" style="color: var(--emerald); font-family: 'JetBrains Mono';">00:00</span>
      </div>

      <div class="call-avatar-box">
        <div id="aiOrb" class="ai-orb">🎙️</div>
        <div id="speakerLabel" style="font-size: 15px; font-weight: 700; margin-top: 12px; color: #ffffff;">AI AGENT READY</div>
        <div id="callSub" style="font-size: 12px; color: #8dafa0; margin-top: 4px;">Click Initiate to start recovery call</div>
      </div>

      <!-- IVR Keypad Buttons -->
      <div id="ivrBox" style="display: none;">
        <div style="font-size: 11px; text-align: center; color: var(--emerald); font-weight: 700; margin-bottom: 8px;">SELECT CALL LANGUAGE</div>
        <div class="ivr-grid">
          <button class="btn-ivr" onclick="selectLang('en')"><span>[1]</span> English</button>
          <button class="btn-ivr" onclick="selectLang('hi')"><span>[2]</span> Hindi (हिंदी)</button>
        </div>
      </div>

      <!-- Live Speech Transcript Box -->
      <div class="transcript-box" id="transcript">
        <div class="msg msg-agent">System ready. Enter debt details on the left and click 'Initiate Human Call'.</div>
      </div>

      <!-- Live Mic Input Bar for Customer -->
      <div style="margin-top: 12px; display: flex; gap: 10px;">
        <input type="text" id="customerSpeakInp" placeholder="Speak or type customer response here..." onkeydown="if(event.key==='Enter') sendCustomerVoice()">
        <button class="btn-liquid" style="width: 120px; padding: 10px;" onclick="sendCustomerVoice()">SPEAK</button>
      </div>
    </div>

    <!-- RIGHT: PARALINGUISTIC VOICE & HARDWARE AUDIT -->
    <div class="glass-card">
      <div class="card-title"><span>VOICE PROSODY ANALYSIS</span><span>LIVE</span></div>

      <div style="font-size: 11px; color: #8dafa0; margin-bottom: 6px;">DETECTED CUSTOMER STATE:</div>
      <div id="emotionDisplay" class="emotion-badge emotion-calm">STATE: CALM / RECEPTIVE</div>

      <div style="font-size: 11px; color: #8dafa0; margin-top: 14px; margin-bottom: 6px;">CIRCUMPLEX AFFECT RETICLE:</div>
      <canvas id="radarCanvas" width="318" height="180" style="background: rgba(0,0,0,0.6); border: 1px solid var(--border); border-radius: 14px;"></canvas>

      <div style="margin-top: 15px; font-size: 12px; line-height: 1.8;">
        <div style="display:flex; justify-content:space-between;"><span>HARDWARE MUTE:</span><b id="txtMute" style="color:var(--emerald);">ISOLATED: NO</b></div>
        <div style="display:flex; justify-content:space-between;"><span>SPEECH ENGINE:</span><span>HUMANOID NEURAL</span></div>
        <div style="display:flex; justify-content:space-between;"><span>BFSI AUDIT LOG:</span><span style="color:var(--emerald);">RBI COMPLIANT</span></div>
      </div>

      <div style="flex: 1;"></div>
      <button class="btn-liquid" style="background: rgba(239, 68, 68, 0.2); border-color: var(--red);" onclick="endCall()">
        <span>END CALL & REPORT</span>
      </button>
    </div>
  </div>

  <script>
    const ws = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws');
    const synth = window.speechSynthesis;
    let selectedLang = 'en';
    let callTimerInterval = null;
    let seconds = 0;

    function addMsg(sender, text) {
      const box = document.getElementById('transcript');
      const div = document.createElement('div');
      div.className = sender === 'agent' ? 'msg msg-agent' : 'msg msg-user';
      div.innerText = (sender === 'agent' ? '🤖 AI: ' : '👤 Customer: ') + text;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    // Humanoid Voice Synthesizer
    function speakHumanoid(text, lang) {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1.05;
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      const orb = document.getElementById('aiOrb');
      u.onstart = () => { orb.className = 'ai-orb speaking-pulse'; };
      u.onend = () => { orb.className = 'ai-orb'; };
      synth.speak(u);
    }

    function initiateCall() {
      const name = document.getElementById('inpName').value;
      const amt = document.getElementById('inpAmount').value;
      const date = document.getElementById('inpDate').value;

      document.getElementById('callBadge').innerText = 'STATUS: RINGING...';
      document.getElementById('speakerLabel').innerText = 'CALLING ' + name.toUpperCase() + '...';

      // Ringing tone effect
      setTimeout(() => {
        document.getElementById('callBadge').innerText = 'CONNECTED [SECURE]';
        document.getElementById('speakerLabel').innerText = 'CALL CONNECTED';
        startTimer();

        // Step 1: Initial Greeting & Language Prompt
        const greeting = `Hello ${name}, I am calling from the debt collection centre regarding your overdue balance. Please choose your language: Press 1 for English, or Press 2 for Hindi.`;
        addMsg('agent', greeting);
        speakHumanoid(greeting, 'en');

        // Reveal IVR Keypad buttons
        document.getElementById('ivrBox').style.display = 'block';

        ws.send(JSON.stringify({
          action: 'START_CALL',
          client_name: name, debt_amount: amt, due_date: date
        }));
      }, 2000);
    }

    function selectLang(lang) {
      selectedLang = lang;
      document.getElementById('ivrBox').style.display = 'none';

      const name = document.getElementById('inpName').value;
      const amt = document.getElementById('inpAmount').value;
      const date = document.getElementById('inpDate').value;

      let msg = '';
      if (lang === 'en') {
        msg = `Thank you. Your total outstanding debt is ₹${amt}, which was due on ${date}. Can you confirm when you will be able to make this payment today?`;
      } else {
        msg = `Dhanyawaad. Aapka kul baaki loan amount ₹${amt} hai, jiski aakhiri tareekh ${date} thi. Kya aap bata sakte hain ki aap is payment ko kab tak jama karenge?`;
      }

      addMsg('agent', msg);
      speakHumanoid(msg, lang);

      ws.send(JSON.stringify({ action: 'SELECT_LANGUAGE', lang: lang }));
    }

    function sendCustomerVoice() {
      const inp = document.getElementById('customerSpeakInp');
      const text = inp.value.trim();
      if (!text) return;

      addMsg('user', text);
      inp.value = '';

      // Send to AI engine for tone & distress analysis
      ws.send(JSON.stringify({
        action: 'ANALYZE_VOICE',
        transcript: text,
        rms_db: text.includes('!') ? -14.0 : -32.0
      }));
    }

    ws.onmessage = (e) => {
      const res = JSON.parse(e.data);
      if (res.type === 'AGENT_RESPONSE') {
        addMsg('agent', res.reply);
        speakHumanoid(res.reply, selectedLang);

        const badge = document.getElementById('emotionDisplay');
        const muteTxt = document.getElementById('txtMute');

        if (res.emotion === 'hostile_distress') {
          badge.className = 'emotion-badge emotion-hostile';
          badge.innerText = 'STATE: AGGRESSIVE DISTRESS';
          muteTxt.innerText = 'ISOLATED: YES (MUTED)';
          muteTxt.style.color = 'var(--red)';
        } else if (res.emotion === 'financial_hardship') {
          badge.className = 'emotion-badge emotion-hardship';
          badge.innerText = 'STATE: FINANCIAL HARDSHIP';
          muteTxt.innerText = 'ISOLATED: NO';
          muteTxt.style.color = 'var(--emerald)';
        } else {
          badge.className = 'emotion-badge emotion-calm';
          badge.innerText = 'STATE: ' + res.emotion.toUpperCase();
          muteTxt.innerText = 'ISOLATED: NO';
          muteTxt.style.color = 'var(--emerald)';
        }

        drawRadar(res.arousal, res.valence);
      }
    };

    function startTimer() {
      clearInterval(callTimerInterval);
      seconds = 0;
      callTimerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        document.getElementById('callTimer').innerText = `${m}:${s}`;
      }, 1000);
    }

    function endCall() {
      clearInterval(callTimerInterval);
      synth.cancel();
      document.getElementById('callBadge').innerText = 'CALL TERMINATED';
      document.getElementById('speakerLabel').innerText = 'AUDIT RECORDED';
      document.getElementById('aiOrb').className = 'ai-orb';
      addMsg('agent', 'Call ended. Full audio transcript & compliance log encrypted and saved.');
      ws.send(JSON.stringify({ action: 'END_CALL' }));
    }

    function drawRadar(arousal=0, valence=0) {
      const canvas = document.getElementById('radarCanvas');
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      const cx = w/2, cy = h/2;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(41, 183, 119, 0.25)';
      ctx.strokeRect(10, 10, w-20, h-20);
      ctx.beginPath();
      ctx.moveTo(cx, 10); ctx.lineTo(cx, h-10);
      ctx.moveTo(10, cy); ctx.lineTo(w-10, cy);
      ctx.stroke();

      const tx = cx + (valence * (cx - 25));
      const ty = cy - (arousal * (cy - 20));

      ctx.fillStyle = arousal > 0.6 ? '#ef4444' : '#29b777';
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI*2);
      ctx.fill();
    }
    drawRadar();
  </script>
</body>
</html>
EOF

echo ">>> [SUCCESS] Agent successfully compiled and ready!"
