import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { HeaderConnected } from './components/Header';
import { PublicSiteStoreState } from './redux/public_site_reducer';
import { Routes } from './components/Routes';
import styled, { ThemeProvider } from 'styled-components';
import './assets/icons.css';
import { initIxo } from './redux/ixo/ixo_action_creators';
import { initKeysafe } from './redux/keysafe/keysafe_action_creators';
import { setActiveProject } from './redux/activeProject/activeProject_action_creators';

// THEME DECLARATION BELOW

const theme = {
	ixoBlue: '#49BFE0', // button borders, small hero numbers, SDG numbers
	ixoOrange: '#F89D28',
	bg: {
		blue: '#002233', // dashboard background
		darkBlue: '#01151F', // Tooltips background
		lightBlue: '#017492', // active button background for tabs on hero section
		lightGrey: '#F6F6F6', // light background for projects list
		gradientBlue: 'linear-gradient(to bottom, #012639 0%,#002d42 100%)', // background for widgets (charts, graphs, tabs, etc.)
		gradientButton: 'linear-gradient(180deg, #49BFE0 0%, #016480 100%)'
	},
	fontBlue: '#49BFE0', // Same as ixoBlue
	fontDarkBlue: '#013C4F', 
	fontDarkGrey: '#282828',
	fontLightBlue: '#83D9F2', // big hero section numbers, widgets big numbers
	fontGrey: '#282828', // generally text on white background
	fontRoboto: 'Roboto, sans-serif',
	fontRobotoCondensed: 'Roboto Condensed, sans-serif',
	grey: '#E9E8E8', // borders for project list cards, progress bar background on projects list
	darkGrey: '#656969', // "load more projects" button on project list
	widgetBorder: '#0C3549', // border color for graphs/ charts, etc.
	graphGradient: 'linear-gradient(to right, #016480 0%, #03d0FE 100%)', // gradient fill for graphs/bars/charts
	red: '#E2223B'
};

// END OF THEME DECLARATION, CSS FOR COMPONENT BELOW
const Container = styled.div`
	font-family: ${theme.fontRoboto};
	font-weight: 300;
`;

// const Loading = styled.div`
// 	display:flex;
// 	justify-content:center;
// 	align-items:center;
// 	height:calc(100vh - 140px);
// `;

// const Unsuccessful = Loading;

export namespace App {

	export interface State {
		projectList: any;
		myProjectList: any;
		serviceAgentProjectList: any;
		did: string;
	}

	export interface StateProps {
		ixo?: any;
		pingError?: String;
		pingResult?: String;
		keysafe?: any;
	}
	export interface DispatchProps {
		onIxoInit: () => void;
		onKeysafeInit: () => void;
		onSetActiveProject: (did: string) => void;
	}
	export interface Props extends StateProps, DispatchProps {
	}
}

class App extends React.Component<App.Props, App.State> {

	state = {
		projectList: [],
		myProjectList: [],
		serviceAgentProjectList: [],
		did: '',
		isProjectPage: false
	};

	refreshProjects = () => {
		this.props.ixo.project.listProjects().then((response: any) => {
			// this.setState({ projectList: response.result });
		}).catch((error) => {
			console.error(error);
		});
	}

	refreshMyProjects = () => {
		// const myProjectsList: any = this.state.projectList.filter((project) => {
		// 	return project.owner.did === this.props.ixo.credentialProvider.getDid();
		// });
		this.setState({ myProjectList: this.state.projectList });
	}

	refreshServiceAgentProjectList = () => {
		this.props.ixo.project.listProjectsByDidAndRole(this.props.ixo.credentialProvider.getDid(), 'SA').then((response: any) => {
			this.setState({ serviceAgentProjectList: response.result });
		}).catch((error) => {
			console.error(error);
		});
	}

	refreshProjectList = () => {
		this.refreshProjects();
		this.refreshMyProjects();
		this.refreshServiceAgentProjectList();
	}

	handleOnboardDid() {
		this.props.keysafe.getInfo((error, response) => {
			if (response) {
				this.setState({did: response.did});
				console.log('You have successfully been linked into the keysafe');
			} else {
				console.log('Please login to your credential provider', error);
			}
		});
	}

	componentDidUpdate(prevProps: any) {
		if (this.props.ixo !== prevProps.ixo) {
			this.props.ixo.project.listProjects().then((response: any) => {
				this.setState({ projectList: response.result });
			}).catch((result: Error) => {
				console.log(result);
			});
		}

	}

	componentDidMount() {

		this.props.onIxoInit();
		this.props.onKeysafeInit();

		if (this.props.keysafe !== null) {
			this.handleOnboardDid();
		} else {
			console.log('Please install IXO Keysafe');
		}

	}

	renderProjectContent() {
		return (
			<Routes
				projectList={this.state.projectList}
				myProjectList={this.state.myProjectList}
				serviceAgentProjectList={this.state.serviceAgentProjectList}
				refreshProjects={this.refreshProjectList}
			/>
		);
		// if (this.props.ixo && !this.props.pingError) {
		// 	return (
		// 			<Routes
		// 				projectList={this.state.projectList}
		// 				myProjectList={this.state.myProjectList}
		// 				serviceAgentProjectList={this.state.serviceAgentProjectList}
		// 				refreshProjects={this.refreshProjectList}
		// 			/>
		// 	);
		// } else if (this.props.pingError) {
		// 	return <Unsuccessful className="col-md-12"><p>Error connecting to ixo server... Retrying...</p></Unsuccessful>;
		// } else {
		// 	return <Loading className="col-md-12"><p>Loading...</p></Loading>;
		// }
}

	render() {
		return (
			<ThemeProvider theme={theme}>
				<Container>
					<HeaderConnected />
					{this.renderProjectContent()}
				</Container>
			</ThemeProvider>
		);
	}
}

function mapStateToProps(state: PublicSiteStoreState) {
	return {
		ixo: state.ixoStore.ixo,
		keysafe: state.keysafeStore.keysafe
	};
}

function mapDispatchToProps(dispatch: any): App.DispatchProps {
	return {
		onIxoInit: () => {
			dispatch(initIxo());
		},
		onKeysafeInit: () => {
			dispatch(initKeysafe());
		},
		onSetActiveProject: (did: string) => {
			dispatch(setActiveProject(did));
		}
	};
}

export const AppConnected = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(App as any) as any);