import { FC, useState } from "react";
import { useSecondClient } from "../webrtc/clients/second";

const Second: FC = () => {
	const [rawText, setRawText] = useState("");
	const [realText, setRealText] = useState<string>("");

	const { id, socketioConnected, iceCandidate, connected, send } = useSecondClient(realText);

	const submit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setRealText(rawText);
	}

	return (
		<div>
			<h1>Second</h1>
			<div>Is connected: {connected?"yes":"no"}</div>
			<div>Is socketio connected: {socketioConnected?"yes":"no"}</div>
			<div>Id: {id??"-"}</div>
			<div>Ice candidate: {iceCandidate}</div>
			<form onSubmit={submit}>
				<label htmlFor="id">Id</label>
				<input type="text" name="id" id="id" onChange={(e) => setRawText(e.target.value)} />
			</form>
			<button onClick={() => send("test2")}>Click</button>
		</div>
	);
};

export default Second;
