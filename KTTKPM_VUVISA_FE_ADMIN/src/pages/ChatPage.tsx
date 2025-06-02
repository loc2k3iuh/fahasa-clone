import React from 'react';
import Chat from '../components/chat/Chat';
import { useUserService } from "../services/useUserService";
import { UserResponse } from "../types/user";

const ChatPage: React.FC = () => {
    const { getUserDetail } = useUserService();
    const [currentUser, setCurrentUser] = React.useState<UserResponse | null>(null);
    const [loading, setLoading] = React.useState(true);    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const userDetail = await getUserDetail();
                setCurrentUser(userDetail);
            } catch (error) {
                console.error("Error fetching user details:", error);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [getUserDetail]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="chat-page">
            {currentUser ? (
                <Chat currentUser={currentUser} />
            ) : (
                <div className="not-authenticated">
                    Please log in to access the chat system.
                </div>
            )}
        </div>
    );
};

export default ChatPage;
