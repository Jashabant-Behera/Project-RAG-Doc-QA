import ChatView from "../components/ChatView";

const Chat = ({ useChatHook, selectedDoc }) => {
    return (
        <div className="page active">
            <div className="chat-page">
                <ChatView useChatHook={useChatHook} selectedDoc={selectedDoc} />
            </div>
        </div>
    );
};

export default Chat;
