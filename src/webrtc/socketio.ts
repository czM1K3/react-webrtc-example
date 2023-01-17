import { useEffect, useState } from "react";
import io from "socket.io-client";
import { z } from "zod";

const socket = io(import.meta.env.VITE_SOCKETIO_URL ?? "http://localhost:3000");

const messageSchema = z.object({
	sourceId: z.string(),
	message: z.string(),
	type: z.string(),
});

export const useSocketIO = (
	receiveHandler: (remoteId: string, type: string, message: string) => void
) => {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [id, setId] = useState<string>("");

	useEffect(() => {
		socket.on("connect", () => {
			setIsConnected(true);
		});

		socket.on("disconnect", () => {
			setIsConnected(false);
			setId("");
		});

		socket.on("id", (message: string) => {
			setId(message);
		});

		socket.on("message", (message: string) => {
			try {
				const parsedMessage = JSON.parse(message);
				const data = messageSchema.parse(parsedMessage);
				receiveHandler(data.sourceId, data.type, data.message);
			} catch (e) {
				console.error("Failed to parse");
			}
		});

		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off("id");
			socket.off("message");
		};
	}, []);

	const sendMessage = (targetId: string, type: string, message: string) => {
		if (targetId === "") return;
		socket.emit(
			"message",
			JSON.stringify({
				targetId,
				message,
				type,
			})
		);
	};

	const close = () => {
		socket.close();
	};
	const open = () => {
		socket.open();
	};

	return {
		isConnected,
		id,
		sendMessage,
		open,
		close,
	};
};
