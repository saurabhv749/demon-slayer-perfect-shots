import {
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  Vector2,
} from "three";
import Page from "../classes/Page";
// shaders
import vertexShader from "../shaders/about.vert";
import fragmentShader from "../shaders/about.frag";
import gsap from "gsap";
import Media from "../classes/Media";

export default class About extends Page {
  constructor(canvas, index) {
    super(".about, .about__wrapper, .about__content", index);
    this.canvas = canvas;
    this.id = "about";
    this.medias = [];

    this.getElements();
    this.create();
  }

  getElements() {
    this.parent = document.querySelector(".about");
    this.wrapper = document.querySelector(".about__wrapper");
    this.profile = document.querySelector(".about__profile");
  }

  resizePlanes() {
    this.medias.forEach((media) => {
      media.resize();
    });
  }

  addPlane(el, name, image) {
    const texture = new Texture(image);
    texture.needsUpdate = true;

    const { naturalWidth, naturalHeight } = image;
    const { width, height } = el.getBoundingClientRect();
    const geom = new PlaneGeometry();
    const mat = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uTexture1: { value: texture },
        uTexSize: { value: new Vector2(naturalWidth, naturalHeight) },
        uPlaneSize: { value: new Vector2(width, height) },
        uProgress: { value: 0 },
      },
      transparent: true,
    });
    const plane = new Mesh(geom, mat);
    plane.name = name;
    const media = new Media(this.group, plane, el);
    this.medias.push(media);
  }

  create() {
    this.group = new Group();
    this.group.visible = false;
    this.group.name = "about";
    this.canvas.scene.add(this.group);
    const img = document.querySelector(".about__profile img");
    this.addPlane(this.profile, "profile", img);
  }

  slideInProfile() {
    if (this.profileTl) this.profileTl.play();
    else {
      this.profileTl = new gsap.timeline();

      this.profileTl.fromTo(
        this.medias[0].plane.material.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: 0.8,
        }
      );
    }
  }

  slideInContent() {
    if (this.contentTl) this.contentTl.play();
    else {
      this.contentTl = new gsap.timeline();

      this.contentTl
        .fromTo(
          ".about__header, .about__description, .contact__button",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, stagger: 0.15 }
        )
        .fromTo(
          " .about__credit",
          {
            opacity: 0,
          },
          { opacity: 1 },
          "<+=50%"
        );
    }
  }

  animateIn() {
    this.resizePlanes();
    this.slideInProfile();
    this.slideInContent();

    return new Promise(async (res, rej) => {
      this.group && (this.group.visible = true);

      await super.animateIn();
      res();
    });
  }

  animateOut() {
    this.profileTl.reverse();
    this.contentTl.reverse();
    // make children invisible
    return new Promise(async (res, rej) => {
      // this.group && (this.group.visible = false);
      await super.animateOut();
      res();
    });
  }
}
