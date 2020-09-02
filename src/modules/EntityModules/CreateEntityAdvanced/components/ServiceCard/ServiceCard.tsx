import React from 'react'
import { ServiceType } from '../../../Entities/types'
import { serviceTypeMap } from '../../../Entities/strategy-map'
import MultiControlForm from 'common/components/JsonForm/MultiControlForm/MultiControlForm'
import { FormCardProps } from '../../../CreateEntity/types'
import { LinkButton } from 'common/components/JsonForm/JsonForm.styles'

interface Props extends FormCardProps {
  type: ServiceType
  shortDescription: string
  serviceEndpoint: string
  publicKey: string
  properties: string
}

const ServiceCard: React.FunctionComponent<Props> = React.forwardRef(
  (
    {
      type,
      shortDescription,
      serviceEndpoint,
      publicKey,
      properties,
      handleUpdateContent,
      handleSubmitted,
      handleError,
      handleRemoveSection,
    },
    ref,
  ) => {
    const formData = {
      type,
      shortDescription,
      serviceEndpoint,
      publicKey,
      properties,
    }

    const schema = {
      type: 'object',
      required: [
        'type',
        'shortDescription',
        'serviceEndpoint',
        'publicKey',
        'properties',
      ],
      properties: {
        type: {
          type: 'string',
          title: 'Service Type',
          enum: Object.keys(ServiceType).map((key) => ServiceType[key]),
          enumNames: Object.keys(ServiceType).map(
            (key) => serviceTypeMap[ServiceType[key]].title,
          ),
        },
        serviceEndpoint: {
          type: 'string',
          title: 'Service Endpoint',
        },
        publicKey: {
          type: 'string',
          title: 'Public Key / Token',
        },
        properties: {
          type: 'string',
          title: 'Other Parameters',
        },
        shortDescription: {
          type: 'string',
          title: 'Short Description',
        },
      },
    } as any

    const uiSchema = {
      type: {
        'ui:placeholder': 'Select Service',
      },
      serviceEndpoint: {
        'ui:placeholder': 'Enter URL',
      },
      publicKey: {
        'ui:placeholder': 'Enter Value',
      },
      properties: {
        'ui:placeholder': 'Paste a Valid String',
      },
      shortDescription: {
        'ui:widget': 'textarea',
        'ui:placeholder': 'Start Typing Here',
      },
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

export default ServiceCard