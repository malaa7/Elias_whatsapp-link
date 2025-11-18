export interface HistoryEntry {
  id: string;
  phoneNumber: string;
  fullLink: string;
  timestamp: number;
  countryCode: string;
}

export interface Country {
  name: string;
  nameAr: string;
  dialCode: string;
  code: string;
  flag: string;
}
