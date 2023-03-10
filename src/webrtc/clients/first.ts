import { useState, useEffect} from "react";
import { config } from "../config";
import { useSocketIO } from "../socketio";
import { Status } from "../status";
import { CallBackMessage } from "../types";

export const useFirstClient = (callback: CallBackMessage) => {
	const [rtc, setRtc] = useState<RTCPeerConnection>();
	const [channel, setChannel] = useState<RTCDataChannel>();
	const [iceCandidate, setIceCandidate] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const [secondId, setSecondId] = useState("");
	const [secondIceCandidate, setSecondIceCandidate] = useState("");
	const [status, setStatus] = useState(Status.TryingConnect);

	const incomming = (remoteId: string, type: string, message: string) => {
		switch (type) {
			case "get": {
				setSecondId(remoteId);
				break;
			}
			case "answer": {
				setSecondIceCandidate(message);
				break;
			}
			default: {
				alert(message);
				break;
			}
		}
	}

	const { id, isConnected: socketioConnected, sendMessage, close, open } = useSocketIO(incomming);

	const initRtc = () => {
		const rtcConnection = new RTCPeerConnection(config);
		rtcConnection.onicecandidate = () => {
			setIceCandidate(JSON.stringify(rtcConnection.localDescription));
		};
		const channel = rtcConnection.createDataChannel("channel");
		channel.onopen = () => setConnected(true);
		channel.onclose = () => setConnected(false);
		channel.onmessage = ({ data }: { data: string }) => {
			callback(data);
		};

		rtcConnection.createOffer().then((o) => rtcConnection.setLocalDescription(o));

		setRtc(rtcConnection);
		setChannel(channel);
		return {
			rtcConnection,
			channel,
		};
	}

	useEffect(() => {
		return () => {
			channel?.close();
			rtc?.close();
		};
	}, []);

	useEffect(() => {
		if (secondId === "") return;
		if (iceCandidate) sendMessage(secondId, "offer", iceCandidate);
		else alert("Ice candidate is missing "+iceCandidate);
	}, [secondId]);

	useEffect(() => {
		if (secondId !== "" && iceCandidate)
			sendMessage(secondId, "offer", iceCandidate);
	}, [iceCandidate]);

	useEffect(() => {
		if (secondIceCandidate === "" || !rtc) return;
		rtc.setRemoteDescription(JSON.parse(secondIceCandidate));
	}, [secondIceCandidate]);

	useEffect(() => {
		if (connected) {
			close();
		} else {
			setSecondId("");
			setSecondIceCandidate("");
			rtc?.close();
			initRtc();
			open();
		}
	}, [connected]);

	useEffect(() => {
		if (connected)
			setStatus(Status.Connected);
		else if (!connected && secondId)
			setStatus(Status.Connecting);
		else if (!connected && socketioConnected)
			setStatus(Status.Waiting);
		else
			setStatus(Status.TryingConnect);
	}, [connected, socketioConnected, secondId]);

	const send = (data: string) => {
		channel?.send(data);
	}

	return {
		id,
		socketioConnected,
		iceCandidate,
		connected,
		send,
		status
	};
};
