import _ from 'lodash'

import { ETHERIUM_NETWORKS, WALLET_PROVIDER } from 'integrations/constants'
import { registerWallet, updateWallet } from 'actions/wallet'

class Metamask {
  async initialize(store) {
    this.store = store
    this.store.dispatch(registerWallet({ provider: WALLET_PROVIDER.METAMASK }))

    const walletEnabled = await new Promise((resolve, reject) => {
      /* global Web3, window */
      window.addEventListener('load', () => {
        if (typeof window.web3 !== 'undefined') {
          this.web3 = new Web3(window.web3.currentProvider)
          resolve(true)
        } else {
          reject(false)
        }
      })
    })

    const network = await this.getNetwork()
    const account = await this.getAccount()

    this.store.dispatch(updateWallet({
      provider: WALLET_PROVIDER.METAMASK,
      enabled: walletEnabled,
      network,
      account,
    }))
  }

  async getNetwork() {
    return new Promise((resolve, reject) => {
      this.web3.version.getNetwork((err, netId) => {
        if (err) {
          reject(err)
        } else {
          switch (netId) {
            case '1': {
              resolve(ETHERIUM_NETWORKS.MAIN)
              break
            }
            case '2': {
              resolve(ETHERIUM_NETWORKS.MORDEN)
              break
            }
            case '3': {
              resolve(ETHERIUM_NETWORKS.ROPSTEN)
              break
            }
            case '4': {
              resolve(ETHERIUM_NETWORKS.RINKEBY)
              break
            }
            case '42': {
              resolve(ETHERIUM_NETWORKS.KOVAN)
              break
            }
            default: {
              resolve(ETHERIUM_NETWORKS.UNKNOWN)
              break
            }
          }
        }
      })
    })
  }

  async getAccount() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const accounts = _.get(this, 'web3.eth.accounts', [])
        if (accounts.length > 0) {
          resolve(accounts[0])
        } else {
          reject('No Accounts available')
        }
      }, 0)
    })
  }
}

export default new Metamask()