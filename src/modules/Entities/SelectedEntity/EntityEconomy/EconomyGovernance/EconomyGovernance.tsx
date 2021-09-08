import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import keysafe from 'common/keysafe/keysafe'
import * as keplr from 'common/utils/keplr'
import * as Toast from 'common/utils/Toast'
import Axios from 'axios'
import GovernanceTable, {
  GovernanceTableRow,
} from './components/GovernanceTable'
import {
  Container,
  SectionTitleContainer,
  SectionTitle,
  ActionButton,
} from '../EntityEconomy.styles'
import GovernanceProposal, {
  ProposalType,
} from './components/GovernanceProposal'
import { getProposals, getProposers } from '../EntityEconomy.actions'
import { ProposalStatus, ProposalsType } from '../types'
import { MsgSubmitProposal } from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { getUIXOAmount } from 'common/utils/currency.utils'
import * as base58 from 'bs58'
import { sortObject } from 'common/utils/transformationUtils'

const EconomyGovernance: React.FunctionComponent = () => {
  const dispatch = useDispatch()
  const { governance } = useSelector((state: RootState) => state.economy)
  const { 
    address: userAddress,
    accountNumber: userAccountNumber,
    sequence: userSequence,
    userInfo
  } = useSelector((state: RootState) => state.account)

  useEffect(() => {
    dispatch(getProposals())
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (governance && governance.proposals) {
      if (governance.proposals[0].proposer) return
      dispatch(
        getProposers(
          governance.proposals.map(
            (proposal: ProposalsType) => proposal.proposalId,
          ),
        ),
      )
    }
    // eslint-disable-next-line
  }, [governance])

  const calcPercentage = (limit: number, value: number): number => {
    if (!limit) return 0
    return Number(((value / limit) * 100).toFixed(0))
  }

  const mapToGovernanceTable = (
    proposals: ProposalsType[],
  ): GovernanceTableRow[] => {
    return proposals.map(
      (proposal: ProposalsType): GovernanceTableRow => {
        const { status, tally, proposalId, submitTime, content } = proposal

        console.log(status, 'status')
        let result = ''
        switch (status) {
          case ProposalStatus.PROPOSAL_STATUS_PASSED:
            result += `Passed (${calcPercentage(
              tally.available - tally.abstain,
              tally.yes,
            )})`
            break
          case ProposalStatus.PROPOSAL_STATUS_FAILED:
            result += `Failed (${calcPercentage(
              tally.available - tally.abstain,
              tally.yes,
            )})`
            break
          case ProposalStatus.PROPOSAL_STATUS_REJECTED:
            result += `Vetoed (${calcPercentage(
              tally.available - tally.abstain,
              tally.noWithVeto,
            )})`
            break
          case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
            result += `No Quorum`
            break
          case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
            break
          case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
            break
          default:
            break
        }
        const vote = `${tally.yes} Yes / ${tally.no} No / ${tally.noWithVeto} Veto`
        return {
          proposalId: '#' + proposalId,
          date: submitTime,
          result,
          description: content.description,
          vote,
          type: 'Technical',
        }
      },
    )
  }

  const broadCastMessage = useCallback(
    msg => {
      const payload = {
        msgs: [msg],
        chain_id: process.env.REACT_APP_CHAIN_ID,
        fee: {
          amount: [{ amount: String(5000), denom: 'uixo' }],
          gas: String(200000),
        },
        memo: '',
        account_number: String(userAccountNumber),
        sequence: String(userSequence),
      }

      const pubKey = base58.decode(userInfo.didDoc.pubKey).toString('base64')

      keysafe.requestSigning(
        JSON.stringify(sortObject(payload)),
        (error: any, signature: any) => {
          Axios.post(`${process.env.REACT_APP_GAIA_URL}/txs`, {
            tx: {
              msg: payload.msgs,
              fee: payload.fee,
              signatures: [
                {
                  account_number: payload.account_number,
                  sequence: payload.sequence,
                  signature: signature.signatureValue,
                  pub_key: {
                    type: 'tendermint/PubKeyEd25519',
                    value: pubKey,
                  },
                },
              ],
              memo: '',
            },
            mode: 'sync',
          }).then(response => {
            if (response.data.txhash) {
              Toast.successToast(`Transaction Successful`)
              if (response.data.code === 4) {
                Toast.errorToast(`Transaction Failed`)
                return
              }

              return
            }

            Toast.errorToast(`Transaction Failed`)
          })
        },
        'base64',
      )
    },
    [userInfo, userSequence, userAccountNumber],
  )

  const handleNewProposal = async () => {
    // const type = 'TextProposal' // 'ParameterChangeProposal'
    const title = 'Set base network inflation at 20%'
    const description = 'The Impact Hub is a bonded Proof of Stake (bPoS) network with bonding denominated in IXO tokens. A higher bonded ratio of IXO tokens, relative to total supply, increases the network security. Inflation in the token supply provides the incentive for del'
    const changes = [
      {
        subspace: "mint",
        key: "InflationMax",
        value: '"0.200000000000000000"'
      },
      { 
        subspace: "mint",
        key: "InflationMin",
        value: '"0.070000000000000000"'
      },
      { 
        subspace: "mint",
        key: "InflationRateChange",
        value: '"0.130000000000000000"'
      }
    ]
    try {
      const [accounts, offlineSigner] = await keplr.connectAccount()
      const address = accounts[0].address
      const client = await keplr.initStargateClient(offlineSigner)

      const payload = {
        msgAny: {
          typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
          value: MsgSubmitProposal.fromPartial({
            content: Any.fromPartial({
              typeUrl: "/cosmos.gov.v1beta1.TextProposal",
              value: TextProposal.encode(
                TextProposal.fromPartial({
                  title: title,
                  description: description,
                }),
              ).finish(),
            }),
            initialDeposit: [
              {
                amount: '1000000',
                denom: 'uixo',
              },
            ],
            proposer: address,
          }),
        },
        chain_id: process.env.REACT_APP_CHAIN_ID,
        fee: {
          amount: [{ amount: String(5000), denom: 'uixo' }],
          gas: String(200000),
        },
        memo: '',
      }

      try {
        const result = await keplr.sendTransaction(client, address, payload)
        if (result) {
          Toast.successToast(`Transaction Successful`)
        } else {
          Toast.errorToast(`Transaction Failed`)
        }
      } catch (e) {
        Toast.errorToast(`Transaction Failed`)
        throw e
      }
    } catch (e) {
      if (!userAddress) return;
      const msg = {
        type: 'cosmos-sdk/MsgSubmitProposal',
        value: {
          content: {
            type: 'cosmos-sdk/ParameterChangeProposal',
            value: {
              title,
              description,
              changes
            },
          },
          initial_deposit: [
            {
              amount: getUIXOAmount(String(1)),
              denom: 'uixo',
            },
          ],
          proposer: userAddress,
        },
      }
  
      broadCastMessage(msg)
    }
  }

  return (
    <Container>
      <SectionTitleContainer>
        <SectionTitle>Current Governance Proposals</SectionTitle>
        <ActionButton onClick={handleNewProposal}>New Proposal</ActionButton>
      </SectionTitleContainer>

      {governance &&
        governance.proposals &&
        governance.proposals.map((proposal: ProposalsType, i: number) => (
          <GovernanceProposal
            key={i}
            proposalId={proposal.proposalId}
            type={ProposalType.Membership}
            announce={proposal.content.title}
            proposedBy={proposal.proposer}
            submissionDate={proposal.submitTime}
            closeDate={proposal.DepositEndTime}
            tally={proposal.tally}
            totalDeposit={proposal.totalDeposit[0]}
            status={proposal.status}
          />
        ))}

      <SectionTitleContainer>
        <SectionTitle>Past Governance Proposals</SectionTitle>
      </SectionTitleContainer>
      {governance && governance.proposals && (
        <GovernanceTable data={mapToGovernanceTable(governance.proposals)} />
      )}
    </Container>
  )
}

export default EconomyGovernance
