import React, { useEffect } from 'react'
import Long from 'long'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import * as keplr from 'common/utils/keplr'
import * as Toast from 'common/utils/Toast'
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
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { getUIXOAmount } from 'common/utils/currency.utils'
import { broadCastMessage } from 'common/utils/keysafe'

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
            result += 'Deposit Period'
            break
          case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
            result += 'Voting Period'
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
          type: content['@type'].split('.').pop(),
        }
      },
    )
  }

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
  
      broadCastMessage(userInfo, userSequence, userAccountNumber, msg, () => {
        
      })
    }
  }

  const handleVote = async (proposalId: string, answer: number) => {
    try {
      const [accounts, offlineSigner] = await keplr.connectAccount()
      const address = accounts[0].address
      const client = await keplr.initStargateClient(offlineSigner)

      const payload = {
        msgAny: {
          typeUrl: '/cosmos.gov.v1beta1.MsgVote',
          value: MsgVote.fromPartial({
            proposalId: Long.fromString(proposalId),
            voter: address,
            option: answer,
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
      if (!userAddress) return
      const msg = {
        type: 'cosmos-sdk/MsgVote',
        value: {
          option: Number(answer),
          proposal_id: proposalId,
          voter: userAddress,
        },
      }

      broadCastMessage(userInfo, userSequence, userAccountNumber, msg, () => {
        
      })
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
            handleVote={handleVote}
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
