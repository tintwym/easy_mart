import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Search, Send } from 'lucide-react';
import { useRef, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatMessageTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatChatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

type Message = {
    id: string;
    body: string;
    created_at: string;
    user: { id: string; name: string };
    user_id: string;
};

type ConversationItem = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        price: number;
        user_id: string;
        user: { id: string; name: string };
    };
    buyer: { id: string; name: string };
    messages_count: number;
    messages: Array<{ id: string; body: string; created_at: string; user_id: string }>;
    updated_at: string;
};

type Conversation = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        price: number;
        user: { id: string; name: string };
    };
    buyer: { id: string; name: string };
};

type Props = {
    conversations: ConversationItem[];
    conversation: Conversation;
    messages: Message[];
};

export default function ChatShow({
    conversations,
    conversation,
    messages,
}: Props) {
    const { auth } = usePage<{ auth: { user?: { id: string } } }>().props;
    const currentUserId = auth?.user?.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
    });

    const otherUser =
        currentUserId === conversation.buyer.id
            ? conversation.listing.user
            : conversation.buyer;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const submitMessage = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/chat/${conversation.id}/messages`, {
            onSuccess: () => reset('body'),
        });
    };

    // Group messages by date for timestamps
    const messageGroups = messages.reduce<Array<{ date: string; msgs: Message[] }>>(
        (groups, msg) => {
            const date = msg.created_at.split('T')[0];
            const last = groups[groups.length - 1];
            if (last && last.date === date) {
                last.msgs.push(msg);
            } else {
                groups.push({ date, msgs: [msg] });
            }
            return groups;
        },
        [],
    );

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={`Chat with ${otherUser.name}`} />
            <div className="-mx-4 flex h-[calc(100vh-7rem)] overflow-hidden sm:-mx-6 lg:-mx-8">
                {/* Left panel - Chat list (hidden on mobile when viewing conversation) */}
                <aside className="hidden w-full flex-col border-r border-border/50 bg-background md:flex md:w-[360px] md:shrink-0">
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
                        <h1 className="text-xl font-semibold">Inbox</h1>
                        <button
                            type="button"
                            className="rounded-md p-2 hover:bg-muted"
                            aria-label="Search"
                        >
                            <Search className="size-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-2 py-2">
                            <p className="mb-2 px-2 text-muted-foreground text-sm font-medium">
                                Chats
                            </p>
                            <ul className="space-y-0.5">
                                {conversations.map((conv) => {
                                    const other =
                                        currentUserId === conv.buyer.id
                                            ? conv.listing.user
                                            : conv.buyer;
                                    const lastMessage = conv.messages[0];
                                    const isActive = conv.id === conversation.id;
                                    return (
                                        <li key={conv.id}>
                                            <Link
                                                href={`/chat/${conv.id}`}
                                                className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                                                    isActive
                                                        ? 'bg-muted'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                                    {conv.listing.image_path ? (
                                                        <img
                                                            src={
                                                                conv.listing
                                                                    .image_path
                                                            }
                                                            alt=""
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
                                                            —
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {other.name}
                                                    </p>
                                                    <p className="truncate text-muted-foreground text-sm">
                                                        {conv.listing.title}
                                                    </p>
                                                    {lastMessage && (
                                                        <p className="mt-0.5 truncate text-muted-foreground text-xs">
                                                            {lastMessage.body}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    {conv.listing.image_path ? (
                                                        <img
                                                            src={
                                                                conv.listing
                                                                    .image_path
                                                            }
                                                            alt=""
                                                            className="size-12 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-12 items-center justify-center text-muted-foreground text-xs">
                                                            —
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <p className="border-t border-border/50 px-4 py-6 text-center text-muted-foreground text-xs">
                            That&apos;s all for your chats
                        </p>
                    </div>
                </aside>

                {/* Right panel - Conversation */}
                <main className="flex min-w-0 flex-1 flex-col bg-muted/20">
                    {/* Chat header */}
                    <div className="flex items-center justify-between border-b border-border/50 bg-background px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                asChild
                            >
                                <Link href="/chat" aria-label="Back to chats">
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                            <Avatar className="size-10 shrink-0">
                                <AvatarFallback className="text-sm font-medium">
                                    {getInitials(otherUser.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">
                                    {otherUser.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Item summary */}
                    <div className="border-b border-border/50 bg-background px-4 py-3">
                        <Link
                            href={`/listings/${conversation.listing.id}`}
                            className="flex items-center gap-3"
                        >
                            <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                {conversation.listing.image_path ? (
                                    <img
                                        src={conversation.listing.image_path}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
                                        —
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                    {conversation.listing.title}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    $
                                    {Number(
                                        conversation.listing.price,
                                    ).toFixed(2)}
                                </p>
                            </div>
                            <Button size="sm" asChild>
                                <Link href={`/listings/${conversation.listing.id}`}>
                                    Make offer
                                </Link>
                            </Button>
                        </Link>
                        <p className="mt-1 text-muted-foreground text-xs">
                            Only you can see this
                        </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground text-sm">
                                No messages yet. Say hello!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {messageGroups.map((group) => (
                                    <div key={group.date}>
                                        <p className="mb-3 text-center text-muted-foreground text-xs">
                                            {formatChatDate(
                                                group.msgs[0].created_at,
                                            )}
                                        </p>
                                        <div className="space-y-3">
                                            {group.msgs.map((msg) => {
                                                const isOwn =
                                                    msg.user_id ===
                                                    currentUserId;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${
                                                            isOwn
                                                                ? 'justify-end'
                                                                : 'justify-start'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex max-w-[75%] gap-2 ${
                                                                isOwn
                                                                    ? 'flex-row-reverse'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <Avatar className="size-8 shrink-0">
                                                                <AvatarFallback className="text-xs">
                                                                    {getInitials(
                                                                        msg.user
                                                                            .name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div
                                                                className={`rounded-2xl px-4 py-2 ${
                                                                    isOwn
                                                                        ? 'bg-muted'
                                                                        : 'bg-muted'
                                                                }`}
                                                            >
                                                                <p className="text-sm">
                                                                    {msg.body}
                                                                </p>
                                                                <p className="mt-0.5 text-muted-foreground text-xs">
                                                                    {formatMessageTime(
                                                                        msg.created_at,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={submitMessage}
                        className="flex items-center gap-2 border-t border-border/50 bg-background p-4"
                    >
                        <input
                            type="text"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Type here..."
                            className="flex-1 rounded-full border border-input bg-muted/50 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button
                            type="button"
                            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Attach"
                        >
                            <ImagePlus className="size-5" />
                        </button>
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full"
                            disabled={processing || !data.body.trim()}
                        >
                            <Send className="size-4" />
                        </Button>
                        <InputError message={errors.body} />
                    </form>
                </main>
            </div>
        </AppLayout>
    );
}
