import { FC, useState } from "react";
import { useFirstClient } from "../webrtc/clients/first";

const First: FC = () => {
	const [num, setNum] = useState(0);
	const callback = (message: string) => {
		setNum(parseInt(message) ?? 0);
	};

	const { id, status, send } = useFirstClient(callback);

	const add = () => {
		const newNum = num + 1;
		send(`${newNum}`)
		setNum(newNum);
	};

	return (
		<div>
			<h1>First</h1>
			<div>Status: {status}</div>
			<div>Id: {id ?? "-"}</div>
			<button disabled={status !== "connected"} onClick={add}>{num}</button>
		</div>
	);
};

export default First;
