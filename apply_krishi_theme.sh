#!/bin/bash
set -e

echo ">>> [1/6] Installing font dependencies..."
apt update && apt install -y curl fontconfig libglib2.0-dev-bin

echo ">>> [2/6] Installing KrishiConnect Typography (Plus Jakarta Sans & Manrope)..."
mkdir -p /usr/local/share/fonts/krishi
curl -sL -o /usr/local/share/fonts/krishi/PlusJakartaSans-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf" || true
curl -sL -o /usr/local/share/fonts/krishi/Manrope-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/manrope/Manrope%5Bwght%5D.ttf" || true
fc-cache -f

echo ">>> [3/6] Setting GDM Greeter configuration..."
cat << "EOF" > /etc/gdm3/greeter.dconf-defaults
[org/gnome/login-screen]
banner-message-enable=false
disable-user-list=false

[org/gnome/desktop/interface]
font-name="Plus Jakarta Sans SemiBold 14"
document-font-name="Manrope 12"
text-scaling-factor=1.2
gtk-theme="Adwaita-dark"
color-scheme="prefer-dark"
EOF
dconf update

echo ">>> [4/6] Locating and extracting GNOME Shell theme resource..."
RESOURCE_FILE=""
for p in \
  "/usr/share/gnome-shell/gnome-shell-theme.gresource" \
  "/usr/share/gnome-shell/theme/gnome-shell-theme.gresource" \
  "/etc/alternatives/gdm3-theme.gresource"; do
    if [ -f "$p" ]; then
      RESOURCE_FILE=$(realpath "$p")
      break
    fi
done

if [ -z "$RESOURCE_FILE" ]; then
  RESOURCE_FILE=$(find /usr/share -name "*gnome-shell*theme*.gresource" 2>/dev/null | head -n 1)
fi

echo "Using resource: $RESOURCE_FILE"

BUILD_DIR=$(mktemp -d)
cd "$BUILD_DIR"

for r in $(gresource list "$RESOURCE_FILE"); do
  f="${r#/org/gnome/shell/theme/}"
  mkdir -p "$(dirname "$f")"
  gresource extract "$RESOURCE_FILE" "$r" > "$f"
done

echo ">>> [5/6] Injecting KrishiConnect Liquid Glass styles & animations..."
cat << "EOF" >> gnome-shell.css

/* ============================================================
   KRISHICONNECT LIQUID GLASS & BIOLUMINESCENT EMERALD THEME
   ============================================================ */

/* 1. TOP BAR: OBSIDIAN FOREST LIQUID GLASS */
#panel {
  background-color: rgba(7, 19, 13, 0.65) !important;
  background-gradient-direction: vertical !important;
  background-gradient-start: rgba(15, 32, 23, 0.75) !important;
  background-gradient-end: rgba(7, 19, 13, 0.85) !important;
  border-bottom: 1px solid rgba(41, 183, 119, 0.25) !important;
  box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.25), 0 8px 24px rgba(0, 0, 0, 0.45) !important;
  color: #eef6f1 !important;
  font-family: "Plus Jakarta Sans", sans-serif !important;
  font-weight: 600 !important;
}

#panel .panel-button {
  border-radius: 9999px !important;
  margin: 3px 6px !important;
  transition-duration: 250ms !important;
}

#panel .panel-button:hover {
  background-color: rgba(41, 183, 119, 0.2) !important;
  box-shadow: 0 0 16px rgba(41, 183, 119, 0.3) !important;
  color: #ffffff !important;
}

/* 2. DOCK / DASH: KRISHICONNECT FLOATING GLASS CAPSULE */
#dash .dash-background {
  background: linear-gradient(180deg, rgba(15, 32, 23, 0.7) 0%, rgba(7, 19, 13, 0.85) 100%) !important;
  border: 1px solid rgba(41, 183, 119, 0.35) !important;
  border-radius: 28px !important;
  box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(41, 183, 119, 0.15) !important;
  padding: 8px 12px !important;
}

/* 3. LOGIN CARD: KRISHICONNECT EXACT LIQUID GLASS CONTAINER */
.login-dialog {
  background: linear-gradient(180deg, rgba(15, 32, 23, 0.55) 0%, rgba(7, 19, 13, 0.75) 100%) !important;
  border: 1px solid rgba(41, 183, 119, 0.4) !important;
  border-radius: 30px !important;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0, 0, 0, 0.35), 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(41, 183, 119, 0.2) !important;
  padding: 44px 56px !important;
}

