import BigNumber from 'bignumber.js'
import { getCategoryId } from '../models/categories'
import Nebulas from '../nebulify/Nebulas'
import Account from '../nebulify/Account'
import Transaction from '../nebulify/Transaction'
import { chunkString } from '../utils'

// local node: n21nefYJiv1GprKbewt9AgqXoTonot94iHs

const contractAddress = 'n1pLtck9REuunWJrHsaHZHnKmFFC8gqyKbb'
export const imgCubeAccount = Account.fromAddress('n1FhdXhRaDQWvCMwC29JBMuuCxUczUuecYU')

// 0.0.0.0:8685

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

  get chainId() {
    return this.isTestnet ? 1001 : 100 // TODO: 1 might not be mainnet
  }

  constructor() {
    this.nebulas = new Nebulas()

    this.setApiOptions({
      testnet: true
    })
  }

  async upload(width: number, height: number, base64: string, name: string, author: string, category: string, sender: Account, value: BigNumber, dryRun: boolean = false) {
    const chunks = chunkString(base64, 130000)

    const id = (parseInt((await this.getImagesUploadingCount()).result as string, 10)).toString()

    const result = await this.call('upload', [{
      width,
      height,
      base64: chunks[0],
      name,
      author,
      category: getCategoryId(category) - 1
    }, chunks.length === 1], sender, value, false)

    const waitTimer = setInterval(async () => {
      if ((await this.nebulas.api.getTransactionReceipt(result.transaction.txHash)).status === 1) {
        clearInterval(waitTimer)

        this.uploadChunks(chunks, sender, id)

        return
      }

      if (this.run) {
        return
      }
    }, 350)
  }

  run: boolean = false

  async uploadChunks(chunks: string[], sender: Account, id: string) {
    if (chunks.length > 1 && this.run === false) {
      this.run = true
      const startNonce = (await this.nebulas.api.getAccountState(sender.getAddress())).nonce

      for (let i = 1; i < chunks.length; i++) {
        console.log('loop start')

        const chunk = chunks[i]
        let last

        if (i === chunks.length - 1) {
          last = true
        }

        await this.call('appendBase64', [id, chunk, last], sender, new BigNumber(0), false, startNonce + i)
      }
    }
  }

  async getImageCount() {
    return this.call('getImageCount', [], imgCubeAccount, new BigNumber(0), true)
  }

  async getImagesUploadingCount() {
    return this.call('getImagesUploadingCount', [], imgCubeAccount, new BigNumber(0), true)
  }

  async query(count: number, offset: number, category: string, sender: Account, value: BigNumber) {
    const categoryId = getCategoryId(category)

    const payload = [count, offset, categoryId]

    if (categoryId === 0) {
      payload.splice(-1, 1)
    }

    const raw = (await this.call('query', payload, imgCubeAccount, value, true)).result

    const result = JSON.parse(raw === '' ? '[]' : raw)

    return result
  }

  // 29013b136d0dcf37faf148ebe6c9d6d651d27daf4baf90b3dde03053ecc14231
  // cec19e40ca9204688243b4e45b3382eb5411adc857276561fbe38eb332d70a27

  async call(functionName: string, payload: {}, sender: Account, value: BigNumber, dryRun: boolean = false, nonce: number = null): Promise<CallResult> {
    return new Promise<CallResult>((resolve) => {
      this.nebulas.api.getGasPrice().then(async (price) => {
        if (nonce == null) {
          nonce = (await this.nebulas.api.getAccountState(sender.getAddress())).nonce + 1
        }

        console.log('nonce', nonce)

        const contract = {
          function: functionName,
          args: JSON.stringify(payload)
        }

        this.nebulas.api.call({
          from: sender.getAddress(),
          to: contractAddress,
          value: value.toString(),
          nonce,
          contract,
          gasPrice: price,
          gasLimit: 1000000000
        }).then((result) => {
          if (dryRun === false) {
            const transaction: Transaction = new Transaction(this.chainId, sender, contractAddress, value.toString(), nonce, 20000000, 1000000000, contract)

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
  }

  setApiOptions(options: ApiOptions) {
    this.nebulas.setApi(options)

    this.isTestnet = options.testnet
  }

  setAccount(account: Account) {
    this.account = account
  }
}