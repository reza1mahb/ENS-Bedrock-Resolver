import { ethers } from "ethers";
import { L2_PUBLIC_RESOLVER_ADDRESS } from "./../../constants";
import { ProofService } from "../proof/ProofService";
import { CreateProofResult, ProofInputObject } from "../proof/types";

/**
 * This class provides the storage location for different for the particular fiels of the PublicResolverContract
 */
export class EnsResolverService {
    private readonly resolverAddress: string;
    private readonly proofService: ProofService;

    constructor(resolverAddress: string, proofService: ProofService) {
        this.resolverAddress = resolverAddress;
        this.proofService = proofService;
    }
    public static instance() {
        return new EnsResolverService(L2_PUBLIC_RESOLVER_ADDRESS, ProofService.instance());
    }

    public proofText(node: string, recordName: string): Promise<CreateProofResult> {
        //The storage slot within the particular contract
        const TEXTS_SLOT_NAME = 7;
        const version = 0;
        const slot = EnsResolverService.getStorageSlotForText(TEXTS_SLOT_NAME, version, node, recordName);
        return this.proofService.createProof(this.resolverAddress, slot);
    }
    public static getStorageSlotForText(slot: number, versionNumber: number, node: string, recordName: string) {
        //versionable_texts[number][node][key]
        //versionable_texts[inner][middle][outer]
        const innerHash = ethers.utils.solidityKeccak256(["uint256", "uint256"], [versionNumber, slot]);
        const middleHash = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [node, innerHash]);
        const outerHash = ethers.utils.solidityKeccak256(["string", "bytes32"], [recordName, middleHash]);
        return outerHash;
    }
}
