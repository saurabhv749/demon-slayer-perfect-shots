uniform sampler2D uTexture1;
uniform sampler2D uTexture2;

uniform float uDir;
uniform float uSlide;
uniform float uProgress;

uniform vec2 uTexSize1;
uniform vec2 uTexSize2;

uniform vec2 uPlaneSize;

#define  PI 3.14159265359

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
  vec2 uv1 = coverUV(uPlaneSize,uTexSize1,vUv);
  vec2 uv2 = coverUV(uPlaneSize,uTexSize2,vUv);
  // scale
  float _Scale = sin(uProgress*PI*.1)*0.3 *(1. - uProgress) + 1.;
  uv1  = (uv1 - 0.5) * _Scale + 0.5;
  uv2 = (uv2 - 0.5) * _Scale + 0.5;
  
  vec4 t1 = texture2D(uTexture1,uv1);
  vec4 t2 = texture2D(uTexture2,uv2);
  
  vec2 p = vUv;
  float d = p.y;
  if(uDir == 1.){
    d=1.- p.y;
  }

  // slope
  float dy = sin(PI * d  )*p.x*p.x*0.25;
  d+=dy;

  float area = step(d,uProgress);

  // area*=uSlide;
  float opacity = step(vUv.x*vUv.x ,1. - uSlide*uSlide);


  vec4 color = mix(t1,t2,area);
  gl_FragColor = vec4(opacity,0.,0.,1.);
  color.a *=opacity; 
  gl_FragColor = color;
}
