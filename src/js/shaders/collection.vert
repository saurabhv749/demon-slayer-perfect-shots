#define PI 3.1415492

varying vec2 vUv;

void main() {

  vec2 u = uv;
  vec3 pos= position;


  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