/* AVATAR: BIOLUMINESCENT EMERALD RING */
.login-dialog-user-avatar, .user-avatar, .user-widget-avatar {
  width: 124px !important;
  height: 124px !important;
  border-radius: 62px !important;
  border: 2.5px solid rgba(41, 183, 119, 0.85) !important;
  box-shadow: 0 0 28px rgba(41, 183, 119, 0.55), inset 0 0 14px rgba(41, 183, 119, 0.35) !important;
  margin-top: -24px !important;
  margin-bottom: 22px !important;
}

/* HELLO HARSH: PLUS JAKARTA SANS BOLD */
.user-widget-label, .login-dialog-title {
  font-family: "Plus Jakarta Sans", sans-serif !important;
  font-size: 24pt !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
  color: #eef6f1 !important;
  text-shadow: 0 0 20px rgba(41, 183, 119, 0.55), 0 2px 10px rgba(0, 0, 0, 0.8) !important;
  margin-bottom: 20px !important;
}

/* PASSWORD INPUT: KRISHICONNECT INPUT STYLE */
.login-dialog StEntry {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(41, 183, 119, 0.35) !important;
  border-radius: 12px !important;
  color: #eef6f1 !important;
  font-family: "Plus Jakarta Sans", sans-serif !important;
  font-size: 14pt !important;
  padding: 10px 18px !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.login-dialog StEntry:focus {
  border-color: #29b777 !important;
  box-shadow: 0 0 20px rgba(41, 183, 119, 0.5) !important;
}

/* 4. POPUP MENUS */
.popup-menu-content {
  background: linear-gradient(180deg, rgba(15, 32, 23, 0.8) 0%, rgba(7, 19, 13, 0.9) 100%) !important;
  border: 1px solid rgba(41, 183, 119, 0.3) !important;
  border-radius: 20px !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px rgba(255, 255, 255, 0.25) !important;
}
EOF

[ -f "gnome-shell-dark.css" ] && cat gnome-shell.css > gnome-shell-dark.css

cat << "EOF" > theme.gresource.xml
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/org/gnome/shell/theme">
EOF

find . -type f ! -name "theme.gresource.xml" | sed "s|^\./||" | while read -r file; do
  echo "    <file>$file</file>" >> theme.gresource.xml
done

echo "  </gresource>" >> theme.gresource.xml
echo "</gresources>" >> theme.gresource.xml

glib-compile-resources --target=krishi-glass.gresource theme.gresource.xml
mkdir -p "$(dirname "$RESOURCE_FILE")"
cp -f krishi-glass.gresource "$RESOURCE_FILE"
rm -rf "$BUILD_DIR"

echo ">>> [6/6] Injecting KrishiConnect button animations (active scale 0.97 + hover lift) into GTK..."
mkdir -p /etc/gtk-3.0 /etc/gtk-4.0 /home/harsh/.config/gtk-3.0 /home/harsh/.config/gtk-4.0
cat << "EOF" | tee /etc/gtk-3.0/gtk.css /etc/gtk-4.0/gtk.css /home/harsh/.config/gtk-3.0/gtk.css /home/harsh/.config/gtk-4.0/gtk.css > /dev/null
/* KRISHICONNECT BUTTON & LIQUID GLASS ENGINE */
button {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.01) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 10px !important;
  box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0, 0, 0, 0.35), 0 6px 18px rgba(0, 0, 0, 0.3) !important;
  color: #eef6f1 !important;
  font-family: "Plus Jakarta Sans", sans-serif !important;
  font-weight: 600 !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

button:hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.02) 100%) !important;
  border-color: rgba(41, 183, 119, 0.5) !important;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.55), 0 10px 24px rgba(20, 122, 77, 0.3) !important;
  transform: translateY(-1.5px) !important;
}

button:active {
  transform: scale(0.97) translateY(0) !important;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 4px 10px rgba(0, 0, 0, 0.3) !important;
}

headerbar, .titlebar {
  background: rgba(7, 19, 13, 0.75) !important;
  border-bottom: 1px solid rgba(41, 183, 119, 0.25) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
  color: #eef6f1 !important;
}
EOF
chown -R harsh:harsh /home/harsh/.config 2>/dev/null || true

echo ">>> [DONE] Successfully applied KrishiConnect Liquid Glass theme! Restarting GDM..."
systemctl restart gdm3
