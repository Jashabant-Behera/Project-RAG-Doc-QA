import ChatView from "../components/ChatView";

const Chat = ({ useChatHook, selectedDoc }) => {
    return (
        <ChatView
            useChatHook={useChatHook}
            selectedDoc={selectedDoc}
        />
    );
};

export default Chat;
