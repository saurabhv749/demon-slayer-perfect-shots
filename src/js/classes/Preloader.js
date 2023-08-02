import gsap from "gsap";
import { Texture } from "three";

export default class Preloader {
  constructor(data, store) {
    this.store = store;
    this.data = data;

    this.loading = {
      current: 0,
      total: 0,
      isLoaded: false,
    };

    this.getElements();
    this.animateIn();
    this.loadImages();
  }

  getElements() {
    this.container = document.querySelector(".preloader");
    this.title = document.querySelectorAll(".preloader__title");
    this.progress = document.querySelector(".preloader__progress");
  }

  animateIn() {
    let tl = new gsap.timeline({ defaults: { duration: 0.8 } });

    tl.to(this.progress, {
      top: "50%",
      opacity: 1,
    })
      .to(
        this.title[0],
        {
          top: "40%",
          opacity: 1,
        },
        "<"
      )
      .to(
        this.title[1],
        {
          top: "60%",
          opacity: 1,
          onComplete() {
            tl.kill();
          },
        },
        "<"
      );
  }

  loadImages() {
    for (let char of this.data) {
      // add to main app instead of
      const cover = new window.Image();
      const thumb = new window.Image();

      cover.crossOrigin = thumb.crossOrigin = "anonymous";
      cover.src = this.store + char.cover + "?alt=media";
      thumb.src = this.store + char.thumb + "?alt=media";

      cover.onload = () => this.onload(cover);
      thumb.onload = () => this.onload(thumb);
      this.loading.total += 2;

      char.coverImage = cover;
      char.thumbImage = thumb;
    }
  }

  onload(img) {
    img.texture = new Texture(img);
    img.texture.needsUpdate = true;
    this.loading.current += 1;
    const p = this.loading.current / this.loading.total;
    this.progress.textContent = Math.round(p * 100) + " %";

    if (p === 1) {
      this.container.classList.add("is-hidden");
      this.loading.isLoaded = true;
    }
  }
}
