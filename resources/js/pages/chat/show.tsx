import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCheck,
    ImagePlus,
    Search,
    Send,
} from 'lucide-react';
import { useRef, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';

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
    user: { id: string; name: string } | null;
    user_id: string;
    read_at: string | null;
    status: 'sent' | 'delivered' | 'seen' | null;
};

type ConversationItem = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        price: number;
        user_id: string;
        user: { id: string; name: string; region?: string | null } | null;
    };
    buyer: { id: string; name: string };
    messages_count: number;
    messages: Array<{
        id: string;
        body: string;
        created_at: string;
        user_id: string;
    }>;
    updated_at: string;
};

type Conversation = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        price: number;
        user: { id: string; name: string; region?: string | null } | null;
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
    const { formatPrice } = useCurrency();
    const currentUserId = auth?.user?.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
    });

    // Show seller (listing owner) as the other party name
    const otherUser =
        conversation.listing.user ?? conversation.buyer;

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
    const messageGroups = messages.reduce<
        Array<{ date: string; msgs: Message[] }>
    >((groups, msg) => {
        const date = msg.created_at.split('T')[0];
        const last = groups[groups.length - 1];
        if (last && last.date === date) {
            last.msgs.push(msg);
        } else {
            groups.push({ date, msgs: [msg] });
        }
        return groups;
    }, []);

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={`Chat with ${otherUser?.name ?? 'Unknown'}`} />
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
                            <p className="mb-2 px-2 text-sm font-medium text-muted-foreground">
                                Chats
                            </p>
                            <ul className="space-y-0.5">
                                {conversations.map((conv) => {
                                    const other =
                                        conv.listing.user ?? conv.buyer;
                                    const lastMessage = conv.messages[0];
                                    const isActive =
                                        conv.id === conversation.id;
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
                                                    {(conv.listing.image_url ??
                                                    conv.listing.image_path) ? (
                                                        <img
                                                            src={
                                                                conv.listing
                                                                    .image_url ??
                                                                conv.listing
                                                                    .image_path ??
                                                                ''
                                                            }
                                                            alt=""
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                                            —
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {other?.name ??
                                                            'Unknown'}
                                                    </p>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {conv.listing.title}
                                                    </p>
                                                    {lastMessage && (
                                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                            {lastMessage.body}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    {(conv.listing.image_url ??
                                                    conv.listing.image_path) ? (
                                                        <img
                                                            src={
                                                                conv.listing
                                                                    .image_url ??
                                                                conv.listing
                                                                    .image_path ??
                                                                ''
                                                            }
                                                            alt=""
                                                            className="size-12 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-12 items-center justify-center text-xs text-muted-foreground">
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
                        <p className="border-t border-border/50 px-4 py-6 text-center text-xs text-muted-foreground">
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
                                    {getInitials(otherUser?.name ?? '')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">
                                    {otherUser?.name ?? 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
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
                                {(conversation.listing.image_url ??
                                conversation.listing.image_path) ? (
                                    <img
                                        src={
                                            conversation.listing.image_url ??
                                            conversation.listing.image_path ??
                                            ''
                                        }
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                        —
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                    {conversation.listing.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatPrice(
                                        conversation.listing.price,
                                        conversation.listing.user?.region,
                                    )}
                                </p>
                            </div>
                            <Button size="sm" asChild>
                                <Link
                                    href={`/listings/${conversation.listing.id}`}
                                >
                                    Make offer
                                </Link>
                            </Button>
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Only you can see this
                        </p>
                    </div>

                    {/* Messages - WhatsApp style */}
                    <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
                        {messages.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No messages yet. Say hello!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {messageGroups.map((group) => (
                                    <div key={group.date}>
                                        <p className="mb-3 text-center text-xs text-muted-foreground">
                                            {formatChatDate(
                                                group.msgs[0].created_at,
                                            )}
                                        </p>
                                        <div className="space-y-0.5">
                                            {group.msgs.map((msg, i) => {
                                                const isOwn =
                                                    msg.user_id ===
                                                    currentUserId;
                                                const prev =
                                                    group.msgs[i - 1];
                                                const prevSameSender =
                                                    prev &&
                                                    prev.user_id ===
                                                        msg.user_id;
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
                                                            className={`max-w-[85%] rounded-2xl px-3 py-1.5 shadow-sm ${
                                                                isOwn
                                                                    ? `rounded-br-md ${
                                                                          prevSameSender
                                                                              ? 'rounded-tr-md'
                                                                              : ''
                                                                      } bg-[#005c4b] text-[#e9edef]`
                                                                    : `rounded-bl-md ${
                                                                          prevSameSender
                                                                              ? 'rounded-tl-md'
                                                                              : ''
                                                                      } bg-background border border-border`
                                                            }`}
                                                        >
                                                            <p className="break-words text-sm">
                                                                {msg.body}
                                                            </p>
                                                            <div
                                                                className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                                                    isOwn
                                                                        ? 'text-[#8696a0]'
                                                                        : 'text-muted-foreground'
                                                                }`}
                                                            >
                                                                <span>
                                                                    {formatMessageTime(
                                                                        msg.created_at,
                                                                    )}
                                                                </span>
                                                                {isOwn &&
                                                                    msg.status && (
                                                                        <span
                                                                            className={
                                                                                msg.status ===
                                                                                'seen'
                                                                                    ? 'text-[#53bdeb]'
                                                                                    : ''
                                                                            }
                                                                        >
                                                                            {msg.status ===
                                                                            'sent' ? (
                                                                                <Check className="size-3.5" />
                                                                            ) : (
                                                                                <CheckCheck className="size-3.5" />
                                                                            )}
                                                                        </span>
                                                                    )}
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

                    {/* Input - WhatsApp style */}
                    <form
                        onSubmit={submitMessage}
                        className="flex items-end gap-2 border-t border-border/50 bg-background px-4 py-3"
                    >
                        <button
                            type="button"
                            className="shrink-0 rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Attach"
                        >
                            <ImagePlus className="size-6" />
                        </button>
                        <input
                            type="text"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Message"
                            className="min-w-0 flex-1 rounded-full border border-input bg-muted/50 py-2.5 pl-5 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-full bg-[#005c4b] hover:bg-[#004d40]"
                            disabled={processing || !data.body.trim()}
                        >
                            <Send className="size-5" />
                        </Button>
                        <InputError message={errors.body} />
                    </form>
                </main>
            </div>
        </AppLayout>
    );
}
