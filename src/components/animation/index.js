import gsap from "gsap";

class WaspAnimation {
  constructor(target, name, boundary, changePosition) {
    this.parent = target;
    this.wasp = document.getElementById(target);
    this.sprite = document.getElementById(name);
    this.pos = 1;
    this.changePosition = changePosition;
    this.boundary = boundary;

    this.top = Math.floor(Math.random() * 50 + 5);
    this.bottom = Math.floor(Math.random() * 200 + 50);
    this.time = Math.floor(Math.random() * 4 + 2);
    this.flapInterval = 0;
  }

  flap = () => {
    this.flapInterval = setInterval(() => {
      switch (this.pos) {
        case 1:
          this.moveWings();
          break;
        case 2:
          this.moveWings();
          break;
        default:
          this.moveWings();
          break;
      }
    }, 30);
  };

  moveWings = () => {
    let calcPos = -(this.pos * this.boundary);
    this.pos === 3
      ? this.changePosition(0, this.sprite.getAttribute("id"))
      : this.changePosition(calcPos, this.sprite.getAttribute("id"));
    this.pos = this.pos === 3 ? 1 : this.pos + 1;
  };

  flyDown = () => {
    gsap.to(`#${this.parent}`, {
      duration: this.time,
      ease: "Sine.easeInOut",
      y: this.top,
      onComplete: () => {
        this.flyUp();
      },
    });
  };

  flyUp = () => {
    gsap.to(`#${this.parent}`, {
      duration: this.time,
      ease: "Sine.easeInOut",
      y: this.bottom,
      onComplete: () => {
        this.flyDown();
      },
    });
  };

  setTop = () => {
    this.wasp.style.top = `${this.top}px`;
  };

  stop = () => {
    if (this.flapInterval) {
      clearInterval(this.flapInterval);
      this.flapInterval = 0;
    }
    gsap.killTweensOf(`#${this.parent}`);
  };
}

export default WaspAnimation;
