export const config: RTCConfiguration = {
	iceServers: [
		{
			urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
		},
		{
			urls: "turn:openrelay.metered.ca:80",
			username: "openrelayproject",
			credential: "openrelayproject",
		},
	],
	iceCandidatePoolSize: 10,
};
