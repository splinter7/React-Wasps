import React from "react";
import { Sprite, WaspAnimationFrame } from "./styles";
import waspbg1 from "./images/sprites.png";
import waspbg2 from "./images/sprites1.png";
import waspbg3 from "./images/sprites2.png";
import WaspAnimation from "./animation";
import { wasps } from "./wasps";

class Wasps extends React.Component {
    constructor(){
        super();

        this.state = {
            wasps: wasps
        }
    }

    componentDidMount = () => {
        let { wasps } = this.state;

        let waspObj = wasps.map((wasp) => {
            return new WaspAnimation(wasp.target, wasp.name, wasp.boundary, this.changeWaspWingPosition)
        });

        waspObj.forEach((wasp) => {
            wasp.flap();
            wasp.setTop();
            wasp.flyDown();
        });
    }

    changeWaspWingPosition = (value, object) => {
        const { wasps } = this.state;
        let update = wasps.map((wasp) => {
            if(wasp.name === object){
                wasp.position = `0 ${value}px`;
            }
            return wasp;
        });
        this.setState({wasps: update});
    }

    renderWasp = (index, wasp, img) => (
        <Sprite styles={wasp.styles} key={index} id={wasp.target}>
            <WaspAnimationFrame
                background={img}
                id={wasp.name}
                position={wasp.position}
                width={wasp.styles.width}
                height={wasp.styles.height}
            />
        </Sprite>
    )

    render = () => {
        const {
            wasps
        } = this.state
        return (
            <div>
                {wasps.map((wasp, index) => {
                    switch(index){
                        case 0:
                            return this.renderWasp(index, wasp, waspbg1);
                        case 1:
                            return this.renderWasp(index, wasp, waspbg2);
                        case 2:
                            return this.renderWasp(index, wasp, waspbg3);
                    }
                })}
            </div>
        );
    }
}

export default Wasps;
