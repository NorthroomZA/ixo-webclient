import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import GovernanceTable from './components/GovernanceTable'
import {
  Container,
  SectionTitleContainer,
  SectionTitle,
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
      if (governance.proposals[0].proposer) return;
      dispatch(
        getProposers(governance.proposals.map((proposal: ProposalsType) => proposal.proposalId)),
      )
    }
    // eslint-disable-next-line
  }, [governance])

  return (
    <Container>
      <SectionTitleContainer>
        <SectionTitle>Current Governance Proposals</SectionTitle>
      </SectionTitleContainer>

      {governance && governance.proposals && governance.proposals.map((proposal: ProposalsType, i: number) => (
        <GovernanceProposal
          key={i}
          proposalId={proposal.proposalId}
          type={ProposalType.Membership}
          announce={proposal.content.title}
          proposedBy={proposal.proposer}
          submissionDate={proposal.submitTime}
          closeDate={proposal.DepositEndTime}
          votes={230}
          available={280}
          totalDeposit={proposal.totalDeposit[0]}
        />
      ))}

      <SectionTitleContainer>
        <SectionTitle>Past Governance Proposals</SectionTitle>
      </SectionTitleContainer>
      <GovernanceTable />
    </Container>
  )
}

export default EconomyGovernance
