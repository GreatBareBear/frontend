import BigNumber from 'bignumber.js'
import * as ipfsApi from 'ipfs-api'
import * as NebulasPay from '../nebPay/nebpay.js'
import { getCategoryId } from '../models/categories'
import Nebulas from '../nebulify/Nebulas'
import Account from '../nebulify/Account'
import { UploadImage } from '../models/UploadImage'

export const testnetContractAddress = 'n1gKtRQCEApnCvdFtCH7U2S2dL87kewQ8Yi'
export const mainnetContractAddress = 'n1knkT1wDdfuYkjra7EDUryQJcBhPLkMvbe'
export const imgCubeAccount = Account.fromAddress('n1FhdXhRaDQWvCMwC29JBMuuCxUczUuecYU')

export type CallResult = {
  txHash: Hash,
  contractAddress: Address,
  serialNumber: string
}

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
    return this.isTestnet ? 1001 : 100
  }

  constructor() {
    this.nebulas = new Nebulas()

    this.setApi(false)

    this.nebPay = new NebulasPay()
    this.ipfs = ipfsApi('ipfs.nufflee.com', '443', {
      protocol: 'https'
    })
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
    return this.nebulasCall<number>('getImageCount', [], new BigNumber(0))
  }

  async query(count: number, offset: number, category: string, value: BigNumber) {
    const categoryId = getCategoryId(category)

    const payload = [count, offset, categoryId]

    if (categoryId === 0) {
      payload.splice(-1, 1)
    } else {
      payload[2]--
    }

    return await this.nebulasCall('query', payload, value)
  }

  async tip(id: string, dryRun = false) {
    return await this.call('tip', [id], new BigNumber(0.01), dryRun)
  }

  async get(id: string) {
    return await this.nebulasCall('get', [id], new BigNumber(0))
  }

  async getTransactionInfo(serialNumber: SerialNumber, options?: NebPayOptions) {
    return this.nebPay.queryPayInfo(serialNumber, options)
  }

  async call<T>(functionName: string, payload: {}, value: BigNumber, dryRun: boolean = false): Promise<T> {
    return new Promise<T>((resolve) => {
      const args = JSON.stringify(payload)
      const callbackUrl = this.isTestnet ? NebulasPay.config.testnetUrl : NebulasPay.config.mainnetUrl

      if (dryRun) {
        this.nebPay.simulateCall(this.contractAddress, value.toString(), functionName, args, {
          listener: (response) => {
            let json = response.result

            if (json === '') {
              json = '[]'
            }

            try {
              resolve({
                ...JSON.parse(json),
                serialNumber: response.serialNumber
              })
            } catch (error) {
              throw new Error(json)
            }
          },
          callback: callbackUrl
        })
      } else {
        const serialNumber = this.nebPay.call(this.contractAddress, value.toString(), functionName, args, {
          listener: (response: any) => {
            if (typeof response === 'string') {
              resolve({
                response,
                serialNumber
              } as any)
            } else {
              resolve({
                ...response,
                result: response.result,
                serialNumber
              })
            }
          },
          callback: callbackUrl
        })
      }
    })
  }

  async nebulasCall<T>(functionName: string, payload: {}, value: BigNumber = new BigNumber(0)): Promise<T> {
    const nonce = (await this.nebulas.api.getAccountState(imgCubeAccount.getAddress())).nonce + 1

    const contract = {
      function: functionName,
      args: JSON.stringify(payload)
    }

    let json = (await this.nebulas.api.call({
      from: imgCubeAccount.getAddress(),
      to: this.contractAddress,
      value: value.toString(),
      nonce,
      gasPrice: 1000000,
      gasLimit: 200000,
      contract
    })).result

    if (json === '') {
      json = '[]'
    }

    try {
      return JSON.parse(json)
    } catch (error) {
      throw new Error(json)
    }
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