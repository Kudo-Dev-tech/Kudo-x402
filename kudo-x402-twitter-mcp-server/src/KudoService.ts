import { Contract, Wallet, JsonRpcProvider } from 'ethers';
import { KudoABI } from './KudoABI.js';

export class KudoService {
  private contract: Contract;
  private wallet: Wallet;

  constructor(
    contractAddress: string,
    privateKey: string,
    rpcUrl: string
  ) {
    const provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, provider);
    this.contract = new Contract(contractAddress, KudoABI, this.wallet);
  }

  /**
   * Calls the setAskSettlementData function on the Kudo contract
   * @param nftId - The NFT ID to set settlement data for
   * @param settlementData - The settlement data string
   * @param promiseDetail - The promise detail string
   * @returns Transaction receipt
   */
  async setAskSettlementData(
    nftId: bigint,
    settlementData: string,
    promiseDetail: string
  ) {
    try {
      const tx = await this.contract.setAskSettlementData(
        nftId,
        settlementData,
        promiseDetail
      );

      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error calling setAskSettlementData:', error);
      throw error;
    }
  }
}