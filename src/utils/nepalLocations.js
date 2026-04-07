/**
 * Nepal Administrative Hierarchy — Single Source of Truth
 *
 * Structure: NEPAL_DATA[province][district] = [municipalities...]
 * Used by both frontend cascading selects and backend validation.
 */

export const NEPAL_DATA = {
  "Koshi Pradesh": {
    "Bhojpur": ["Bhojpur Municipality", "Shadananda Municipality", "Aamchowk Rural Municipality", "Arun Rural Municipality", "Hatuwagadhi Rural Municipality", "Pauwadungma Rural Municipality", "Ramprasad Rural Municipality", "Salpasilichho Rural Municipality", "Temkemaiyung Rural Municipality"],
    "Dhankuta": ["Dhankuta Municipality", "Mahalaxmi Municipality", "Pakhribas Municipality", "Chaubise Rural Municipality", "Chhathar Jorpati Rural Municipality", "Sangurigadhi Rural Municipality", "Shahidbhumi Rural Municipality"],
    "Ilam": ["Deumai Municipality", "Illam Municipality", "Mai Municipality", "Suryodaya Municipality", "Chulachuli Rural Municipality", "Fakphokthum Rural Municipality", "Maijogmai Rural Municipality", "Mangsebung Rural Municipality", "Rong Rural Municipality", "Sandakpur Rural Municipality"],
    "Jhapa": ["Arjundhara Municipality", "Bhadrapur Municipality", "Birtamod Municipality", "Damak Municipality", "Gauradhaha Municipality", "Kankai Municipality", "Mechinagar Municipality", "Shivasataxi Municipality", "Barhadashi Rural Municipality", "Buddhashanti Rural Municipality", "Gauriganj Rural Municipality", "Haldibari Rural Municipality", "Jhapa Rural Municipality", "Kachankawal Rural Municipality", "Kamal Rural Municipality"],
    "Khotang": ["Diktel Rupakot Majhuwagadhi Municipality", "Halesi Tuwachung Municipality", "Ainselukhark Rural Municipality", "Barahapokhari Rural Municipality", "Diprung Rural Municipality", "Jantedhunga Rural Municipality", "Kepilasagadhi Rural Municipality", "Khotehang Rural Municipality", "Rawa Besi Rural Municipality", "Sakela Rural Municipality"],
    "Morang": ["Biratnagar Metropolitan City", "Belbari Municipality", "Letang Municipality", "Pathari Shanishchare Municipality", "Rangeli Municipality", "Ratuwamai Municipality", "Sundarharaicha Municipality", "Sunwarshi Municipality", "Uralabari Municipality", "Budhiganga Rural Municipality", "Dhanpalthan Rural Municipality", "Gramthan Rural Municipality", "Jahada Rural Municipality", "Kanepokhari Rural Municipality", "Katahari Rural Municipality", "Kerabari Rural Municipality", "Miklajung Rural Municipality"],
    "Okhaldhunga": ["Siddhicharan Municipality", "Champadevi Rural Municipality", "Chisankhugadhi Rural Municipality", "Khijidemba Rural Municipality", "Likhu Rural Municipality", "Manebhanjyang Rural Municipality", "Molung Rural Municipality", "Sunkoshi Rural Municipality"],
    "Panchthar": ["Phidim Municipality", "Falelung Rural Municipality", "Falgunanda Rural Municipality", "Hilihang Rural Municipality", "Kummayak Rural Municipality", "Miklajung Rural Municipality", "Tumbewa Rural Municipality", "Yangwarak Rural Municipality"],
    "Sankhuwasabha": ["Chainpur Municipality", "Dharmadevi Municipality", "Khandbari Municipality", "Madi Municipality", "Panchakhapan Municipality", "Bhotkhola Rural Municipality", "Chichila Rural Municipality", "Makalu Rural Municipality", "Sabhapokhari Rural Municipality", "Silichong Rural Municipality"],
    "Solukhumbu": ["Solududhakunda Municipality", "Khumbupasanglahmu Rural Municipality", "Likhupike Rural Municipality", "Maapya Dudhkoshi Rural Municipality", "Mahakulung Rural Municipality", "Nechasalyan Rural Municipality", "Sotang Rural Municipality", "Thulung Dudhkoshi Rural Municipality"],
    "Sunsari": ["Barahchhetra Municipality", "Duhabi Municipality", "Inaruwa Municipality", "Ramdhuni Municipality", "Dharan Sub-Metropolitan City", "Itahari Sub-Metropolitan City", "Barju Rural Municipality", "Bhokraha Narsing Rural Municipality", "Dewanganj Rural Municipality", "Gadhi Rural Municipality", "Harinagar Rural Municipality", "Koshi Rural Municipality"],
    "Taplejung": ["Phungling Municipality", "Aathrai Tribeni Rural Municipality", "Maiwakhola Rural Municipality", "Meringden Rural Municipality", "Mikwakhola Rural Municipality", "Pathivara Yangwarak Rural Municipality", "Phaktanglung Rural Municipality", "Sidingba Rural Municipality", "Sirijangha Rural Municipality"],
    "Terhathum": ["Laligurans Municipality", "Myanglung Municipality", "Aathrai Rural Municipality", "Chhathar Rural Municipality", "Menchayam Rural Municipality", "Phedap Rural Municipality"],
    "Udayapur": ["Belaka Municipality", "Chaudandigadhi Municipality", "Katari Municipality", "Triyuga Municipality", "Limchungbung Rural Municipality", "Rautamai Rural Municipality", "Tapli Rural Municipality", "Udayapurgadhi Rural Municipality"],
  },

  "Madhesh Pradesh": {
    "Bara": ["Kolhabi Municipality", "Mahagadhimai Municipality", "Nijgadh Municipality", "Pacharauta Municipality", "Simraungadh Municipality", "Jitpursimara Sub-Metropolitan City", "Kalaiya Sub-Metropolitan City", "Adarsh Kotwal Rural Municipality", "Baragadhi Rural Municipality", "Bishrampur Rural Municipality", "Devtal Rural Municipality", "Karaiyamai Rural Municipality", "Parwanipur Rural Municipality", "Pheta Rural Municipality", "Prasauni Rural Municipality", "Suwarna Rural Municipality"],
    "Dhanusha": ["Chhireshwornath Municipality", "Dhanushadham Municipality", "Ganeshman Charnath Municipality", "Janakpur Sub-Metropolitan City", "Mithila Municipality", "Nagarain Municipality", "Sabaila Municipality", "Bateshwar Rural Municipality", "Dhanauji Rural Municipality", "Hanspur Rural Municipality", "Janaknandani Rural Municipality", "Kamala Rural Municipality", "Lakshminiya Rural Municipality", "Mithila Bihari Rural Municipality", "Mukhiyapatti Musaharniya Rural Municipality", "Shahidbhumi Rural Municipality", "Aurahi Rural Municipality"],
    "Mahottari": ["Jaleshwor Municipality", "Bardibas Municipality", "Gaushala Municipality", "Aurahi Rural Municipality", "Balwa Rural Municipality", "Bhangaha Rural Municipality", "Ekdara Rural Municipality", "Loharpatti Rural Municipality", "Manara Siswa Rural Municipality", "Matihani Rural Municipality", "Pipra Rural Municipality", "Ramgopalpur Rural Municipality", "Samsi Rural Municipality", "Sonama Rural Municipality"],
    "Parsa": ["Birgunj Metropolitan City", "Bahudarmai Municipality", "Parsagadhi Municipality", "Pokhariya Municipality", "Bindabasini Rural Municipality", "Chhipaharmai Rural Municipality", "Dhobini Rural Municipality", "Jagarnathpur Rural Municipality", "Kalikamai Rural Municipality", "Pakaha Mainpur Rural Municipality", "Paterwa Sugauli Rural Municipality", "Sakhuwa Prasauni Rural Municipality", "Sakhuwanankarkatti Rural Municipality", "Thori Rural Municipality"],
    "Rautahat": ["Gaur Municipality", "Chandrapur Municipality", "Garuda Municipality", "Brindaban Municipality", "Durga Bhagwati Rural Municipality", "Dewahhi Gonahi Rural Municipality", "Gujara Rural Municipality", "Ishanath Rural Municipality", "Katahariya Rural Municipality", "Madhav Narsingh Rural Municipality", "Maulapur Rural Municipality", "Paroha Rural Municipality", "Phatuwa Bijayapur Rural Municipality", "Rajdevi Rural Municipality", "Rajpur Rural Municipality", "Yamunamai Rural Municipality"],
    "Saptari": ["Rajbiraj Municipality", "Bodebarsain Municipality", "Dakneshwori Municipality", "Hanumannagar Kankalini Municipality", "Kanchanrup Municipality", "Khadak Municipality", "Mahadeva Municipality", "Rajgadh Rural Municipality", "Saptakoshi Rural Municipality", "Surunga Municipality", "Tilathi Koiladi Rural Municipality", "Tirhut Rural Municipality", "Agnisair Krishna Savaran Rural Municipality", "Balan Bihul Rural Municipality", "Bishnupur Rural Municipality", "Chhinnamasta Rural Municipality", "Rupani Rural Municipality", "Shambhunath Municipality"],
    "Sarlahi": ["Malangawa Municipality", "Ishworpur Municipality", "Lalbandi Municipality", "Haripur Municipality", "Godaita Municipality", "Bagmati Municipality", "Barahathawa Municipality", "Balara Rural Municipality", "Basbariya Rural Municipality", "Bishnupur Rural Municipality", "Brahmpuri Rural Municipality", "Chandranagar Rural Municipality", "Chakraghatta Rural Municipality", "Dhankaul Rural Municipality", "Haripurwa Rural Municipality", "Kabilasi Rural Municipality", "Kaudena Rural Municipality", "Parsa Rural Municipality", "Ramnagar Rural Municipality"],
    "Siraha": ["Siraha Municipality", "Lahan Municipality", "Mirchaiya Municipality", "Golbazar Municipality", "Dhangadhimai Municipality", "Kalyanpur Municipality", "Karjanha Municipality", "Arnama Rural Municipality", "Aurahi Rural Municipality", "Bariyarpatti Rural Municipality", "Bhagawanpur Rural Municipality", "Bishnupur Rural Municipality", "Laxmipur Patari Rural Municipality", "Naraha Rural Municipality", "Nawarajpur Rural Municipality", "Sakhuwa Mahendranagar Rural Municipality", "Sukhipur Rural Municipality"],
  },

  "Bagmati Pradesh": {
    "Bhaktapur": ["Bhaktapur Municipality", "Madhyapur Thimi Municipality", "Suryabinayak Municipality", "Changunarayan Municipality"],
    "Chitwan": ["Bharatpur Metropolitan City", "Ratnanagar Municipality", "Khairahani Municipality", "Rapti Municipality", "Kalika Municipality", "Madi Municipality", "Ichchhakamana Rural Municipality"],
    "Dhading": ["Dhunibesi Municipality", "Nilkantha Municipality", "Benighat Rorang Rural Municipality", "Gajuri Rural Municipality", "Galchi Rural Municipality", "Gangajamuna Rural Municipality", "Jwalamukhi Rural Municipality", "Khaniyabas Rural Municipality", "Netrawati Dabjong Rural Municipality", "Rubi Valley Rural Municipality", "Siddhalek Rural Municipality", "Thakre Rural Municipality", "Tripurasundari Rural Municipality"],
    "Dolakha": ["Bhimeshwor Municipality", "Jiri Municipality", "Kalinchok Rural Municipality", "Melung Rural Municipality", "Bigu Rural Municipality", "Gaurishankar Rural Municipality", "Baiteshwor Rural Municipality", "Sailung Rural Municipality", "Tamakoshi Rural Municipality"],
    "Kathmandu": ["Kathmandu Metropolitan City", "Kirtipur Municipality", "Gokarneshwor Municipality", "Budhanilkantha Municipality", "Tarakeshwar Municipality", "Tokha Municipality", "Chandragiri Municipality", "Nagarjun Municipality", "Kageshwori Manohara Municipality", "Shankharapur Municipality", "Dakshinkali Municipality"],
    "Kavrepalanchok": ["Dhulikhel Municipality", "Banepa Municipality", "Panauti Municipality", "Namobuddha Municipality", "Panchkhal Municipality", "Mandan Deupur Rural Municipality", "Temal Rural Municipality", "Bethanchok Rural Municipality", "Bhumlu Rural Municipality", "Chaurideurali Rural Municipality", "Khanikhola Rural Municipality", "Mahabharat Rural Municipality", "Roshi Rural Municipality"],
    "Lalitpur": ["Lalitpur Metropolitan City", "Mahalaxmi Municipality", "Godawari Municipality", "Bagmati Rural Municipality", "Konjyosom Rural Municipality", "Mahankal Rural Municipality"],
    "Makwanpur": ["Hetauda Sub-Metropolitan City", "Thaha Municipality", "Bhimphedi Rural Municipality", "Makwanpurgadhi Rural Municipality", "Manahari Rural Municipality", "Bakaiya Rural Municipality", "Bagmati Rural Municipality", "Indrasarowar Rural Municipality", "Kailash Rural Municipality", "Raksirang Rural Municipality"],
    "Nuwakot": ["Bidur Municipality", "Belkotgadhi Municipality", "Kakani Rural Municipality", "Dupcheshwar Rural Municipality", "Kispang Rural Municipality", "Likhu Rural Municipality", "Meghang Rural Municipality", "Panchakanya Rural Municipality", "Shivapuri Rural Municipality", "Suryagadhi Rural Municipality", "Tadi Rural Municipality", "Tarkeshwar Rural Municipality"],
    "Ramechhap": ["Manthali Municipality", "Ramechhap Municipality", "Umakunda Rural Municipality", "Khandadevi Rural Municipality", "Gokulganga Rural Municipality", "Doramba Rural Municipality", "Likhu Tamakoshi Rural Municipality", "Sunapati Rural Municipality"],
    "Rasuwa": ["Naukunda Rural Municipality", "Kalika Rural Municipality", "Uttargaya Rural Municipality", "Gosaikunda Rural Municipality", "Aamachodingmo Rural Municipality"],
    "Sindhuli": ["Kamalamai Municipality", "Dudhauli Municipality", "Golanjor Rural Municipality", "Ghyanglekh Rural Municipality", "Hariharpurgadhi Rural Municipality", "Marin Rural Municipality", "Phikkal Rural Municipality", "Sunkoshi Rural Municipality", "Tinpatan Rural Municipality"],
    "Sindhupalchok": ["Chautara Sangachokgadhi Municipality", "Melamchi Municipality", "Barhabise Municipality", "Helambu Rural Municipality", "Indrawati Rural Municipality", "Jugal Rural Municipality", "Lisankhu Pakhar Rural Municipality", "Bhotekoshi Rural Municipality", "Panchpokhari Thangpal Rural Municipality", "Sunkoshi Rural Municipality", "Tripurasundari Rural Municipality"],
  },

  "Gandaki Pradesh": {
    "Baglung": ["Baglung Municipality", "Galkot Municipality", "Jaimini Municipality", "Dhorpatan Municipality", "Bareng Rural Municipality", "Kathekhola Rural Municipality", "Nisikhola Rural Municipality", "Tarakhola Rural Municipality", "Badigad Rural Municipality", "Tamankhola Rural Municipality"],
    "Gorkha": ["Gorkha Municipality", "Palungtar Municipality", "Sulikot Rural Municipality", "Siranchok Rural Municipality", "Ajirkot Rural Municipality", "Aarughat Rural Municipality", "Barpak Sulikot Rural Municipality", "Bhimsen Thapa Rural Municipality", "Chum Nubri Rural Municipality", "Dharche Rural Municipality", "Shahid Lakhan Rural Municipality"],
    "Kaski": ["Pokhara Metropolitan City", "Annapurna Rural Municipality", "Machhapuchchhre Rural Municipality", "Madi Rural Municipality", "Rupa Rural Municipality"],
    "Lamjung": ["Besisahar Municipality", "Rainas Municipality", "Sundarbazar Municipality", "Dordi Rural Municipality", "Dudhpokhari Rural Municipality", "Kwholasothar Rural Municipality", "Marsyangdi Rural Municipality", "Madhyanepal Municipality"],
    "Manang": ["Chame Rural Municipality", "Nason Rural Municipality", "Narpa Bhumi Rural Municipality", "Manang Ngisyang Rural Municipality"],
    "Mustang": ["Lomanthang Rural Municipality", "Dalome Rural Municipality", "Baragung Muktichhetra Rural Municipality", "Gharpajhong Rural Municipality", "Thasang Rural Municipality"],
    "Myagdi": ["Beni Municipality", "Annapurna Rural Municipality", "Dhaulagiri Rural Municipality", "Mangala Rural Municipality", "Malika Rural Municipality", "Raghuganga Rural Municipality"],
    "Nawalpur": ["Kawasoti Municipality", "Gaindakot Municipality", "Devchuli Municipality", "Madhyabindu Municipality", "Binayi Tribeni Rural Municipality", "Bulingtar Rural Municipality", "Hupsekot Rural Municipality", "Baudikali Rural Municipality"],
    "Parbat": ["Kushma Municipality", "Phalebas Municipality", "Jaljala Rural Municipality", "Paiyun Rural Municipality", "Mahashila Rural Municipality", "Modi Rural Municipality", "Bihadi Rural Municipality"],
    "Syangja": ["Putalibazar Municipality", "Waling Municipality", "Galyang Municipality", "Chapakot Municipality", "Arjun Chaupari Rural Municipality", "Bhirkot Rural Municipality", "Biruwa Rural Municipality", "Harinas Rural Municipality", "Kaligandaki Rural Municipality", "Aandhikhola Rural Municipality", "Phedikhola Rural Municipality"],
    "Tanahun": ["Damauli Municipality", "Bhanu Municipality", "Shuklagandaki Municipality", "Bhimad Municipality", "Devghat Rural Municipality", "Bandipur Rural Municipality", "Rishing Rural Municipality", "Gharahun Rural Municipality", "Myagde Rural Municipality", "Aanbu Khaireni Rural Municipality"],
  },

  "Lumbini Pradesh": {
    "Arghakhanchi": ["Sandhikharka Municipality", "Sitganga Municipality", "Bhumikasthan Municipality", "Chhatradev Rural Municipality", "Panini Rural Municipality", "Malarani Rural Municipality"],
    "Banke": ["Nepalgunj Sub-Metropolitan City", "Kohalpur Municipality", "Narainapur Rural Municipality", "Raptisonari Rural Municipality", "Duduwa Rural Municipality", "Janki Rural Municipality", "Baijanath Rural Municipality", "Khajura Rural Municipality"],
    "Bardiya": ["Gulariya Municipality", "Rajapur Municipality", "Madhuwan Municipality", "Bansgadhi Municipality", "Badhaiyatal Rural Municipality", "Barbardiya Rural Municipality", "Geruwa Rural Municipality", "Thakurbaba Municipality"],
    "Dang": ["Ghorahi Sub-Metropolitan City", "Tulsipur Sub-Metropolitan City", "Lamahi Municipality", "Bangalachuli Rural Municipality", "Dangisharan Rural Municipality", "Gadhawa Rural Municipality", "Rajpur Rural Municipality", "Rapti Rural Municipality", "Shantinagar Rural Municipality", "Babai Rural Municipality"],
    "Gulmi": ["Resunga Municipality", "Musikot Municipality", "Isma Rural Municipality", "Kaligandaki Rural Municipality", "Gulmi Darbar Rural Municipality", "Satyawati Rural Municipality", "Chandrakot Rural Municipality", "Rurukshetra Rural Municipality", "Chatrakot Rural Municipality", "Dhurkot Rural Municipality", "Madane Rural Municipality", "Malika Rural Municipality"],
    "Kapilvastu": ["Kapilbastu Municipality", "Buddhabhumi Municipality", "Shivaraj Municipality", "Maharajgunj Municipality", "Banganga Municipality", "Bijayanagar Rural Municipality", "Krishnanagar Municipality", "Mayadevi Rural Municipality", "Suddhodhan Rural Municipality", "Yashodhara Rural Municipality"],
    "Palpa": ["Tansen Municipality", "Rampur Municipality", "Tinau Rural Municipality", "Bagnaskali Rural Municipality", "Mathagadhi Rural Municipality", "Nisdi Rural Municipality", "Purbakhola Rural Municipality", "Rambha Rural Municipality", "Rainadevi Chhahara Rural Municipality", "Ribdikot Rural Municipality"],
    "Parasi": ["Ramgram Municipality", "Sunwal Municipality", "Bardaghat Municipality", "Susta Rural Municipality", "Pratappur Rural Municipality", "Sarawal Rural Municipality", "Palhinandan Rural Municipality"],
    "Pyuthan": ["Pyuthan Municipality", "Swargadwari Municipality", "Mandavi Rural Municipality", "Jhimruk Rural Municipality", "Naubahini Rural Municipality", "Mallarani Rural Municipality", "Airavati Rural Municipality", "Sarumarani Rural Municipality", "Gaumukhi Rural Municipality"],
    "Rolpa": ["Rolpa Municipality", "Triveni Rural Municipality", "Duikholi Rural Municipality", "Madi Rural Municipality", "Runtigadhi Rural Municipality", "Lungri Rural Municipality", "Sunchhahari Rural Municipality", "Thabang Rural Municipality", "Gangadev Rural Municipality", "Parivartan Rural Municipality"],
    "Rukum East": ["Bhume Rural Municipality", "Putha Uttarganga Rural Municipality", "Sisne Rural Municipality"],
    "Rupandehi": ["Butwal Sub-Metropolitan City", "Siddharthanagar Municipality", "Tilottama Municipality", "Devdaha Municipality", "Lumbini Sanskritik Municipality", "Sainamaina Municipality", "Rohini Rural Municipality", "Marchabari Rural Municipality", "Sammarimai Rural Municipality", "Siyari Rural Municipality", "Gajadahawa Rural Municipality", "Omsatiya Rural Municipality", "Kanchan Rural Municipality", "Kotahimai Rural Municipality", "Mayadevi Rural Municipality", "Sudhdhodhan Rural Municipality"],
  },

  "Karnali Pradesh": {
    "Dailekh": ["Narayan Municipality", "Dullu Municipality", "Aathabis Municipality", "Chamunda Bindrasaini Municipality", "Thantikandh Rural Municipality", "Bhairabi Rural Municipality", "Mahabu Rural Municipality", "Naumule Rural Municipality", "Dungeshwar Rural Municipality", "Gurans Rural Municipality", "Bhagawatimai Rural Municipality"],
    "Dolpa": ["Thuli Bheri Municipality", "Tripurasundari Municipality", "Dolpo Buddha Rural Municipality", "Shey Phoksundo Rural Municipality", "Jagadulla Rural Municipality", "Mudkechula Rural Municipality", "Kaike Rural Municipality", "Chharka Tangsong Rural Municipality"],
    "Humla": ["Simikot Rural Municipality", "Namkha Rural Municipality", "Kharpunath Rural Municipality", "Sarkegad Rural Municipality", "Chankheli Rural Municipality", "Adanchuli Rural Municipality", "Tanjakot Rural Municipality"],
    "Jajarkot": ["Bheri Municipality", "Chhedagad Municipality", "Nalgad Municipality", "Barekot Rural Municipality", "Kushe Rural Municipality", "Junichande Rural Municipality", "Shivalaya Rural Municipality"],
    "Jumla": ["Chandannath Municipality", "Kanakasundari Rural Municipality", "Sinja Rural Municipality", "Hima Rural Municipality", "Tila Rural Municipality", "Guthichaur Rural Municipality", "Tatopani Rural Municipality", "Patarasi Rural Municipality"],
    "Kalikot": ["Khandachakra Municipality", "Raskot Municipality", "Tilagufa Municipality", "Pachaljharana Rural Municipality", "Sanni Triveni Rural Municipality", "Narharinath Rural Municipality", "Shubhakalika Rural Municipality", "Mahawai Rural Municipality", "Palata Rural Municipality"],
    "Mugu": ["Chhayanath Rara Municipality", "Mugum Karmarong Rural Municipality", "Soru Rural Municipality", "Khatyad Rural Municipality"],
    "Rukum West": ["Musikot Municipality", "Chaurjahari Municipality", "Aathbiskot Municipality", "Banfikot Rural Municipality", "Tribeni Rural Municipality", "Sani Bheri Rural Municipality"],
    "Salyan": ["Shaarada Municipality", "Bagchaur Municipality", "Bangad Kupinde Municipality", "Kapurkot Rural Municipality", "Kalimati Rural Municipality", "Triveni Rural Municipality", "Chhatreshwori Rural Municipality", "Darma Rural Municipality", "Kumakh Rural Municipality"],
    "Surkhet": ["Birendranagar Municipality", "Bheriganga Municipality", "Gurbhakot Municipality", "Panchapuri Municipality", "Lekbeshi Municipality", "Barahatal Rural Municipality", "Chaukune Rural Municipality", "Chingad Rural Municipality", "Simta Rural Municipality"],
  },

  "Sudurpashchim Pradesh": {
    "Achham": ["Mangalsen Municipality", "Kamalbazar Municipality", "Sanphebagar Municipality", "Panchadewal Binayak Municipality", "Chaurpati Rural Municipality", "Mellokh Rural Municipality", "Bannigadhi Jayagadh Rural Municipality", "Ramaroshan Rural Municipality", "Dhakari Rural Municipality", "Turmakhad Rural Municipality"],
    "Baitadi": ["Dasharathchand Municipality", "Patan Municipality", "Melauli Municipality", "Purchaudi Municipality", "Sunarya Rural Municipality", "Sigas Rural Municipality", "Shivanath Rural Municipality", "Pancheshwar Rural Municipality", "Dogadakedar Rural Municipality", "Dilasaini Rural Municipality"],
    "Bajhang": ["Jaya Prithvi Municipality", "Bungal Municipality", "Surma Rural Municipality", "Talakot Rural Municipality", "Masta Rural Municipality", "Khaptad Chhanna Rural Municipality", "Thalara Rural Municipality", "Bitthadchir Rural Municipality", "Kedarsyu Rural Municipality", "Chabis Pathibhera Rural Municipality"],
    "Bajura": ["Badimalika Municipality", "Triveni Municipality", "Budhiganga Municipality", "Budhinanda Municipality", "Khaptad Chhededaha Rural Municipality", "Swami Kartik Khapar Rural Municipality", "Jagannath Rural Municipality", "Gaumul Rural Municipality", "Himali Rural Municipality"],
    "Dadeldhura": ["Amargadhi Municipality", "Parshuram Municipality", "Alital Rural Municipality", "Bhageshwar Rural Municipality", "Navadurga Rural Municipality", "Ajaymeru Rural Municipality", "Ganyapdhura Rural Municipality"],
    "Darchula": ["Mahakali Municipality", "Shailyashikhar Municipality", "Malikarjun Rural Municipality", "Apimpi Rural Municipality", "Naugad Rural Municipality", "Marma Rural Municipality", "Lekam Rural Municipality", "Vyans Rural Municipality", "Duhun Rural Municipality"],
    "Doti": ["Dipayal Silgadhi Municipality", "Shikhar Municipality", "Purbichauki Rural Municipality", "Badikedar Rural Municipality", "Jorayal Rural Municipality", "Sayal Rural Municipality", "Adarsha Rural Municipality", "K.I. Singh Rural Municipality", "Bogatan Rural Municipality"],
    "Kailali": ["Dhangadhi Sub-Metropolitan City", "Tikapur Municipality", "Ghodaghodi Municipality", "Lamki Chuha Municipality", "Bhajani Municipality", "Gauriganga Municipality", "Godawari Municipality", "Bardagoriya Rural Municipality", "Chure Rural Municipality", "Janaki Rural Municipality", "Joshipur Rural Municipality", "Kailari Rural Municipality", "Mohanyal Rural Municipality"],
    "Kanchanpur": ["Bhimdattanagar Municipality", "Shuklaphanta Municipality", "Bedkot Municipality", "Belauri Municipality", "Krishnapur Municipality", "Laljhadi Rural Municipality", "Punarbas Municipality", "Beldandi Rural Municipality", "Mahakali Municipality"],
  },
};

