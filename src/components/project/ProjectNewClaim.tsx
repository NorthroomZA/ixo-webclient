import * as React from 'react';
import { LayoutWrapperClaims } from '../common/LayoutWrapperClaims';
import { WidgetWrapperClaims } from '../common/WidgetWrapperClaims';
import DynamicForm from '../form/DynamicForm';
import { decode as base64Decode } from 'base-64';
import { Data } from '../../types/models/project';
import styled from 'styled-components';

const Divider = styled.div`
	height: 2px;
	background: ${props => props.theme.bg.lightBlue};
	width: 36%;
	position: absolute;
	left: 15px;
`;

const DividerShadow = styled.div`
	height: 1px;
	background: ${props => props.theme.bg.lightGrey};
	width: 100%;
`;

const FormProgressBar = styled.div`
	background: ${props => props.theme.bg.green};
	height: 6px;
	width: 100%;
	border-radius: 4px 4px 0px 0px;
`;

export interface ParentProps {
	submitClaim: (claimData: object) => void;
	ixo?: any;
	projectData: Data;
}
export class ProjectNewClaim extends React.Component<ParentProps> {
	state = {
		fetchedFile: null
	};

	fetchFormFile = (claimFormKey: string, pdsURL: string) => {
		this.props.ixo.project.fetchPublic(claimFormKey, pdsURL).then((res: any) => {
			console.log('Fetched: ', res);
			let fileContents = base64Decode(res.data);
			this.setState({ fetchedFile: fileContents });
		});
	}

	componentDidMount() {
		this.fetchFormFile(this.props.projectData.templates.claim.form, this.props.projectData.serviceEndpoint);
	}

	render() {
		const claimParsed = JSON.parse(this.state.fetchedFile);
		if (claimParsed) {
			return (
				<LayoutWrapperClaims>
					<div className="container">
						<FormProgressBar />
						<div className="row">
							<div className="col-md-12">
								<WidgetWrapperClaims>
									<h3>Form section 1</h3>
									<DividerShadow>
									<Divider />
									</DividerShadow>
									<DynamicForm projectDID={this.props.projectData.projectDid} formSchema={claimParsed.fields} handleSubmit={(claimData) => this.props.submitClaim(claimData)} />
								</WidgetWrapperClaims>
							</div>
						</div>
					</div>
				</LayoutWrapperClaims>
			);
		}
		return null;
	}
}