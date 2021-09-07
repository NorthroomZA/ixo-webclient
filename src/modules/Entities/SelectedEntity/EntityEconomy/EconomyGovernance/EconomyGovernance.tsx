import React, { useEffect } from 'react'
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

const EconomyGovernance: React.FunctionComponent = () => {
  const dispatch = useDispatch()
  const { governance } = useSelector((state: RootState) => state.economy)

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

  const handleNewProposal = async () => {
    try {
      const [accounts, offlineSigner] = await keplr.connectAccount()
      const address = accounts[0].address
      const client = await keplr.initStargateClient(offlineSigner)

      const payload = {
        msgAny: {
          typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
          value: MsgSubmitProposal.fromPartial({
            content: {
              typeUrl: '/cosmos.gov.v1beta1.TextProposal',
              value: new Uint8Array(
                Buffer.from(
                  JSON.stringify({
                    title: 'Set base network inflation at 20%',
                    description:
                      'The Impact Hub is a bonded Proof of Stake (bPoS) network with bonding denominated in IXO tokens. A higher bonded ratio of IXO tokens, relative to total supply, increases the network security. Inflation in the token supply provides the incentive for del',
                  }),
                ),
              ),

              // value: new Uint8Array(TextProposal.fromPartial({
              //   title: 'Set base network inflation at 20%',
              //   description: 'The Impact Hub is a bonded Proof of Stake (bPoS) network with bonding denominated in IXO tokens. A higher bonded ratio of IXO tokens, relative to total supply, increases the network security. Inflation in the token supply provides the incentive for del',
              // }))
            },
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
      // if (!userDid) return
      // const msg = {
      //   type: 'cosmos-sdk/MsgDelegate',
      //   value: {
      //     amount: {
      //       amount: getUIXOAmount(String(amount)),
      //       denom: 'uixo',
      //     },
      //     delegator_address: userAddress,
      //     validator_address: validatorAddress,
      //   },
      // }
      // broadCastMessage(msg)
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
