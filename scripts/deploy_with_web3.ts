import { deploy } from './web3-lib'

const INITIAL_OWNER = '0x5D8b4DEeDE9cC751ac792B8B367deeff2fE1f7E1'

(async () => {
  try {
    const result = await deploy('RACI', [INITIAL_OWNER])
    console.log(`address: ${result.address}`)
  } catch (e) {
    console.log(e.message)
  }
})()
