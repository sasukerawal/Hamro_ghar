export const PROVINCES_TO_DISTRICTS = {
  "Koshi": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
  "Madhesh": ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
  "Bagmati": ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
  "Gandaki": ["Baglung", "Gorkha", "Kaski (Pokhara)", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahun"],
  "Lumbini": ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rukum East", "Rupandehi"],
  "Karnali": ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Rukum West", "Salyan", "Surkhet"],
  "Sudurpashchim": ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
};

// All 77 districts of Nepal (sorted by search popularity / population)
export const DISTRICTS_OF_NEPAL = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Kaski (Pokhara)", "Rupandehi",
  "Chitwan", "Morang", "Sunsari", "Jhapa", "Parsa",
  "Kavrepalanchok", "Makwanpur", "Dhanusha", "Bara", "Banke",
  "Kailali", "Dang", "Nuwakot", "Dhading", "Gorkha",
  "Sarlahi", "Rautahat", "Mahottari", "Siraha", "Saptari",
  "Sindhuli", "Sindhupalchok", "Udayapur", "Ilam", "Kanchanpur",
  "Kapilvastu", "Bardiya", "Syangja", "Tanahun", "Lamjung",
  "Nawalpur", "Palpa", "Parasi", "Baglung", "Parbat",
  "Myagdi", "Mustang", "Manang", "Dolakha", "Ramechhap",
  "Okhaldhunga", "Khotang", "Bhojpur", "Dhankuta", "Terhathum",
  "Panchthar", "Taplejung", "Sankhuwasabha", "Solukhumbu",
  "Surkhet", "Dailekh", "Jajarkot", "Salyan", "Pyuthan",
  "Rolpa", "Rukum East", "Rukum West", "Gulmi", "Arghakhanchi",
  "Kalikot", "Jumla", "Dolpa", "Mugu", "Humla",
  "Achham", "Doti", "Bajhang", "Bajura", "Darchula",
  "Baitadi", "Dadeldhura", "Rasuwa",
];

