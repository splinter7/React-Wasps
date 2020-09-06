import React from "react";
import { 
    Sprite1,
    Sprite2,
    Sprite3,
    WaspAnimationFrame
} from "./styles";
import waspbg1 from "./images/sprites.png";
import waspbg2 from "./images/sprites1.png";
import waspbg3 from "./images/sprites2.png";
import WaspAnimation from "./animation";
import { wasp1, wasp2, wasp3 } from "./wasps";

class Wasps extends React.Component {
    constructor(){
        super()

        this.state = {
            wasp1: wasp1,
            wasp2: wasp2,
            wasp3: wasp3
        }
    }

    componentDidMount = () => {
        const waspObj1 = new WaspAnimation('target0', "buzzer0", 100, this.changeWaspWingPosition);
        const waspObj2 = new WaspAnimation('target1', "buzzer1", 90, this.changeWaspWingPosition);
        const waspObj3 = new WaspAnimation('target2', "buzzer2", 50, this.changeWaspWingPosition);
        waspObj1.flap();
        waspObj2.flap();
        waspObj3.flap();

        waspObj1.flyUp();
        waspObj2.flyDown();
        waspObj3.flyDown();

        waspObj1.setTop();
        waspObj2.setTop();
        waspObj3.setTop();
    }

    changeWaspWingPosition = (value, object) => {
        let { wasp1, wasp2, wasp3 } = this.state;
        let wasps = [ wasp1, wasp2, wasp3 ];
        wasps.map((wasp) => {
            if(wasp.name === object){
                wasp.position = `0 ${value}px`;
            }
            return wasp;
        })
        this.setState({wasp1: wasp1});
        this.setState({wasp2: wasp2});
        this.setState({wasp3: wasp3});
    }

    render = () => {
        const {
            wasp1,
            wasp2,
            wasp3,
        } = this.state
        return (
            <div>
                <Sprite1 id={wasp1.target}>
                    <WaspAnimationFrame
                        background={waspbg1}
                        id={wasp1.name}
                        position={wasp1.position}
                        width="123px"
                        height="100px"
                    />
                </Sprite1>

                <Sprite2 id={wasp2.target}>
                    <WaspAnimationFrame
                        background={waspbg2}
                        id={wasp2.name}
                        position={wasp2.position}
                        width="90px"
                        height="73px"
                    />
                </Sprite2>

                <Sprite3 id={wasp3.target}>
                    <WaspAnimationFrame
                        background={waspbg3}
                        id={wasp3.name}
                        position={wasp3.position}
                        width="50px"
                        height="41px"
                    />
                </Sprite3>
            </div>
        );
    }
}

export default Wasps;
