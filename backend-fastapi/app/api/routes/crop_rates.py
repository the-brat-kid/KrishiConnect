import re
import json
import time
import urllib.request
from typing import Dict, Any, List
from fastapi import APIRouter, Query

router = APIRouter()

CACHE_TTL = 1800  # 30 minutes
_cache: Dict[str, Any] = {
    "data": None,
    "last_fetched": 0
}

_history_cache: Dict[str, Any] = {
    "data": None,
    "last_fetched": 0
}

SOURCE_URL = "https://vegetablemarketprice.com/market/bhubaneswar/today"
HISTORY_SOURCE_URL = "https://vegetablemarketprice.com/market/bhubaneswar/history"

def fetch_and_parse_rates() -> List[Dict[str, Any]]:
    req = urllib.request.Request(
        SOURCE_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode("utf-8")

    rows = re.findall(r"<tr[^>]*class=\"[^\"]*todayVegetableTableRows[^\"]*\"[^>]*>(.*?)</tr>", html, re.DOTALL)
    items = []

    for row in rows:
        img_match = re.search(r"<img[^>]*src=\"([^\"]+)\"", row)
        tds = re.findall(r"<td[^>]*>(.*?)</td>", row, re.DOTALL)
        if len(tds) >= 5:
            name = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", tds[1])).strip()
            price_raw = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", tds[2])).strip()
            retail_raw = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", tds[3])).strip()
            unit = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", tds[4])).strip()

            img = img_match.group(1) if img_match else ""
            if img and img.startswith("/"):
                img = "https://vegetablemarketprice.com" + img

            num_match = re.search(r"(\d+)", price_raw)
            price_num = int(num_match.group(1)) if num_match else 0

            if name:
                items.append({
                    "id": re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"),
                    "name": name,
                    "price": price_raw,
                    "price_num": price_num,
                    "retail_price": retail_raw,
                    "unit": unit,
                    "image": img
                })
    return items

def fetch_and_parse_history(days: int = 7) -> Dict[str, Any]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": HISTORY_SOURCE_URL
    }

    url1 = f"https://vegetablemarketprice.com/api/dataapi/market/bhubaneswar/latestchartdata?days={days}"
    req1 = urllib.request.Request(url1, headers=headers)
    with urllib.request.urlopen(req1, timeout=10) as resp1:
        data1 = json.loads(resp1.read().decode("utf-8"))

    veg_ids = [v["vegId"] for v in data1.get("columnMapping", []) if "vegId" in v]
    full_data = data1

    if veg_ids:
        url2 = f"https://vegetablemarketprice.com/api/dataapi/market/bhubaneswar/latestchartdata?days={days}&vegIds={','.join(veg_ids)}"
        req2 = urllib.request.Request(url2, headers=headers)
        with urllib.request.urlopen(req2, timeout=12) as resp2:
            full_data = json.loads(resp2.read().decode("utf-8"))

    raw_columns = full_data.get("columns", [])
    raw_items = full_data.get("data", [])

    items = []
    for it in raw_items:
        name = it.get("name", "")
        raw_data = it.get("data", [])
        daily_prices = [d.get("yValue") if isinstance(d.get("yValue"), (int, float)) else d.get("y", 0) for d in raw_data]
        retail_prices = [d.get("retailprice", "") for d in raw_data]
        unit = raw_data[0].get("units", "1kg") if raw_data else "1kg"

        img = it.get("marker", {}).get("symbol", "")
        if "url(" in img:
            img = img.replace("url(", "").rstrip(")")
        if img.startswith("/"):
            img = "https://vegetablemarketprice.com" + img

        current_p = daily_prices[-1] if daily_prices else 0
        start_p = daily_prices[0] if daily_prices else 0
        change = current_p - start_p
        change_pct = round((change / start_p) * 100, 1) if start_p > 0 else 0
        trend = "up" if change > 0 else ("down" if change < 0 else "stable")

        items.append({
            "id": re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"),
            "name": name,
            "color": it.get("color", "#10b981"),
            "image": img,
            "unit": unit,
            "daily_prices": daily_prices,
            "retail_prices": retail_prices,
            "current_price": current_p,
            "start_price": start_p,
            "change": change,
            "change_percent": change_pct,
            "trend": trend
        })

    return {
        "success": True,
        "market": "Bhubaneswar",
        "state": "Odisha",
        "source_url": HISTORY_SOURCE_URL,
        "start_date": full_data.get("startDate"),
        "end_date": full_data.get("endDate"),
        "columns": raw_columns,
        "count": len(items),
        "items": items
    }

@router.get("")
async def get_crop_rates(refresh: bool = Query(False, description="Bypass cache and fetch fresh rates")):
    now = time.time()
    if not refresh and _cache["data"] and (now - _cache["last_fetched"] < CACHE_TTL):
        return _cache["data"]

    try:
        items = fetch_and_parse_rates()
        result = {
            "success": True,
            "market": "Bhubaneswar",
            "state": "Odisha",
            "source_url": SOURCE_URL,
            "updated_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
            "count": len(items),
            "items": items
        }
        _cache["data"] = result
        _cache["last_fetched"] = now
        return result
    except Exception as e:
        if _cache["data"]:
            return _cache["data"]
        return {
            "success": False,
            "error": str(e),
            "market": "Bhubaneswar",
            "state": "Odisha",
            "source_url": SOURCE_URL,
            "items": []
        }

@router.get("/history")
async def get_crop_rates_history(
    days: int = Query(7, ge=3, le=30),
    refresh: bool = Query(False, description="Bypass cache")
):
    now = time.time()
    if not refresh and _history_cache["data"] and (now - _history_cache["last_fetched"] < CACHE_TTL):
        return _history_cache["data"]

    try:
        data = fetch_and_parse_history(days=days)
        _history_cache["data"] = data
        _history_cache["last_fetched"] = now
        return data
    except Exception as e:
        if _history_cache["data"]:
            return _history_cache["data"]
        return {
            "success": False,
            "error": str(e),
            "market": "Bhubaneswar",
            "state": "Odisha",
            "source_url": HISTORY_SOURCE_URL,
            "columns": [],
            "items": []
        }
