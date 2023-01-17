import { FC } from "react";
import { useFirstClient } from "../webrtc/clients/first";

const First: FC = () => {
	const { id, status, send } = useFirstClient();

	return (
		<div>
			<h1>First</h1>
			<div>Status: {status}</div>
			<div>Id: {id ?? "-"}</div>
			<button disabled={status !== "connected"} onClick={() => send("test1")}>Click</button>
		</div>
	);
};

export default First;
