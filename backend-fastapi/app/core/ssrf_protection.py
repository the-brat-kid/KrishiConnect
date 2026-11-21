"""
KrishiConnect SSRF (Server-Side Request Forgery) Protection Module
Provides comprehensive validation against internal network probing,
cloud metadata exfiltration (AWS/GCP/Azure), private subnet access,
DNS rebinding, and dangerous URL schemes.
"""

import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple, Optional, Set
from fastapi import HTTPException, status
import logging

logger = logging.getLogger("krishiconnect.security.ssrf")

# Disallowed private & reserved IP networks
BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),          # "This" network
    ipaddress.ip_network("10.0.0.0/8"),         # RFC 1918 Private Class A
    ipaddress.ip_network("100.64.0.0/10"),      # Shared Address Space (Carrier NAT)
    ipaddress.ip_network("127.0.0.0/8"),        # Loopback
    ipaddress.ip_network("169.254.0.0/16"),     # Link-Local / Cloud Metadata (169.254.169.254)
    ipaddress.ip_network("172.16.0.0/12"),      # RFC 1918 Private Class B
    ipaddress.ip_network("192.0.0.0/24"),       # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),       # TEST-NET-1 documentation
    ipaddress.ip_network("192.168.0.0/16"),     # RFC 1918 Private Class C
    ipaddress.ip_network("198.18.0.0/15"),      # Network Interconnect Benchmark Testing
    ipaddress.ip_network("198.51.100.0/24"),    # TEST-NET-2 documentation
    ipaddress.ip_network("203.0.113.0/24"),     # TEST-NET-3 documentation
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved for future use
    ipaddress.ip_network("255.255.255.255/32"), # Limited broadcast
    # IPv6
    ipaddress.ip_network("::/128"),             # Unspecified
    ipaddress.ip_network("::1/128"),           # Loopback
    ipaddress.ip_network("fc00::/7"),           # Unique Local Address (ULA)
    ipaddress.ip_network("fe80::/10"),          # Link-Local Unicast
    ipaddress.ip_network("ff00::/8"),           # Multicast
]

# Prohibited internal hostnames & cloud metadata hostnames
BLOCKED_HOSTNAMES: Set[str] = {
    "localhost",
    "localhost.localdomain",
    "ip6-localhost",
    "ip6-loopback",
    "postgres",
    "mongodb",
    "redis",
    "backend-fastapi",
    "backend-node",
    "metadata",
    "metadata.google.internal",
    "instance-data",
}

# Allowed public web schemes
ALLOWED_SCHEMES = {"http", "https"}

# Safe standard web ports
ALLOWED_PORTS = {80, 443, 8080, 8443}


def is_ip_blocked(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Check if an IP address belongs to any blocked/private network."""
    if ip_obj.is_loopback or ip_obj.is_private or ip_obj.is_link_local or ip_obj.is_multicast or ip_obj.is_reserved:
        return True
    return any(ip_obj in net for net in BLOCKED_NETWORKS)


def is_safe_url(url: str, allow_custom_ports: bool = False) -> Tuple[bool, str]:
    """
    Validates a URL against Server-Side Request Forgery (SSRF) threats.
    
    Returns:
        (is_safe: bool, reason_or_normalized_url: str)
    """
    if not url or not isinstance(url, str):
        return False, "URL must be a non-empty string"

    url = url.strip()
    if len(url) > 2048:
        return False, "URL length exceeds safe limit (2048 characters)"

    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, f"Failed to parse URL: {str(e)}"

    # 1. Scheme Check
    scheme = (parsed.scheme or "").lower()
    if scheme not in ALLOWED_SCHEMES:
        return False, f"Scheme '{scheme}' is prohibited. Only http and https are permitted."

    # 2. Hostname Check
    hostname = (parsed.hostname or "").lower().strip()
    if not hostname:
        return False, "URL contains no valid host"

    # Block credentials in URL (e.g. http://attacker:pwd@target)
    if parsed.username or parsed.password:
        return False, "Embedded user credentials in URL are prohibited"

    # Explicitly blocked hostnames
    if hostname in BLOCKED_HOSTNAMES or hostname.endswith(".local") or hostname.endswith(".internal"):
        return False, f"Hostname '{hostname}' resolves to an internal/restricted service"

    # 3. Port Check
    port = parsed.port
    if port and not allow_custom_ports and port not in ALLOWED_PORTS:
        return False, f"Port {port} is not permitted for outbound web requests"

    # 4. IP Literal or DNS Resolution Check
    try:
        # Check if hostname is an IP literal
        ip_obj = ipaddress.ip_address(hostname)
        if is_ip_blocked(ip_obj):
            return False, f"Direct access to private or reserved IP '{ip_obj}' is blocked"
    except ValueError:
        # Hostname is a domain name -> Resolve DNS to check resulting IPs
        try:
            addr_info = socket.getaddrinfo(hostname, None)
            if not addr_info:
                return False, f"Unable to resolve DNS for host '{hostname}'"

            for entry in addr_info:
                resolved_ip_str = entry[4][0]
                try:
                    resolved_ip = ipaddress.ip_address(resolved_ip_str)
                    if is_ip_blocked(resolved_ip):
                        return False, f"Host '{hostname}' resolved to blocked/private IP '{resolved_ip_str}'"
                except ValueError:
                    return False, f"Invalid resolved IP '{resolved_ip_str}'"
        except socket.gaierror as e:
            return False, f"DNS resolution failed for '{hostname}': {str(e)}"
        except Exception as e:
            return False, f"DNS validation error for '{hostname}': {str(e)}"

    return True, url


def validate_safe_url(url: str, allow_custom_ports: bool = False) -> str:
    """
    Validates a URL against SSRF; raises HTTP 400 Bad Request on failure.
    """
    is_safe, message = is_safe_url(url, allow_custom_ports=allow_custom_ports)
    if not is_safe:
        logger.warning("SSRF Attempt Blocked: url='%s', reason='%s'", url, message)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security violation (SSRF protection): {message}",
        )
    return url
