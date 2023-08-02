
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform float uBlend;

varying vec2 vUv;


void main() {
  vec4 c1 =  uColor1;
  vec4 c2 =  uColor2;
  c1.r /=255.;
  c2.r /=255.;
  c1.g /=255.;
  c2.g /=255.;
  c1.b /=255.;
  c2.b /=255.;

  vec4 color = mix(c1,c2,uBlend);

  gl_FragColor = color;
}