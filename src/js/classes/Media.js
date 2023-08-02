export default class Media {
  constructor(group, plane, el) {
    this.group = group;
    this.plane = plane;
    this.el = el;
    this.group.add(this.plane);
    this.resize();
  }

  resize() {
    const { width, height, left, top } = this.el.getBoundingClientRect();
    this.plane.scale.set(width + 5, height);
    this.plane.position.x = -(window.innerWidth / 2) + left + width / 2;
    this.plane.position.y = window.innerHeight / 2 - top - height / 2;
    //
    this.plane.material.uniforms.uPlaneSize.value.x = width;
    this.plane.material.uniforms.uPlaneSize.value.y = height;
  }
  animateIn() {}
  animateOut() {}
}
