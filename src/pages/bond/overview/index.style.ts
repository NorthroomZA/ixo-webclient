import styled from 'styled-components'
import { theme } from 'modules/App/App.styles'

export const BondsHomeSectionNav = styled.div`
  padding: 1rem;
  margin-left: 1.875rem;
  a {
    font-weight: normal;
    font-size: 1.1875rem;
    text-transform: uppercase;
    text-decoration: none;

    color: #ffffff;
    padding: 0.25rem 1.5rem;
    &.active {
      color: #87def6;
    }
    &:hover {
      text-decoration: none;
      color: #87def6;
    }
  }
  @media (max-width: 768px) {
    padding: 1rem 0;
    margin: 0;
    width: initial;
    overflow-x: scroll;
  }
`

export const BondState = styled.span`
  background: ${theme.fontSkyBlue};
  padding: 5px 10px;
  border-radius: 100px;
  color: white;
  font-weight: bold;
  margin-right: 10px;
`
