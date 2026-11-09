#!/bin/bash
set -e

echo "=========================================================="
echo ">>> [1/6] Installing Fonts & Blur Extension Packages..."
echo "=========================================================="
apt update && apt install -y curl fontconfig libglib2.0-dev-bin gnome-shell-extension-blur-my-shell || true

mkdir -p /usr/local/share/fonts/krishi
curl -sL -o /usr/local/share/fonts/krishi/PlusJakartaSans-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf" || true
curl -sL -o /usr/local/share/fonts/krishi/Manrope-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/manrope/Manrope%5Bwght%5D.ttf" || true
fc-cache -f

echo "=========================================================="
echo ">>> [2/6] Generating KrishiConnect Ambient Grid 4K Wallpaper..."
echo "=========================================================="
mkdir -p /usr/share/backgrounds/aegis
cat << "EOF" > /usr/share/backgrounds/aegis/krishiconnect_wallpaper.svg
<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160">
  <defs>
    <!-- 36px Ambient Grid Pattern from KrishiConnect -->
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1c3527" stroke-width="1" stroke-opacity="0.55"/>
    </pattern>
    <!-- Bioluminescent Emerald Radial Ambient Glow -->
    <radialGradient id="emeraldGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#29b777" stop-opacity="0.28"/>
      <stop offset="40%" stop-color="#147a4d" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#07130d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Deep Obsidian Forest Background -->
  <rect width="100%" height="100%" fill="#07130d"/>
  <!-- Ambient Grid -->
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <!-- Glowing Radial Emerald Accent -->
  <rect width="100%" height="100%" fill="url(#emeraldGlow)"/>
</svg>
EOF

echo "=========================================================="
echo ">>> [3/6] Configuring GDM Greeter & Typography..."
echo "=========================================================="
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

[org/gnome/desktop/background]
picture-uri="file:///usr/share/backgrounds/aegis/krishiconnect_wallpaper.svg"
picture-uri-dark="file:///usr/share/backgrounds/aegis/krishiconnect_wallpaper.svg"
picture-options="zoom"
EOF
dconf update

echo "=========================================================="
echo ">>> [4/6] Extracting Shell Theme for Liquid Glass Build..."
echo "=========================================================="
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
[ -z "$RESOURCE_FILE" ] && RESOURCE_FILE=$(find /usr/share -name "*gnome-shell*theme*.gresource" 2>/dev/null | head -n 1)

BUILD_DIR=$(mktemp -d)
cd "$BUILD_DIR"

for r in $(gresource list "$RESOURCE_FILE"); do
  f="${r#/org/gnome/shell/theme/}"
  mkdir -p "$(dirname "$f")"
  gresource extract "$RESOURCE_FILE" "$r" > "$f"
done

echo "=========================================================="
echo ">>> [5/6] Injecting 100% St-Compliant Liquid Glass CSS..."
echo "=========================================================="
cat << "EOF" >> gnome-shell.css

/* ============================================================
   KRISHICONNECT LIQUID GLASS ENGINE (ST-COMPLIANT)
   ============================================================ */

/* 1. LOGIN CARD: FROSTED GLASS ELEVATION WITH EMERALD SPECULAR GLOW */
.login-dialog {
  background-color: rgba(11, 26, 18, 0.52) !important;
  background-gradient-direction: vertical !important;
  background-gradient-start: rgba(18, 42, 29, 0.68) !important;
  background-gradient-end: rgba(7, 18, 12, 0.78) !important;
  border: 1.5px solid rgba(41, 183, 119, 0.45) !important;
  border-radius: 32px !important;
  box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.42), inset 0 -1.5px 2px rgba(0, 0, 0, 0.4), 0 25px 65px rgba(0, 0, 0, 0.75), 0 0 35px rgba(41, 183, 119, 0.28) !important;
  padding: 44px 58px !important;
}

/* AVATAR: BIOLUMINESCENT EMERALD LIQUID RING */
.login-dialog-user-avatar, .user-avatar, .user-widget-avatar {
  width: 124px !important;
  height: 124px !important;
  border-radius: 62px !important;
  border: 2.5px solid rgba(41, 183, 119, 0.85) !important;
  box-shadow: 0 0 30px rgba(41, 183, 119, 0.6), inset 0 0 15px rgba(41, 183, 119, 0.35) !important;
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
  text-shadow: 0 0 20px rgba(41, 183, 119, 0.6), 0 2px 10px rgba(0, 0, 0, 0.8) !important;
  margin-bottom: 20px !important;
}

/* PASSWORD INPUT GLASS BAR */
.login-dialog StEntry {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border: 1.2px solid rgba(41, 183, 119, 0.38) !important;
  border-radius: 14px !important;
  color: #eef6f1 !important;
  font-family: "Plus Jakarta Sans", sans-serif !important;
  font-size: 14pt !important;
  padding: 10px 18px !important;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.35) !important;
}

.login-dialog StEntry:focus {
  border-color: #29b777 !important;
  box-shadow: 0 0 22px rgba(41, 183, 119, 0.55) !important;
}

