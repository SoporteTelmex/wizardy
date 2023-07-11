import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '../$types';
import WebSocket from 'ws';

// Interfaces
interface Output {
	average_duration: number;
	data: [string[][]];
	duration: number;
	is_generating: boolean;
}

interface Message {
	msg: string;
	output: Output;
	success: boolean;
}

interface Body {
	spells: string[];
}

// Constants
const BASE_SPELL_GENERATOR =
	'You are an Artificial Intelligence dedicated to generating element combination names and returning JSON data. Your responses will adhere to the following JSON format: `{name: string}`. Names must be based on real life combinations. Names must not contain their original names. Examples: "Water + Fire = Steam", "Air + Fire = Heat", "Dark + Light = Illusion", "Air + Water = Cloud", "Water + Earth = Erosion", "Dark + Earth = Decay". Generate: ';

// Utility functions
const generateRandomString = (length: number = 6): string => {
	const randomString = Math.random().toString(20).substr(2, length);
	return randomString;
};

const processResponse = (response: string): string => {
	const processedResponse = response.replaceAll('<br/>', '').replaceAll(/(“|”)/g, '"');
	return processedResponse;
};

// Request handler
export async function POST({ request }: RequestEvent) {
	const body = await request.json() as Body;

	if (!body || !body.spells) {
		return error(404, '');
	}

	const spellList = body.spells.join(' + ');
	const spellGenerator = BASE_SPELL_GENERATOR + spellList;

	const ws = new WebSocket('wss://yuntian-deng-chatgpt.hf.space/queue/join');

	const completion = new Promise<string>((resolve, reject) => {
		const sendHash = generateRandomString();

		const handleMessage = (msg: Buffer) => {
			const data = JSON.parse(msg.toString()) as Message;
			if (data.msg === 'send_hash') {
				ws.send(JSON.stringify({ fn_index: 5, session_hash: sendHash }));
			} else if (data.msg === 'send_data') {
				const requestData = [
					spellGenerator,
					1,
					1,
					0,
					[],
					null,
				];
				const sendData = JSON.stringify({
					fn_index: 5,
					data: requestData,
					event_data: null,
					session_hash: sendHash,
				});
				ws.send(sendData);
			} else if (data.msg === 'process_completed') {
				resolve(data.output.data[0][0][1]);
			}
		};

		const handleClose = (code: number, reason: Buffer) => {
			reject(reason)
		}

		ws.on('close', handleClose);
		ws.on('message', handleMessage)
	});

	try {
		const response = await completion;
		const processedResponse = processResponse(response);

		console.log({ p: processedResponse, s: spellGenerator })

		const parsedResponse = JSON.parse(processedResponse);
		console.log({ parsedResponse })
		return json(parsedResponse);
	} catch (e) {
		return error(404, '');
	}
}
