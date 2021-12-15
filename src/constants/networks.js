import Mainnet from '../assets/networks/mainnet-network.svg'
import Polygon from '../assets/networks/polygon-network.png'
import BSC from '../assets/networks/bsc-network.png'
import AVAX from '../assets/networks/avax-network.png'
import Fantom from '../assets/networks/fantom-network.png'
import Cronos from '../assets/networks/cronos-network.png'
import Aurora from '../assets/networks/aurora-network.svg'
import { ChainId } from '.'

export const NETWORK_ICON = {
  [ChainId.MAINNET]: Mainnet,
  [ChainId.MATIC]: Polygon,
  [ChainId.BSCMAINNET]: BSC,
  [ChainId.AVAXMAINNET]: AVAX,
  [ChainId.FANTOM]: Fantom,
  [ChainId.CRONOS]: Cronos,
  [ChainId.AURORA]: Aurora,
}

export const NETWORK_LABEL = {
  [ChainId.MAINNET]: 'Ethereum',
  [ChainId.MATIC]: 'Polygon',
  [ChainId.BSCMAINNET]: 'BSC',
  [ChainId.AVAXMAINNET]: 'Avalanche',
  [ChainId.FANTOM]: 'Fantom',
  [ChainId.CRONOS]: 'Cronos',
  [ChainId.AURORA]: 'Aurora',
}
