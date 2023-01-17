import { FC } from "react";
import { useFirstClient } from "../webrtc/clients/first";

const First: FC = () => {
	const { id, socketioConnected, iceCandidate, connected, send } = useFirstClient();

	return (
		<div>
			<h1>First</h1>
			<div>Is connected: {connected ? "yes" : "no"}</div>
			<div>Is socketio connected: {socketioConnected ? "yes" : "no"}</div>
			<div>Id: {id ?? "-"}</div>
			<div>Ice candidate: {iceCandidate}</div>
			<button onClick={() => send("test1")}>Click</button>
		</div>
	);
};

export default First;
