import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import 'feather-icons'
import { Link as LinkScroll } from 'react-scroll'
import styled from 'styled-components'
import Panel from '../components/Panel'
import { PageWrapper, ContentWrapperLarge } from '../components/index'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonOutlined, ButtonDark } from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import PoolList from '../components/PoolList'
import Link from '../components/Link'
import Loader from '../components/LocalLoader'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import { formattedNum, formattedPercent, getSwapLink } from '../utils'
import { usePairData, usePairPools } from '../contexts/PairData'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'
import TokenLogo from '../components/TokenLogo'
import { Hover } from '../components'
import { useEthPrice } from '../contexts/GlobalData'
import Warning from '../components/Warning'
import { usePathDismissed, useSavedPairs } from '../contexts/LocalStorage'
import FormattedName from '../components/FormattedName'
import { useListedTokens } from '../contexts/Application'
import bookMark from '../assets/bookmark.svg'
import bookMarkOutline from '../assets/bookmark_outline.svg'
import useTheme from '../hooks/useTheme'

const DashboardWrapper = styled.div`
  width: 100%;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 1rem;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto auto;
  column-gap: 60px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 1rem;
    }
  }
`

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 10px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

function PairPage({ pairAddress, history }) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    oneDayFeeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    oneDayFeeUntracked,
    volumeChangeUntracked,
    liquidityChangeUSD,
  } = usePairData(pairAddress)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const pools = usePairPools(pairAddress)
  const theme = useTheme()

  const backgroundColor = theme.primary

  // liquidity
  const formattedLiquidity = reserveUSD ? formattedNum(reserveUSD, true) : formattedNum(trackedReserveUSD, true)
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // mark if using untracked liquidity
  const [usingTracked, setUsingTracked] = useState(true)
  useEffect(() => {
    setUsingTracked(!trackedReserveUSD ? false : true)
  }, [trackedReserveUSD])

  // volume	  // volume
  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? formattedNum(oneDayVolumeUSD === 0 ? oneDayVolumeUntracked : oneDayVolumeUSD, true)
      : oneDayVolumeUSD === 0
      ? '$0'
      : '-'

  // mark if using untracked volume
  const [usingUtVolume, setUsingUtVolume] = useState(false)
  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false)
  }, [oneDayVolumeUSD])

  const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUntracked)

  // get fees	  // get fees
  const fees =
    oneDayFeeUSD || oneDayFeeUSD === 0
      ? usingUtVolume
        ? formattedNum(oneDayFeeUntracked, true)
        : formattedNum(oneDayFeeUSD, true)
      : '-'

  // token data for usd
  const [ethPrice] = useEthPrice()
  const token0USD =
    token0?.derivedETH && ethPrice ? formattedNum(parseFloat(token0.derivedETH) * parseFloat(ethPrice), true) : ''

  const token1USD =
    token1?.derivedETH && ethPrice ? formattedNum(parseFloat(token1.derivedETH) * parseFloat(ethPrice), true) : ''

  // rates
  const token0Rate =
    token0 &&
    token1 &&
    token0.derivedETH &&
    token1.derivedETH &&
    parseFloat(token0.derivedETH) > 0 &&
    parseFloat(token1.derivedETH) > 0
      ? formattedNum(token0.derivedETH / token1.derivedETH)
      : '-'
  const token1Rate =
    token0 &&
    token1 &&
    token0.derivedETH &&
    token1.derivedETH &&
    parseFloat(token0.derivedETH) > 0 &&
    parseFloat(token1.derivedETH) > 0
      ? formattedNum(token1.derivedETH / token0.derivedETH)
      : '-'

  // formatted symbols for overflow
  const formattedSymbol0 = token0?.symbol.length > 6 ? token0?.symbol.slice(0, 5) + '...' : token0?.symbol
  const formattedSymbol1 = token1?.symbol.length > 6 ? token1?.symbol.slice(0, 5) + '...' : token1?.symbol

  const below1080 = useMedia('(max-width: 1080px)')
  const below900 = useMedia('(max-width: 900px)')
  const below600 = useMedia('(max-width: 600px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  // TODO: Remove this when Cronos has a token list
  const noWarning = process.env.REACT_APP_CHAIN_ID === '25'

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  const [savedPairs, addPair, removePair] = useSavedPairs()

  const listedTokens = useListedTokens()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <span />
      <Warning
        type={'pair'}
        show={
          !noWarning &&
          !dismissed &&
          listedTokens &&
          !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))
        }
        setShow={markAsDismissed}
        address={pairAddress}
      />
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body>
            <BasicLink to="/pairs">{'Pairs '}</BasicLink>→ {token0?.symbol}-{token1?.symbol}
          </TYPE.body>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <WarningGrouping>
          <DashboardWrapper>
            <AutoColumn gap="40px" style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  width: '100%',
                }}
              >
                <RowFixed style={{ flexWrap: 'wrap', minWidth: '100px' }}>
                  <RowFixed>
                    {token0 && token1 && (
                      <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={32} margin={true} />
                    )}{' '}
                    <TYPE.main fontSize={below1080 ? '1.5rem' : '2rem'} style={{ margin: '0 1rem' }}>
                      {token0 && token1 ? (
                        <>
                          <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>{token0.symbol}</HoverSpan>
                          <span>-</span>
                          <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>
                            {token1.symbol}
                          </HoverSpan>{' '}
                          Pair
                        </>
                      ) : (
                        ''
                      )}
                    </TYPE.main>
                  </RowFixed>
                </RowFixed>
                <RowFixed
                  ml={below900 ? '0' : '2.5rem'}
                  mt={below1080 && '1rem'}
                  style={{
                    flexDirection: below1080 ? 'row-reverse' : 'initial',
                  }}
                >
                  {!!!savedPairs[pairAddress] && !below1080 ? (
                    <Hover onClick={() => addPair(pairAddress, token0.id, token1.id, token0.symbol, token1.symbol)}>
                      <img
                        src={bookMarkOutline}
                        width={24}
                        height={24}
                        alt="BookMark"
                        style={{ marginRight: '0.5rem' }}
                      />
                    </Hover>
                  ) : !below1080 ? (
                    <Hover onClick={() => removePair(pairAddress)}>
                      <img src={bookMark} width={24} height={24} alt="BookMarked" style={{ marginRight: '0.5rem' }} />
                    </Hover>
                  ) : (
                    <></>
                  )}

                  <LinkScroll to="topPools" spy={true} smooth={true}>
                    <ButtonOutlined style={{ padding: '11px 22px' }}>Choose pool to add liquidity</ButtonOutlined>
                  </LinkScroll>

                  <Link external href={getSwapLink(token0?.id, token1?.id)}>
                    <ButtonDark
                      ml={!below1080 && '.5rem'}
                      mr={below1080 && '.5rem'}
                      color={backgroundColor}
                      style={{ padding: '11px 22px' }}
                    >
                      Swap
                    </ButtonDark>
                  </Link>
                </RowFixed>
              </div>
            </AutoColumn>
            <AutoRow
              gap="6px"
              style={{
                width: 'fit-content',
                marginTop: below900 ? '1rem' : '0',
                marginBottom: below900 ? '0' : '2rem',
                flexWrap: 'wrap',
              }}
            >
              <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token0?.id} size={'16px'} />
                  <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                    {token0 && token1
                      ? `1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                          parseFloat(token0?.derivedETH) ? '(' + token0USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
              <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token1?.id} size={'16px'} />
                  <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                    {token0 && token1
                      ? `1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                          parseFloat(token1?.derivedETH) ? '(' + token1USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
            </AutoRow>
            <>
              {!below1080 && <TYPE.main fontSize={'1.125rem'}>Pair Stats</TYPE.main>}
              <PanelWrapper style={{ marginTop: '1.5rem' }}>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Total Liquidity {!usingTracked ? '(Untracked)' : ''}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {formattedLiquidity}
                      </TYPE.main>
                      <TYPE.main>{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Volume (24hrs) {usingUtVolume && '(Untracked)'}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {volume}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Fees (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {fees}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>

                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Pooled Tokens</TYPE.main>
                      <div />
                    </RowBetween>
                    <Hover onClick={() => history.push(`/token/${token0?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token0?.id} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve0 ? formattedNum(reserve0) : ''}{' '}
                            <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                    <Hover onClick={() => history.push(`/token/${token1?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token1?.id} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve1 ? formattedNum(reserve1) : ''}{' '}
                            <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                  </AutoColumn>
                </Panel>
                <Panel
                  style={{
                    gridColumn: below1080 ? '1/4' : '2/4',
                    gridRow: below1080 ? '' : '1/5',
                  }}
                >
                  <PairChart
                    address={pairAddress}
                    color={backgroundColor}
                    base0={token0 && token1 && token0.derivedETH ? token1.derivedETH / token0.derivedETH : 0}
                    base1={token0 && token1 && token1.derivedETH ? token0.derivedETH / token1.derivedETH : 0}
                  />
                </Panel>
              </PanelWrapper>
              <TYPE.main id="topPools" fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
                Top Pools
              </TYPE.main>
              <Panel
                style={{
                  marginTop: '1.5rem',
                  padding: 0,
                  border: 'none',
                }}
              >
                {pools ? <PoolList pools={pools} /> : <Loader />}
              </Panel>
              <RowBetween style={{ marginTop: '3rem' }}>
                <TYPE.main fontSize={'1.125rem'}>Pair Information</TYPE.main>
              </RowBetween>
              <Panel
                rounded
                style={{
                  marginTop: '1.5rem',
                }}
                p={20}
              >
                <TokenDetailsLayout>
                  <Column>
                    <TYPE.main color={theme.subText} fontSize="12px">
                      PAIR NAME
                    </TYPE.main>
                    <TYPE.main style={{ marginTop: '18px' }}>
                      <RowFixed>
                        <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />
                        -
                        <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />
                      </RowFixed>
                    </TYPE.main>
                  </Column>
                  <Column>
                    <TYPE.main color={theme.subText} fontSize="12px">
                      PAIR ADDRESS
                    </TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main style={{ marginTop: '12px' }} fontSize="18px">
                        {pairAddress.slice(0, 6) + '...' + pairAddress.slice(81, 85)}
                      </TYPE.main>
                      <CopyHelper toCopy={pairAddress} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main color={theme.subText} fontSize="12px">
                      <RowFixed>
                        <FormattedName style={{ color: theme.subText }} text={token0?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>ADDRESS</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main style={{ marginTop: '12px' }} fontSize="18px">
                        {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={token0?.id} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main fontSize="12px" color={theme.subText}>
                      <RowFixed>
                        <FormattedName style={{ color: theme.subText }} text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>ADDRESS</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main style={{ marginTop: '12px' }} fontSize={18}>
                        {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={token1?.id} />
                    </AutoRow>
                  </Column>
                </TokenDetailsLayout>
              </Panel>
            </>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapperLarge>
    </PageWrapper>
  )
}

export default withRouter(PairPage)
