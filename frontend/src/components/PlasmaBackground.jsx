import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";


const PlasmaMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    precision highp float;

uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

/* 2D hash */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

/* Smooth noise */
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/* Fractal Brownian Motion */
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  float t = uTime * 0.12;

  /* Turbulence */
  vec2 flow = vec2(
    fbm(p + t),
    fbm(p - t * 0.7)
  );

  float plasma = fbm(p * 1.2 + flow);

  /* RIGHT-SIDE ENERGY MASK */
  float rightBias = smoothstep(-0.2, 0.9, uv.x);
  plasma *= rightBias;

  /* Sharpen structure */
  plasma = pow(plasma, 1.5);

  /* Colors */
  vec3 black = vec3(0.0, 0.0, 0.0);
  vec3 blue = vec3(0.35, 0.45, 1.0);
  vec3 white = vec3(1.0);

  vec3 color = mix(black,blue,plasma * 0.8);
  color = mix(color, white, plasma * 0.35);

  gl_FragColor = vec4(color, 1);
}

  `,
};



function PlasmaPlane() {
  const materialRef = useRef();

  useFrame(({ clock }) => {
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh renderOrder={1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={materialRef} {...PlasmaMaterial} />
    </mesh>
  );
}

export default function PlasmaBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
  gl={{ antialias: false }}
  dpr={[1, 1.5]}
  camera={{ position: [0, 0, 1] }}
>
  {/* <BackgroundStars /> */}
  <PlasmaPlane />
</Canvas>

    </div>
  );
}
