export interface MandiLocation {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  address: string;
}

export const REGIONAL_MANDIS: Record<string, MandiLocation[]> = {
  Haryana: [
    { id: "karnal", name: "Karnal Basmati APMC Mandi", state: "Haryana", district: "Karnal", lat: 29.6857, lon: 76.9905, address: "New Grain Market, GT Road, Karnal" },
    { id: "ambala", name: "Ambala City Grain Market", state: "Haryana", district: "Ambala", lat: 30.3782, lon: 76.7767, address: "New Anaj Mandi, Ambala City" },
    { id: "panipat", name: "Panipat Grain Market", state: "Haryana", district: "Panipat", lat: 29.3909, lon: 76.9635, address: "APMC Yard, GT Road, Panipat" },
    { id: "sirsa", name: "Sirsa Cotton & Wheat Mandi", state: "Haryana", district: "Sirsa", lat: 29.5349, lon: 75.0289, address: "Anaj Mandi, Sirsa" },
    { id: "hisar", name: "Hisar Agro Terminal Mandi", state: "Haryana", district: "Hisar", lat: 29.1492, lon: 75.7217, address: "New Anaj Mandi, Hisar" },
  ],
  Punjab: [
    { id: "khanna", name: "Khanna Grain Market", state: "Punjab", district: "Ludhiana", lat: 30.7067, lon: 76.2201, address: "Asia's Largest Grain Market Yard, GT Road, Khanna" },
    { id: "ludhiana", name: "Ludhiana Subzi & Grain Mandi", state: "Punjab", district: "Ludhiana", lat: 30.9010, lon: 75.8573, address: "Gill Road Market Yard, Ludhiana" },
    { id: "amritsar", name: "Amritsar Bhagtanwala Mandi", state: "Punjab", district: "Amritsar", lat: 31.6340, lon: 74.8723, address: "Bhagtanwala Grain Market, Amritsar" },
    { id: "jalandhar", name: "Jalandhar Maqsudan Mandi", state: "Punjab", district: "Jalandhar", lat: 31.3260, lon: 75.5762, address: "Maqsudan APMC Yard, Jalandhar" },
    { id: "bathinda", name: "Bathinda Cotton & Grain Market", state: "Punjab", district: "Bathinda", lat: 30.2110, lon: 74.9455, address: "New Mandi Yard, Bathinda" },
  ],
  Maharashtra: [
    { id: "nashik", name: "Nashik (Pimpalgaon) APMC Mandi", state: "Maharashtra", district: "Nashik", lat: 20.1706, lon: 73.9859, address: "Pimpalgaon Baswant APMC Market, Nashik" },
    { id: "lasalgaon", name: "Lasalgaon Asia Onion Market", state: "Maharashtra", district: "Nashik", lat: 20.1472, lon: 74.2289, address: "Asia's Premier Onion Hub, Lasalgaon" },
    { id: "pune", name: "Pune Gultekdi APMC Market", state: "Maharashtra", district: "Pune", lat: 18.5204, lon: 73.8567, address: "Market Yard, Gultekdi, Pune" },
    { id: "vashi", name: "Mumbai (Vashi) APMC Terminal", state: "Maharashtra", district: "Navi Mumbai", lat: 19.0771, lon: 72.9986, address: "APMC Sector 19, Vashi, Navi Mumbai" },
    { id: "nagpur", name: "Nagpur Orange & Grain Mandi", state: "Maharashtra", district: "Nagpur", lat: 21.1458, lon: 79.0882, address: "Kalamna APMC Market Yard, Nagpur" },
  ],
  Odisha: [
    { id: "bhubaneswar", name: "Bhubaneswar APMC Mandi", state: "Odisha", district: "Khordha", lat: 20.2961, lon: 85.8245, address: "Unit 1 Wholesale Yard, Bhubaneswar" },
    { id: "cuttack", name: "Cuttack Malgodown Mandi", state: "Odisha", district: "Cuttack", lat: 20.4625, lon: 85.8828, address: "Malgodown Wholesale Market, Cuttack" },
    { id: "sambalpur", name: "Sambalpur Grain Mandi", state: "Odisha", district: "Sambalpur", lat: 21.4669, lon: 83.9812, address: "RMC Yard, Khetrajpur, Sambalpur" },
    { id: "berhampur", name: "Berhampur Commercial Mandi", state: "Odisha", district: "Ganjam", lat: 19.3150, lon: 84.7941, address: "APMC Yard, Berhampur" },
    { id: "bargarh", name: "Bargarh Paddy RMC Market", state: "Odisha", district: "Bargarh", lat: 21.3331, lon: 83.6190, address: "Bargarh Rice Bowl Market Yard" },
  ],
  "Delhi NCR": [
    { id: "delhi", name: "Delhi Azadpur APMC Mandi", state: "Delhi NCR", district: "North Delhi", lat: 28.7118, lon: 77.1777, address: "Azadpur Subzi Mandi, GTK Road, Delhi" },
    { id: "okhla", name: "Delhi Okhla Mandi", state: "Delhi NCR", district: "South Delhi", lat: 28.5355, lon: 77.2755, address: "Okhla Wholesale Terminal, New Delhi" },
    { id: "ghazipur", name: "Delhi Ghazipur Terminal Market", state: "Delhi NCR", district: "East Delhi", lat: 28.6258, lon: 77.3294, address: "Ghazipur Fruit & Vegetable Market, Delhi" },
  ],
  "Madhya Pradesh": [
    { id: "indore", name: "Indore (Choithram) Mandi", state: "Madhya Pradesh", district: "Indore", lat: 22.6868, lon: 75.8427, address: "Choithram Mandi, Manik Bagh Road, Indore" },
    { id: "bhopal", name: "Bhopal Karond APMC Mandi", state: "Madhya Pradesh", district: "Bhopal", lat: 23.2599, lon: 77.4126, address: "Karond Mandi Yard, Bhopal" },
    { id: "ujjain", name: "Ujjain Grain & Soybean Mandi", state: "Madhya Pradesh", district: "Ujjain", lat: 23.1765, lon: 75.7885, address: "Chimanganj Mandi, Ujjain" },
    { id: "neemuch", name: "Neemuch Medicinal & Agri Mandi", state: "Madhya Pradesh", district: "Neemuch", lat: 24.4754, lon: 74.8710, address: "Krishi Upaj Mandi, Neemuch" },
  ],
  Gujarat: [
    { id: "deesa", name: "Deesa Potato APMC", state: "Gujarat", district: "Banaskantha", lat: 24.2586, lon: 72.1793, address: "APMC Market Yard, Highway Road, Deesa" },
    { id: "unjha", name: "Unjha Spices & Cumin Mandi", state: "Gujarat", district: "Mehsana", lat: 23.8038, lon: 72.3924, address: "Asia's Premier Cumin & Isabgol Hub, Unjha" },
    { id: "rajkot", name: "Rajkot Bedi APMC Market Yard", state: "Gujarat", district: "Rajkot", lat: 22.3039, lon: 70.8022, address: "Bedi Market Yard, Rajkot" },
    { id: "gondal", name: "Gondal Groundnut & Chilli Yard", state: "Gujarat", district: "Rajkot", lat: 21.9619, lon: 70.7937, address: "Krishi Upaj Mandi, Gondal" },
  ],
  Rajasthan: [
    { id: "jaipur", name: "Jaipur (Muhana) Terminal Mandi", state: "Rajasthan", district: "Jaipur", lat: 26.7825, lon: 75.7483, address: "Muhana Mandi Terminal, Sanganer, Jaipur" },
    { id: "jodhpur", name: "Jodhpur Mandore Grain Mandi", state: "Rajasthan", district: "Jodhpur", lat: 26.2389, lon: 73.0243, address: "Mandore Market Yard, Jodhpur" },
    { id: "kota", name: "Kota Bhamashah Krishi Mandi", state: "Rajasthan", district: "Kota", lat: 25.2138, lon: 75.8648, address: "Bhamashah Mandi Yard, Kota" },
    { id: "ganganagar", name: "Sri Ganganagar Grain Market", state: "Rajasthan", district: "Sri Ganganagar", lat: 29.9038, lon: 73.8772, address: "Dhan Mandi Yard, Sri Ganganagar" },
  ],
  "Uttar Pradesh": [
    { id: "agra", name: "Agra Wholesale Potato Mandi", state: "Uttar Pradesh", district: "Agra", lat: 27.1767, lon: 78.0081, address: "Khandari & Sikandra Mandi Yard, Agra" },
    { id: "kanpur", name: "Kanpur (Chakeri) APMC Mandi", state: "Uttar Pradesh", district: "Kanpur", lat: 26.4499, lon: 80.3319, address: "Chakeri Wholesale Market, Kanpur" },
    { id: "lucknow", name: "Lucknow Dubagga Mandi", state: "Uttar Pradesh", district: "Lucknow", lat: 26.8467, lon: 80.9462, address: "Dubagga Fruit & Vegetable Market, Lucknow" },
    { id: "varanasi", name: "Varanasi Pahariya Mandi", state: "Uttar Pradesh", district: "Varanasi", lat: 25.3176, lon: 82.9739, address: "Pahariya Wholesale Yard, Varanasi" },
  ],
  Karnataka: [
    { id: "kolar", name: "Kolar Tomato APMC Market", state: "Karnataka", district: "Kolar", lat: 13.1378, lon: 78.1291, address: "APMC Yard, Bangarpet Road, Kolar" },
    { id: "bangalore", name: "Bengaluru Yeshwanthpur APMC", state: "Karnataka", district: "Bengaluru", lat: 13.0280, lon: 77.5408, address: "APMC Yard, Yeshwanthpur, Bengaluru" },
    { id: "hubli", name: "Hubballi Cotton & Chilli Market", state: "Karnataka", district: "Dharwad", lat: 15.3647, lon: 75.1240, address: "APMC Amargol Yard, Hubli" },
  ],
  "Andhra Pradesh": [
    { id: "guntur", name: "Guntur Mirchi Yard", state: "Andhra Pradesh", district: "Guntur", lat: 16.3067, lon: 80.4365, address: "Asia's Largest Chilli Yard, Guntur" },
    { id: "vijayawada", name: "Vijayawada Gollapudi APMC", state: "Andhra Pradesh", district: "Krishna", lat: 16.5062, lon: 80.6480, address: "Gollapudi Market Yard, Vijayawada" },
  ],
  "West Bengal": [
    { id: "kolkata", name: "Kolkata (Posta / Koley) Mandi", state: "West Bengal", district: "Kolkata", lat: 22.5851, lon: 88.3541, address: "Posta Wholesale Market, Kolkata" },
    { id: "siliguri", name: "Siliguri Regulated Market", state: "West Bengal", district: "Darjeeling", lat: 26.7271, lon: 88.3953, address: "Champasari Mandi Yard, Siliguri" },
  ],
  "Himachal Pradesh": [
    { id: "shimla", name: "Shimla (Dhalli) Apple Mandi", state: "Himachal Pradesh", district: "Shimla", lat: 31.1114, lon: 77.2023, address: "APMC Subzi Mandi, Dhalli, Shimla" },
    { id: "solan", name: "Solan Tomato Terminal Market", state: "Himachal Pradesh", district: "Solan", lat: 30.9045, lon: 77.0967, address: "Solan Vegetable Mandi Yard" },
  ],
};

export const STATE_NAMES = Object.keys(REGIONAL_MANDIS);

export function getMandisForState(state: string): MandiLocation[] {
  return REGIONAL_MANDIS[state] || REGIONAL_MANDIS["Odisha"] || [];
}

export function findMandiById(id: string): MandiLocation | undefined {
  for (const list of Object.values(REGIONAL_MANDIS)) {
    const found = list.find((m) => m.id === id);
    if (found) return found;
  }
  return undefined;
}

export function stateToRegionId(state: string): string {
  const map: Record<string, string> = {
    Odisha: "odisha",
    Haryana: "haryana",
    Punjab: "punjab",
    Maharashtra: "maharashtra",
    "Delhi NCR": "all_india",
    "Madhya Pradesh": "madhya_pradesh",
    Gujarat: "gujarat",
    Rajasthan: "rajasthan",
    "Uttar Pradesh": "uttar_pradesh",
    Karnataka: "karnataka",
    "Andhra Pradesh": "andhra_pradesh",
    "West Bengal": "west_bengal",
    "Himachal Pradesh": "himachal_pradesh",
  };
  return map[state] || "all_india";
}
