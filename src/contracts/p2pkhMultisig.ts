import {
    Addr,
    assert,
    FixedArray,
    hash160,
    method,
    prop,
    PubKey,
    Sig,
    SmartContract,
} from 'scrypt-ts'

const M = 2
const N = 2

export type P2PKHSig = {
    sig: Sig
    pubKey: PubKey
}

export class P2pkhMultisig extends SmartContract {
    @prop()
    addresses: FixedArray<Addr, typeof N>

    constructor(addresses: FixedArray<Addr, typeof N>) {
        super(...arguments)
        this.addresses = addresses
    }

    @method()
    public unlock(sigs: FixedArray<P2PKHSig, typeof M>) {
        let j = 0n
        for (let i = 0; i < N; i++) {
            const addr = this.addresses[i]
            const sig = sigs[Number(j)]
            if (
                addr == hash160(sig.pubKey) &&
                this.checkSig(sig.sig, sig.pubKey)
            ) {
                j++
            }
        }
        assert(j == BigInt(M), 'Not enough signatures')
    }
}
