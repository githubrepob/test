import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

const MODULES = [
  {
    name: "Notes",
    desc: "Organize and share study notes",
    route: "/notes",
  },
  {
    name: "Leaderboard",
    desc: "Track your impact",
    route: "/leaderboard",
  },
  {
    name: "Tech Issues",
    desc: "Ask. Solve. Learn.",
    route: "/tech-issues",
  },
  {
    name: "Hackathons",
    desc: "Compete and collaborate",
    route: "/hackathons",
  },
  {
    name: "Referrals",
    desc: "Unlock opportunities",
    route: "/referrals",
  },
  {
    name: "Micro Internships",
    desc: "Learn by doing",
    route: "/micro-internships",
  },
  {
    name: "Community",
    desc: "Connect with peers",
    route: "/community",
  },
  {
    name: "Events",
    desc: "Never miss out",
    route: "/events",
  },
];

function Orbit({ radius }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const a = (i / 100) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <line geometry={new THREE.BufferGeometry().setFromPoints(points)}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
    </line>
  );
}

function Planet({ data, radius, speed, index }) {
  const ref = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    angle.current += speed;
    ref.current.position.set(
      Math.cos(angle.current) * radius,
      0,
      Math.sin(angle.current) * radius
    );
  });

  return (
    <mesh
      ref={ref}
      onClick={() => navigate(data.route)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.45, 32, 32]} />
      <meshStandardMaterial
        color={index % 2 === 0 ? "#9bb2ff" : "#ffffff"}
        emissive={index % 2 === 0 ? "#9bb2ff" : "#ffffff"}
        emissiveIntensity={2.5}
      />

      {/* Tooltip */}
      {hovered && (
        <Html distanceFactor={10} center>
          <div className="px-3 py-2 rounded-lg bg-black/70 backdrop-blur text-white text-xs border border-white/10">
            <div className="font-medium">{data.name}</div>
            <div className="text-gray-400 text-[10px] mt-0.5">
              {data.desc}
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default function GalaxyScene() {
  return (
    <Canvas camera={{ position: [0, 4.5, 12], fov: 45 }}>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 8, 6]} intensity={3} />

      <group position={[0, 0, 0]}>
        {MODULES.map((mod, i) => {
          const radius = 2.2 + i * 0.70;
          return (
            <group key={mod.name}>
              <Orbit radius={radius} />
              <Planet
                data={mod}
                radius={radius}
                speed={0.001 + i * 0.00018}
                index={i}
              />
            </group>
          );
        })}
      </group>
    </Canvas>
  );
}
