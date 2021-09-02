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
import { getProposals } from '../EntityEconomy.actions'

const EconomyGovernance: React.FunctionComponent = () => {
  const dispatch = useDispatch()
  const {
    governance: { proposals },
  } = useSelector((state: RootState) => state.economy)

  useEffect(() => {
    dispatch(getProposals())
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    console.log(proposals)
  }, [proposals])
  return (
    <Container>
      <SectionTitleContainer>
        <SectionTitle>Current Governance Proposals</SectionTitle>
      </SectionTitleContainer>

      <GovernanceProposal
        no={999}
        type={ProposalType.Membership}
        announce={'Extend the project end-date to September 2020'}
        remain={412}
        proposedBy={'Shaun Conway'}
        submissionDate={'2020-06-23 16:23'}
        closeDate={'2020-08-24 16:30'}
        votes={230}
        available={280}
        myVote={false}
      />
      <GovernanceProposal
        no={4}
        type={ProposalType.Budget}
        announce={'Issue an Alpha Bond for $100,000'}
        remain={0}
        proposedBy={'Shaun Conway'}
        submissionDate={'2020-04-01 10:00'}
        closeDate={'2020-04-21 10:00'}
        votes={230}
        available={280}
        myVote={true}
      />

      <SectionTitleContainer>
        <SectionTitle>Past Governance Proposals</SectionTitle>
      </SectionTitleContainer>
      <GovernanceTable />
    </Container>
  )
}

export default EconomyGovernance
