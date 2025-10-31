// ISO 3166-1 alpha-2 country codes
export const COUNTRY_TO_ISO = {
  'Albania': 'AL',
  'American Samoa': 'AS',
  'Antigua and Barbuda': 'AG',
  'Argentina': 'AR',
  'Aruba': 'AW',
  'Australia': 'AU',
  'Austria': 'AT',
  'Bahamas': 'BS',
  'Barbados': 'BB',
  'Belgium': 'BE',
  'Belize': 'BZ',
  'Botswana': 'BW',
  'Brazil': 'BR',
  'British Virgin Islands': 'VG',
  'Cambodia': 'KH',
  'Canada': 'CA',
  'Cayman Islands': 'KY',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Cook Islands': 'CK',
  'Costa Rica': 'CR',
  'Croatia': 'HR',
  'Curacao': 'CW',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  'Dominican Republic': 'DO',
  'Ecuador': 'EC',
  'Egypt': 'EG',
  'Estonia': 'EE',
  'Fiji': 'FJ',
  'France': 'FR',
  'French Polynesia': 'PF',
  'Germany': 'DE',
  'Greece': 'GR',
  'Grenada': 'GD',
  'Guatemala': 'GT',
  'Honduras': 'HN',
  'Hungary': 'HU',
  'Indonesia': 'ID',
  'Ireland': 'IE',
  'Italy': 'IT',
  'Jamaica': 'JM',
  'Japan': 'JP',
  'Malaysia': 'MY',
  'Malta': 'MT',
  'Mauritius': 'MU',
  'Mexico': 'MX',
  'Monaco': 'MC',
  'Montenegro': 'ME',
  'Morocco': 'MA',
  'Namibia': 'NA',
  'Nepal': 'NP',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Nicaragua': 'NI',
  'North Macedonia': 'MK',
  'Norway': 'NO',
  'Oman': 'OM',
  'Panama': 'PA',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Romania': 'RO',
  'Saint Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Vincent and the Grenadines': 'VC',
  'Serbia': 'RS',
  'Seychelles': 'SC',
  'Slovenia': 'SI',
  'South Africa': 'ZA',
  'Spain': 'ES',
  'Sri Lanka': 'LK',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Tanzania': 'TZ',
  'Thailand': 'TH',
  'Trinidad and Tobago': 'TT',
  'Tunisia': 'TN',
  'Turkey': 'TR',
  'Turks and Caicos Islands': 'TC',
  'Uganda': 'UG',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Uruguay': 'UY',
  'Vanuatu': 'VU',
  'Vietnam': 'VN',
  'New Caledonia': 'NC',
  'India': 'IN',
  'Senegal': 'SN',
  'Israel': 'IL',
  'U.S. Virgin Islands': 'VI',
  'Saint Vincent and Grenadines': 'VC',
  'Turks and Caicos': 'TC',
  'Sint Maarten': 'SX',
  'Martinique': 'MQ',
  'Northern Cyprus': 'CY',  // Disputed territory, use Cyprus code
  'Puerto Rico': 'PR',
  'Marshall Islands': 'MH',
  'Laos': 'LA',
  'Latvia': 'LV',
  'Micronesia': 'FM',
  'Samoa': 'WS',
  'Tonga': 'TO',
  'Palau': 'PW',
  'Paraguay': 'PY',
  'Saint Martin': 'MF',
  'Taiwan': 'TW',
  'Iceland': 'IS',
  'Solomon Islands': 'SB',
  'Rwanda': 'RW',
  'Singapore': 'SG',
  'Guinea-Bissau': 'GW'
};

