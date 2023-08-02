import gsap from "gsap";

export default class CloseButton {
  constructor(el) {
    this.el = document.querySelector(el);
    this.delay = "-=65%";

    this.createAnimation();
    this.addListeners();
  }

  animateIn() {
    this.initialTl = new gsap.timeline();

    this.initialTl
      .set("rect", { opacity: 1 })
      .to(".l1", {
        rotate: 45,
        x: -5,
        y: 10,
        transformOrigin: "50% 50%",
      })
      .to(
        ".l2",
        {
          rotate: -45,
          x: 5,
          y: 10,
          transformOrigin: "50% 50%",
        },
        "<"
      )
      .to(
        ".l3",
        {
          rotate: -45,
          x: -5,
          y: -20,
          transformOrigin: "50% 50%",
        },
        "<"
      )
      .to(
        ".l4",
        {
          rotate: 45,
          x: 5,
          y: -20,
          transformOrigin: "50% 50%",
        },
        "<"
      );
  }
  animateOut() {
    this.initialTl.reverse();
  }

  createAnimation() {
    this.animation = new gsap.timeline({
      paused: true,
      defaults: { duration: 0.35 },
    });
    const delay = this.delay;

    this.animation
      .to(".l1", {
        x: -10,
        y: 5,
        transformOrigin: "50% 50%",
      })
      .to(
        ".l2",
        {
          x: 10,
          y: 5,
          transformOrigin: "50% 50%",
        },
        delay
      )
      .to(
        ".l4",
        {
          x: 10,
          y: -15,
          transformOrigin: "50% 50%",
        },
        delay
      )
      .to(
        ".l3",
        {
          x: -10,
          y: -15,
          transformOrigin: "50% 50%",
        },
        delay
      );
  }

  addListeners() {
    this.el.onmouseenter = (_) => this.animation.play();
    this.el.onmouseleave = (_) => this.animation.reverse();
    this.el.onclick = (_) => history.back();
  }
}
