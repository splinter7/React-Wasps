import styled from "styled-components";

export const Sprite1 = styled.div`
	width:123px;
	height:100px;
	position:absolute;
	top:100px;
	right:50px;
	z-index:3;
`;

export const Sprite2 = styled.div`
	width:90px;
	height:73px;
	position:absolute;
	top:70px;
	right:200px;
	z-index:2;
`;

export const Sprite3 = styled.div`
	width:50px;
	height:41px;
	position:absolute;
	top:50px;
	right:50px;
	z-index:1;
`;

export const WaspAnimationFrame = styled.div`
    background: url(${(props) => props.background}) no-repeat;
	background-position: ${(props) => props.position};
	width: ${(props) => props.width};
	height: ${(props) => props.height};
`;