import gsap from "gsap";
import {
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector4,
} from "three";
import Page from "../classes/Page";
// shader
import vertexShader from "../shaders/collection.vert";
import fragmentShader from "../shaders/collection.frag";
import Media from "../classes/Media";

export default class Home extends Page {
  constructor(canvas, index, data) {
    super(
      ".router, .controller, .collection__heading, .collection__heading__link",
      index
    );

    this.canvas = canvas;
    this.collectionData = data;
    this.len = data.length - 1;

    this.medias = [];
    this.id = "home";
    this.inTransition = false;
    // touch
    this.touch = 0;
    // background
    this.index = 0;
    this.switched = 0;
    //
    this.selectors =
      ".router, .controller, .collection__heading, .collection__heading__link";
    this.headings =
      ".collection__heading__title, .collection__heading__category";
    this.getElements();
    this.create();

    this.bindAll();
    this.addEventListeners();
  }

  getElements() {
    this.container = document.querySelector(".collection__heading");
    this.title = document.querySelector(".collection__heading__title");
    this.category = document.querySelector(".collection__heading__category");
    this.collectionLink = document.querySelector(".collection__heading__link");
    //
    this.cover = document.querySelector(".cover");
    this.preview = document.querySelector(".preview__container");

    this.slide = document.querySelector(".controller__slide span");
    this.slideCount = document.querySelectorAll(".controller__slide span")[2];
    this.prev = document.querySelector(".controller__prev");
    this.next = document.querySelector(".controller__next");
    // this.down = document.querySelector(".router__link");
  }

  // images
  resizePlanes() {
    this.medias.forEach((media) => {
      media.resize();
    });
  }

  addPlane(el, name, img) {
    const { width, height } = el.getBoundingClientRect();
    const { naturalWidth, naturalHeight } = img;
    const plane = new Mesh(
      new PlaneGeometry(),
      new ShaderMaterial({
        fragmentShader,
        vertexShader,

        uniforms: {
          uTexture1: { value: img.texture },
          uTexture2: { value: img.texture },
          uDir: { value: 1 },
          uSlide: { value: 0 },
          uProgress: { value: 0 },
          uTexSize1: { value: new Vector2(naturalWidth, naturalHeight) },
          uTexSize2: { value: new Vector2(naturalWidth, naturalHeight) },
          uPlaneSize: { value: new Vector2(width, height) },
        },
        transparent: true,
      })
    );
    plane.name = name;
    this.medias.push(new Media(this.group, plane, el));
  }

  setTheme() {
    const rgb = this.collectionData[this.index].bg;
    const c = rgb.slice(0, rgb.length - 1).join();

    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", `rgba(${rgb.join()})`);

    document.querySelector(":root").style.setProperty("--theme-color", c);
  }

  create() {
    this.slideCount.textContent = this.collectionData.length;
    this.updateCollection(this.collectionData[0]);
    this.setTheme();

    // WEBGL
    this.group = new Group();
    this.group.name = "home";
    this.group.visible = false;

    this.canvas.scene.add(this.group);
    // add Elements
    this.addPlane(this.cover, "cover", this.collectionData[0].coverImage, 1);
    this.addPlane(
      this.preview,
      "preview",
      this.collectionData[0].thumbImage,
      -1
    );
  }
  // webgl end
  bindAll() {
    this.animateOut.bind(this);
    this.animateIn.bind(this);
    this.addEventListeners.bind(this);
    this.changeCollection.bind(this);
  }

  indexify(m) {
    return m > this.len ? 0 : m < 0 ? this.len : m;
  }

  updateCollection(d) {
    const { name, category, galleryID } = d;

    this.collectionLink.href =
      "/demon-slayer-perfect-shots/characters/" + galleryID;
    this.preview.href = "/demon-slayer-perfect-shots/characters/" + galleryID;

    this.title.textContent = name;
    this.category.textContent = category;
    this.slide.textContent =
      this.index > 9 ? this.index + 1 : "0" + (this.index + 1);
  }

