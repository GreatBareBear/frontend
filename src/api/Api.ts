import BigNumber from 'bignumber.js'
import { getCategoryId } from '../models/categories'
import Nebulas from '../nebulify/Nebulas'
import Account from '../nebulify/Account'
import Transaction from '../nebulify/Transaction'
import * as _ from 'lodash'

const contractAddress = 'n22MpZjRfwz8tbL7cecrNFAGQ1jDedTJQjz'

type CallResult = ContractCallResult & {
  transaction?: {
    txHash: Hash,
    contractAddress: Address
  }
}

export default class Api {
  private nebulas: Nebulas
  private account: Account
  public isTestnet: boolean

  get chainId() {
    return this.isTestnet ? 1001 : 1 // TODO: 1 might not be mainnet
  }

  constructor() {
    this.nebulas = new Nebulas()

    this.setApiOptions({
      testnet: true
    })
  }

  async upload(width: number, height: number, base64: string, name: string, author: string, category: string, sender: Account, value: BigNumber, dryRun: boolean = false) {
    // [{"width": 100, "height": 100, "base64": "", "name": "a", "username": "user1", "category": 0}]

    const chunks = base64.match(new RegExp(`.{1,${43000}}`, `g`))

    /*
        const result = await this.call('upload', [{
          width,
          height,
          chunks[0],
          name,
          author,
          category: getCategoryId(category) - 1
        }, chunks.length === 1], sender, value, dryRun)

        if (chunks.length > 1) {
          for (const chunk of chunks) {
            this.call('appendBase64', [])
          }
        }

        return result*/
  }

  async getImageCount() {
    // return this.call('getImageCount', [], )
  }

  async getImagesUploadingCount() {

  }

  async query(count: number, offset: number, category: string, sender: Account, value: BigNumber) {
    const categoryId = getCategoryId(category)

    const payload = [count, offset, categoryId]

    if (categoryId === 0) {
      payload.splice(-1, 1)
    } else {
      payload[2]--
    }

    console.log(payload[2])

    return this.call('query', payload, sender, value, true)
  }

  async call(functionName: string, payload: {}, sender: Account, value: BigNumber, dryRun: boolean): Promise<CallResult> {
    return new Promise<CallResult>((resolve) => {
      this.nebulas.api.getGasPrice().then((price) => {
        this.nebulas.api.getAccountState(sender.getAddress()).then((state) => {
          const contract = {
            function: functionName,
            args: JSON.stringify(payload)
          }

          console.log(JSON.stringify(contract))

          this.nebulas.api.call({
            from: sender.getAddress(),
            to: contractAddress,
            value: value.toString(),
            nonce: state.nonce,
            contract,
            gasPrice: price,
            gasLimit: 1000000
          }).then((result) => {
            if (dryRun === false) {
              const transaction: Transaction = new Transaction(this.chainId, sender, contractAddress, value.toString(), state.nonce + 1, price, 1000000, 0, contract)

              transaction.sign()

              this.nebulas.api.sendRawTransaction(transaction).then((transactionResult) => {
                resolve({
                  ...result,
                  transaction: {
                    contractAddress: transactionResult.contractAddress,
                    txHash: transactionResult.txHash
                  }
                })
              })
            } else {
              resolve(result)
            }
          })
        })
      })
    })
  }

  setApiOptions(options: ApiOptions) {
    this.nebulas.setApi(options)

    this.isTestnet = options.testnet
  }

  setAccount(account: Account) {
    this.account = account
  }
}