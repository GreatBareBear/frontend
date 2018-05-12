import BigNumber from 'bignumber.js'
import { getCategoryId } from '../models/categories'
import Nebulas from '../nebulify/src/Nebulas'
import Account from '../nebulify/src/Account'
import Transaction from '../nebulify/src/Transaction'
import { observable } from 'mobx'

const contractAddress = 'n1ih7EmQAzrwTucvUnQbU1wxxNTzVofcELV'

type CallResult = ContractCallResult & {
  transaction?: {
    txHash: Hash,
    contractAddress: Address
  }
}

export default class Api {
  private nebulas: Nebulas
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

    return this.call('upload', [{
      width,
      height,
      base64,
      name,
      author,
      category: getCategoryId(category)
    }], sender, value, dryRun)
  }

  async query(count: number, offset: number, category: string, sender: Account, value: BigNumber, dryRun: boolean = false) {
    const categoryId = getCategoryId(category)

    const payload = [count, offset, categoryId]

    if (categoryId === 0) {
      payload.splice(-1, 1)
    }

    return this.call('query', payload, sender, value, dryRun)
  }

  setApiOptions(options: ApiOptions) {
    this.nebulas.setApi(options)

    this.isTestnet = options.testnet
  }

  async call(functionName: string, payload: {}, sender: Account, value: BigNumber, dryRun: boolean): Promise<CallResult> {
    return new Promise<CallResult>((resolve) => {
      this.nebulas.api.getGasPrice().then((price) => {
        this.nebulas.api.getAccountState(sender.getAddress()).then((state) => {
          const contract = {
            function: functionName,
            args: JSON.stringify(payload)
          }

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
}