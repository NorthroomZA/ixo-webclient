import { Dispatch } from 'redux'
import blocksyncApi from 'common/api/blocksync-api/blocksync-api'
import keysafe from 'common/keysafe/keysafe'
import {
  AgentStatus,
  EntityAgentsActions,
  GetEntityAgentsAction,
  UpdateEntityAgentStatusAction,
  CreateEntityAgentAction,
} from './types'
import { AgentRole } from 'modules/Account/types'
import {
  ApiCreateEntityAgentPayload,
  ApiEntityAgent,
  // ApiListEntityAgentsPayload,
  ApiUpdateEntityAgentPayload,
} from 'common/api/blocksync-api/types/entity-agent'
import { RootState } from 'common/redux/types'
import * as Toast from 'common/utils/Toast'
import { selectCellNodeEndpoint } from '../../SelectedEntity.selectors'

export const getEntityAgents = (entityDid: string, role: AgentRole) => (
  dispatch: Dispatch,
  getState: () => RootState,
): GetEntityAgentsAction => {
  const agentsPayload = {
    projectDid: entityDid,
  }
  const state = getState()
  const cellNodeEndpoint = selectCellNodeEndpoint(state)

  keysafe.requestSigning(
    JSON.stringify(agentsPayload),
    (signError: any, signature: any): any => {
      if (signError) {
        return dispatch({
          type: EntityAgentsActions.GetEntityAgentsFailure,
          payload: {
            error: signError,
          },
        })
      }

      blocksyncApi.agent
        .listAgentsForProject(agentsPayload, signature, cellNodeEndpoint)
        .then((response: any) => {
          console.log('fffffffffffffffff', response)
          if (response.error) {
            return dispatch({
              type: EntityAgentsActions.GetEntityAgentsFailure,
              payload: {
                error: response.error.message,
              },
            })
          } else {
            const agents: ApiEntityAgent[] = response.result
            return dispatch({
              type: EntityAgentsActions.GetEntityAgentsSuccess,
              payload: {
                agents: agents.map((agent) => {
                  let status = AgentStatus.Pending,
                    version = '2.0'
                  // currentStatus can be nul
                  if (agent.currentStatus) {
                    status = agent.currentStatus.status
                    version = agent.currentStatus.version
                  }

                  const { agentDid, email, name, role } = agent

                  return {
                    name,
                    email,
                    agentDid,
                    role,
                    status,
                    version,
                  }
                }),
              },
            })
          }
        })
        .catch((error) => {
          return dispatch({
            type: EntityAgentsActions.GetEntityAgentsFailure,
            payload: {
              error: error.message,
            },
          })
        })
    },
    'base64',
  )

  return null
}

export const updateAgentStatus = (agentDid: string, status: AgentStatus) => (
  dispatch: Dispatch,
  getState: () => RootState,
): UpdateEntityAgentStatusAction => {
  const state = getState()
  const {
    selectedEntityAgents: { agents },
    selectedEntity: { did: entityDid },
  } = state
  const { role, version } = agents[agentDid]
  const cellNodeEndpoint = selectCellNodeEndpoint(state)

  const updateAgentPayload: ApiUpdateEntityAgentPayload = {
    agentDid,
    status,
    projectDid: entityDid,
    role,
    version: version || undefined,
  }

  keysafe.requestSigning(
    JSON.stringify(updateAgentPayload),
    (signError, signature): any => {
      if (signError) {
        return dispatch({
          type: EntityAgentsActions.UpdateEntityAgentStatusFailure,
          payload: {
            error: signError,
          },
        })
      }

      blocksyncApi.agent
        .updateAgentStatus(updateAgentPayload, signature, cellNodeEndpoint)
        .then((response): any => {
          if (response.error !== undefined) {
            return dispatch({
              type: EntityAgentsActions.UpdateEntityAgentStatusFailure,
              payload: {
                error: response.error.message,
              },
            })
          } else {
            return dispatch({
              type: EntityAgentsActions.UpdateEntityAgentStatusSuccess,
              payload: {
                agentDid,
                status,
              },
            })
          }
        })
        .catch((error) => {
          return dispatch({
            type: EntityAgentsActions.UpdateEntityAgentStatusFailure,
            payload: {
              error: error.message,
            },
          })
        })
    },
    'base64',
  )

  return null
}

export const createEntityAgent = (
  email: string,
  name: string,
  role: AgentRole,
) => (
  dispatch: Dispatch,
  getState: () => RootState,
): CreateEntityAgentAction => {
  // const { account } = getState()

  const state = getState()
  const {
    account: {
      userInfo: {
        didDoc: { did: userDid },
      },
    },
    selectedEntity: { did: entityDid },
  } = state
  const cellNodeEndpoint = selectCellNodeEndpoint(state)

  const createAgentPayload: ApiCreateEntityAgentPayload = {
    email: email,
    name: name,
    role: role,
    agentDid: userDid,
    projectDid: entityDid,
  }

  keysafe.requestSigning(
    JSON.stringify(createAgentPayload),
    (signError: any, signature: any): any => {
      if (signError) {
        return dispatch({
          type: EntityAgentsActions.CreateEntityAgentFailure,
          payload: {
            error: signError,
          },
        })
      }

      blocksyncApi.agent
        .createAgent(createAgentPayload, signature, cellNodeEndpoint)
        .then((response): any => {
          if (response.error !== undefined) {
            Toast.errorToast(`Error: ${response.error.message}`)
            return dispatch({
              type: EntityAgentsActions.CreateEntityAgentFailure,
              payload: {
                error: response.error.message,
              },
            })
          } else {
            Toast.successToast(`Successfully applied to join`)
            return dispatch({
              type: EntityAgentsActions.CreateEntityAgentSuccess,
              payload: {
                agent: {
                  name,
                  email,
                  userDid,
                  role,
                  status: AgentStatus.Pending,
                  version: '2.0',
                },
              },
            })
          }
        })
    },
    'base64',
  )

  return null
}
