import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import _ from "lodash";
import * as settings from "./settings.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

/**
 * @description Settings imported from settings.js
 */
const columnHeight = settings.columnHeight;
const wordColumnWidth = settings.wordColumnWidth;
const wordList = settings.wordList;
const Difficulty = settings.difficulty;
const DudLength = settings.dudLength;
const Haikus = settings.haikus;
const Attempts = settings.attempts;

/**
 * @description assorted consts
 */
const BracketSets = ["<>", "[]", "{}", "()"];
const gchars = "'|\"!@#$%^&*-_+=.;:?,/".split("");

const TerminalGame = () => {
	// #region States
	const [power, setPower] = useState(false);
	const [attempts, setAttempts] = useState(Attempts);
	const [correctWord, setCorrectWord] = useState("");
	const [words, setWords] = useState([]);
	const [outputLines, setOutputLines] = useState([]);
	const [wordGrid, setWordGrid] = useState({ column2: [], column4: [] });
	const [soundEnabled] = useState(true);
	const [consoleText, setConsoleText] = useState("");
	// const terminalRef = useRef();
	const [hoverWord, setHoverWord] = useState(null);
	const [hoverChar, setHoverChar] = useState(null);
	const [hexColumnOne, setHexColumnOne] = useState([]);
	const [hexColumnThree, setHexColumnThree] = useState([]);
	const [haiku, setHaiku] = useState(
		Haikus[Math.floor(Math.random() * Haikus.length)]
	);
	const [gameState, setGameState] = useState("playing");
	const [showPowerUpFx, setShowPowerUpFx] = useState(false);
	const typingRef = useRef(false);
	const typingQueue = useRef([]);

	// #endregion

	//#region Effects

	useEffect(() => {
		if (power) initializeTerminal();
	}, [power]);

	useEffect(() => {
		const generateHex = () =>
			Array.from(
				{ length: columnHeight },
				() =>
					"0x" +
					Math.floor(Math.random() * 65536)
						.toString(16)
						.toUpperCase()
						.padStart(4, "0")
			);
		setHexColumnOne(generateHex());
		setHexColumnThree(generateHex());
	}, []);

	useEffect(() => {
		if (power) {
			setShowPowerUpFx(true);
			setTimeout(() => setShowPowerUpFx(false), 1000);
		}
	}, [power]);

	// #endregion

	// #region Functions

	const playSound = (id) => {
		const el = document.getElementById(id);
		if (el && soundEnabled) el.play();
	};

	const playRandomSound = () => {
		const keys = ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9", "k10"];
		const id = keys[Math.floor(Math.random() * keys.length)];
		const el = document.getElementById(id);
		if (el && soundEnabled) el.play();
	};

	const togglePower = () => {
		setPower((prev) => !prev);
		playSound(power ? "poweroff" : "poweron");
		setGameState("playing");
	};

	const initializeTerminal = () => {
		setAttempts(Attempts);
		setOutputLines(["> CONUNDROOM INDUSTRIES (TM)", "> ENTER PASSWORD NOW"]);
		const shuffled = shuffle(wordList);
		setWords(shuffled);
		setCorrectWord(shuffled[0]);
		buildWordColumns(shuffled);
	};

	const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
	const updateOutput = (text) => {
		typingQueue.current.push(`> ${text}`);
		if (!typingRef.current) {
			processTypingQueue();
		}
	};

	const processTypingQueue = () => {
		if (typingQueue.current.length === 0) {
			typingRef.current = false;
			return;
		}

		typingRef.current = true;
		const line = typingQueue.current.shift();
		let index = 0;
		let typedLine = "";

		const typeNext = () => {
			if (index < line.length) {
				typedLine += line[index];
				setOutputLines((prev) => [
					...prev.slice(-columnHeight + 2, prev.length - 1),
					typedLine,
				]);
				playRandomSound();
				index++;
				setTimeout(typeNext, 25 + Math.random() * 25); // typing speed
			} else {
				setOutputLines((prev) => [
					...prev.slice(-columnHeight + 2, prev.length - 1),
					typedLine,
				]);
				setTimeout(processTypingQueue, 200);
			}
		};

		setOutputLines((prev) => [...prev.slice(-columnHeight + 2), ""]);

		typeNext();
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
				gameWin();
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
				if (newAttempts === 0) gameLoss();
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

	const gameLoss = () => {
		setGameState("loss");
	};

	const gameWin = () => {
		setGameState("win");
	};

	let renderCallCount = 0;
	const renderColumn = (columnData) => {
		renderCallCount++;
		const columnId = `column${renderCallCount}`;
		const rows = [];
		for (let row = 0; row < columnHeight; row++) {
			const cells = [];
			for (let col = 0; col < wordColumnWidth; col++) {
				const index = row * wordColumnWidth + col;
				const item = columnData[index];

				const isHoveredWord =
					item?.type === "word" &&
					hoverWord?.word === item.word &&
					hoverWord?.column === columnId;
				const isHoveredChar =
					item?.type !== "word" &&
					hoverChar?.index === index &&
					hoverChar?.column === columnId;

				cells.push(
					<span
						key={index}
						className={`character ${item?.type || ""} ${
							isHoveredWord || isHoveredChar ? "character-hover" : ""
						}`}
						onClick={() => item && handleCharClick(item)}
						onMouseEnter={() => {
							if (item?.type === "word") {
								setHoverWord({ word: item.word, column: columnId });
								setHoverChar(null);
							} else {
								setHoverChar({ index, column: columnId });
								setHoverWord(null);
							}
						}}
						onMouseLeave={() => {
							setHoverWord(null);
							setHoverChar(null);
							playRandomSound();
						}}
					>
						{item?.char || "."}
					</span>
				);
			}
			rows.push(<div key={row}>{cells}</div>);
		}
		return rows;
	};

	// #endregion

	// #region Render
	return (
		<>
			<div className="relative w-screen h-screen overflow-hidden font-semibold bg-black text-green-400 font-mono text-[1.2rem]">
				<div className="absolute inset-0 flex items-center justify-center">
					<img
						className="absolute w-full h-full object-cover z-0"
						src="/images/monitorborder-off.png"
						alt="Monitor Off"
					/>
					<div
						className="z-11 w-full h-full bg-no-repeat bg-cover justify-center items-center gap-x-8 gap-y-3 p-40"
						style={{
							backgroundImage: `url(${
								power ? "/images/bg.png" : "/images/bg-off.png"
							})`,
						}}
					>
						{showPowerUpFx && (
							<div className="absolute inset-0 z-10 bg-green-400 opacity-20 animate-terminalPowerUp pointer-events-none" />
						)}
						{showPowerUpFx && (
							<div className="absolute inset-0 z-20 pointer-events-none">
								<div className="w-full h-[4px] bg-green-300 opacity-80 animate-scanlineFlash mx-auto" />
							</div>
						)}
						{power && (
							<div
								style={{ textShadow: "0 0 5px #00ff0080, 0 0 10px #00ff0080" }}
							>
								{gameState === "playing" && (
									<>
										<div className="col-span-2">
											<div dangerouslySetInnerHTML={{ __html: haiku }} />
											PASSWORD REQUIRED.
										</div>

										<div className="col-span-2">
											{attempts} ATTEMPT(S) LEFT: {" █".repeat(attempts)}
										</div>
										<div className="fl">
											<div className="w-full flex flex-row space-x-10 mt-4">
												<div>
													{hexColumnOne.map((hex, i) => (
														<div key={i}>{hex}</div>
													))}
												</div>

												<div>{renderColumn(wordGrid.column2)}</div>

												<div>
													{hexColumnThree.map((hex, i) => (
														<div key={i}>{hex}</div>
													))}
												</div>

												<div>{renderColumn(wordGrid.column4)}</div>

												<div className="col-span-2 space-y-1">
													{outputLines.map((line, i) => (
														<div key={i}>{line}</div>
													))}
													<div className="w-fit h-fit flex items-center gap-x-3">
														<span className="text-green-400">{">"}</span>
														<span className="inline-block w-[1ch] h-[1.1em] bg-green-400 animate-blink" />
													</div>
												</div>
											</div>
										</div>
									</>
								)}
								{gameState === "win" && (
									<div
										className="flex flex-col w-full text-center"
										style={{
											textShadow: "0 0 5px #00ff0080, 0 0 10px #00ff0080",
										}}
									>
										<div>ACCESS GRANTED.</div>
										<div>PASSWORD IS: 69.</div>
									</div>
								)}
								{gameState === "loss" && (
									<div
										className="flex flex-col w-full text-center"
										style={{
											textShadow: "0 0 5px #00ff0080, 0 0 10px #00ff0080",
										}}
									>
										<div>TERMINAL LOCKED.</div>
										<div>PLEASE CONTACT AN ADMINISTRATOR.</div>
									</div>
								)}
							</div>
						)}
					</div>
					<div
						className={`
									absolute w-[60px] h-[60px] bottom-10 right-10 cursor-pointer z-20
									bg-gradient-to-br from-red-800 to-red-900 
									border border-red-950 
									rounded-full 
									shadow-[inset_0_0_8px_rgba(0,0,0,0.5),_0_0_8px_rgba(255,0,0,0.5)]
									flex items-center justify-center 
									overflow-hidden 
									hover:brightness-110 active:scale-95 transition
								`}
						onClick={togglePower}
					>
						<div className="absolute inset-0 pointer-events-none z-0">
							<div className="absolute w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent_70%)]" />
							<div className="absolute w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.1)_4.5px,transparent_5px)] opacity-20" />
						</div>
						{power && (
							<span className="absolute w-[60px] h-[60px] rounded-full bg-red-500 opacity-20 animate-ripple z-0" />
						)}
						<FontAwesomeIcon
							icon={faPowerOff}
							className="text-white text-2xl animate-pulse drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] z-10"
						/>
					</div>
				</div>
			</div>
		</>
	);
	// #endregion
};

export default TerminalGame;
