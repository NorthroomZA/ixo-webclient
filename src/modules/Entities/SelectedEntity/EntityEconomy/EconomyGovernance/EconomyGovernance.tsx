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
import { ProposalsType } from '../types'

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
          />
        ))}

      <SectionTitleContainer>
        <SectionTitle>Past Governance Proposals</SectionTitle>
      </SectionTitleContainer>
      {governance && governance.proposals && (
        <GovernanceTable
          data={governance.proposals.map(
            (proposal: ProposalsType, i: number) => ({
              proposalId: '#' + proposal.proposalId,
              date: proposal.submitTime,
              result: '',
              description: proposal.content.description,
              vote: `${proposal.tally.yes} Yes / ${proposal.tally.no} No / ${proposal.tally.noWithVeto} Veto`,
              type: 'Technical',
            }),
          )}
        />
      )}
    </Container>
  )
}

export default EconomyGovernance
