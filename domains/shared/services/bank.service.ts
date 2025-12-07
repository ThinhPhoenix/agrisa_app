import axios from "axios";
import { BankResponse } from "../models/bank.model";

export const bankService = {
  get: {
    getAllBanks: async (): Promise<BankResponse> => {
      return axios.get(`https://api.vietqr.io/v2/banks`);
    },
  },
};