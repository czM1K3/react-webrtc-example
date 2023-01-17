import { FC, useState } from "react";
import { useSecondClient } from "../webrtc/clients/second";

const Second: FC = () => {
	const [rawText, setRawText] = useState("");
	const [realText, setRealText] = useState<string>("");

	const { status, send } = useSecondClient(realText);

	const submit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setRealText(rawText);
	}

	return (
		<div>
			<h1>Second</h1>
			<div>Status: {status}</div>
			<form onSubmit={submit}>
				<label htmlFor="id">Id</label>
				<input type="text" name="id" id="id" onChange={(e) => setRawText(e.target.value)} />
				<button type="submit">Submit</button>
			</form>
			<button disabled={status !== "connected"} onClick={() => send("test2")}>Click</button>
		</div>
	);
};

export default Second;
