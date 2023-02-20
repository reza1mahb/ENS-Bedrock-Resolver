import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { mockProofOfMultislot } from "../mockProof";
import { LibAddressManager, OptimisimProofVerifier, StateCommitmentChain } from "typechain";
import { ProofService } from "../../gateway/service/proof/ProofService";
import { expect } from "chai";

describe("ProofServiceTest", () => {
    let owner: SignerWithAddress;
    let optimismProofVerifier: OptimisimProofVerifier;
    let stateCommitmentChain: StateCommitmentChain;
    let addresManager: LibAddressManager;

    const l1_provider = new ethers.providers.JsonRpcProvider(
        "https://eth-mainnet.g.alchemy.com/v2/L1PIhq_TFU7sofEqd2IJwWqhBsJYah1S"
    );
    const l2Provider = new ethers.providers.JsonRpcProvider(
        "https://opt-mainnet.g.alchemy.com/v2/DBATzBzSluCdFAA6Zi7YMWHpDGm1soJI"
    );
    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        const optimismProofVerifierFactory = await ethers.getContractFactory("OptimisimProofVerifier");
        const stateCommitmentChainFactory = await ethers.getContractFactory("StateCommitmentChain");
        const addresManagerFactory = await ethers.getContractFactory("Lib_AddressManager");

        stateCommitmentChain = new ethers.Contract(
            "0xBe5dAb4A2e9cd0F27300dB4aB94BeE3A233AEB19",
            stateCommitmentChainFactory.interface,
            l1_provider
        ) as StateCommitmentChain;

        addresManager = new ethers.Contract(
            "0xdE1FCfB0851916CA5101820A69b13a4E276bd81F",
            addresManagerFactory.interface,
            l1_provider
        ) as LibAddressManager;

        optimismProofVerifier = (await optimismProofVerifierFactory.deploy(
            addresManager.address
        )) as OptimisimProofVerifier;
    });

    it("sinlge slot", async () => {
        const proofService = new ProofService(l1_provider, l2Provider);

        const node = ethers.utils.namehash("foo.eth");
        const recordName = "foo";

        const ownNode = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["bytes32", "address"],
                [node, "0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870"]
            )
        );
        const proof = await proofService.proofText("0x2D2d42a1200d8e3ACDFa45Fe58b47F45ebbbaCd6", ownNode, recordName);

        expect(proof.length).to.be.equal(3);
    });
    it("multislot slot", async () => {
        const l2Provider = new ethers.providers.JsonRpcProvider(
            "https://opt-mainnet.g.alchemy.com/v2/DBATzBzSluCdFAA6Zi7YMWHpDGm1soJI"
        );
        const proofService = new ProofService(l1_provider, l2Provider);

        const node = ethers.utils.namehash("foo.eth");
        const recordName = "network.dm3.eth";

        const ownNode = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["bytes32", "address"],
                [node, "0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870"]
            )
        );

        const proof = await proofService.proofText("0x2D2d42a1200d8e3ACDFa45Fe58b47F45ebbbaCd6", ownNode, recordName);

        console.log(JSON.stringify(proof));
        const profile = {
            publicSigningKey: "0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=",
            publicEncryptionKey: "Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=",
            deliveryServices: ["foo.dm3"],
        };
        expect(proof.length).to.be.equal(JSON.stringify(profile).length);
    });
});
