import React from 'react';
import styled, { css } from 'styled-components';
import palette from '../../lib/styles/palette';

const StylesButton = styled.button` 
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.25rem 1rem;
    color: white;
    outline: non;
    cursor: pointer;

    background ${palette.gray[8]};
    &:hover {
        background ${palette.gray[6]};
    }

    ${props => 
        props.fullWidth &&
        css`
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        width: 100%;
        font-size: 1.125rem;
    `}

    ${props => 
        props.cyan &&
        css`
        background: ${palette.cyan[5]};
        &:hover {
            background: ${palette.cyan[4]};
        }
    `}
`; 

//굳이 Button 리액트 컴포넌트를 만들고 그안에 렌더해준건, 추후 자동 import가 되도록. 
//(styled-components로 만든 컴포넌트를 바로 내보내면, 자동 import가 제대로 작동하지 않기 떄문)
//Button이 받아오는 props를 모두 StyledButton에 전달한다는 의미. 
const Button = props => <StylesButton {...props} />;
export default Button;
