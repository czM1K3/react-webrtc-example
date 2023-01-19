import { FC, useState } from "react";
import { useSecondClient } from "../webrtc/clients/second";

const Second: FC = () => {
	const [rawText, setRawText] = useState("");
	const [realText, setRealText] = useState<string>("");
	const [num, setNum] = useState(0);
	const callback = (message: string) => {
		setNum(parseInt(message) ?? 0);
	};

	const { status, send } = useSecondClient(realText, callback);

	const submit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setRealText(rawText);
	}

	const add = () => {
		const newNum = num + 1;
		send(`${newNum}`)
		setNum(newNum);
	};

	return (
		<div>
			<h1>Second</h1>
			<div>Status: {status}</div>
			<form onSubmit={submit}>
				<label htmlFor="id">Id</label>
				<input type="text" name="id" id="id" onChange={(e) => setRawText(e.target.value)} />
				<button type="submit">Submit</button>
			</form>
			<button disabled={status !== "connected"} onClick={add}>{num}</button>
		</div>
	);
};

export default Second;
