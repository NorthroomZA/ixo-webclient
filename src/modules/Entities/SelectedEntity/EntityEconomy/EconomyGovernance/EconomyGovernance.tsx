import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
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

  const mapToGovernanceTable = (proposals: ProposalsType[]): GovernanceTableRow[] => {
    return proposals.map((proposal: ProposalsType): GovernanceTableRow => {
      const { status, tally, proposalId, submitTime, content } = proposal

      console.log(status, 'status')
      let result = ''
      switch (status) {
        case ProposalStatus.PROPOSAL_STATUS_PASSED:
          result += `Passed (${calcPercentage(tally.available - tally.abstain, tally.yes)})`
          break;
        case ProposalStatus.PROPOSAL_STATUS_FAILED:
          result += `Failed (${calcPercentage(tally.available - tally.abstain, tally.yes)})`
          break;
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
          result += `Vetoed (${calcPercentage(tally.available - tally.abstain, tally.noWithVeto)})`
          break;
        case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
          result += `No Quorum`
          break;
        case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
          break;
        case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
          break;
        default:
          break;
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
    })
  }

  const handleNewProposal = () => {}

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
