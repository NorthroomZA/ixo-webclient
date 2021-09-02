import { EconomyActionTypes, EconomyState, EntityEconomyActions } from "./types"

const initialState: EconomyState = {
  governance: {
    proposals: null
  }
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
          proposals: action.payload
        }
      }
    default:
      return state
  }
}
