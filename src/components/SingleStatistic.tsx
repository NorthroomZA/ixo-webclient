import * as React from 'react';
import { StatType, Statistic } from '../types/models';
import styled from 'styled-components';

const Container = styled.div`
	text-align: center;
	padding:20px 15px;
`;

const Title = styled.h3`
	text-transform: uppercase;
	color: white;
	font-size: 15px;
	margin-bottom: 4px;
`;

const Amount = styled.p`
	color: ${props => props.theme.fontLightBlue};
	font-size: 29px;
	line-height: 38px;
	margin-bottom: 4px;

	span {
		font-weight: 300;
	}

	i:before {
		font-size: 19px;
		top: -2px;
		right: 5px;
		position: relative;
	}
`;

const Error = styled.p`
	color: ${props => props.theme.red};
	font-size: 16px;
`;

const Warning = styled(Error)`
	color: ${props => props.theme.ixoOrange};
`;

const Description = styled.p`
	color: white;
	font-weight: 300;
	font-size: 13px;

	.text {
		color: white;
	}

	.number {
		color: ${props => props.theme.fontBlue}; 
		display:inline-block;
		background: ${props => props.theme.bg.gradientBlue};
		padding:2px 8px;
		margin:0 5px;
		border-radius: 3px;
	}
`;

export const SingleStatistic: React.SFC<Statistic> = ({type, amount, title, descriptor}) => {

	const handleAmount = () => {

		if (type !== StatType.fraction &&  amount instanceof Array) {
			return <Error>WRONG INPUT FOR STATISTIC TYPE</Error>;
		}
		switch (type) {
			case StatType.decimal:
				return (
					<Amount>
						{(amount).toLocaleString()}
					</Amount>
				);
			case StatType.fraction:
				if (!(amount instanceof Array)) {
					return <Error>INPUT SHOULD BE ARRAY WITH 2 NUMBERS</Error>;
				}
				if (amount[0] > amount[1]) {
					return <Error>INVALID FORMAT, NUMERATOR CANNOT BE LARGER THAN DENOMINATOR</Error>;
				}
				return (
					<Amount>
						<span>{(amount[0]).toLocaleString()}/</span>{(amount[1]).toLocaleString()}
					</Amount>
				);
			
			case StatType.ixoAmount:
				return (
				<Amount>
					<i className="icon-ixo-small" />
					{amount.toLocaleString()}
				</Amount>
				);
			default:
				return <Warning>UNKNOWN</Warning>;
		}
	};

	return (
		<Container>
			<Title>{title}</Title>
			{handleAmount()}
			<Description>
				{descriptor.map((obj, index) => {
					return <span key={index} className={obj.class}>{obj.value}</span>;
				})}
			</Description>
		</Container>
	);
};