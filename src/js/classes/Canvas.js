import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
// shaders
import vertexShader from "../shaders/bg.vert";
import fragmentShader from "../shaders/bg.frag";

export default class Canvas {
  constructor(viewport, data) {
    this.viewport = viewport; //in-sync
    this.time = 0;
    this.pointer = new Vector2();
    this.activePage = null;
    this.data = data;

    this.getElements();
    this.init();
    this.addBackground();
    this.addTextRenderer();
    this.resize();
    this.render();
    // this.addRaycaster();
    // this.addOrbitControl();
  }

  getElements() {
    this.parent = document.querySelector(".webgl");
    this.container = this.parent.firstChild;
    this.canvas = this.container.firstChild;
  }

  addTextRenderer() {
    // renderer
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.viewport.w, this.viewport.h);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.container.appendChild(this.labelRenderer.domElement);
  }

  init() {
    const aspect = this.viewport.w / this.viewport.h;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, aspect, 100, 2000);
    this.camera.position.z = 600;
    this.renderer = new WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setSize(this.viewport.w, this.viewport.h);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    // pointer
    // window.onpointermove = this.onPointerMove.bind(this);
  }

  // onPointerMove(event) {
  //   event.preventDefault();
  //   // calculate pointer position in normalized device coordinates
  //   // (-1 to +1) for both components
  //   this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //   this.raycaster.setFromCamera(this.pointer, this.camera);
  // }

  // addRaycaster() {
  //   this.raycaster = new Raycaster();
  // }

  // addOrbitControl() {
  //   this.controls = new OrbitControls(this.camera, document.documentElement);
  // }

  addBackground() {
    const texture1 = this.data[0].bg;
    const texture2 = this.data[1].bg;

    const geometry = new PlaneGeometry();
    const material = new ShaderMaterial({
      uniforms: {
        uColor1: { value: new Vector4(...texture1) },
        uColor2: { value: new Vector4(...texture2) },
        uBlend: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });
    this.bg = new Mesh(geometry, material);
    this.bg.scale.x = this.viewport.w;
    this.bg.scale.y = this.viewport.h;
    this.scene.add(this.bg);
  }

  render() {
    // this.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render.bind(this));
  }

  resize() {
    const { w, h } = this.viewport;

    this.renderer.setSize(w, h);
    this.bg.scale.x = w;
    this.bg.scale.y = h;

    let aspect = w / h;
    let tanA = window.innerHeight / 2 / this.camera.position.z;
    let a = Math.atan(tanA);
    this.camera.fov = 2 * a * (180 / Math.PI);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    // CSS2D RENDERER
    this.labelRenderer.setSize(w, h);
  }
}
