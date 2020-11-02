import React from 'react'
import { LinkButton } from 'common/components/JsonForm/JsonForm.styles'
import { NodeType } from '../../../../types'
import { nodeTypeMap } from '../../../../strategy-map'
import { FormCardProps } from '../../../types'
import MultiControlForm from 'common/components/JsonForm/MultiControlForm/MultiControlForm'
import { FormValidation } from '@rjsf/core'
import Axios from 'axios'

interface Props extends FormCardProps {
  type: NodeType
  nodeId: string
  serviceEndpoint: string
}

const NodeCard: React.FunctionComponent<Props> = React.forwardRef(
  (
    {
      type,
      nodeId,
      serviceEndpoint,
      handleUpdateContent,
      handleSubmitted,
      handleError,
      handleRemoveSection,
    },
    ref,
  ) => {
    const formData = {
      type,
      nodeId,
      serviceEndpoint
    }

    const schema = {
      type: 'object',
      required: ['type', 'nodeId', 'serviceEndpoint'],
      properties: {
        type: {
          type: 'string',
          title: 'Node Type',
          enum: Object.keys(NodeType).map((key) => NodeType[key]),
          enumNames: Object.keys(NodeType).map(
            (key) => nodeTypeMap[NodeType[key]].title,
          ),
        },
        nodeId: { type: 'string', title: 'Node ID' },
        serviceEndpoint: { type: 'string', title: 'Cell Node URL', format: 'uri' }
      },
    } as any

    const uiSchema = {
      type: {
        'ui:placeholder': 'Select Node Type',
      },
      nodeId: { 'ui:placeholder': 'Enter !Name or DID' },
      serviceEndpoint: {
        'ui:placeholder': 'Enter a valid URL in the format https://',
      }
    }

    const endpointHealthCheck = async (url): Promise<boolean> => {
      const isWorking = await Axios.get(url)
      .then((response) => {
        console.log('ffffffffffffffffff')
        return response.status === 200;
      }).catch((reason: any) => false)
      console.log('gggggggggggggggggggg')
      return isWorking
    }

    const validateNodeUrl = (formData:any, errors: FormValidation): FormValidation => {
      if (errors.serviceEndpoint.__errors.length === 0) {
        const isWorking = endpointHealthCheck(formData.serviceEndpoint)
        console.log('fffffffffffff', isWorking);
        if (isWorking) {
          console.log('fffffffffffff', isWorking);
          errors.serviceEndpoint.addError('Check that you have the correct end-point for the Cell Node. Confirm that your instance of the Cell Node is running.')
        }
      }
      return errors;
    }

    return (
      <>
        <MultiControlForm
          ref={ref}
          onSubmit={handleSubmitted}
          onFormDataChange={handleUpdateContent}
          onError={handleError}
          formData={formData}
          schema={schema}
          uiSchema={uiSchema}
          validate={ validateNodeUrl }
          liveValidate={false}
          multiColumn
        >
          &nbsp;
        </MultiControlForm>
        <div className="text-right">
          <LinkButton type="button" onClick={handleRemoveSection}>
            - Remove
          </LinkButton>
        </div>
      </>
    )
  },
)

export default NodeCard
