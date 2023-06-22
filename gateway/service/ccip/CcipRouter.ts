import { ethers } from "hardhat";
import { encodeText } from "./../encoding/text/encodeText";
import { encodeAddr } from "./../encoding/addr/encodeAddr";
import { encodeAbi } from "./../encoding/abi/encodeAbi";
import { encodeContentHash } from "./../encoding/contenthash/encodeContentHash";
import { encodeInterface } from "./../encoding/interface/encodeInterface";
import { encodeName } from "./../encoding/name/encodeName";
import { encodePubkey } from "./../encoding/pubkey/encodePubkey";
import { encodeDnsRecord } from "./../encoding/dns/encodeDnsRecord";
import { encodeHasDnsRecord } from "./../encoding/dns/encodeHasDnsRecords";

import { EnsResolverService } from "../ens/EnsService";
import { getProofParamType } from "../encoding/proof/getProofParamType";
export class CcipRouter {
    private readonly ensService: EnsResolverService;

    constructor(ensService: EnsResolverService) {
        this.ensService = ensService;
    }
    public static async instance() {
        return new CcipRouter(await EnsResolverService.instance());
    }

    public async handleRequest(signature: string, request: any) {
        switch (signature) {
            case "text(bytes32,string)":
                return await this.handleText(request);
            case "addr(bytes32)":
                return await this.handleAddr(request);
            case "ABI(bytes,bytes32,uint256)":
                return await this.handleABI(request);
            case "contenthash(bytes32)":
                return await this.handleContentHash(request);
            case "interfaceImplementer(bytes,bytes32,bytes4)":
                return await this.handleInterface(request);
            case "name(bytes,bytes32)":
                return await this.handleName(request);
            case "pubkey(bytes,bytes32)":
                return await this.handlePubkey(request);
            case "dnsRecord(bytes,bytes32,bytes32,uint16)":
                return await this.handleDnsRecord(request);
            case "hasDNSRecords(bytes,bytes32,bytes32)":
                return await this.handleHasDnsRecords(request);
            default:
                return null;
        }
    }

    /**
     * Get text record for a given node
     * @param request.ownedNode - the owned Node
     * @param request.record - record name
     * @returns - the response of the ccip request
     */

    private async handleText(request: any) {
        const { proof, result } = await this.ensService.proofText(request.context, request.node, request.record);

        const encodedGetTextResult = encodeText(result);
        const proofParamType = await getProofParamType();

        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetTextResult, proof]);
    }

    private async handleAddr(request: any) {
        const coinType = 60;
        const { proof, result } = await this.ensService.proofAddr(request.context, request.node, coinType);
        const encodedGetTextResult = encodeAddr(result === "0x" ? ethers.constants.AddressZero : result);
        const proofParamType = await getProofParamType();
        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetTextResult, proof]);
    }
    private async handleABI(request: any) {
        const { proof, result } = await this.ensService.proofAbi(request.context, request.node, request.contentTypes);

        //If the resut is 0x the content type shall be 0 
        const contentTypes = result === "0x" ? 0 : request.contentTypes

        const encodedGetTextResult = encodeAbi(result, contentTypes);
        const proofParamType = await getProofParamType();

        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetTextResult, proof]);
    }
    private async handleContentHash(request: any) {
        const { proof, result } = await this.ensService.proofContentHash(request.context, request.node);

        const encodedGetTextResult = encodeContentHash(result);
        const proofParamType = await getProofParamType();

        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetTextResult, proof]);

    }
    private async handleInterface(request: any) {
        const { proof, result } = await this.ensService.proofInterface(request.context, request.node, request.interfaceID);

        const encodedGetTextResult = encodeInterface(result === "0x" ? ethers.constants.AddressZero : result);
        const proofParamType = await getProofParamType();

        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetTextResult, proof]);

    }
    private async handleName(request: any) {
        const { proof, result } = await this.ensService.proofName(request.context, request.node);
        const encodedGetTextResult = encodeName(result);
        const proofParamType = await getProofParamType();

        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetTextResult, proof]);

    }
    private async handlePubkey(request: any) {
        const { proof, result } = await this.ensService.proofPubkey(request.context, request.node);
        const [x, y] = result
        const encodedGetTextResult = encodePubkey(x, y);
        const proofParamType = await getProofParamType();

        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetTextResult, proof]);

    }
    private async handleDnsRecord(request: any) {

        const { proof, result } = await this.ensService.proofDnsRecord(request.context, request.node, request.name, request.resource);
        const encodedGetDnstResult = encodeDnsRecord(result);
        const proofParamType = await getProofParamType();
        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetDnstResult, proof]);

    }
    private async handleHasDnsRecords(request: any) {
        const { proof, result } = await this.ensService.proofHasDnsRecords(request.context, request.node, request.name);
        const encodedGetDnstResult = encodeHasDnsRecord(result);
        const proofParamType = await getProofParamType();
        return ethers.utils.defaultAbiCoder.encode(["bytes", proofParamType], [encodedGetDnstResult, proof]);

    }
}
