import BigNumber from 'bignumber.js'
import * as NebulasPay from '../nebPay/nebpay.js'
import { getCategoryId } from '../models/categories'
import Nebulas from '../nebulify/Nebulas'
import Account from '../nebulify/Account'
import { chunkString } from '../utils'
import { UploadImage } from '../models/UploadImage'

export const contractAddress = 'n1n3b2TBwHxat9FaXXr2qj5veqAruL2R9nt'
export const imgCubeAccount = Account.fromAddress('n1FhdXhRaDQWvCMwC29JBMuuCxUczUuecYU')

type CallResult = ContractCallResult & {
  transaction?: {
    txHash: Hash,
    contractAddress: Address
  }
}

export default class Api {
  public isTestnet: boolean

  private nebulas: Nebulas
  private account: Account
  private nebPay: NebPay
  private run = false

  get chainId() {
    return this.isTestnet ? 1001 : 100 // TODO: 1 might not be mainnet
  }

  constructor() {
    this.nebulas = new Nebulas()

    // TODO: Change this to mainnet in prod
    this.setApi(true)

    this.nebPay = new NebulasPay()
  }

  async upload(images: UploadImage[], value: BigNumber, dryRun: boolean = false) {
    const result = await this.call('upload', images.map((image) => ({
      width: image.width,
      height: image.height,
      name: image.name,
      author: image.author,
      urlHash: '',
      category: getCategoryId(image.category) - 1
    })), value, dryRun)

    return result
  }

  async getImageCount() {
    return this.call('getImageCount', [], new BigNumber(0), true)
  }

  async getImagesUploadingCount() {
    return this.call('getImagesUploadingCount', [], new BigNumber(0), true)
  }

  async query(count: number, offset: number, category: string, value: BigNumber) {
    const categoryId = getCategoryId(category)

    const payload = [count, offset, categoryId]

    if (categoryId === 0) {
      payload.splice(-1, 1)
    } else {
      payload[2]--
    }

    const raw = (await this.nebulasCall('query', payload, value)).result

    return JSON.parse(raw === '' ? '[]' : raw)
  }

  async call(functionName: string, payload: {}, value: BigNumber, dryRun: boolean = false): Promise<CallResult> {
    return new Promise<CallResult>((resolve) => {
      const args = JSON.stringify(payload)
      const callbackUrl = this.isTestnet ? NebulasPay.config.testnetUrl : NebulasPay.config.mainnetUrl

      if (dryRun) {
        this.nebPay.simulateCall(contractAddress, value.toString(), functionName, args, {
          listener: (response) => {
            resolve(response)
          },
          callback: callbackUrl
        })
      } else {
        this.nebPay.call(contractAddress, value.toString(), functionName, args, {
          listener: (response) => {
            resolve(response)
          },
          callback: callbackUrl
        })
      }
    })
  }

  async nebulasCall(functionName: string, payload: {}, value: BigNumber = new BigNumber(0)): Promise<CallResult> {
    return new Promise<CallResult>(async (resolve) => {
      const nonce = (await this.nebulas.api.getAccountState(imgCubeAccount.getAddress())).nonce + 1

      const contract = {
        function: functionName,
        args: JSON.stringify(payload)
      }

      this.nebulas.api.call({
        from: imgCubeAccount.getAddress(),
        to: contractAddress,
        value: value.toString(),
        nonce,
        gasPrice: 1000000,
        gasLimit: 200000,
        contract
      }).then((resolve))
    })
  }

  setApi(testnet: boolean) {
    this.isTestnet = testnet

    this.nebulas.setApi({
      mainnet: !testnet,
      testnet
    })
  }
}