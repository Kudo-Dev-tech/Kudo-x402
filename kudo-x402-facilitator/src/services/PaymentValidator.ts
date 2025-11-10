import { ethers } from 'ethers';
import { PaymentRequirements } from "../types";

export class PaymentValidator {
    validate(paymentRequirements: PaymentRequirements): { isValid: boolean; invalidReason: string | null } {
        console.log('[PaymentValidator.validate] Starting validation');
        console.log('[PaymentValidator.validate] Payment requirements:', paymentRequirements);

        try {
            // Validate required fields
            if (!paymentRequirements.scheme) {
                console.log('[PaymentValidator.validate] Validation failed: Missing payment scheme');
                return { isValid: false, invalidReason: 'Missing payment scheme' };
            }

            if (!paymentRequirements.network) {
                console.log('[PaymentValidator.validate] Validation failed: Missing network');
                return { isValid: false, invalidReason: 'Missing network' };
            }

            if (!paymentRequirements.asset || !ethers.isAddress(paymentRequirements.asset)) {
                console.log('[PaymentValidator.validate] Validation failed: Invalid asset address');
                return { isValid: false, invalidReason: 'Invalid asset address' };
            }

            if (!paymentRequirements.payTo || !ethers.isAddress(paymentRequirements.payTo)) {
                console.log('[PaymentValidator.validate] Validation failed: Invalid payTo address');
                return { isValid: false, invalidReason: 'Invalid payTo address' };
            }

            if (!paymentRequirements.maxAmountRequired) {
                console.log('[PaymentValidator.validate] Validation failed: Missing maxAmountRequired');
                return { isValid: false, invalidReason: 'Missing maxAmountRequired' };
            }

            // Validate maxAmountRequired is a valid uint256 string
            try {
                ethers.getBigInt(paymentRequirements.maxAmountRequired);
            } catch {
                console.log('[PaymentValidator.validate] Validation failed: Invalid maxAmountRequired format');
                return { isValid: false, invalidReason: 'Invalid maxAmountRequired format' };
            }

            if (!paymentRequirements.resource) {
                console.log('[PaymentValidator.validate] Validation failed: Missing resource URL');
                return { isValid: false, invalidReason: 'Missing resource URL' };
            }

            if (!paymentRequirements.description) {
                console.log('[PaymentValidator.validate] Validation failed: Missing description');
                return { isValid: false, invalidReason: 'Missing description' };
            }

            if (!paymentRequirements.mimeType) {
                console.log('[PaymentValidator.validate] Validation failed: Missing mimeType');
                return { isValid: false, invalidReason: 'Missing mimeType' };
            }

            if (typeof paymentRequirements.maxTimeoutSeconds !== 'number' || paymentRequirements.maxTimeoutSeconds <= 0) {
                console.log('[PaymentValidator.validate] Validation failed: Invalid maxTimeoutSeconds');
                return { isValid: false, invalidReason: 'Invalid maxTimeoutSeconds' };
            }

            console.log('[PaymentValidator.validate] Validation successful');
            return {
                isValid: true,
                invalidReason: null
            };
        } catch (error) {
            console.error('[PaymentValidator.validate] Unexpected error during validation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
            console.error('[PaymentValidator.validate] Error message:', errorMessage);
            return {
                isValid: false,
                invalidReason: errorMessage
            };
        }
    }
}