import gsap from "gsap";

export default class Page {
  constructor(selector, index) {
    this.parent = selector;
    this.pageIndex = index;
    this.tl = new gsap.timeline();
    this.bindAll();
  }
  bindAll() {
    this.animateIn.bind(this);
    this.animateOut.bind(this);
  }

  animateIn() {
    return new Promise((res, rej) => {
      this.tl.fromTo(
        this.parent,
        { opacity: 0, pointerEvents: "none" },
        {
          opacity: 1,
          pointerEvents: "all",
          onComplete() {
            res();
          },
        }
      );
    });
  }

  animateOut() {
    return new Promise((res, rej) => {
      this.tl.to(this.parent, {
        opacity: 0,
        pointerEvents: "none",
        onComplete() {
          res();
        },
      });
    });
  }
}
