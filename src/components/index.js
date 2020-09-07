import React from "react";
import { Sprite, WaspAnimationFrame } from "./styles";
import waspbg1 from "./images/sprites.png";
import waspbg2 from "./images/sprites1.png";
import waspbg3 from "./images/sprites2.png";
import WaspAnimation from "./animation";
import { wasps } from "./wasps";

class Wasps extends React.Component {
  constructor() {
    super();

    this.state = {
      wasps: wasps,
      spriteImgs: [waspbg1, waspbg2, waspbg3],
    };
  }

  componentDidMount = () => {
    const { wasps } = this.state;
    let waspObj = wasps.map((wasp) => {
      return new WaspAnimation(
        wasp.target,
        wasp.name,
        wasp.boundary,
        this.changeWaspWingPosition
      );
    });

    waspObj.forEach((wasp) => {
      wasp.flap();
      wasp.setTop();
      wasp.flyDown();
    });
  };

  changeWaspWingPosition = (value, object) => {
    const { wasps } = this.state;
    let update = wasps.map((wasp) => {
      if (wasp.name === object) {
        wasp.position = `0 ${value}px`;
      }
      return wasp;
    });
    this.setState({ wasps: update });
  };

  renderWasp = (index, wasp) => {
    const { spriteImgs } = this.state;
    return (
      <Sprite styles={wasp.styles} key={index} id={wasp.target}>
        <WaspAnimationFrame
          background={spriteImgs[index]}
          id={wasp.name}
          position={wasp.position}
          width={wasp.styles.width}
          height={wasp.styles.height}
        />
      </Sprite>
    );
  };

  render = () => {
    const { wasps } = this.state;
    return (
      <div>
        {wasps.map((wasp, index) => {
          return this.renderWasp(index, wasp);
        })}
      </div>
    );
  };
}

export default Wasps;
