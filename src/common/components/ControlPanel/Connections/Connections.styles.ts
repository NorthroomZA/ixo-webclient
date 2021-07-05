import styled from "styled-components";
import { SquareButtonSection } from "../ControlPanel.styles";
import { QRInner } from "../../QRCode/QRCode.styles";

export const ConnectionButtonsWrapper = styled(SquareButtonSection)`
  button {
    max-width: 5.5rem;
    min-width: auto;
    padding: 0.25rem;

    .icon-wrapper {
      border-radius: 50%;
      background: #F8F9FD;
      border: 1px solid #E0E5EF;
      width: 3.5rem;
      height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;


      svg {
        margin: 0 auto;
        path {
          fill: ${(props: any): string => props.theme.ixoBlue};
        }
      }
    }
  }
  .show-more-container {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0s ease-out;
    &.show {
      transition: max-height 1.75s ease-out;
      max-height: 300px;
    }
    > * {
      padding: 1rem;
    }
    button {
      margin: 0;
    }
    ${QRInner} {
      background: none;
      box-shadow: none;
      margin: 0;
      padding: 0;
      height: initial;
    }
  }
`;
