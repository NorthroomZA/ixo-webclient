import { Moment } from 'moment'

export interface EconomyState {
  governance: GovernanceState
}

// Governance
export interface GovernanceState {
  proposals: ProposalsType[]
}

export enum ProposalStatus {
  PROPOSAL_STATUS_REJECTED = 'PROPOSAL_STATUS_REJECTED',
  PROPOSAL_STATUS_DEPOSIT_PERIOD = 'PROPOSAL_STATUS_DEPOSIT_PERIOD'
}

export interface TallyType {
  yes: string;
  no: string;
  noWithVeto: string;
  abstain: string;
}

export interface Coin {
  denom: string
  amount: string
}

export enum ProposalContentType {
  ParameterChangeProposal = "/cosmos.params.v1beta1.ParameterChangeProposal",
  TextProposal = "/cosmos.gov.v1beta1.TextProposal",
}

export enum InflationType {
  InflationMin = 'InflationMin',
  InflationMax = 'InflationMax',
  InflationRateChange = 'InflationRateChange'
}

export interface ProposalChangeType {
  subspace: string
  key: InflationType
  value: string
}

export interface ProposalContent{
  '@type': ProposalContentType
  title: string
  description: string
  changes?: ProposalChangeType[]
}

export interface ProposalsType {
  proposalId: number
  proposer: string
  content: ProposalContent
  tally: TallyType
  status: ProposalStatus
  totalDeposit: Coin[]
  submitTime: Moment
  DepositEndTime: Moment
  votingStartTime: Moment
  votingEndTime: Moment
}


// Acion types
export enum EntityEconomyActions {
  GetProposals = 'ixo/Economy/GET_PROPOSALS',
  GetProposalsSuccess = 'ixo/Economy/GET_PROPOSALS_FULFILLED',
  GetProposalsPending = 'ixo/Economy/GET_PROPOSALS_PENDING',
  GetProposalsFailure = 'ixo/Economy/GET_PROPOSALS_REJECTED',
}
export interface GetProposalsAction {
  type: typeof EntityEconomyActions.GetProposals
  payload: Promise<ProposalsType[]>
}
export interface GetProposalsSuccessAction {
  type: typeof EntityEconomyActions.GetProposalsSuccess
  payload: ProposalsType[]
}


export type EconomyActionTypes = 
  | GetProposalsAction
  | GetProposalsSuccessAction