// ── Derived exports (backward compatible) ───────────────────────────────────

/** Province names array */
export const PROVINCES = Object.keys(NEPAL_DATA);

/** Province → Districts mapping */
export const PROVINCES_TO_DISTRICTS = {};
for (const province of PROVINCES) {
  PROVINCES_TO_DISTRICTS[province] = Object.keys(NEPAL_DATA[province]).sort();
}

/** All districts sorted */
export const DISTRICTS_OF_NEPAL = Object.values(PROVINCES_TO_DISTRICTS).flat().sort();

/** District → Municipalities mapping */
export const MUNICIPALITIES = {};
for (const province of PROVINCES) {
  for (const district of Object.keys(NEPAL_DATA[province])) {
    MUNICIPALITIES[district] = NEPAL_DATA[province][district];
  }
}

/** Facing direction options */
export const FACING_DIRECTIONS = [
  "East", "West", "North", "South",
  "North-East", "North-West", "South-East", "South-West"
];

/** Terai districts that use the Bigha-Katha-Dhur system */
export const TERAI_DISTRICTS = [
  "Jhapa", "Morang", "Sunsari", "Saptari", "Siraha",
  "Dhanusha", "Mahottari", "Sarlahi", "Rautahat", "Bara",
  "Parsa", "Chitwan", "Rupandehi", "Kapilvastu", "Dang",
  "Banke", "Bardiya", "Kailali", "Kanchanpur", "Parasi",
  "Nawalpur",
];

/**
 * Validate that a province→district→municipality hierarchy is valid.
 * Returns { valid: boolean, error?: string }
 */
export function validateLocationHierarchy(province, district, municipality) {
  if (!province) return { valid: false, error: "Province is required" };
  if (!district) return { valid: false, error: "District is required" };
  if (!municipality) return { valid: false, error: "Municipality is required" };

  if (!NEPAL_DATA[province]) {
    return { valid: false, error: `Invalid province: ${province}` };
  }
  if (!NEPAL_DATA[province][district]) {
    return { valid: false, error: `District "${district}" does not belong to province "${province}"` };
  }
  if (!NEPAL_DATA[province][district].includes(municipality)) {
    return { valid: false, error: `Municipality "${municipality}" does not belong to district "${district}"` };
  }
  return { valid: true };
}
