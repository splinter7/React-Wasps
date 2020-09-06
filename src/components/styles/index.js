import styled from "styled-components";


export const Sprite = styled.div`
	width:${(props) => props.styles.width};
	height:${(props) => props.styles.height};
	position:absolute;
	top:${(props) => props.styles.top};
	right:${(props) => props.styles.right};
	z-index:${(props) => props.styles.zindex};
`;

export const WaspAnimationFrame = styled.div`
    background: url(${(props) => props.background}) no-repeat;
	background-position: ${(props) => props.position};
	width: ${(props) => props.width};
	height: ${(props) => props.height};
`;