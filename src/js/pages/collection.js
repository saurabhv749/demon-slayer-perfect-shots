import {
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
} from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import SmoothScrollbar from "smooth-scrollbar";

import Page from "../classes/Page";
import vertexShader from "../shaders/gallery.vert";
import fragmentShader from "../shaders/gallery.frag";
import gsap from "gsap";
import CloseButton from "../classes/CloseButton";

export default class Collection extends Page {
  constructor(canvas, index, database) {
    super(".collection", index);
    this.canvas = canvas;
    this.id = "collection";
    this.labels = [];

    this.database = database;
    this.data = database.db.characters;
    this.gSize = { w: 0, h: 0 };
    this.items = [];
    this.meshes = {};

    this.getElements();
    this.addScroll();
    this.create();
  }

  getElements() {
    this.parent = document.querySelector(".collection");
    this.wrapper = this.parent.children[0];
    this.gallery = this.parent.querySelector(".collection__gallery");
    this.scroll = document.querySelector(".collection__scroll");
    this.scrollContent = this.scroll.querySelector(".content");
    // collection info
    this.title = document.querySelector(".collection__heading__title");
    this.category = document.querySelector(".collection__heading__category");

    const infoContainer = document.querySelector(".collection__info");
    this.voice = infoContainer.querySelector(".voice");
    this.style = infoContainer.querySelector(".style");
    this.personality = infoContainer.querySelector(".personality");
    this.strength = infoContainer.querySelector(".strength");
  }

  addScroll() {
    this.scrollbar = new SmoothScrollbar(this.scroll);
    this.scrollbar.addListener(this.slideGroup.bind(this));
  }

  fetchGallery() {
    const g = this.database.getCharacter(this.gID);

    this.gSize.w = g.size.width;
    this.gSize.h = g.size.height;
    this.items = g.items;

    this.addItems();
  }

  // content
  updateContent() {
    this.gID = window.location.pathname.split("/characters/").at(-1);
    let c = this.data.find((x) => x.galleryID === this.gID);

    this.voice.textContent = c.voice;
    this.style.textContent = c.style;
    this.personality.textContent = c.personality;
    this.strength.textContent = c.strength;
  }

  // scroll
  slideGroup() {
    this.group.position.x = -this.scrollbar.scrollTop;
  }

  // labels
  restoreLabel() {
    this.labels.forEach((l) => {
      const { innerWidth: w, innerHeight: h } = window;
      const { left, top, width, height } = l.el.getBoundingClientRect();
      const x = (left + width / 2) / w - 0.5;
      const y = 0.5 - (height / 2 + top) / h;
      gsap.to(l.position, {
        x,
        y,
        duration: 0.8,
        ease: "expo.out",
        onComplete() {
          l.fakeDom.classList.add("hide");
        },
      });
    });
  }
  centerLabel() {
    this.labels.forEach((l) => {
      l.fakeDom.classList.remove("hide");
      gsap.to(l.position, {
        x: 0,
        duration: 1.5,
        ease: "expo.out",
      });
    });
  }
  positionLabels() {
    if (!this.gID) return;

    let c = this.data.find((c) => c.galleryID === this.gID);

    this.labels.forEach((l, i) => {
      const { innerWidth: w, innerHeight: h } = window;
      l.fakeDom.textContent = i === 0 ? c.name : c.category;

      const { left, top, width, height } = l.el.getBoundingClientRect();
      // l.fakeDom.style.width = width + "px";
      // l.fakeDom.style.height = height + "px";
      const x = (left + width / 2) / w - 0.5;
      const y = 0.5 - (height / 2 + top) / h;
      l.position.set(x, y);
    });
  }
  addGLLabels() {
    const title = document.createElement("div");
    title.className = "gl__title  hide";
    let cTitle = new CSS2DObject(title);
    this.canvas.bg.add(cTitle);
    cTitle.layers.set(0);
    cTitle.el = this.title;
    cTitle.fakeDom = title;

    const category = document.createElement("div");
    category.className = "gl__category hide";
    let cCat = new CSS2DObject(category);
    this.canvas.bg.add(cCat);
    cCat.layers.set(0);
    cCat.el = this.category;
    cCat.fakeDom = category;

    this.labels.push(cTitle, cCat);
  }

  // resize
  updateHeight() {
    if (!this.gSize.w) return;

    const asp = window.innerHeight / this.gSize.h;
    const w = Math.round(
      this.gSize.w * asp - window.innerWidth + window.innerHeight
    );
    this.scrollContent.style.height = w + "px";
  }

  resizeImages() {
    if (!this.items.length) return;

    this.items.forEach((item) => {
      let { url, left, width, top, height } = item;
      const asp = window.innerHeight / this.gSize.h;
      left *= asp;
      top *= asp;
      width *= asp;
      height *= asp;

      const plane = this.meshes[url];

      plane.scale.set(width, height);
      plane.position.x = -window.innerWidth / 2 + left + width / 2;
      plane.position.y = window.innerHeight / 2 - top - height / 2;
    });
  }

  resizePlanes() {
    this.updateHeight();
    this.resizeImages();
  }

  // webgl
  hideItems() {
    this.items.forEach((c) => {
      let tl = new gsap.timeline();
      tl.to(this.meshes[c.url].material.uniforms.uOpacity, {
        value: 0,
        onComplete() {
          tl.kill();
        },
      });
    });
  }

  onTextureLoad(l) {
    gsap.to(this.meshes[l].material.uniforms.uOpacity, {
      value: 1,
      duration: 1,
    });
  }

  addItems() {
    for (let item of this.items) {
      let { url } = item;

      if (this.meshes[url]) {
        this.meshes[url].visible = true;
        let tl = new gsap.timeline();
        tl.fromTo(
          this.meshes[url].material.uniforms.uOpacity,
          {
            value: 0,
          },
          {
            value: 1,
            duration: 1,
            onComplete() {
              tl.kill();
            },
          }
        );
      } else {
        const texture = new TextureLoader().load(
          this.database.db.store + url + "?alt=media",
          () => this.onTextureLoad(url)
        );
        const mat = new ShaderMaterial({
          transparent: true,
          vertexShader,
          fragmentShader,
          uniforms: {
            uTexture1: { value: texture },
            uOpacity: { value: 0 },
          },
          transparent: true,
        });

        const plane = new Mesh(this.geom, mat);
        plane.name = url;
        this.meshes[url] = plane;

        this.group.add(plane);
      }
    }

    this.resizePlanes();
  }

  create() {
    this.group = new Group();
    this.group.visible = false;
    this.group.name = "collection";
    this.canvas.scene.add(this.group);

    // addMeshes max(43)
    this.geom = new PlaneGeometry(1, 1, 30, 30);

    //

    this.addGLLabels();
    this.positionLabels();
    this.closeButton = new CloseButton(".collection__close");
  }

  animateIn() {
    this.updateContent();
    this.fetchGallery();
    this.closeButton.animateIn();
    // label
    this.positionLabels();
    this.centerLabel();

    this.group && (this.group.visible = true);
    return new Promise(async (res, rej) => {
      await super.animateIn();
      this.gallery.scrollLeft = 0;
      res();
    });
  }

  animateOut() {
    this.hideItems();
    this.closeButton.animateOut();
    this.restoreLabel();

    return new Promise(async (res, rej) => {
      await super.animateOut();
      this.scrollbar.scrollTop = 0;
      res();
    });
  }
}
