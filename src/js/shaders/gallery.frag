#define PI 3.1415492

uniform sampler2D uTexture1;
uniform float uOpacity;

varying vec2 vUv;

void main() {

  vec4 orgColor = texture2D(uTexture1,vUv);
  orgColor.a*= step(vUv.x ,uOpacity);

  gl_FragColor = orgColor;
}