// Municipality/VDC data for each district
// Expanded to cover all major districts with key municipalities
export const MUNICIPALITIES = {
  "Kathmandu": [
    "Kathmandu Metropolitan City", "Kirtipur", "Gokarneshwor", "Budhanilkantha",
    "Tarakeshwar", "Tokha", "Chandragiri", "Nagarjun", "Kageshwori Manohara",
    "Shankharapur", "Dakshinkali"
  ],
  "Lalitpur": [
    "Lalitpur Metropolitan City", "Mahalaxmi", "Godawari", "Bagmati", "Konjyosom", "Mahankal"
  ],
  "Bhaktapur": [
    "Bhaktapur", "Madhyapur Thimi", "Suryabinayak", "Changunarayan"
  ],
  "Kaski (Pokhara)": [
    "Pokhara Metropolitan City", "Annapurna", "Machhapuchchhre", "Madi", "Rupa"
  ],
  "Rupandehi": [
    "Butwal", "Siddharthanagar (Bhairahawa)", "Tilottama", "Devdaha",
    "Lumbini Sanskritik", "Sainamaina", "Rohini", "Marchabari",
    "Sammarimai", "Siyari", "Gajadahawa", "Omsatiya", "Kanchan",
    "Kotahimai", "Mayadevi", "Sudhdhodhan"
  ],
  "Chitwan": [
    "Bharatpur", "Ratnanagar", "Khairahani", "Rapti", "Kalika",
    "Madi", "Ichchhakamana"
  ],
  "Morang": [
    "Biratnagar", "Sunbarshi", "Belbari", "Urlabari", "Pathari Shanischare",
    "Rangeli", "Letang", "Sundarharaicha", "Kanepokhari", "Gramthan",
    "Jahada", "Katahari", "Dhanpalthan", "Kerabari", "Budhiganga", "Mirgauli"
  ],
  "Sunsari": [
    "Itahari", "Dharan", "Inaruwa", "Duhabi", "Barju",
    "Koshi", "Ramdhuni", "Barahachhetra", "Dewanganj", "Harinagara", "Gadhi"
  ],
  "Jhapa": [
    "Bhadrapur", "Birtamod", "Mechinagar", "Damak", "Kankai",
    "Arjundhara", "Shivasatakshi", "Gauradaha", "Buddhashanti",
    "Haldibari", "Jhapa", "Barhadashi", "Kamal", "Kachankawal"
  ],
  "Parsa": [
    "Birgunj", "Bahudarmai", "Parsagadhi", "Pokhariya",
    "Bindabasini", "Chhipaharmai", "Dhobini", "Jagarnathpur",
    "Kalikamai", "Pakaha-Mainpur", "Paterwa Sugauli",
    "Sakhuwa Prasauni", "Sakhuwanankarkatti", "Thori"
  ],
  "Kavrepalanchok": [
    "Dhulikhel", "Banepa", "Panauti", "Namobuddha", "Panchkhal",
    "Mandan Deupur", "Temal", "Bethanchok", "Bhumlu",
    "Chaurideurali", "Khanikhola", "Mahabharat", "Roshi"
  ],
  "Makwanpur": [
    "Hetauda", "Thaha", "Bhimphedi", "Makwanpurgadhi",
    "Manahari", "Bakaiya", "Bagmati", "Indrasarowar",
    "Kailash", "Raksirang"
  ],
  "Dhanusha": [
    "Janakpur", "Chhireshworanath", "Dhanusadham", "Ganeshman Charnath",
    "Mithila", "Nagarain", "Sabaila", "Bateshwar",
    "Dhanauji", "Hanspur", "Janaknandani", "Kamala",
    "Lakshminiya", "Mithila Bihari", "Mukhiyapatti Musaharniya",
    "Shahidbhumi", "Aurahi"
  ],
  "Banke": [
    "Nepalgunj", "Kohalpur", "Narainapur", "Raptisonari",
    "Duduwa", "Janki", "Baijanath", "Khajura"
  ],
  "Kailali": [
    "Dhangadhi", "Tikapur", "Ghodaghodi", "Lamki Chuha",
    "Bhajani", "Gauriganga", "Godawari", "Bardagoriya",
    "Chure", "Janaki", "Joshipur", "Kailari", "Mohanyal"
  ],
  "Dang": [
    "Ghorahi", "Tulsipur", "Lamahi", "Bangalachuli",
    "Dangisharan", "Gadhawa", "Rajpur", "Rapti",
    "Shantinagar", "Babai"
  ],
  "Bara": [
    "Kalaiya", "Jeetpur Simara", "Kolhabi", "Mahagadhimai",
    "Nijgadh", "Simraungadh", "Adarsha Kotwal", "Baragadhi",
    "Devtal", "Karaiyamai", "Parwanipur", "Pheta",
    "Prasauni", "Pacharauta", "Suvarna"
  ],
  "Nuwakot": [
    "Bidur", "Belkotgadhi", "Kakani", "Dupcheshwar",
    "Kispang", "Likhu", "Meghang", "Panchakanya",
    "Shivapuri", "Suryagadhi", "Tadi", "Tarkeshwar"
  ],
  "Dhading": [
    "Dhunibesi", "Nilkantha", "Benighat Rorang", "Gajuri",
    "Galchi", "Gangajamuna", "Jwalamukhi", "Khaniyabas",
    "Netrawati Dabjong", "Rubi Valley", "Siddhalek",
    "Thakre", "Tripurasundari"
  ],
  "Gorkha": [
    "Gorkha", "Palungtar", "Sulikot", "Siranchok",
    "Ajirkot", "Aarughat", "Barpak Sulikot", "Bhimsen Thapa",
    "Chum Nubri", "Dharche", "Shahid Lakhan"
  ],
  "Sarlahi": [
    "Malangawa", "Ishworpur", "Lalbandi", "Haripur",
    "Godaita", "Bagmati", "Barahathawa", "Balara",
    "Basbariya", "Bishnupur", "Brahmpuri", "Chandranagar",
    "Chakraghatta", "Dhankaul", "Haripurwa", "Kabilasi",
    "Kaudena", "Parsa", "Ramnagar"
  ],
  "Kanchanpur": [
    "Mahendranagar", "Bhimdattanagar", "Shuklaphanta",
    "Bedkot", "Belauri", "Krishnapur",
    "Laljhadi", "Punarbas", "Beldandi"
  ],
  "Sindhuli": [
    "Kamalamai", "Dudhauli", "Golanjor", "Ghyanglekh",
    "Hariharpurgadhi", "Marin", "Phikkal", "Sunkoshi", "Tinpatan"
  ],
  "Sindhupalchok": [
    "Chautara Sangachokgadhi", "Melamchi", "Barhabise",
    "Helambu", "Indrawati", "Jugal", "Lisankhu Pakhar",
    "Bhotekoshi", "Panchpokhari Thangpal", "Sunkoshi", "Tripurasundari"
  ],
  "Ilam": [
    "Ilam", "Deumai", "Mai", "Suryodaya",
    "Chulachuli", "Phakphokthum", "Mangsebung",
    "Mai Jogmai", "Rong", "Sandakpur"
  ],
  "Syangja": [
    "Putalibazar", "Waling", "Galyang", "Chapakot",
    "Arjun Chaupari", "Bhirkot", "Biruwa",
    "Harinas", "Kaligandaki", "Aandhikhola", "Phedikhola"
  ],
  "Tanahun": [
    "Damauli (Byas)", "Bhanu", "Shuklagandaki",
    "Bhimad", "Devghat", "Bandipur", "Rishing",
    "Gharahun", "Myagde", "Aanbu Khaireni"
  ],
  "Nawalpur": [
    "Kawasoti", "Gaindakot", "Devchuli", "Madhyabindu",
    "Binayi Tribeni", "Bulingtar", "Hupsekot", "Baudikali"
  ],
  "Kapilvastu": [
    "Kapilbastu", "Buddhabhumi", "Shivaraj",
    "Maharajgunj", "Banganga", "Bijayanagar",
    "Krishnanagar", "Mayadevi", "Suddhodhan",
    "Yashodhara"
  ],
  "Bardiya": [
    "Gulariya", "Rajapur", "Madhuwan",
    "Bansgadhi", "Badhaiyatal", "Barbardiya",
    "Geruwa", "Thakurbaba"
  ],
  "Udayapur": [
    "Triyuga", "Katari", "Chaudandigadhi",
    "Belaka", "Rautamai", "Tapli",
    "Limchungbung", "Udayapurgadhi"
  ],
  "Dolakha": [
    "Bhimeshwor", "Jiri", "Kalinchok",
    "Melung", "Bigu", "Gaurishankar",
    "Baiteshwor", "Sailung", "Tamakoshi"
  ],
  "Surkhet": [
    "Birendranagar", "Bheriganga", "Gurbhakot",
    "Panchapuri", "Lekbeshi", "Barahatal",
    "Chaukune", "Chingad", "Simta"
  ],
  "Palpa": [
    "Tansen", "Rampur", "Tinau",
    "Bagnaskali", "Mathagadhi", "Nisdi",
    "Purbakhola", "Rambha", "Rainadevi Chhahara", "Ribdikot"
  ],
  "Lamjung": [
    "Besisahar", "Rainas", "Sundarbazar",
    "Dordi", "Dudhpokhari", "Kwholasothar",
    "Marsyangdi", "Madhyanepal"
  ],
  "Rautahat": [
    "Gaur", "Chandrapur", "Garuda", "Brindaban",
    "Durga Bhagwati", "Dewahhi Gonahi", "Gujara",
    "Ishanath", "Katahariya", "Madhav Narsingh",
    "Maulapur", "Paroha", "Phatuwa Bijayapur",
    "Rajdevi", "Rajpur", "Yamunamai"
  ],
  "Mahottari": [
    "Jaleshwor", "Bardibas", "Gaushala",
    "Aurahi", "Balwa", "Bhangaha",
    "Ekdara", "Loharpatti", "Manara Siswa",
    "Matihani", "Pipra", "Ramgopalpur",
    "Samsi", "Sonama"
  ],
  "Siraha": [
    "Siraha", "Lahan", "Mirchaiya",
    "Golbazar", "Dhangadhimai", "Kalyanpur",
    "Karjanha", "Arnama", "Aurahi",
    "Bariyarpatti", "Bhagawanpur", "Bishnupur",
    "Laxmipur Patari", "Naraha", "Nawarajpur",
    "Sakhuwa Mahendranagar", "Sukhipur"
  ],
<<<<<<< HEAD
  "Baglung": [
    "Baglung", "Galkot", "Jaimini", "Dhorpatan", "Bareng", "Kathekhola", "Nisikhola", "Tarakhola", "Badigad", "Tamankhola"
  ],
  "Parbat": [
    "Kushma", "Phalebas", "Jaljala", "Paiyun", "Mahashila", "Modi", "Bihadi"
  ],
  "Myagdi": [
    "Beni", "Annapurna", "Dhaulagiri", "Mangala", "Malika", "Raghuganga"
  ],
  "Mustang": [
    "Lomanthang", "Dalome", "Baragung Muktichhetra", "Gharpajhong", "Thasang"
  ],
  "Manang": [
    "Chame", "Nason", "Narpa Bhumi", "Manang Ngisyang"
  ],
  "Ramechhap": [
    "Manthali", "Ramechhap", "Umakunda", "Khandadevi", "Gokulganga", "Doramba", "Likhu Tamakoshi", "Sunapati"
  ],
  "Rasuwa": [
    "Naukunda", "Kalika", "Uttargaya", "Gosaikunda", "Aamachodingmo"
  ],
  "Okhaldhunga": [
    "Siddhicharan", "Khijidemba", "Champadevi", "Chishankhugadhi", "Manebhanjyang", "Molung", "Likhu", "Sunkoshi"
  ],
  "Khotang": [
    "Diktel Rupakot Majhuwagadhi", "Halesi Tuwachung", "Aiselukharka", "Rawa Besi", "Jantedhunga", "Khotehang", "Kepilasgadhi", "Diprung", "Sa-Kela", "Barahapokhari"
  ],
  "Bhojpur": [
    "Bhojpur", "Shadanand", "Hatuwagadhi", "Ramprasad Rai", "Aamchowk", "Tyamke Maiyum", "Arun", "Pauwadungma", "Salpasilichho"
  ],
  "Dhankuta": [
    "Dhankuta", "Pakhribas", "Mahalaxmi", "Sangurigadhi", "Chaubise", "Sahidbhumi", "Chhathar Jorpati"
  ],
  "Terhathum": [
    "Myanglung", "Laligurans", "Aathrai", "Chhathar", "Phedap", "Menchhayayem"
  ],
  "Panchthar": [
    "Phidim", "Miklajung", "Falgunanda", "Hilihang", "Phalelung", "Yangwarak", "Kummayak", "Tumbewa"
  ],
  "Taplejung": [
    "Phungling", "Sirijangha", "Aathrai Triveni", "Pathibhara Yangwarak", "Meringden", "Sidingba", "Phaktanglung", "Maiwakhola", "Mikwakhola"
  ],
  "Sankhuwasabha": [
    "Khandbari", "Chainpur", "Dharmadevi", "Madi", "Panchakhapan", "Bhotkhola", "Chichila", "Makalu", "Sabhapokhari", "Silichong"
  ],
  "Solukhumbu": [
    "Solududhkunda", "Mapya Dudhkoshi", "Kumbu Pasanglamu", "Thulung Dudhkoshi", "Nechasalyan", "Maha Kulung", "Likhupike", "Sotang"
  ],
  "Pyuthan": [
    "Pyuthan", "Swargadwari", "Mandavi", "Jhimruk", "Naubahini", "Mallarani", "Airavati", "Sarumarani", "Gaumukhi"
  ],
  "Rolpa": [
    "Rolpa", "Triveni", "Duikholi", "Madi", "Runtigadhi", "Lungri", "Sunchhahari", "Thabang", "Gangadev", "Parivartan"
  ],
  "Rukum East": [
    "Bhume", "Putha Uttarganga", "Sisne"
  ],
  "Rukum West": [
    "Musikot", "Chaurjahari", "Aathbiskot", "Banfikot", "Tribeni", "Sani Bheri"
  ],
  "Gulmi": [
    "Resunga", "Musikot", "Isma", "Kaligandaki", "Gulmi Darbar", "Satyawati", "Chandrakot", "Rurukshetra", "Chatrakot", "Dhurkot", "Madane", "Malika"
  ],
  "Arghakhanchi": [
    "Sandhikharka", "Sitganga", "Bhumikasthan", "Chhatradev", "Panini", "Malarani"
  ],
  "Jajarkot": [
    "Bheri", "Chhedagad", "Nalgad", "Barekot", "Kushe", "Junichande", "Shivalaya"
  ],
  "Salyan": [
    "Shaarada", "Bagchaur", "Bangad Kupinde", "Kapurkot", "Kalimati", "Triveni", "Chhatreshwori", "Darma", "Kumakh"
  ],
  "Kalikot": [
    "Khandachakra", "Raskot", "Tilagufa", "Pachaljharana", "Sanni Triveni", "Narharinath", "Shubhakalika", "Mahawai", "Palata"
  ],
  "Jumla": [
    "Chandannath", "Kanakasundari", "Sinja", "Hima", "Tila", "Guthichaur", "Tatopani", "Patarasi"
  ],
  "Dolpa": [
    "Thuli Bheri", "Tripurasundari", "Dolpo Buddha", "Shey Phoksundo", "Jagadulla", "Mudkechula", "Kaike", "Chharka Tangsong"
  ],
  "Mugu": [
    "Chhayanath Rara", "Mugum Karmarong", "Soru", "Khatyad"
  ],
  "Humla": [
    "Simikot", "Namkha", "Kharpunath", "Sarkegad", "Chankheli", "Adanchuli", "Tanjakot"
  ],
  "Achham": [
    "Mangalsen", "Kamalbazar", "Sanphebagar", "Panchadewal Binayak", "Chaurpati", "Mellokh", "Bannigadhi Jayagadh", "Ramaroshan", "Dhakari", "Turmakhad"
  ],
  "Doti": [
    "Dipayal Silgadhi", "Shikhar", "Purbichauki", "Badikedar", "Jorayal", "Sayal", "Adarsha", "K.I. Singh", "Bogatan"
  ],
  "Bajhang": [
    "Jaya Prithvi", "Bungal", "Surma", "Talakot", "Masta", "Khaptad Chhanna", "Thalara", "Bitthadchir", "Kedarsyu", "Chabis Pathibhera"
  ],
  "Bajura": [
    "Badimalika", "Triveni", "Budhiganga", "Budhinanda", "Khaptad Chhededaha", "Swami Kartik Khapar", "Jagannath", "Gaumul", "Himali"
  ],
  "Darchula": [
    "Mahakali", "Shailyashikhar", "Malikarjun", "Apimpi", "Naugad", "Marma", "Lekam", "Vyans (Byans)", "Duhun"
  ],
  "Baitadi": [
    "Dasharathchand", "Patan", "Melauli", "Purchaudi", "Sunarya", "Sigas", "Shivanath", "Pancheshwar", "Dogadakedar", "Dilasaini"
  ],
  "Dadeldhura": [
    "Amargadhi", "Parshuram", "Alital", "Bhageshwar", "Navadurga", "Ajaymeru", "Ganyapdhura"
  ],
  "Dailekh": [
    "Narayan", "Dullu", "Aathabis", "Chamunda Bindrasaini", "Thantikandh", "Bhairabi", "Mahabu", "Naumule", "Dungeshwar", "Gurans", "Bhagawatimai"
  ],
  "Parasi": [
    "Ramgram", "Sunwal", "Bardaghat", "Susta", "Pratappur", "Sarawal", "Palhinandan"
  ],
=======
>>>>>>> 7a9515929bc7df666cbe345be314b9ac42018faf
  "Saptari": [
    "Rajbiraj", "Bodebarsain", "Dakneshwori",
    "Hanumannagar Kankalini", "Kanchanrup", "Khadak",
    "Mahadeva", "Rajgadh", "Saptakoshi",
    "Surunga", "Tilathi Koiladi", "Tirhut",
    "Agnisair Krishna Savaran", "Balan Bihul", "Bishnupur",
    "Chhinnamasta", "Rupani", "Shambhunath"
  ],
};

export const FACING_DIRECTIONS = [
  "East", "West", "North", "South",
  "North-East", "North-West", "South-East", "South-West"
];

// Terai districts that use the Bigha-Katha-Dhur system
export const TERAI_DISTRICTS = [
  "Jhapa", "Morang", "Sunsari", "Saptari", "Siraha",
  "Dhanusha", "Mahottari", "Sarlahi", "Rautahat", "Bara",
  "Parsa", "Chitwan", "Rupandehi", "Kapilvastu", "Dang",
  "Banke", "Bardiya", "Kailali", "Kanchanpur", "Parasi",
  "Nawalpur",
];
