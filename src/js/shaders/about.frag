
#define  PI 3.14159265359

uniform sampler2D uTexture1;
uniform float uProgress;
uniform vec2 uTexSize;
uniform vec2 uPlaneSize;

varying vec2 vUv;

vec2 coverUV(vec2 b,vec2 i, vec2 uv){
  float rB = b.x/b.y;
  float rI = i.x/i.y;

  // coverBox
  vec2 new = rB < rI ?
    vec2(rI * b.y , b.y) :
    vec2(b.x, (1./rI) * b.x );
  // cropping
  vec2 offset = rB < rI ?
   vec2((new.x - b.x) / 2., 0.0) : 
   vec2(0.0, (new.y - b.y) / 2.);
  offset/=new; 
  // offsetting
  vec2 m =  (uv * b/new) + offset ;

  return vec2(m);
}

void main() {
  vec2 uv = coverUV(uPlaneSize,uTexSize,vUv);
  vec2 p = uv;

  vec4 color = texture2D(uTexture1,uv);
  

  // skew motion
  float dist = step(p.x+p.y*2.,uProgress);
  float dx = sin(PI * dist)*uProgress;
  dist += pow(dx,2.);
  float alpha = step(p.x,uProgress);

  color.a = alpha;
  gl_FragColor = color;

}