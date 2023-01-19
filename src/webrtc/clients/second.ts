import { useState, useEffect } from "react";
import { config } from "../config";
import { useSocketIO } from "../socketio";
import { Status } from "../status";
import { CallBackMessage } from "../types";

export const useSecondClient = (firstId: string, callback: CallBackMessage) => {
	const [rtc, setRtc] = useState<RTCPeerConnection>();
	const [channel, setChannel] = useState<RTCDataChannel>();
	const [iceCandidate, setIceCandidate] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const [firstIceCandidate, setFirstIceCandidate] = useState("");
	const [status, setStatus] = useState(Status.TryingConnect);
	const [iceInterval, setIceInterval] = useState<number>(0);

	const incomming = (_remoteId: string, type: string, message: string) => {
		switch (type) {
			case "offer": {
				setFirstIceCandidate(message);
				break;
			}
			default: {
				alert(message);
				break;
			}
		}
	};

	const {
		id,
		isConnected: socketioConnected,
		sendMessage,
		close,
		open
	} = useSocketIO(incomming);

	const initRtc = () => {
		const rtcConnection = new RTCPeerConnection(config);
		rtcConnection.onicecandidate = () => {
			setIceCandidate(JSON.stringify(rtcConnection.localDescription));
		};
		rtcConnection.ondatachannel = ({ channel }) => {
			channel.onopen = () => setConnected(true);
			channel.onclose = () => setConnected(false);
			channel.onmessage = ({ data }: { data: string }) => {
				callback(data);
			};
			setChannel(channel);
		};

		setRtc(rtcConnection);
		return { rtcConnection };
	}

	useEffect(() => {
		return () => {
			channel?.close();
			rtc?.close();
		};
	}, []);

	useEffect(() => {
		sendMessage(firstId, "get", "");
	}, [firstId]);

	useEffect(() => {
		if (firstIceCandidate === "" || !rtc) return;
		rtc.setRemoteDescription(JSON.parse(firstIceCandidate));
		rtc.createAnswer().then((a) => rtc.setLocalDescription(a));
	}, [firstIceCandidate]);

	useEffect(() => {
		if (!iceCandidate) return;
		if (iceInterval) {
			clearInterval(iceInterval);
			setIceInterval(0);
		}
		const int = setInterval(() => {
			sendMessage(firstId, "answer", iceCandidate);
		}, 1000);
		setIceInterval(int);
	}, [iceCandidate]);

	useEffect(() => {
		if (connected) {
			close();
		} else {
			setFirstIceCandidate("");
			setIceCandidate("");
			rtc?.close();
			initRtc();
			open();
		}
	}, [connected]);

	useEffect(() => {
		if (connected)
			setStatus(Status.Connected);
		else if (!connected && firstId)
			setStatus(Status.Connecting);
		else if (!connected && socketioConnected)
			setStatus(Status.Waiting);
		else
			setStatus(Status.TryingConnect);
	}, [connected, socketioConnected, firstId]);

	const send = (data: string) => {
		channel?.send(data);
	}

	return {
		id,
		socketioConnected,
		iceCandidate,
		connected,
		send,
		status,
	};
};