  // transition
  changeCollection(dir) {
    if (this.inTransition) return;

    this.inTransition = true;
    let n = dir;

    this.index = this.indexify(n + this.index);
    const tragetHeading = this.collectionData[this.index];

    const { coverImage, thumbImage, bg } = tragetHeading;

    //change
    const tl = new gsap.timeline();

    let blend = this.switched ? 0 : 1;
    // t2 = targetTexture
    if (this.switched) {
      this.canvas.bg.material.uniforms.uColor1.value = new Vector4(...bg);
    } else {
      this.canvas.bg.material.uniforms.uColor2.value = new Vector4(...bg);
    }

    // fit cover
    this.group.children[0].material.uniforms.uTexture2.value =
      coverImage.texture;
    this.group.children[0].material.uniforms.uTexSize2.value.x =
      coverImage.naturalWidth;
    this.group.children[0].material.uniforms.uTexSize2.value.y =
      coverImage.naturalHeight;

    this.group.children[1].material.uniforms.uTexture2.value =
      thumbImage.texture;
    this.group.children[1].material.uniforms.uTexSize2.value.x =
      thumbImage.naturalWidth;
    this.group.children[1].material.uniforms.uTexSize2.value.y =
      thumbImage.naturalHeight;

    // directions
    this.group.children[0].material.uniforms.uDir.value = dir;
    this.group.children[1].material.uniforms.uDir.value = dir;

    // theme
    this.setTheme();

    tl.to(this.headings, {
      opacity: 0,
      onComplete: () => {
        this.updateCollection(tragetHeading);
      },
    })
      .to(this.canvas.bg.material.uniforms.uBlend, {
        value: blend,
        // duration: 1,
      })
      .fromTo(
        this.group.children[0].material.uniforms.uProgress,
        {
          value: 0,
        },
        { value: 1, duration: 0.7 },
        "<"
      )
      .fromTo(
        this.group.children[1].material.uniforms.uProgress,
        {
          value: 0,
        },
        {
          value: 1,
          duration: 0.7,
          onComplete: () => {
            // t1 = targetTexture
            this.group.children[0].material.uniforms.uTexture1.value =
              coverImage.texture;
            this.group.children[0].material.uniforms.uTexSize1.value.x =
              coverImage.naturalWidth;
            this.group.children[0].material.uniforms.uTexSize1.value.y =
              coverImage.naturalHeight;

            this.group.children[1].material.uniforms.uTexture1.value =
              thumbImage.texture;
            this.group.children[1].material.uniforms.uTexSize1.value.x =
              thumbImage.naturalWidth;
            this.group.children[1].material.uniforms.uTexSize1.value.y =
              thumbImage.naturalHeight;
          },
        },
        "<"
      )
      .to(this.headings, {
        opacity: 1,
        onComplete: () => {
          this.switched = this.switched ? 0 : 1;
          this.inTransition = false;
          tl.kill();
        },
      });
  }

  // Events

  keyboardHandler(e) {
    if (!this.active) return;
    // e.preventDefault();
    const { key } = e;

    key === "ArrowUp" && this.changeCollection(-1);
    key === "ArrowDown" && this.changeCollection(1);
  }

  wheelHandler(e) {
    if (!this.active) return;
    // e.preventDefault();
    const { wheelDeltaY } = e;
    const dir = wheelDeltaY > 0 ? 1 : -1;

    this.changeCollection(dir);
  }

  // touch
  touchStartHandler(e) {
    // e.preventDefault();
    if (this.inTransition) return;

    const { touches } = e;
    const { pageY } = touches[0];
    this.touch = Math.round(pageY);
  }

  touchEndHandler(e) {
    // e.preventDefault();
    if (this.inTransition) return;

    const { changedTouches } = e;
    const { pageY } = changedTouches[0];
    const diff = this.touch - Math.round(pageY);

    if (Math.abs(diff) > 40) {
      const dir = diff > 0 ? -1 : 1;
      this.changeCollection(dir);
    }
  }

  addEventListeners() {
    const _ = (e) => {
      e.preventDefault();
      const dir = +e.target.getAttribute("data-target");
      this.changeCollection(dir);
    };
    this.prev.onclick = _;
    this.next.onclick = _;
    // this.down.onclick = _;
    // keyboard
    window.onkeydown = this.keyboardHandler.bind(this);
    this.container.onwheel = this.wheelHandler.bind(this);

    this.container.ontouchstart = this.touchStartHandler.bind(this);
    this.container.ontouchend = this.touchEndHandler.bind(this);
  }

  animateOut() {
    // make children invisible

    this.active = false;

    return new Promise(async (res, rej) => {
      this.group.children.forEach((c) => {
        let tl = new gsap.timeline();

        tl.to(c.material.uniforms.uSlide, {
          value: 1,
          onComplete: () => {
            this.group && (this.group.visible = false);
            tl.kill();
          },
        });
      });

      await super.animateOut();
      res();
    });
  }

  animateIn() {
    this.resizePlanes();

    this.group.children.forEach((c) => {
      let tl = new gsap.timeline();

      tl.to(c.material.uniforms.uSlide, {
        value: 0,
        onComplete() {
          tl.kill();
        },
      });
    });

    this.active = true;

    this.group && (this.group.visible = true);

    return new Promise(async (res, rej) => {
      await super.animateIn();
      res();
    });
  }
}
