#!/bin/bash
set -e

echo ">>> [1/5] Creating 1920x1080 Monitor Profile..."
cat << "EOF" > /tmp/monitors.xml
<monitors version="2">
  <configuration>
    <logicalmonitor>
      <x>0</x>
      <y>0</y>
      <scale>1</scale>
      <primary>yes</primary>
      <monitor>
        <monitorspec>
          <connector>Virtual-1</connector>
          <vendor>unknown</vendor>
          <product>unknown</product>
          <serial>unknown</serial>
        </monitorspec>
        <mode>
          <width>1920</width>
          <height>1080</height>
          <rate>60.000</rate>
        </mode>
      </monitor>
    </logicalmonitor>
  </configuration>
</monitors>
EOF

echo ">>> [2/5] Locking profile for user 'harsh'..."
mkdir -p /home/harsh/.config
cp -f /tmp/monitors.xml /home/harsh/.config/monitors.xml
chown -R harsh:harsh /home/harsh/.config/monitors.xml
chmod 644 /home/harsh/.config/monitors.xml

echo ">>> [3/5] Locking profile for GDM Login Screen..."
mkdir -p /var/lib/gdm3/.config
cp -f /tmp/monitors.xml /var/lib/gdm3/.config/monitors.xml
chown -R Debian-gdm:Debian-gdm /var/lib/gdm3/.config
chmod 644 /var/lib/gdm3/.config/monitors.xml

echo ">>> [4/5] Enforcing stable X11 display mode..."
sed -i "s/^#\?WaylandEnable=.*/WaylandEnable=false/" /etc/gdm3/daemon.conf

mkdir -p /etc/gdm3/Init
if [ -f /etc/gdm3/Init/Default ]; then
    sed -i "/xrandr/d" /etc/gdm3/Init/Default
    sed -i "2i xrandr --output Virtual-1 --mode 1920x1080 2>/dev/null || xrandr -s 1920x1080 2>/dev/null || true" /etc/gdm3/Init/Default
fi

echo ">>> [5/5] Creating auto-resolution startup hook..."
cat << "EOF" > /etc/profile.d/permanent-resolution.sh
if [ -n "$DISPLAY" ]; then
    xrandr --output Virtual-1 --mode 1920x1080 2>/dev/null || true
fi
EOF
chmod +x /etc/profile.d/permanent-resolution.sh

echo ">>> [DONE] 1920x1080 locked permanently! Restarting GDM..."
systemctl restart gdm3
