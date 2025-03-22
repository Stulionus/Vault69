import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const columnHeight = 17;
const wordColumnWidth = 12;
const Count = 12;
const Difficulty = 7;
const DudLength = 8;
const Haikus = [
	"Out of memory.<br />We wish to hold the whole sky,<br />But we never will.",
	"Three things are certain:<br />Death, taxes, and lost data.<br />Guess which has occurred.",
	"wind catches lily<br />scatt'ring petals to the wind:<br />segmentation fault",
	"The fence is for you<br />To protect you from danger<br />Don't go past the fence",
	"Joe Roquefort: hero<br />of cryptanalysis in<br />the Second World War.",
	"Math gurus showed us<br />some hash weaknesses. Panic<br />ensues. New hash now!",
	"Two thousand seven,<br />NIST says 'New hash contest now!'<br />Five years later, done.",
];
const BracketSets = ["<>", "[]", "{}", "()"];
const gchars = "'|\"!@#$%^&*-_+=.;:?,/".split("");

const TerminalGame = () => {
	const [power, setPower] = useState(false);
	const [attempts, setAttempts] = useState(6);
	const [correctWord, setCorrectWord] = useState("");
	const [words, setWords] = useState([]);
	const [outputLines, setOutputLines] = useState([]);
	const [wordGrid, setWordGrid] = useState({ column2: [], column4: [] });
	const [soundEnabled] = useState(true);
	const [consoleText, setConsoleText] = useState("");
	const terminalRef = useRef();
	const [hoverWord, setHoverWord] = useState(null);

	useEffect(() => {
		if (power) initializeTerminal();
	}, [power]);

	const playSound = (id) => {
		const el = document.getElementById(id);
		if (el && soundEnabled) el.play();
	};

	const togglePower = () => {
		setPower((prev) => !prev);
		playSound(power ? "poweroff" : "poweron");
	};

	const initializeTerminal = () => {
		setAttempts(6);
		setOutputLines([
			"> ROBCO INDUSTRIES (TM) TERMALINK PROTOCOL",
			"> ENTER PASSWORD NOW",
		]);
		const mockWords = [
			"VESPER",
			"BEWITCH",
			"RECHECK",
			"STRETCH",
			"BEDROCK",
			"BEAKERS",
			"BELEAPT",
			"BEDWED",
			"BESHAME",
			"BEFRETS",
			"TESTACY",
			"BUSIEST",
		];
		const shuffled = shuffle(mockWords);
		setWords(shuffled);
		setCorrectWord(shuffled[0]);
		buildWordColumns(shuffled);
	};

	const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

	const updateOutput = (text) => {
		setOutputLines((prev) => [...prev.slice(-columnHeight + 2), `> ${text}`]);
	};

	const buildWordColumns = (wordList) => {
		const half = Math.floor(wordList.length / 2);
		const fillColumn = (wordsHalf) => {
			const chars = generateGarbageCharacters();
			const startRows = Math.floor(columnHeight / wordsHalf.length);

			for (let i = 0; i < wordsHalf.length; i++) {
				const row = i * startRows;
				const col = Math.floor(Math.random() * (wordColumnWidth - Difficulty));
				for (let j = 0; j < Difficulty; j++) {
					const index = row * wordColumnWidth + col + j;
					chars[index] = {
						char: wordsHalf[i][j],
						type: "word",
						word: wordsHalf[i],
					};
				}
			}
			return addDudBrackets(chars);
		};

		setWordGrid({
			column2: fillColumn(wordList.slice(0, half)),
			column4: fillColumn(wordList.slice(half)),
		});
	};

	const generateGarbageCharacters = () => {
		const out = [];
		for (let i = 0; i < columnHeight * wordColumnWidth; i++) {
			out.push({
				char: gchars[Math.floor(Math.random() * gchars.length)],
				type: "char",
			});
		}
		return out;
	};

	const addDudBrackets = (nodes) => {
		const blankIndices = [];
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i].type !== "word") {
				if (!blankIndices.length || i !== blankIndices.at(-1).at(-1) + 1)
					blankIndices.push([]);
				blankIndices.at(-1).push(i);
			}
		}

		for (const group of blankIndices) {
			if (group.length >= DudLength && Math.random() > 0.25) {
				const start = group[Math.floor(group.length / 2 - DudLength / 2)];
				const brackets =
					BracketSets[Math.floor(Math.random() * BracketSets.length)].split("");
				for (let j = 0; j < DudLength; j++) {
					const idx = start + j;
					nodes[idx] = {
						char:
							j === 0 ? brackets[0] : j === DudLength - 1 ? brackets[1] : ".",
						type: j === 0 || j === DudLength - 1 ? "dudcap" : "dud",
					};
				}
			}
		}
		return nodes;
	};

	const handleCharClick = (item) => {
		if (attempts <= 0) return;
		if (item.type === "word") {
			playSound("enter");
			updateOutput(item.word);
			if (item.word === correctWord) {
				playSound("passgood");
				updateOutput("Exact match!");
				updateOutput("Please wait");
				updateOutput("while system");
				updateOutput("is accessed.");
				setAttempts(0);
				renderSuccess();
			} else {
				playSound("passbad");
				updateOutput("Access denied");
				updateOutput(
					`${compareWords(item.word, correctWord)}/${
						correctWord.length
					} correct.`
				);
				const newAttempts = attempts - 1;
				setAttempts(newAttempts);
				if (newAttempts === 0) renderFailure();
			}
		} else if (item.type === "dudcap") {
			playSound("enter");
			if (Math.random() > 0.3) {
				setAttempts(6);
				updateOutput("");
				updateOutput("Allowance");
				updateOutput("replenished.");
			} else {
				updateOutput("");
				updateOutput("Dud removed.");
			}
		}
	};

	const compareWords = (first, second) => {
		return first.split("").filter((c, i) => c === second[i]).length;
	};

	const renderFailure = () => {
		if (!terminalRef.current) return;
		terminalRef.current.innerHTML = `<div id='adminalert'><div class='character-hover alert-text'>TERMINAL LOCKED</div><br />PLEASE CONTACT AN ADMINISTRATOR</div>`;
	};

	const renderSuccess = () => {
		if (!terminalRef.current) return;
		terminalRef.current.innerHTML = `<div id='adminalert'><div id='msg' class='character-hover alert-text'>TERMINAL ACCESS GRANTED</div><br /><div onClick="location.href = 'https://breakout.bernis-hideout.de/pip-boy';return false;" id='proceed' class='alert-text'>PRESS HERE TO PROCEED</div></div>`;
	};

	const renderColumn = (columnData) => {
		const rows = [];
		for (let row = 0; row < columnHeight; row++) {
			const cells = [];
			for (let col = 0; col < wordColumnWidth; col++) {
				const index = row * wordColumnWidth + col;
				const item = columnData[index];
				const isHovered = item?.type === "word" && item.word === hoverWord;
				cells.push(
					<span
						key={index}
						className={`character ${item?.type || ""} ${
							isHovered ? "character-hover" : ""
						}`}
						onClick={() => item && handleCharClick(item)}
						onMouseEnter={() =>
							item?.type === "word" && setHoverWord(item.word)
						}
						onMouseLeave={() => setHoverWord(null)}
					>
						{item?.char || "."}
					</span>
				);
			}
			rows.push(<div key={row}>{cells}</div>);
		}
		return rows;
	};

	return (
		<div className="terminal-container">
			<div className="terminal-wrapper">
				<img
					className="terminal-border"
					src="/images/monitorborder-off.png"
					alt="Monitor Off"
				/>
				<div
					id="terminal"
					style={{
						backgroundImage: `url(${
							power ? "/images/bg.png" : "/images/bg-off.png"
						})`,
					}}
				>
					{power && (
						<div id="terminal-interior" ref={terminalRef}>
							<div id="info">
								{outputLines.map((line, idx) => (
									<div key={idx} dangerouslySetInnerHTML={{ __html: line }} />
								))}
							</div>
							<div id="attempts">
								{attempts} ATTEMPT(S) LEFT: {"█".repeat(attempts)}
							</div>
							<div id="column1" className="column pointers">
								{Array.from({ length: columnHeight }).map((_, i) => (
									<div key={i}>
										{"0x" +
											Math.floor(Math.random() * 65536)
												.toString(16)
												.toUpperCase()
												.padStart(4, "0")}
									</div>
								))}
							</div>
							<div id="column2" className="column words">
								{renderColumn(wordGrid.column2)}
							</div>
							<div id="column3" className="column pointers">
								{Array.from({ length: columnHeight }).map((_, i) => (
									<div key={i}>
										{"0x" +
											Math.floor(Math.random() * 65536)
												.toString(16)
												.toUpperCase()
												.padStart(4, "0")}
									</div>
								))}
							</div>
							<div id="column4" className="column words">
								{renderColumn(wordGrid.column4)}
							</div>
							<div id="output"></div>
							<div id="console">{consoleText}▊</div>
						</div>
					)}
				</div>
				<div id="powerbutton" onClick={togglePower}></div>
			</div>
		</div>
	);
};

export default TerminalGame;
