export interface BankResponse {
  code: string;
  desc: string;
  data: Datum[];
}

export interface Datum {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: null | string;
}
