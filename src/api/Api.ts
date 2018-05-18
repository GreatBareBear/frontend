import BigNumber from 'bignumber.js'
import * as ipfsApi from 'ipfs-api'
import * as NebulasPay from '../nebPay/nebpay.js'
import { getCategoryId } from '../models/categories'
import Nebulas from '../nebulify/Nebulas'
import Account from '../nebulify/Account'
import { UploadImage } from '../models/UploadImage'

export const testnetContractAddress = 'n1kVrAU1s9m862DZcJm2Bkf3hcUB627rvuL'
export const mainnetContractAddress = testnetContractAddress // TODO: Change this
export const imgCubeAccount = Account.fromAddress('n1FhdXhRaDQWvCMwC29JBMuuCxUczUuecYU')

export type CallResult = NebulasCallResult & {
  serialNumber?: string
} | string

export type NebulasCallResult = ContractCallResult & {
  transaction?: {
    txHash: Hash,
    contractAddress: Address
  }
}

export default class Api {
  public isTestnet: boolean
  public ipfs

  private nebulas: Nebulas
  private nebPay: NebPay
  private contractAddress: string

  get chainId() {
    return this.isTestnet ? 1001 : 100 // TODO: 1 might not be mainnet
  }

  constructor() {
    this.nebulas = new Nebulas()

    // TODO: Change this to mainnet in prod
    this.setApi(true)

    this.nebPay = new NebulasPay()
    this.ipfs = ipfsApi('ipfs.nufflee.com', '443', {
      protocol: 'https'
    })
  }

  async payUpload(value: BigNumber, dryRun: boolean = false): Promise<any> {
    return await this.call('payUpload', [], value, dryRun)
  }

  async upload(images: UploadImage[], dryRun: boolean = false) {
    return await this.call('upload', [images.map((image) => ({
      width: image.width,
      height: image.height,
      name: image.name,
      author: image.author,
      url: image.hash,
      category: getCategoryId(image.category) - 1
    }))], new BigNumber(0), dryRun)
  }

  async getImageCount(): Promise<any> {
    return this.call('getImageCount', [], new BigNumber(0), true)
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

  async returnPaidUpload(dryRun: boolean = false) {
    return await this.call('returnPaidUpload', [], new BigNumber(0), dryRun)
  }

  async getTransactionInfo(serialNumber: SerialNumber, options?: NebPayOptions) {
    return this.nebPay.queryPayInfo(serialNumber, options)
  }

  async call(functionName: string, payload: {}, value: BigNumber, dryRun: boolean = false): Promise<CallResult> {
    return new Promise<CallResult>((resolve) => {
      const args = JSON.stringify(payload)
      const callbackUrl = this.isTestnet ? NebulasPay.config.testnetUrl : NebulasPay.config.mainnetUrl

      if (dryRun) {
        this.nebPay.simulateCall(this.contractAddress, value.toString(), functionName, args, {
          listener: (response) => {
            resolve(response)
          },
          callback: callbackUrl
        })
      } else {
        const serialNumber = this.nebPay.call(this.contractAddress, value.toString(), functionName, args, {
          listener: (response: any) => {
            if (typeof response  === 'string') {
              resolve({
                response,
                serialNumber
              } as any)
            } else {
              resolve({
                ...response,
                serialNumber
              })
            }
          },
          callback: callbackUrl
        })
      }
    })
  }

  async nebulasCall(functionName: string, payload: {}, value: BigNumber = new BigNumber(0)): Promise<NebulasCallResult> {
    return new Promise<NebulasCallResult>(async (resolve) => {
      const nonce = (await this.nebulas.api.getAccountState(imgCubeAccount.getAddress())).nonce + 1

      const contract = {
        function: functionName,
        args: JSON.stringify(payload)
      }

      this.nebulas.api.call({
        from: imgCubeAccount.getAddress(),
        to: this.contractAddress,
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
    this.contractAddress = this.isTestnet ? testnetContractAddress : mainnetContractAddress

    this.nebulas.setApi({
      mainnet: !testnet,
      testnet
    })
  }
}