/* 2. TOP PANEL: OBSIDIAN GLASS BAR */
#panel {
  background-color: rgba(7, 19, 13, 0.55) !important;
  background-gradient-direction: vertical !important;
  background-gradient-start: rgba(14, 34, 24, 0.65) !important;
  background-gradient-end: rgba(7, 19, 13, 0.75) !important;
  border-bottom: 1px solid rgba(41, 183, 119, 0.3) !important;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 8px 24px rgba(0, 0, 0, 0.5) !important;
  color: #eef6f1 !important;
  font-family: "Plus Jakarta Sans", sans-serif !important;
}

#panel .panel-button:hover {
  background-color: rgba(41, 183, 119, 0.22) !important;
  box-shadow: 0 0 16px rgba(41, 183, 119, 0.35) !important;
}

/* 3. DOCK / DASH: FLOATING GLASS CAPSULE */
#dash .dash-background {
  background-color: rgba(11, 26, 18, 0.55) !important;
  background-gradient-direction: vertical !important;
  background-gradient-start: rgba(18, 42, 29, 0.65) !important;
  background-gradient-end: rgba(7, 18, 12, 0.75) !important;
  border: 1.5px solid rgba(41, 183, 119, 0.38) !important;
  border-radius: 28px !important;
  box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 22px rgba(41, 183, 119, 0.2) !important;
  padding: 8px 12px !important;
}

/* 4. POPUP MENUS */
.popup-menu-content {
  background-color: rgba(11, 26, 18, 0.75) !important;
  background-gradient-direction: vertical !important;
  background-gradient-start: rgba(18, 42, 29, 0.85) !important;
  background-gradient-end: rgba(7, 18, 12, 0.9) !important;
  border: 1.5px solid rgba(41, 183, 119, 0.35) !important;
  border-radius: 20px !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), inset 0 1px 1.5px rgba(255, 255, 255, 0.25) !important;
}
EOF

[ -f "gnome-shell-dark.css" ] && cat gnome-shell.css > gnome-shell-dark.css

# Compile into gresource
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

echo "=========================================================="
echo ">>> [6/6] Injecting KrishiConnect Spring Button Animations into GTK..."
echo "=========================================================="
mkdir -p /etc/gtk-3.0 /etc/gtk-4.0 /home/harsh/.config/gtk-3.0 /home/harsh/.config/gtk-4.0
cat << "EOF" | tee /etc/gtk-3.0/gtk.css /etc/gtk-4.0/gtk.css /home/harsh/.config/gtk-3.0/gtk.css /home/harsh/.config/gtk-4.0/gtk.css > /dev/null
/* KRISHICONNECT LIQUID GLASS BUTTONS & ACTIVE SPRING PRESS */
button {
  background: linear-gradient(180deg, rgba(20, 122, 77, 0.38) 0%, rgba(20, 122, 77, 0.18) 50%, rgba(20, 122, 77, 0.08) 100%) !important;
  border: 1px solid rgba(41, 183, 119, 0.45) !important;
  border-radius: 10px !important;
  box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 8px 24px rgba(20, 122, 77, 0.35), 0 0 16px rgba(41, 183, 119, 0.2) !important;
  color: #eef6f1 !important;
  font-family: "Plus Jakarta Sans", sans-serif !important;
  font-weight: 600 !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

button:hover {
  background: linear-gradient(180deg, rgba(20, 122, 77, 0.55) 0%, rgba(20, 122, 77, 0.32) 50%, rgba(20, 122, 77, 0.15) 100%) !important;
  border-color: rgba(41, 183, 119, 0.65) !important;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 12px 32px rgba(20, 122, 77, 0.45), 0 0 20px rgba(41, 183, 119, 0.35) !important;
  transform: translateY(-1.5px) !important;
}

button:active {
  transform: scale(0.97) translateY(0) !important;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 4px 10px rgba(0, 0, 0, 0.3) !important;
}

headerbar, .titlebar {
  background: rgba(7, 19, 13, 0.78) !important;
  border-bottom: 1px solid rgba(41, 183, 119, 0.28) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  color: #eef6f1 !important;
}
EOF
chown -R harsh:harsh /home/harsh/.config 2>/dev/null || true

# Desktop wallpaper apply for user
su - harsh -c "
gsettings set org.gnome.desktop.background picture-uri 'file:///usr/share/backgrounds/aegis/krishiconnect_wallpaper.svg'
gsettings set org.gnome.desktop.background picture-uri-dark 'file:///usr/share/backgrounds/aegis/krishiconnect_wallpaper.svg'
gsettings set org.gnome.desktop.background picture-options 'zoom'
gsettings set org.gnome.desktop.interface font-name 'Plus Jakarta Sans SemiBold 11'
" 2>/dev/null || true

echo "=========================================================="
echo ">>> [DONE] KrishiConnect Liquid Glass applied! Restarting GDM..."
echo "=========================================================="
systemctl restart gdm3
