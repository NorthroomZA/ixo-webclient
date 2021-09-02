import { Dispatch } from 'redux'
import Axios from 'axios'
import { EntityEconomyActions, GetProposalsAction } from './types'
import { mapProposals } from './utils'

export const getProposals = () => (dispatch: Dispatch): GetProposalsAction => {
  return dispatch({
    type: EntityEconomyActions.GetProposals,
    payload: Axios.get(
      `${process.env.REACT_APP_GAIA_URL}/cosmos/gov/v1beta1/proposals`,
    )
      .then(response => response.data)
      .then(response => {
        const { proposals } = response
        return proposals.map(proposal => mapProposals(proposal))
      })
      .catch(() => []),
  })
}
