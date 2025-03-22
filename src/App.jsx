import { useState } from "react";
import "./App.css";

function App() {
	return (
		<>
			<head>
				<title>Fallout Terminal-Hacking</title>
			</head>
			<div id="terminal-background">
				<img
					id="terminal-background-off"
					src="/images/monitorborder-off.png"
					alt="Monitor Border Off"
				/>
			</div>
			<div id="terminal"></div>
			<div id="powerbutton" onClick={() => window.TogglePower?.()}></div>

			<div id="power-audio">
				<audio id="poweron" src="/sound/poweron.ogg" />
				<audio id="poweroff" src="/sound/poweroff.ogg" />
				<audio id="passbad" src="/sound/passbad.ogg" />
				<audio id="passgood" src="/sound/passgood.ogg" />
			</div>

			<div id="audio-map">
				<audio id="enter" src="/sound/kenter.ogg" />
				{[...Array(10)].map((_, i) => (
					<audio key={i + 1} id={`k${i + 1}`} src={`/sound/k${i + 1}.ogg`} />
				))}
			</div>
		</>
	);
}

export default App;
