const fs = require("fs");
const path = require("path");

const remaining = {
    "Baglung": ["Baglung", "Galkot", "Jaimini", "Dhorpatan", "Bareng", "Kathekhola", "Nisikhola", "Tarakhola", "Badigad", "Tamankhola"],
    "Parbat": ["Kushma", "Phalebas", "Jaljala", "Paiyun", "Mahashila", "Modi", "Bihadi"],
    "Myagdi": ["Beni", "Annapurna", "Dhaulagiri", "Mangala", "Malika", "Raghuganga"],
    "Mustang": ["Lomanthang", "Dalome", "Baragung Muktichhetra", "Gharpajhong", "Thasang"],
    "Manang": ["Chame", "Nason", "Narpa Bhumi", "Manang Ngisyang"],
    "Ramechhap": ["Manthali", "Ramechhap", "Umakunda", "Khandadevi", "Gokulganga", "Doramba", "Likhu Tamakoshi", "Sunapati"],
    "Rasuwa": ["Naukunda", "Kalika", "Uttargaya", "Gosaikunda", "Aamachodingmo"],
    "Okhaldhunga": ["Siddhicharan", "Khijidemba", "Champadevi", "Chishankhugadhi", "Manebhanjyang", "Molung", "Likhu", "Sunkoshi"],
    "Khotang": ["Diktel Rupakot Majhuwagadhi", "Halesi Tuwachung", "Aiselukharka", "Rawa Besi", "Jantedhunga", "Khotehang", "Kepilasgadhi", "Diprung", "Sa-Kela", "Barahapokhari"],
    "Bhojpur": ["Bhojpur", "Shadanand", "Hatuwagadhi", "Ramprasad Rai", "Aamchowk", "Tyamke Maiyum", "Arun", "Pauwadungma", "Salpasilichho"],
    "Dhankuta": ["Dhankuta", "Pakhribas", "Mahalaxmi", "Sangurigadhi", "Chaubise", "Sahidbhumi", "Chhathar Jorpati"],
    "Terhathum": ["Myanglung", "Laligurans", "Aathrai", "Chhathar", "Phedap", "Menchhayayem"],
    "Panchthar": ["Phidim", "Miklajung", "Falgunanda", "Hilihang", "Phalelung", "Yangwarak", "Kummayak", "Tumbewa"],
    "Taplejung": ["Phungling", "Sirijangha", "Aathrai Triveni", "Pathibhara Yangwarak", "Meringden", "Sidingba", "Phaktanglung", "Maiwakhola", "Mikwakhola"],
    "Sankhuwasabha": ["Khandbari", "Chainpur", "Dharmadevi", "Madi", "Panchakhapan", "Bhotkhola", "Chichila", "Makalu", "Sabhapokhari", "Silichong"],
    "Solukhumbu": ["Solududhkunda", "Mapya Dudhkoshi", "Kumbu Pasanglamu", "Thulung Dudhkoshi", "Nechasalyan", "Maha Kulung", "Likhupike", "Sotang"],
    "Pyuthan": ["Pyuthan", "Swargadwari", "Mandavi", "Jhimruk", "Naubahini", "Mallarani", "Airavati", "Sarumarani", "Gaumukhi"],
    "Rolpa": ["Rolpa", "Triveni", "Duikholi", "Madi", "Runtigadhi", "Lungri", "Sunchhahari", "Thabang", "Gangadev", "Parivartan"],
    "Rukum East": ["Bhume", "Putha Uttarganga", "Sisne"],
    "Rukum West": ["Musikot", "Chaurjahari", "Aathbiskot", "Banfikot", "Tribeni", "Sani Bheri"],
    "Gulmi": ["Resunga", "Musikot", "Isma", "Kaligandaki", "Gulmi Darbar", "Satyawati", "Chandrakot", "Rurukshetra", "Chatrakot", "Dhurkot", "Madane", "Malika"],
    "Arghakhanchi": ["Sandhikharka", "Sitganga", "Bhumikasthan", "Chhatradev", "Panini", "Malarani"],
    "Jajarkot": ["Bheri", "Chhedagad", "Nalgad", "Barekot", "Kushe", "Junichande", "Shivalaya"],
    "Salyan": ["Shaarada", "Bagchaur", "Bangad Kupinde", "Kapurkot", "Kalimati", "Triveni", "Chhatreshwori", "Darma", "Kumakh"],
    "Kalikot": ["Khandachakra", "Raskot", "Tilagufa", "Pachaljharana", "Sanni Triveni", "Narharinath", "Shubhakalika", "Mahawai", "Palata"],
    "Jumla": ["Chandannath", "Kanakasundari", "Sinja", "Hima", "Tila", "Guthichaur", "Tatopani", "Patarasi"],
    "Dolpa": ["Thuli Bheri", "Tripurasundari", "Dolpo Buddha", "Shey Phoksundo", "Jagadulla", "Mudkechula", "Kaike", "Chharka Tangsong"],
    "Mugu": ["Chhayanath Rara", "Mugum Karmarong", "Soru", "Khatyad"],
    "Humla": ["Simikot", "Namkha", "Kharpunath", "Sarkegad", "Chankheli", "Adanchuli", "Tanjakot"],
    "Achham": ["Mangalsen", "Kamalbazar", "Sanphebagar", "Panchadewal Binayak", "Chaurpati", "Mellokh", "Bannigadhi Jayagadh", "Ramaroshan", "Dhakari", "Turmakhad"],
    "Doti": ["Dipayal Silgadhi", "Shikhar", "Purbichauki", "Badikedar", "Jorayal", "Sayal", "Adarsha", "K.I. Singh", "Bogatan"],
    "Bajhang": ["Jaya Prithvi", "Bungal", "Surma", "Talakot", "Masta", "Khaptad Chhanna", "Thalara", "Bitthadchir", "Kedarsyu", "Chabis Pathibhera"],
    "Bajura": ["Badimalika", "Triveni", "Budhiganga", "Budhinanda", "Khaptad Chhededaha", "Swami Kartik Khapar", "Jagannath", "Gaumul", "Himali"],
    "Darchula": ["Mahakali", "Shailyashikhar", "Malikarjun", "Apimpi", "Naugad", "Marma", "Lekam", "Vyans (Byans)", "Duhun"],
    "Baitadi": ["Dasharathchand", "Patan", "Melauli", "Purchaudi", "Sunarya", "Sigas", "Shivanath", "Pancheshwar", "Dogadakedar", "Dilasaini"],
    "Dadeldhura": ["Amargadhi", "Parshuram", "Alital", "Bhageshwar", "Navadurga", "Ajaymeru", "Ganyapdhura"],
    "Dailekh": ["Narayan", "Dullu", "Aathabis", "Chamunda Bindrasaini", "Thantikandh", "Bhairabi", "Mahabu", "Naumule", "Dungeshwar", "Gurans", "Bhagawatimai"],
    "Parasi": ["Ramgram", "Sunwal", "Bardaghat", "Susta", "Pratappur", "Sarawal", "Palhinandan"]
};

// Add remaining into nepalLocations.js
const targetFile = "c:\\Users\\sasuke rawal\\hamro ghar\\hamro-ghar\\src\\utils\\nepalLocations.js";
let content = fs.readFileSync(targetFile, "utf-8");

let added = Object.entries(remaining).map(([district, munis]) => {
    return `  "${district}": [\n    ${munis.map(m => `"${m}"`).join(", ")}\n  ],`;
}).join("\n");

content = content.replace('  "Saptari": [', added + '\n  "Saptari": [');
fs.writeFileSync(targetFile, content);
console.log("Municipalities appended successfully.");
