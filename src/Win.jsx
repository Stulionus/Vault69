import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

export function Win() {
	return (
		<div className="relative w-screen h-screen overflow-hidden font-black bg-black text-green-400 font-mono text-[1.2rem]">
			<div className="w-full h-full items-center-justify-center flex flex-col">
				<SpinningWireframeSphere />
				<div className="text-3xl">TERMINAL ACCESS GRANTED</div>
			</div>
		</div>
	);
}

function WireSphere() {
	const ref = useRef();

	useFrame(() => {
		ref.current.rotation.y += 0.01;
		ref.current.rotation.x += 0.005;
	});

	return (
		<mesh ref={ref}>
			<sphereGeometry args={[1, 32, 32]} />
			<meshBasicMaterial wireframe color="aqua" />
		</mesh>
	);
}

function SpinningWireframeSphere() {
	return (
		<div className="w-full h-full">
			<Canvas camera={{ position: [0, 0, 4] }}>
				<ambientLight />
				<WireSphere />
			</Canvas>
		</div>
	);
}
