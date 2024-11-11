import { expect, use } from 'chai'
import { Addr, bsv, FixedArray, toByteString } from 'scrypt-ts'
import { P2pkhMultisig } from '../src/contracts/p2pkhMultisig'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

const priv1 = bsv.PrivateKey.fromRandom()
const priv2 = bsv.PrivateKey.fromRandom()

const add1 = priv1.toAddress()
const add2 = priv2.toAddress()

const N = 2

const addresses: FixedArray<Addr, typeof N> = [
    Addr(toByteString(add1.hashBuffer.toString('hex'))),
    Addr(toByteString(add2.hashBuffer.toString('hex'))),
]

describe('Test SmartContract `P2pkhMultisig`', () => {
    let instance: P2pkhMultisig

    before(async () => {
        await P2pkhMultisig.loadArtifact()

        instance = new P2pkhMultisig(addresses)
        await instance.connect(getDefaultSigner())
    })

    it('should pass the public method unit test successfully.', async () => {
        const deployTx = await instance.deploy(1)
        console.log(`Deployed contract "P2pkhMultisig": ${deployTx.id}`)

        const call = async () => {
            const callRes = await instance.methods.unlock(
                toByteString('hello world', true)
            )

            console.log(`Called "unlock" method: ${callRes.tx.id}`)
        }
        await expect(call()).not.to.be.rejected
    })

    it('should throw with wrong message.', async () => {
        await instance.deploy(1)

        const call = async () =>
            instance.methods.unlock(toByteString('wrong message', true))
        await expect(call()).to.be.rejectedWith(/Hash does not match/)
    })
})
