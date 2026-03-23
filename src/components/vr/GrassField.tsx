import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BLADE_COUNT = 8000;
const FIELD_SIZE = 30;

const grassVertexShader = `
  uniform float uTime;
  uniform float uWindStrength;
  attribute float aOffset;
  attribute float aScale;
  attribute float aAngle;
  varying vec2 vUv;
  varying float vHeight;

  void main() {
    vUv = uv;
    vHeight = position.y * aScale;

    vec3 pos = position;
    pos.y *= aScale;

    // Wind displacement — stronger at top
    float windPhase = uTime * 1.8 + aOffset * 6.2831;
    float windAmount = pow(uv.y, 2.0) * uWindStrength;
    pos.x += sin(windPhase) * windAmount * 0.6;
    pos.z += cos(windPhase * 0.7 + 1.3) * windAmount * 0.3;

    // Rotate blade around Y
    float c = cos(aAngle);
    float s = sin(aAngle);
    vec3 rotated = vec3(
      pos.x * c - pos.z * s,
      pos.y,
      pos.x * s + pos.z * c
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const grassFragmentShader = `
  varying vec2 vUv;
  varying float vHeight;

  void main() {
    vec3 baseGreen = vec3(0.12, 0.38, 0.08);
    vec3 tipGreen = vec3(0.3, 0.65, 0.15);
    vec3 color = mix(baseGreen, tipGreen, vUv.y);

    // Slight darkening at the very base
    color *= mix(0.5, 1.0, smoothstep(0.0, 0.15, vUv.y));

    // Subtle variation
    color += vHeight * 0.02;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const GrassField = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { offsets, scales, angles, dummy } = useMemo(() => {
    const offsets = new Float32Array(BLADE_COUNT);
    const scales = new Float32Array(BLADE_COUNT);
    const angles = new Float32Array(BLADE_COUNT);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < BLADE_COUNT; i++) {
      offsets[i] = Math.random();
      scales[i] = 0.5 + Math.random() * 1.0;
      angles[i] = Math.random() * Math.PI * 2;
    }
    return { offsets, scales, angles, dummy };
  }, []);

  // Set initial positions
  useMemo(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < BLADE_COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * FIELD_SIZE,
        0,
        (Math.random() - 0.5) * FIELD_SIZE
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  const bladeGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.06, 0.6, 1, 4);
    geo.translate(0, 0.3, 0);

    const offsetAttr = new THREE.InstancedBufferAttribute(offsets, 1);
    const scaleAttr = new THREE.InstancedBufferAttribute(scales, 1);
    const angleAttr = new THREE.InstancedBufferAttribute(angles, 1);
    geo.setAttribute("aOffset", offsetAttr);
    geo.setAttribute("aScale", scaleAttr);
    geo.setAttribute("aAngle", angleAttr);

    return geo;
  }, [offsets, scales, angles]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindStrength: { value: 1.0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    // Set matrices on first frame
    if (meshRef.current && !meshRef.current.userData.initialized) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < BLADE_COUNT; i++) {
        dummy.position.set(
          (Math.random() - 0.5) * FIELD_SIZE,
          0,
          (Math.random() - 0.5) * FIELD_SIZE
        );
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.userData.initialized = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[bladeGeometry, undefined, BLADE_COUNT]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={grassVertexShader}
        fragmentShader={grassFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};

export default GrassField;
