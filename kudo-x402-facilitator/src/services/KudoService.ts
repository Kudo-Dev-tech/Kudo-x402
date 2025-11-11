import { ethers } from 'ethers';
import type { KudoPaymentParams, SettleResponse } from '../types';
import { KudoABI } from '../KudoABI';

export class KudoService {
    private provider: ethers.Provider;
    private wallet: ethers.Wallet;
    private contractAddress: string;

    constructor(rpcUrl: string, privateKey: string, contractAddress: string) {
        console.log('[KudoService] Initializing KudoService with RPC URL:', rpcUrl);
        console.log('[KudoService] Contract address:', contractAddress);
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contractAddress = contractAddress;
        console.log('[KudoService] Wallet address:', this.wallet.address);
    }

    async mintOnBehalfOf(kudoPaymentParams: KudoPaymentParams): Promise<SettleResponse> {
        console.log('[KudoService.mintOnBehalfOf] Starting mint operation');
        console.log('[KudoService.mintOnBehalfOf] Payment params:', kudoPaymentParams);

        try {
            console.log('[KudoService.mintOnBehalfOf] Creating contract instance');
            const contract = new ethers.Contract(this.contractAddress, KudoABI, this.wallet);

            console.log('[KudoService.mintOnBehalfOf] Calling mintCovenantOnBehalfOf with params:', {
                payer: this.wallet.address,
                agentAddr: kudoPaymentParams.agentAddr,
                covenantPromise: kudoPaymentParams.covenantPromise,
                covenantAsk: kudoPaymentParams.covenantAsk,
                paymentMethod: "CREDIT_CARD",
                debtAmount: kudoPaymentParams.debtAmount,
                amountPaid: 0
            });

            const tx = await contract.mintCovenantOnBehalfOf(
                this.wallet.address,
                kudoPaymentParams.agentAddr,
                "449",
                kudoPaymentParams.debtAmount,
                kudoPaymentParams.covenantPromise,
                kudoPaymentParams.covenantAsk,
                "CREDIT_CARD",
                kudoPaymentParams.signature.v,
                kudoPaymentParams.signature.r,
                kudoPaymentParams.signature.s
            );

            console.log('[KudoService.mintOnBehalfOf] Transaction sent:', tx.hash);
            console.log('[KudoService.mintOnBehalfOf] Waiting for transaction receipt...');
            const receipt = await tx.wait();
            console.log('[KudoService.mintOnBehalfOf] Transaction confirmed:', receipt.hash);

            const networkId = (await this.provider.getNetwork()).chainId.toString();
            console.log('[KudoService.mintOnBehalfOf] Network ID:', networkId);

            return {
                success: true,
                error: null,
                txHash: receipt.hash,
                networkId: networkId
            };
        } catch (error) {
            console.error('[KudoService.mintOnBehalfOf] Error during minting:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during minting';
            console.error('[KudoService.mintOnBehalfOf] Error message:', errorMessage);

            return {
                success: false,
                error: errorMessage,
                txHash: null,
                networkId: null
            };
        }
    }
}
