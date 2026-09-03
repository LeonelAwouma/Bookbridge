export interface CountryData {
  code: string
  name: string
  currency: string
  regions: { name: string; cities: string[] }[]
}

export const countries: CountryData[] = [
  {
    code: 'CM',
    name: 'Cameroon',
    currency: 'XAF',
    regions: [
      { name: 'Littoral', cities: ['Douala', 'Nkongsamba', 'Edéa'] },
      { name: 'Centre', cities: ['Yaoundé', 'Mbalmayo', 'Obala'] },
      { name: 'West', cities: ['Bafoussam', 'Dschang'] },
      { name: 'Northwest', cities: ['Bamenda'] },
      { name: 'Southwest', cities: ['Buea', 'Limbe'] },
    ],
  },
  {
    code: 'SN',
    name: 'Senegal',
    currency: 'XOF',
    regions: [
      { name: 'Dakar', cities: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'] },
      { name: 'Thiès', cities: ['Thiès', 'Mbour'] },
      { name: 'Saint-Louis', cities: ['Saint-Louis'] },
    ],
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    currency: 'XOF',
    regions: [
      { name: 'Abidjan', cities: ['Abidjan', 'Bingerville'] },
      { name: 'Yamoussoukro', cities: ['Yamoussoukro'] },
      { name: 'Bouaké', cities: ['Bouaké'] },
    ],
  },
  {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    regions: [
      { name: 'Lagos State', cities: ['Lagos', 'Ikeja', 'Lekki'] },
      { name: 'Federal Capital Territory', cities: ['Abuja'] },
      { name: 'Rivers State', cities: ['Port Harcourt'] },
      { name: 'Kano State', cities: ['Kano'] },
    ],
  },
  {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    regions: [
      { name: 'Greater Accra', cities: ['Accra', 'Tema'] },
      { name: 'Ashanti', cities: ['Kumasi'] },
      { name: 'Western', cities: ['Takoradi'] },
    ],
  },
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    regions: [
      { name: 'Nairobi County', cities: ['Nairobi'] },
      { name: 'Mombasa County', cities: ['Mombasa'] },
      { name: 'Kisumu County', cities: ['Kisumu'] },
    ],
  },
  {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    regions: [
      { name: 'Kigali City', cities: ['Kigali'] },
      { name: 'Southern Province', cities: ['Huye'] },
      { name: 'Northern Province', cities: ['Musanze'] },
    ],
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    regions: [
      { name: 'Île-de-France', cities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis'] },
      { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon', 'Grenoble'] },
      { name: "Provence-Alpes-Côte d'Azur", cities: ['Marseille', 'Nice'] },
      { name: 'Occitanie', cities: ['Toulouse', 'Montpellier'] },
      { name: 'Nouvelle-Aquitaine', cities: ['Bordeaux'] },
      { name: 'Hauts-de-France', cities: ['Lille'] },
      { name: 'Grand Est', cities: ['Strasbourg'] },
    ],
  },
  {
    code: 'BE',
    name: 'Belgium',
    currency: 'EUR',
    regions: [
      { name: 'Brussels-Capital', cities: ['Brussels'] },
      { name: 'Flanders', cities: ['Antwerp', 'Ghent'] },
      { name: 'Wallonia', cities: ['Liège', 'Charleroi'] },
    ],
  },
  {
    code: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    regions: [
      { name: 'Geneva', cities: ['Geneva'] },
      { name: 'Vaud', cities: ['Lausanne'] },
      { name: 'Zurich', cities: ['Zurich'] },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    regions: [
      { name: 'Berlin', cities: ['Berlin'] },
      { name: 'Bavaria', cities: ['Munich'] },
      { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Düsseldorf'] },
      { name: 'Hesse', cities: ['Frankfurt'] },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    regions: [
      { name: 'England', cities: ['London', 'Manchester', 'Birmingham'] },
      { name: 'Scotland', cities: ['Edinburgh', 'Glasgow'] },
    ],
  },
  {
    code: 'OTHER',
    name: 'Other',
    currency: 'USD',
    regions: [{ name: 'Other', cities: ['Other'] }],
  },
]

export function regionsFor(countryName: string) {
  return countries.find((c) => c.name === countryName)?.regions ?? []
}

export function citiesFor(countryName: string, regionName: string) {
  return regionsFor(countryName).find((r) => r.name === regionName)?.cities ?? []
}

export const majorCities = [
  { city: 'Douala', country: 'Cameroon', lat: 4.0511, lng: 9.7679 },
  { city: 'Yaoundé', country: 'Cameroon', lat: 3.848, lng: 11.5021 },
  { city: 'Dakar', country: 'Senegal', lat: 14.7167, lng: -17.4677 },
  { city: 'Abidjan', country: "Côte d'Ivoire", lat: 5.3599, lng: -4.0083 },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { city: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.187 },
  { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { city: 'Kigali', country: 'Rwanda', lat: -1.9441, lng: 30.0619 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { city: 'Geneva', country: 'Switzerland', lat: 46.2044, lng: 6.1432 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
]
