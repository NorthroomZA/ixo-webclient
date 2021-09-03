import {
  EconomyActionTypes,
  EconomyState,
  EntityEconomyActions,
  ProposalsType,
} from './types'

const initialState: EconomyState = {
  governance: {
    proposals: null,
  },
}

export const reducer = (
  state = initialState,
  action: EconomyActionTypes,
): any => {
  switch (action.type) {
    case EntityEconomyActions.GetProposalsSuccess:
      return {
        ...state,
        governance: {
          proposals: action.payload,
        },
      }
    case EntityEconomyActions.GetProposersSuccess:
      const newProposals = { ...state }.governance.proposals.map(
        (proposal: ProposalsType, i: number) => ({
          ...proposal,
          proposer: action.payload[i],
        }),
      )
      return {
        ...state,
        governance: {
          proposals: newProposals,
        },
      }
    default:
      return state
  }
}
