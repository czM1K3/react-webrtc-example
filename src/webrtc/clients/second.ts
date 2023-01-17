import { useState, useEffect } from "react";
import { useSocketIO } from "../socketio";

export const useSecondClient = (firstId: string) => {
	const [rtc, setRtc] = useState<RTCPeerConnection>();
	const [channel, setChannel] = useState<RTCDataChannel>();
	const [iceCandidate, setIceCandidate] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const [firstIceCandidate, setFirstIceCandidate] = useState("");

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

	useEffect(() => {
		const rtcConnection = new RTCPeerConnection();
		rtcConnection.onicecandidate = () => {
			setIceCandidate(JSON.stringify(rtcConnection.localDescription));
		};
		rtcConnection.ondatachannel = ({ channel }) => {
			channel.onopen = () => setConnected(true);
			channel.onclose = () => setConnected(false);
			channel.onmessage = ({ data }: { data: string }) => {
				console.log(data);
			};
			setChannel(channel);
			// rtcConnection.channel = channel;
		};

		setRtc(rtcConnection);

		return () => {
			rtcConnection.close();
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
		sendMessage(firstId, "answer", iceCandidate);
	}, [iceCandidate]);

	useEffect(() => {
		if (connected) {
			close();
		} else {
			setFirstIceCandidate("");
			open();
		}
	}, [connected]);

	const send = (data: string) => {
		channel?.send(data);
	}

	return {
		id,
		socketioConnected,
		iceCandidate,
		connected,
		send,
	};
};
