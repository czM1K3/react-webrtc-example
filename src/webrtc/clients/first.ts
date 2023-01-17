import { useState, useEffect} from "react";
import { useSocketIO } from "../socketio";

export const useFirstClient = () => {
	const [rtc, setRtc] = useState<RTCPeerConnection>();
	const [channel, setChannel] = useState<RTCDataChannel>();
	const [iceCandidate, setIceCandidate] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const [secondId, setSecondId] = useState("");
	const [secondIceCandidate, setSecondIceCandidate] = useState("");

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

	useEffect(() => {
		const rtcConnection = new RTCPeerConnection();
		rtcConnection.onicecandidate = () => {
			setIceCandidate(JSON.stringify(rtcConnection.localDescription));
		};
		const channel = rtcConnection.createDataChannel("channel");
		channel.onopen = () => setConnected(true);
		channel.onclose = () => setConnected(false);
		channel.onmessage = ({ data }: { data: string }) => {
			console.log(data);
		};

		rtcConnection.createOffer().then((o) => rtcConnection.setLocalDescription(o));

		setRtc(rtcConnection);
		setChannel(channel);

		return () => {
			channel.close();
			rtcConnection.close();
		};
	}, []);

	useEffect(() => {
		if (secondId === "") return;
		if (iceCandidate) sendMessage(secondId, "offer", iceCandidate);
		else alert("Ice candidate is missing "+iceCandidate);
	}, [secondId]);

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
