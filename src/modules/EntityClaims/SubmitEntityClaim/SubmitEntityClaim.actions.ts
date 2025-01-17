import {
  SaveAnswerAction,
  SubmitEntityClaimActions,
  GoToPreviousQuestionAction,
  GoToNextQuestionAction,
  GoToQuestionNumberAction,
  FinaliseQuestionsAction,
  CreateClaimSuccessAction,
  CreateClaimFailureAction,
  ClearClaimTemplateAction,
  GetClaimTemplateAction,
} from './types'
import { Dispatch } from 'redux'
import { RootState } from 'common/redux/types'
import keysafe from 'common/keysafe/keysafe'
import blocksyncApi from 'common/api/blocksync-api/blocksync-api'
import * as submitEntityClaimSelectors from './SubmitEntityClaim.selectors'
import { ApiListedEntity } from 'common/api/blocksync-api/types/entities'
import { ApiResource } from 'common/api/blocksync-api/types/resource'
/* import { Attestation } from '../types' */
import { fromBase64 } from 'js-base64'
import { FormData } from 'common/components/JsonForm/types'
import { selectCellNodeEndpoint } from 'modules/Entities/SelectedEntity/SelectedEntity.selectors'

export const clearClaimTemplate = (): ClearClaimTemplateAction => ({
  type: SubmitEntityClaimActions.ClearClaimTemplate,
})

export const getClaimTemplate = (
  templateDid: string,
  serviceEndpoint: string = undefined,
) => (
  dispatch: Dispatch,
  getState: () => RootState,
): GetClaimTemplateAction => {
  const state = getState()
  const { submitEntityClaim } = state
  let cellNodeEndpoint = serviceEndpoint
  if (!cellNodeEndpoint) {
    cellNodeEndpoint = selectCellNodeEndpoint(state)
  }

  if (submitEntityClaim && submitEntityClaim.templateDid === templateDid) {
    return null
  }

  dispatch(clearClaimTemplate())

  const fetchTemplateEntity: Promise<ApiListedEntity> = blocksyncApi.project.getProjectByProjectDid(
    templateDid,
  )

  const fetchContent = (key: string): Promise<ApiResource> =>
    blocksyncApi.project.fetchPublic(key, cellNodeEndpoint) as Promise<
      ApiResource
    >

  return dispatch({
    type: SubmitEntityClaimActions.GetClaimTemplate,
    payload: fetchTemplateEntity.then((apiEntity: ApiListedEntity) => {
      return fetchContent(apiEntity.data.page.cid).then(
        (resourceData: ApiResource) => {
          const attestation: any = JSON.parse(fromBase64(resourceData.data))

          return {
            templateDid,
            claimTitle: apiEntity.data.name,
            claimShortDescription: apiEntity.data.description,
            type: attestation.claimInfo.type,
            questions: attestation.forms,
          }
        },
      )
    }),
  })
}

export const saveAnswer = (formData: FormData) => (
  dispatch: Dispatch,
  getState: () => RootState,
): SaveAnswerAction => {
  if (!formData) {
    return null
  }

  const state = getState()
  const {
    submitEntityClaim: { questions, currentQuestionNo },
  } = state
  const cellNodeEndpoint = selectCellNodeEndpoint(state)

  const questionForm = questions[currentQuestionNo - 1]

  const id = Object.keys(questionForm.schema.properties)[0]
  const control = questionForm.uiSchema[id]['ui:widget']

  if (control.includes('upload') && Object.keys(formData).length > 0) {
    return dispatch({
      type: SubmitEntityClaimActions.SaveAnswer,
      payload: blocksyncApi.project
        .createPublic(formData[id], cellNodeEndpoint)
        .then((response: any) => ({
          [id]: `${cellNodeEndpoint}public/${response.result}`,
        })),
    })
  }

  return dispatch({
    type: SubmitEntityClaimActions.SaveAnswer,
    payload: Promise.resolve({ [id]: formData[id] }),
  })
}

export const goToPreviousQuestion = () => (
  dispatch: Dispatch,
  getState: () => RootState,
): GoToPreviousQuestionAction => {
  const {
    submitEntityClaim: { currentQuestionNo },
  } = getState()

  if (currentQuestionNo > 1) {
    return dispatch({
      type: SubmitEntityClaimActions.GoToPreviousQuestion,
      payload: {
        previousQuestionNo: currentQuestionNo - 1,
      },
    })
  }

  return null
}

export const goToNextQuestion = () => (
  dispatch: Dispatch,
  getState: () => RootState,
): GoToNextQuestionAction => {
  const {
    submitEntityClaim: { questions, currentQuestionNo },
  } = getState()
  const totalQuestions = questions.length

  if (currentQuestionNo < totalQuestions) {
    return dispatch({
      type: SubmitEntityClaimActions.GoToNextQuestion,
      payload: {
        nextQuestionNo: currentQuestionNo + 1,
      },
    })
  }

  return null
}

export const goToQuestionNumber = (newQuestionNumber: number) => (
  dispatch: Dispatch,
  getState: () => RootState,
): GoToQuestionNumberAction => {
  const {
    submitEntityClaim: { questions, currentQuestionNo, answersComplete },
  } = getState()
  const totalQuestions = questions.length

  if (
    answersComplete ||
    (newQuestionNumber <= totalQuestions &&
      newQuestionNumber < currentQuestionNo)
  ) {
    return dispatch({
      type: SubmitEntityClaimActions.GoToQuestionNumber,
      payload: {
        questionNo: newQuestionNumber,
      },
    })
  }

  return null
}

export const finaliseQuestions = (): FinaliseQuestionsAction => {
  return {
    type: SubmitEntityClaimActions.FinaliseQuestions,
  }
}

export const createEntityClaim = () => (
  dispatch: Dispatch,
  getState: () => RootState,
): CreateClaimSuccessAction | CreateClaimFailureAction => {
  dispatch({
    type: SubmitEntityClaimActions.CreateClaimStart,
  })

  const state = getState()
  const cellNodeEndpoint = selectCellNodeEndpoint(state)

  const claimApiPayload = submitEntityClaimSelectors.selectClaimApiPayload(
    state,
  )

  console.log(JSON.stringify(claimApiPayload), 'fffffffffff')

  keysafe.requestSigning(
    JSON.stringify(claimApiPayload),
    (signError: any, signature: any): any => {
      if (signError) {
        return dispatch({
          type: SubmitEntityClaimActions.CreateClaimFailure,
          payload: {
            error: signError,
          },
        })
      }

      blocksyncApi.claim
        .createClaim(claimApiPayload, signature, cellNodeEndpoint)
        .then((res) => {
          if (res.error) {
            return dispatch({
              type: SubmitEntityClaimActions.CreateClaimFailure,
              payload: {
                error: res.error.message,
              },
            })
          } else {
            return dispatch({
              type: SubmitEntityClaimActions.CreateClaimSuccess,
            })
          }
        })
        .catch((error) => {
          return dispatch({
            type: SubmitEntityClaimActions.CreateClaimFailure,
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