// ISO 3166-2 subdivision codes (limited to 10 characters for database)
export const SUBDIVISION_TO_ISO = {
  'US': {
    'Alabama': 'AL',
    'Arizona': 'AZ',
    'California': 'CA',
    'Colorado': 'CO',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Nevada': 'NV',
    'New Mexico': 'NM',
    'North Carolina': 'NC',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'South Carolina': 'SC',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Virginia': 'VA'
  },
  'CA': {
    'Alberta': 'AB',
    'British Columbia': 'BC',
    'New Brunswick': 'NB',
    'Nova Scotia': 'NS',
    'Ontario': 'ON',
    'Prince Edward Island': 'PE'
  },
  'AU': {
    'Australian Capital Territory': 'ACT',
    'New South Wales': 'NSW',
    'Queensland': 'QLD',
    'South Australia': 'SA',
    'Tasmania': 'TAS',
    'Victoria': 'VIC',
    'Western Australia': 'WA'
  },
  'AE': {
    'Abu Dhabi': 'AZ',
    'Dubai': 'DU',
    'Sharjah': 'SH',
    'Ajman': 'AJ',
    'Umm Al-Quwain': 'UQ',
    'Ras Al Khaimah': 'RK',
    'Fujairah': 'FU'
  },
  'MX': {
    'Baja California': 'BC',
    'Baja California Sur': 'BCS',
    'Jalisco': 'JAL',
    'Nayarit': 'NAY',
    'Oaxaca': 'OAX',
    'Quintana Roo': 'QR',
    'Yucatan': 'YUC',
    'Central America': null  // Not a real subdivision, leave NULL
  },
  'ES': {
    'Andalusia': 'AN',
    'Aragon': 'AR',
    'Balearic Islands': 'IB',
    'Canary Islands': 'CN',
    'Catalonia': 'CT',
    'Galicia': 'GA',
    'Murcia': 'MU',
    'Valencia': 'VC'
  },
  'PT': {
    'Algarve': 'FAR',
    'Azores': 'AZO',
    'Center': 'CEN',
    'Lisbon': 'LIS',
    'Madeira': 'MAD',
    'North': 'NOR'
  },
  'FR': {
    'Auvergne-Rhone-Alpes': 'ARA',
    'Nouvelle-Aquitaine': 'NAQ',
    'Occitanie': 'OCC',
    'Provence-Alpes-Cote-d-Azur': 'PAC',
    'Provence-Alpes-Côte d\'Azur': 'PAC',
    'Île-de-France': 'IDF'
  },
  'IT': {
    'Abruzzo': 'ABR',
    'Lazio': 'LAZ',
    'Liguria': 'LIG',
    'Lombardy': 'LOM',
    'Sardinia': 'SAR',
    'Sicily': 'SIC',
    'Tuscany': 'TOS',
    'Umbria': 'UMB'
  },
  'MY': {
    'Penang': 'PNG',
    'Selangor': 'SEL',
    'Kuala Lumpur': 'KUL',
    'Sabah': 'SAB',
    'Sarawak': 'SWK',
    'Johor': 'JHR',
    'Melaka': 'MLK'
  },
  'TH': {
    'Bangkok': 'BKK',
    'Chiang Mai': 'CMI',
    'Krabi': 'KBI',
    'Phuket': 'PKT',
    'Surat Thani': 'SNI'
  },
  'GR': {
    'Attica': 'ATT',
    'Central Macedonia': 'CMC',
    'Crete': 'CRE',
    'Epirus': 'EPI',
    'Ionian Islands': 'ION',
    'Peloponnese': 'PEL',
    'Western Greece': 'WGR'
  },
  'HR': {
    'Dalmatia': null,  // Region, not official subdivision
    'Dubrovnik-Neretva County': 'DBK',
    'Istria': 'IST',
    'Istria County': 'IST',
    'Split-Dalmatia County': 'SPL',
    'Zadar': 'ZAD'
  },
  'AR': {
    'Buenos Aires': 'BA',
    'Mendoza': 'M',
    'Río Negro': 'RN'
  },
  'CL': {
    'Coquimbo': 'CO',
    'Santiago': 'RM',
    'Valparaíso': 'VS'
  },
  'CR': {
    'Alajuela': 'A',
    'Guanacaste': 'G',
    'San José': 'SJ'
  },
  'EC': {
    'Azuay Province': 'A',
    'Loja': 'L',
    'Manabí': 'M',
    'Pichincha': 'P',
    'Santa Elena': 'SE'
  },
  'CO': {
    'Antioquia': 'ANT',
    'Bolívar': 'BOL',
    'Boyacá': 'BOY',
    'Magdalena': 'MAG'
  },
  'BS': {
    'Great Exuma': 'Exuma',
    'New Providence': 'NP'
  },
  'DO': {
    'La Altagracia': 'LA',
    'Puerto Plata': 'PP',
    'Samaná': 'SM'
  },
  'BZ': {
    'Ambergris Caye': null,  // Island, not official subdivision
    'Cayo': 'CY',
    'Corozal': 'CZL',
    'Stann Creek': 'SC'
  },
  'PH': {
    'Cebu': 'CEB',
    'Metro Manila': 'MNL',
    'Palawan': 'PLW'
  },
  'ID': {
    'Bali': 'BA',
    'Central Java': 'JT',
    'East Java': 'JI',
    'Jakarta': 'JK',
    'West Java': 'JB'
  },
  'VN': {
    'Bà Rịa-Vũng Tàu': 'BR',
    'Central Vietnam': null,  // Region, not official subdivision
    'Ho Chi Minh City': 'SG',
    'Khánh Hòa': 'KH',
    'Quảng Nam': 'QN'
  },
  'JP': {
    'Chiba': '12',
    'Fukuoka': '40',
    'Kanagawa': '14',
    'Kyoto': '26',
    'Nara': '29',
    'Osaka': '27',
    'Tokyo': '13'
  },
  'NZ': {
    'Auckland': 'AUK',
    'Bay of Plenty': 'BOP',
    'Canterbury': 'CAN',
    'Nelson': 'NSN',
    'Otago': 'OTA',
    'Wellington': 'WGN'
  },
  'ZA': {
    'Eastern Cape': 'EC',
    'KwaZulu-Natal': 'KZN',
    'Western Cape': 'WC'
  },
  'GB': {
    'Cornwall': 'COR',
    'Scotland': 'SCT',
    'South West England': 'SWE'
  },
  'DE': {
    'Baden-Württemberg': 'BW',
    'Bavaria': 'BY',
    'Hesse': 'HE',
    'Mecklenburg-Vorpommern': 'MV',
    'Rhineland-Palatinate': 'RP',
    'Schleswig-Holstein': 'SH'
  },
  'BE': {
    'East Flanders': 'VOV',
    'Flemish Brabant': 'VBR',
    'Namur Province': 'WNA',
    'West Flanders': 'VWV'
  },
  'SC': {
    'Mahé': 'Mahé'
  },
  'FJ': {
    'Central Division': 'C',
    'Northern Division': 'N',
    'Western Division': 'W'
  },
  'EG': {
    'Cairo': 'C',
    'Red Sea': 'BA',
    'South Sinai': 'JS'
  },
  'PE': {
    'Arequipa': 'ARE',
    'Cusco': 'CUS',
    'La Libertad': 'LAL',
    'Lima': 'LIM'
  }
  // For countries with only 1-2 towns, we'll let them keep region as-is or NULL
};
